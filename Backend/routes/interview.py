import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from schemas import (
    StartInterviewRequest, StartInterviewResponse,
    NextQuestionRequest, NextQuestionResponse,
    TTSRequest, STTResponse,
)
from services.interviewer import interviewer
from services.tts import tts_service
from services.stt import stt_service
from routes.resume import resume_store
from utils.helpers import generate_id

router = APIRouter()

TEMP_AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "audio", "uploads")
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)


@router.post("/start", response_model=StartInterviewResponse)
async def start_interview(request: StartInterviewRequest):
    """
    Start a new interview session.
    Generates questions and returns the first question.
    """
    resume_data = resume_store.get(request.resume_id)
    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found. Please upload first.")

    session_id = generate_id("session")

    try:
        first_question = interviewer.create_session(
            session_id=session_id,
            resume_data=resume_data["parsed"],
            job_description=request.job_description,
            num_questions=request.num_questions,
            job_title=request.job_title,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

    total = interviewer.get_total_questions(session_id)

    return StartInterviewResponse(
        session_id=session_id,
        first_question=first_question,
        question_number=1,
        total_questions=total,
    )


@router.post("/next", response_model=NextQuestionResponse)
async def next_question(request: NextQuestionRequest):
    """Advance to the next interview question."""
    session = interviewer.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    question = interviewer.get_next_question(request.session_id)
    total = interviewer.get_total_questions(request.session_id)
    current = interviewer.get_current_index(request.session_id)

    return NextQuestionResponse(
        session_id=request.session_id,
        question=question,
        question_number=current + 1,
        total_questions=total,
        is_last=(question is None or current + 1 >= total),
    )


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Convert a question text to speech and return audio file.
    """
    try:
        audio_path = tts_service.text_to_speech(request.text, request.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

    return FileResponse(
        path=audio_path,
        media_type="audio/mpeg",
        filename=os.path.basename(audio_path),
    )


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Convert uploaded audio file to text using Whisper.
    Accepts: .mp3, .wav, .m4a, .webm, .ogg
    """
    allowed_extensions = {".mp3", ".wav", ".m4a", ".webm", ".ogg"}
    ext = os.path.splitext(audio.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {allowed_extensions}"
        )

    temp_path = os.path.join(TEMP_AUDIO_DIR, f"upload_{generate_id()}{ext}")
    with open(temp_path, "wb") as f:
        f.write(await audio.read())

    try:
        result = stt_service.speech_to_text(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return STTResponse(
        transcript=result["transcript"],
        confidence=result.get("confidence"),
    )
