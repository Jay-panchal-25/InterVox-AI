from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from services.prompt import get_question_prompt
from services.evaluator_prompt import get_evaluation_prompt

load_dotenv()

app = FastAPI(title="InterVox AI")

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
def generate(req: QuestionRequest):
    try:
        prompt = get_question_prompt()

        chain = prompt | llm

        response = chain.invoke({
            "resume": req.resume,
            "jd": req.jd
        })

        return {"result": response.content}

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