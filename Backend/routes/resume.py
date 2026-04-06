import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse

from schemas import (
    ResumeUploadResponse,
    ScorerRequest,
    ScorerResponse,
    ResumeSuggestionsRequest,
    ResumeSuggestionsResponse,
)
from services.resume_parser import resume_parser
from services.scorer import resume_scorer
from services.resume_advisor import resume_advisor
from utils.helpers import generate_id

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory resume store: { resume_id: { parsed_data, file_path } }
resume_store: dict = {}


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF resume.
    Returns extracted skills, experience, education, name, email.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    resume_id = generate_id("resume")
    file_path = os.path.join(UPLOAD_DIR, f"{resume_id}.pdf")

    # Save file
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Parse resume
    try:
        parsed = resume_parser.parse(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

    # Store for later use
    resume_store[resume_id] = {
        "parsed": parsed,
        "file_path": file_path,
    }

    return ResumeUploadResponse(
        resume_id=resume_id,
        extracted_skills=parsed["skills"],
        experience_years=parsed["experience_years"],
        education=parsed["education"],
        name=parsed.get("name"),
        email=parsed.get("email"),
    )


@router.post("/score", response_model=ScorerResponse)
async def score_resume(request: ScorerRequest):
    """
    Match a resume against a job description and return match score.
    """
    resume_data = resume_store.get(request.resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload first.")

    parsed = resume_data["parsed"]
    result = resume_scorer.compute_score(parsed, request.job_description)

    return ScorerResponse(
        resume_id=request.resume_id,
        match_score=result["match_score"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        experience_match=result["experience_match"],
        summary=result["summary"],
    )


@router.post("/suggestions", response_model=ResumeSuggestionsResponse)
async def suggest_resume(request: ResumeSuggestionsRequest):
    """
    Generate resume improvement suggestions using LLM.
    """
    resume_data = resume_store.get(request.resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload first.")

    parsed = resume_data["parsed"]
    result = resume_advisor.generate_suggestions(parsed, request.job_description)

    return ResumeSuggestionsResponse(
        resume_id=request.resume_id,
        suggestions=result.get("suggestions", []),
        overall_summary=result.get("overall_summary", ""),
    )


@router.get("/{resume_id}")
async def get_resume(resume_id: str):
    """Get parsed resume data by ID."""
    resume_data = resume_store.get(resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return resume_data["parsed"]
