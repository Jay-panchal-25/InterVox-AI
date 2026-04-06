import os
from faster_whisper import WhisperModel

# Load Whisper model once at startup (base is fast & accurate enough)
_model = None


def get_whisper_model():
    global _model
    if _model is None:
        # Default to CPU-friendly settings for Windows
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    return _model


class STTService:
    def speech_to_text(self, audio_path: str) -> dict:
        """
        Transcribe audio file to text using Whisper.
        Supports: .mp3, .wav, .m4a, .webm, .ogg

        Returns:
            { "transcript": str, "language": str, "confidence": float }
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        model = get_whisper_model()
        segments, info = model.transcribe(audio_path)

        collected = []
        avg_logprobs = []
        for seg in segments:
            if seg.text:
                collected.append(seg.text)
            if seg.avg_logprob is not None:
                avg_logprobs.append(seg.avg_logprob)

        transcript = " ".join(collected).strip()
        language = info.language or "en"

        # Faster-Whisper doesn't return raw confidence, estimate from segments
        confidence = None
        if avg_logprobs:
            import math
            avg_logprob = sum(avg_logprobs) / len(avg_logprobs)
            # Convert log prob to 0-1 confidence (rough estimate)
            confidence = round(min(1.0, math.exp(avg_logprob)), 3)

        return {
            "transcript": transcript,
            "language": language,
            "confidence": confidence,
        }


# Singleton instance
stt_service = STTService()
