# 🎤 InterVox AI – AI-Powered Interview Simulator

InterVox AI is an intelligent interview simulation system that generates personalized interview questions from a candidate’s resume and job description, evaluates answers using LLMs, and provides structured feedback with scoring.

---

## 🚀 Features

* 📄 Upload Resume + Job Description
* 🤖 AI-generated interview questions
* 🧠 Multi-dimensional answer evaluation
* 📊 Scoring system (not random, weighted logic)
* 📉 Weak area detection
* 🔁 Interactive interview loop (CLI-based)

---

## 🧠 Core Idea

Most interview tools:

* Ask generic questions
* Give vague feedback

InterVox AI solves this by:

* Personalizing questions based on user profile
* Evaluating answers like a real interviewer
* Providing structured, actionable feedback

---

## ⚙️ System Architecture

```
Resume + JD → Question Generator (LLM)
                   ↓
            Interview Loop
                   ↓
     Answer → Evaluation Engine (LLM)
                   ↓
           Scoring + Feedback
                   ↓
              Final Report
```

---

## 🧩 Modules

### 1. Question Generator

* Input: Resume + Job Description
* Output: Structured interview questions
* Categories:

  * Technical
  * Project-based
  * Scenario-based
  * HR

---

### 2. Evaluation Engine

Evaluates answers on:

* Technical Accuracy
* Depth
* Clarity
* Structure
* Communication

Returns:

```json
{
  "technical_accuracy": 8,
  "depth": 6,
  "clarity": 7,
  "structure": 6,
  "communication": 7,
  "feedback": "...",
  "improvement_suggestions": []
}
```

---

### 3. Scoring System

LLM does NOT decide final score.

We use weighted scoring:

```
technical_accuracy → 35%
depth → 25%
clarity → 15%
structure → 15%
communication → 10%
```

This ensures:

* Consistency
* Reliability
* Control

---

### 4. Interview Loop

```
Question → User Answer → Evaluation → Store → Next Question
```

Final Output:

* Average Score
* Weak Areas
* Feedback

---

## 🛠️ Tech Stack

### Backend

* Python
* LangChain Core
* Groq (LLM API)

### Utilities

* python-dotenv

### Package Manager

* uv

---

## 📦 Installation

### 1. Initialize project

```
uv init
```

### 2. Install dependencies

```
uv add langchain-core langchain-groq python-dotenv
```

---

## 🔑 Environment Setup

Create `.env` file:

```
GROQ_API_KEY=your_api_key_here
```

---

## ▶️ Run Project

```
python main.py
```

---

## 📁 Project Structure

```
intervox_ai/
│
├── main.py
├── services/
│   ├── llm.py
│   ├── generator.py
│   ├── evaluator.py
│   └── prompts.py
│
├── content/
│   ├── resume.txt
│   └── job_description.txt
│
├── .env
├── pyproject.toml
```

---

## ⚠️ Limitations

* LLM scoring is not perfectly consistent
* No voice interaction (yet)
* CLI-based (no UI)
* No data persistence

---

## 🚀 Future Improvements

* 🎤 Voice input (Speech-to-Text)
* 🔊 AI voice interviewer (Text-to-Speech)
* 🌐 Web UI (React + FastAPI)
* 📊 Progress tracking dashboard
* 🧠 Improved evaluation with rubric + examples
* 📁 Multi-user system

---

## 💡 Key Learning Outcomes

* LLM-based system design
* Prompt engineering
* Structured output parsing
* Evaluation logic design
* Building real AI pipelines

---

## 🧠 Why This Project Matters

This is NOT just:

> “LLM generating questions”

This is:

* A structured evaluation system
* A simulation of real interviews
* A foundation for AI-driven hiring tools

---

## 📌 Final Note

InterVox AI focuses on **logic and evaluation**, not just flashy features.

That’s what makes it:

* More realistic
* More useful
* More valuable in real-world scenarios

---

## 👨‍💻 Author

Jay Panchal
AI/ML Developer

---

## ⭐ If you like this project

Star it, fork it, improve it.
