from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.evaluator import evaluate_answer
from services.file_parser import extract_text
from services.generator import build_question_payload, generate_questions
from services.interview_summary import summarize_interview
from services.resume_analysis import analyze_resume

load_dotenv()

app = FastAPI(title="InterVox AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    # Legacy model kept for compatibility with earlier request formats.
    resume: str
    jd: str


class AnswerRequest(BaseModel):
    # Request payload for answer evaluation.
    question: str
    answer: str


class InterviewResultItem(BaseModel):
    question: str = ""
    answer: str = ""
    technical_accuracy: float = 0
    depth: float = 0
    clarity: float = 0
    structure: float = 0
    communication: float = 0
    overall_score: float = 0
    feedback: str = ""
    improvement_suggestions: list[str] = Field(default_factory=list)


class InterviewSummaryRequest(BaseModel):
    results: list[InterviewResultItem] = Field(default_factory=list)


@app.get("/")
def home():
    # Basic health check used by local development.
    return {"message": "InterVox AI Running"}


@app.post("/generate")
async def generate(
    resume: UploadFile = File(None),
    jd: UploadFile = File(None),
    resume_text: str = Form(None),
    jd_text: str = Form(None),
):
    # Generate interview questions from uploaded files or pasted text.
    try:
        resume_data = extract_text(resume) if resume else (resume_text.strip() if resume_text else "")
        jd_data = extract_text(jd) if jd else (jd_text.strip() if jd_text else "")

        if not resume_data or not jd_data:
            raise HTTPException(status_code=400, detail="Provide either files or text")

        result = generate_questions(resume_data, jd_data)

        if result.get("error"):
            raise HTTPException(status_code=502, detail=result["error"])

        return {
            "analysis": analyze_resume(resume_data, jd_data),
            **build_question_payload(result),
        }
    except Exception as error:
        if isinstance(error, HTTPException):
            raise error

        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/evaluate")
def evaluate(req: AnswerRequest):
    # Evaluate one answer against one interview question.
    try:
        result = evaluate_answer(req.question, req.answer)

        if result.get("error"):
            raise HTTPException(status_code=502, detail=result["error"])

        return result
    except Exception as error:
        if isinstance(error, HTTPException):
            raise error

        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/interview-summary")
def interview_summary(req: InterviewSummaryRequest):
    # Build the final interview summary on the backend.
    try:
        return summarize_interview([result.model_dump() for result in req.results])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
