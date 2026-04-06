from pydantic import BaseModel
from typing import List, Optional


# ── Resume ────────────────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    resume_id: str
    extracted_skills: List[str]
    experience_years: float
    education: List[str]
    name: Optional[str] = None
    email: Optional[str] = None


class ScorerRequest(BaseModel):
    resume_id: str
    job_description: str


class ScorerResponse(BaseModel):
    resume_id: str
    match_score: float            # 0–100
    matched_skills: List[str]
    missing_skills: List[str]
    experience_match: bool
    summary: str

class ResumeSuggestionsRequest(BaseModel):
    resume_id: str
    job_description: str


class ResumeSuggestionsResponse(BaseModel):
    resume_id: str
    suggestions: List[str]
    overall_summary: str



# ── Interview ─────────────────────────────────────────────────────────────────

class StartInterviewRequest(BaseModel):
    resume_id: str
    job_description: str
    job_title: Optional[str] = None
    num_questions: int = 5


class StartInterviewResponse(BaseModel):
    session_id: str
    first_question: str
    question_number: int
    total_questions: int


class NextQuestionRequest(BaseModel):
    session_id: str


class NextQuestionResponse(BaseModel):
    session_id: str
    question: Optional[str]
    question_number: int
    total_questions: int
    is_last: bool


# ── Evaluation ────────────────────────────────────────────────────────────────

class EvaluateAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str


class AnswerEvaluation(BaseModel):
    question: str
    answer: str
    relevance_score: float        # 0–10
    depth_score: float            # 0–10
    clarity_score: float          # 0–10
    overall_score: float          # 0–10
    feedback: str


class FinalReportRequest(BaseModel):
    session_id: str
    resume_score: float


class FinalReportResponse(BaseModel):
    session_id: str
    resume_score: float           # 0–100
    interview_score: float        # 0–100
    final_score: float            # (resume*0.4) + (interview*0.6)
    question_evaluations: List[AnswerEvaluation]
    strengths: List[str]
    improvements: List[str]
    overall_feedback: str


# ── Speech ────────────────────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str
    session_id: str


class STTResponse(BaseModel):
    transcript: str
    confidence: Optional[float] = None
