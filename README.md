# InterVox AI

InterVox AI is an AI-powered interview simulation platform that helps candidates practice for role-specific interviews using their resume and a target job description. The system generates personalized questions, evaluates candidate answers with an LLM-based rubric, and provides structured feedback through a modern web interface and a Python backend.

This project sits at the intersection of:

- AI/ML
- Generative AI
- NLP
- Conversational AI
- HRTech / Interview Intelligence
- EdTech / Skill Assessment

## Overview

Traditional interview preparation platforms often rely on generic question banks and shallow feedback. InterVox AI is designed to be more context-aware by using the candidate's profile and the target role to create a focused interview flow.

Core capabilities:

- Resume and job description driven interview question generation
- AI-based evaluation of candidate answers
- Structured feedback across multiple assessment dimensions
- Voice-assisted interview experience
- Web-based workflow for upload, practice, and review

## Key Features

- Personalized question generation from resume and job description
- Multiple question categories:
  - Technical
  - Project-based
  - Scenario-based
  - HR / behavioral
- Answer evaluation using an LLM rubric
- Structured feedback with improvement suggestions
- Weighted scoring logic available in the backend service layer
- File upload support for `.txt`, `.pdf`, and `.docx`
- Voice support:
  - Text-to-speech for reading questions
  - Speech-to-text for capturing answers
- React frontend for a polished interview practice experience
- FastAPI backend for API-driven integration

## Problem Statement

Candidates usually prepare using static question lists that do not reflect:

- Their actual background
- The exact role they are applying for
- Their weak areas in communication or technical explanation

InterVox AI addresses this by creating a personalized interview simulation pipeline where the AI behaves more like a structured interviewer instead of a simple chatbot.

## How It Works

```text
Resume + Job Description
        |
        v
Question Generation via LLM
        |
        v
Interactive Interview Session
        |
        v
Answer Evaluation via LLM Rubric
        |
        v
Feedback, Suggestions, and Interview Report
```

## AI/ML Design

### 1. Question Generation

The backend uses prompt engineering with LangChain and Groq-hosted LLMs to generate interview questions based on:

- Candidate experience
- Skills and projects in the resume
- Role expectations from the job description

Expected structured output:

- `technical`
- `project_based`
- `scenario_based`
- `hr`
- `weak_areas`

### 2. Answer Evaluation

Answers are assessed against a structured rubric covering:

- Technical Accuracy
- Depth
- Clarity
- Structure
- Communication

The evaluator returns detailed feedback and improvement suggestions in JSON format.

### 3. Scoring Logic

The backend service layer includes weighted score calculation with the following logic:

```text
technical_accuracy -> 35%
depth              -> 25%
clarity            -> 15%
structure          -> 15%
communication      -> 10%
```

This design keeps the scoring logic deterministic and transparent instead of relying only on a free-form model response.

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS 4

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- LangChain
- LangChain Core
- LangChain Groq
- python-dotenv

### AI / Voice / Document Processing

- Groq API with `llama-3.1-8b-instant`
- SpeechRecognition
- PyAudio
- gTTS
- pygame
- PyPDF
- python-docx

## Project Structure

```text
InterVox-AI/
|
|-- Backend/
|   |-- app.py                       # FastAPI application
|   |-- main.py                      # CLI interview runner
|   |-- pyproject.toml               # Python project metadata
|   |-- requirement.txt              # Python dependency list
|   |-- uv.lock                      # uv lock file
|   |-- README.md                    # Backend-specific notes
|   |
|   |-- content/
|   |   |-- resume.txt               # Sample/local resume input
|   |   `-- job_description.txt      # Sample/local JD input
|   |
|   `-- services/
|       |-- llm.py                   # LLM client initialization
|       |-- prompt.py                # Prompt for question generation
|       |-- evaluator_prompt.py      # Prompt for answer evaluation
|       |-- generator.py             # Generates interview questions
|       |-- evaluator.py             # Evaluates answers + scoring logic
|       |-- file_parser.py           # TXT/PDF/DOCX parsing
|       `-- voice.py                 # TTS and speech input utilities
|
|-- Frontend/
|   |-- package.json                 # Frontend scripts and dependencies
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- index.html
|   |
|   |-- public/
|   |   |-- favicon.svg
|   |   `-- icons.svg
|   |
|   `-- src/
|       |-- App.jsx                  # Main UI and interview flow
|       |-- App.css
|       |-- index.css
|       |-- main.jsx
|       `-- assets/
|           |-- hero.png
|           |-- react.svg
|           `-- vite.svg
|
|-- .gitignore
`-- README.md
```

## Use Cases

- Interview preparation for software engineering roles
- Personalized mock interviews for students and job seekers
- AI-assisted skill assessment demos
- HRTech and recruitment workflow prototypes
- Conversational AI portfolio project for AI/ML developers

## Installation

### Prerequisites

Make sure you have the following installed:

- Python 3.11 or higher
- Node.js 18 or higher
- npm
- `uv` package manager for Python (recommended)
- A valid Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/InterVox-AI.git
cd InterVox-AI
```

### 2. Backend Setup

Move into the backend folder:

```bash
cd Backend
```

### Option A: Using `uv` (recommended)

Install dependencies:

```bash
uv sync
```

If needed, you can also install from the requirements file:

```bash
uv pip install -r requirement.txt
```

### Option B: Using `pip`

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirement.txt
```

### 3. Frontend Setup

Open a new terminal and move into the frontend folder:

```bash
cd Frontend
npm install
```

### 4. Environment Variables

Create a `.env` file inside the `Backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Notes:

- The backend loads environment variables using `python-dotenv`
- Keep your API key private and never commit `.env` files to GitHub

## Running the Project

You can run InterVox AI in two ways:

- Web application mode
- CLI interview simulation mode

### Run the Backend API

From the `Backend/` directory:

```bash
uvicorn app:app --reload
```

Backend default URL:

```text
http://127.0.0.1:8000
```

### Run the Frontend

From the `Frontend/` directory:

```bash
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

### Run the CLI Version

From the `Backend/` directory:

```bash
python main.py
```

The CLI mode uses local files from:

- `Backend/content/resume.txt`
- `Backend/content/job_description.txt`

It can:

- Generate interview questions
- Read questions aloud
- Capture spoken answers
- Evaluate responses
- Print a final summary report

## API Endpoints

### `GET /`

Health/status endpoint.

Example response:

```json
{
  "message": "InterVox AI Running"
}
```

### `POST /generate`

Generates interview questions from either:

- Uploaded files (`resume`, `jd`)
- Direct form text (`resume_text`, `jd_text`)

Supported input file types:

- `.txt`
- `.pdf`
- `.docx`

### `POST /evaluate`

Evaluates a candidate answer using:

- `question`
- `answer`

Returns structured interview feedback generated by the evaluation prompt.

## Frontend Workflow

The frontend currently supports the following flow:

1. Upload resume
2. Upload job description
3. Generate questions from the backend
4. Answer questions with text or microphone input
5. Review feedback and score-related metrics

## Why This Project Is Valuable

InterVox AI is more than a basic LLM demo. It demonstrates practical engineering in:

- Prompt design for structured output
- LLM integration into full-stack applications
- Resume and job-description contextualization
- Human-centered interview simulation
- AI product thinking for real-world career and hiring workflows

For AI/ML portfolios, this project is useful because it shows both:

- Applied model orchestration
- Product-level implementation with frontend and backend integration


## Author

**Jay Panchal**  
AI/ML Developer


