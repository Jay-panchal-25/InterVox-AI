import os
import uuid
from gtts import gTTS

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)


class TTSService:
    def text_to_speech(self, text: str, session_id: str = "") -> str:
        """
        Convert text to speech and save as MP3.
        Returns the file path of the generated audio.
        """
        filename = f"{session_id}_{uuid.uuid4().hex[:8]}.mp3" if session_id else f"{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)

        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(filepath)

        return filepath

    def cleanup_session_audio(self, session_id: str):
        """Delete all audio files for a session."""
        for fname in os.listdir(AUDIO_DIR):
            if fname.startswith(session_id):
                try:
                    os.remove(os.path.join(AUDIO_DIR, fname))
                except Exception:
                    pass


# Singleton instance
tts_service = TTSService()
