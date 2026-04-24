from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.evaluator import evaluate_answer
from services.file_parser import extract_text
from services.generator import generate_questions

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
            return {"error": "Provide either files or text"}

        result = generate_questions(resume_data, jd_data)
        return {"result": result}
    except Exception as error:
        return {"error": str(error)}


@app.post("/evaluate")
def evaluate(req: AnswerRequest):
    # Evaluate one answer against one interview question.
    try:
        result = evaluate_answer(req.question, req.answer)
        return {"result": result}
    except Exception as error:
        return {"error": str(error)}
