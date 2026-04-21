from gtts import gTTS
import os
import uuid
import pygame
import time
import speech_recognition as sr

# ==============================
# 🔊 TEXT TO SPEECH
# ==============================
def speak(text):
    print(f"\n[AI]: {text}")

    filename = f"temp_{uuid.uuid4()}.mp3"

    try:
        # Generate audio
        tts = gTTS(text=text, lang='en')
        tts.save(filename)

        # Init mixer only once
        if not pygame.mixer.get_init():
            pygame.mixer.init()

        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()

        # Wait until audio finishes
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)

        pygame.mixer.music.stop()
        pygame.mixer.music.unload()   # 🔴 VERY IMPORTANT

    except Exception as e:
        print(f"⚠️ TTS Error: {e}")

    finally:
        # ✅ Always runs (even if error happens)
        if os.path.exists(filename):
            try:
                os.remove(filename)
                print(f"🗑️ Deleted: {filename}")
            except Exception as e:
                print(f"❌ Failed to delete file: {e}")


# ==============================
# 🎤 SPEECH TO TEXT
# ==============================
def listen():
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        print("\n🎤 Speak your answer...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio)
        print(f"\n[You]: {text}")
        return text

    except sr.UnknownValueError:
        print("❌ Could not understand audio")
        return ""

    except sr.RequestError:
        print("❌ Speech service error")
        return ""