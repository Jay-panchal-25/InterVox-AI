from fastapi import APIRouter, HTTPException

from schemas import (
    EvaluateAnswerRequest, AnswerEvaluation,
    FinalReportRequest, FinalReportResponse,
)
from services.evaluator import evaluator
from services.interviewer import interviewer, interview_sessions
from utils.helpers import calculate_final_score

router = APIRouter()


@router.post("/answer", response_model=AnswerEvaluation)
async def evaluate_answer(request: EvaluateAnswerRequest):
    """
    Evaluate a single interview answer.
    Also saves the Q&A to the session for the final report.
    """
    session = interviewer.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    jd = session.get("job_description", "")

    # Save answer to session
    interviewer.save_answer(request.session_id, request.question, request.answer)

    # Evaluate
    try:
        result = evaluator.evaluate_answer(
            question=request.question,
            answer=request.answer,
            job_description=jd,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

    return AnswerEvaluation(**result)


@router.post("/final-report", response_model=FinalReportResponse)
async def get_final_report(request: FinalReportRequest):
    """
    Generate the complete interview report.
    Evaluates all answers and computes final score.
    """
    session = interviewer.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    qa_pairs = session.get("answers", [])
    jd = session.get("job_description", "")

    if not qa_pairs:
        raise HTTPException(status_code=400, detail="No answers found in this session.")

    # Evaluate all answers
    try:
        evaluations = evaluator.evaluate_all_answers(qa_pairs, jd)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

    # Compute interview score (0-100)
    interview_score = evaluator.compute_interview_score(evaluations)

    # Final score formula: (resume * 0.4) + (interview * 0.6)
    final_score = calculate_final_score(request.resume_score, interview_score)

    # Generate final feedback
    feedback_data = evaluator.generate_final_feedback(
        evaluations=evaluations,
        resume_score=request.resume_score,
        interview_score=interview_score,
        job_description=jd,
    )

    return FinalReportResponse(
        session_id=request.session_id,
        resume_score=request.resume_score,
        interview_score=interview_score,
        final_score=final_score,
        question_evaluations=[AnswerEvaluation(**e) for e in evaluations],
        strengths=feedback_data["strengths"],
        improvements=feedback_data["improvements"],
        overall_feedback=feedback_data["overall_feedback"],
    )
