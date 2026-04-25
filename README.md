# InterVox AI

InterVox AI is an AI-powered interview preparation and resume intelligence system that analyzes a candidate’s resume against a job description, generates tailored interview questions, evaluates answers, and provides structured performance feedback.

# 🚀 Features

## 🧠 Resume Intelligence System (NEW)
- ATS score based on:
  - Keyword relevance
  - Resume structure
  - Formatting quality
- AI-based JD matching score
- Final combined score (ATS + AI)
- Matched vs missing keyword detection
- Actionable resume feedback:
  - Strengths
  - Mistakes
  - Improvement suggestions

---

## 🎯 Interview System
- Resume + Job Description based question generation
- Multiple question types:
  - Technical
  - Project-based
  - Scenario-based
  - HR / behavioral
- Adaptive interview flow (context-aware)

---

## 📊 Answer Evaluation Engine
- AI-based structured scoring:
  - Technical accuracy
  - Depth
  - Clarity
  - Structure
  - Communication
- Weighted scoring system
- Per-question feedback with improvement tips

---

## 🧾 Final Interview Summary
- Total score calculation
- Performance classification (Strong / Good / Weak)
- Dimension-wise breakdown
- Weak & strong area detection  
---

## How It Works
```text
Resume + Job Description
        ↓
Resume Analysis (ATS + AI + Keywords)
        ↓
Interview Question Generation
        ↓
Interactive Interview Flow
        ↓
Answer Evaluation (AI + rubric scoring)
        ↓
Final Summary + Feedback Report
```

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- React Router

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- LangChain
- LangChain Groq
- python-dotenv

### Voice and File Processing

- Web Speech API in the browser
- SpeechRecognition
- gTTS
- pygame
- PyPDF
- python-docx

## Project Structure

```text
InterVox-AI/
|-- Backend/
|   |-- app.py
|   |-- main.py
|   |-- pyproject.toml
|   |-- requirement.txt
|   `-- services/
|       |-- evaluator_prompt.py
|       |-- evaluator.py
|       |-- file_parser.py
|       |-- generator.py
|       |-- interview_summary.py
|       |-- llm.py
|       |-- prompt.py
|       |-- resume_analysis.py
|       `-- voice.py
|-- Frontend/
|   |-- eslint.config.js
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   |-- README.md
|   |-- public/
|   `-- src/
|       |-- App.jsx
|       |-- index.css
|       |-- main.jsx
|       |-- components/
|       |   |-- AppShell.jsx
|       |   |-- FileDropCard.jsx
|       |   `-- SectionCard.jsx
|       |-- context/
|       |   `-- InterviewContext.jsx
|       `-- pages/
|           |-- AnalysisPage.jsx
|           |-- HomePage.jsx
|           |-- InterviewPage.jsx
|           `-- ResultsPage.jsx
|-- README.md
```

## Requirements

Install these before running the project:

- Python 3.11 or later
- Node.js 18 or later
- npm
- A Groq API key

Optional but recommended:

- `uv` for Python dependency management

## Environment Variables

Create a `.env` file inside `Backend/`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/InterVox-AI.git
cd InterVox-AI
```

### 2. Install backend dependencies

Using `uv`:

```bash
cd Backend
uv sync
```

Or using `pip`:

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirement.txt
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd Frontend
npm install
```

## Run the Project

### Start the backend API

From `Backend/`:

```bash
uvicorn app:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### Start the frontend

From `Frontend/`:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## API Reference

### `GET /`

Simple health endpoint.

Example response:

```json
{
  "message": "InterVox AI Running"
}
```

### `POST /generate`

Generates interview questions from either uploaded files or pasted text.

Accepted form fields:

- `resume`
- `jd`
- `resume_text`
- `jd_text`

Supported file types:

- `.txt`
- `.pdf`
- `.docx`

### `POST /evaluate`

Evaluates one answer against one question.

Request body:

```json
{
  "question": "Tell me about a project where you used Python.",
  "answer": "I built..."
}
```

Response shape:

```json
{
  "result": {
    "technical_accuracy": 7,
    "depth": 6,
    "clarity": 7,
    "structure": 6,
    "communication": 7,
    "feedback": "Detailed feedback from the evaluator",
    "improvement_suggestions": [
      "Add more specifics",
      "Mention tradeoffs"
    ],
    "overall_score": 6.65
  }
}
```

## CLI Mode

You can also run the backend in CLI interview mode.

From `Backend/`:

```bash
python main.py
```

The CLI flow reads:

- `Backend/content/resume.txt`
- `Backend/content/job_description.txt`

It then:

- Generates questions
- Reads them aloud
- Records spoken answers
- Evaluates responses
- Prints a final report

## Notes

- The frontend is currently configured to call `http://localhost:8000`
- CORS is enabled for local Vite development on port `5173`
- Browser microphone support depends on the user's browser and permissions
- CLI voice mode may require additional system audio dependencies depending on the OS

## Author

Jay Panchal
