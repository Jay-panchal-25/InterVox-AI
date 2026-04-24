import os
import time
import uuid

import pygame
import speech_recognition as sr
from gtts import gTTS


def speak(text):
    # Convert text to speech for the CLI interview flow.
    print(f"\n[AI]: {text}")
    filename = f"temp_{uuid.uuid4()}.mp3"

    try:
        tts = gTTS(text=text, lang="en")
        tts.save(filename)

        # Reuse the pygame mixer if it is already initialized.
        if not pygame.mixer.get_init():
            pygame.mixer.init()

        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()

        while pygame.mixer.music.get_busy():
            time.sleep(0.1)

        pygame.mixer.music.stop()
        pygame.mixer.music.unload()
    except Exception as error:
        print(f"TTS Error: {error}")
    finally:
        # Temporary audio files are always cleaned up after playback.
        if os.path.exists(filename):
            try:
                os.remove(filename)
                print(f"Deleted: {filename}")
            except Exception as error:
                print(f"Failed to delete file: {error}")


def listen():
    # Capture one spoken answer and convert it to text.
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        print("\nSpeak your answer...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio)
        print(f"\n[You]: {text}")
        return text
    except sr.UnknownValueError:
        print("Could not understand audio")
        return ""
    except sr.RequestError:
        print("Speech service error")
        return ""
