from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import os

load_dotenv()

from routes.resume import router as resume_router   
from routes.interview import router as interview_router
from routes.evaluate import router as evaluate_router

app = FastAPI(
    title="InterVox AI",
    description="Voice-based AI Interview Simulator",
    version="1.0.0",
)

# ── CORS (allow React frontend) ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(resume_router,   prefix="/api/resume",    tags=["Resume"])
app.include_router(interview_router, prefix="/api/interview", tags=["Interview"])
app.include_router(evaluate_router,  prefix="/api/evaluate",  tags=["Evaluate"])


@app.get("/")
async def root():
    return {"message": "InterVox AI Backend is running 🚀"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
