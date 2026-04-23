from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File,Form

app = FastAPI(title="InterVox AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from services.evaluator_prompt import get_evaluation_prompt

from services.file_parser import extract_text
from services.generator import generate_questions
load_dotenv()

# ==============================
# INIT LLM
# ==============================
llm = ChatGroq(
    model_name="llama-3.1-8b-instant",
    temperature=0.7
)

# ==============================
# REQUEST MODELS
# ==============================
class QuestionRequest(BaseModel):
    resume: str
    jd: str

class AnswerRequest(BaseModel):
    question: str
    answer: str


# ==============================
# HOME
# ==============================
@app.get("/")
def home():
    return {"message": "InterVox AI Running"}


# ==============================
# GENERATE QUESTIONS
# ==============================

@app.post("/generate")
async def generate(
    resume: UploadFile = File(None),
    jd: UploadFile = File(None),
    resume_text: str = Form(None),
    jd_text: str = Form(None),
):
    try:
        # ===== HANDLE FILE INPUT =====
        if resume and jd:
            resume_data = extract_text(resume)
            jd_data = extract_text(jd)

        # ===== HANDLE TEXT INPUT =====
        elif resume_text and jd_text:
            resume_data = resume_text
            jd_data = jd_text

        else:
            return {"error": "Provide either files or text"}

        result = generate_questions(resume_data, jd_data)

        return {"result": result}

    except Exception as e:
        return {"error": str(e)}


# ==============================
# EVALUATE ANSWER
# ==============================
@app.post("/evaluate")
def evaluate(req: AnswerRequest):
    try:
        prompt = get_evaluation_prompt()

        chain = prompt | llm

        response = chain.invoke({
            "question": req.question,
            "answer": req.answer
        })

        return {"result": response.content}

    except Exception as e:
        return {"error": str(e)}
