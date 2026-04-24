# InterVox AI

InterVox AI is an AI-powered interview practice app that generates interview questions from a candidate's resume and a target job description, runs a guided interview flow, and produces AI-based scoring with overall feedback.

## Features

- Resume-driven and JD-driven interview question generation
- Multiple question categories:
  - Technical
  - Project-based
  - Scenario-based
  - HR / behavioral
- AI evaluation of each answer using a structured rubric
- Weighted overall scoring
- Final interview summary with total score, feedback, and improvement suggestions
- File upload support for `.txt`, `.pdf`, and `.docx`
- Browser-based voice support:
  - Text-to-speech for reading questions
  - Speech-to-text for capturing answers
- CLI voice interview flow using the backend voice service

## How It Works

```text
Resume + Job Description
        |
        v
Question Generation
        |
        v
Interactive Interview
        |
        v
Answer Evaluation
        |
        v
Final Interview Summary
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
|   |-- uv.lock
|   |-- README.md
|   |-- content/
|   |   |-- resume.txt
|   |   `-- job_description.txt
|   `-- services/
|       |-- evaluator.py
|       |-- evaluator_prompt.py
|       |-- file_parser.py
|       |-- generator.py
|       |-- llm.py
|       |-- prompt.py
|       `-- voice.py
|-- Frontend/
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- index.html
|   |-- public/
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- index.css
|       |-- components/
|       |-- context/
|       |-- lib/
|       `-- pages/
|-- .gitignore
`-- README.md
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
