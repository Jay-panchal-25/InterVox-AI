import json
import os
import re

from services.llm import get_llm
from services.prompt import get_question_prompt


def extract_json(text):
    # Parse direct JSON or JSON wrapped in a fenced code block.
    try:
        match = re.search(r"```json(.*?)```", text, re.DOTALL)
        if match:
            return json.loads(match.group(1).strip())

        return json.loads(text)
    except Exception:
        return {
            "error": "Invalid JSON",
            "raw": text,
        }


def get_question_text(question):
    if isinstance(question, dict):
        return str(question.get("question", "")).strip()

    return str(question).strip()


def dedupe_questions(questions):
    seen = set()
    unique = []

    for question in questions:
        text = get_question_text(question)
        normalized = re.sub(r"\s+", " ", text.lower()).strip()

        if not normalized or normalized in seen:
            continue

        seen.add(normalized)
        unique.append(text)

    return unique


def load_text(path):
    # Load plain text content from a local file path.
    with open(path, "r", encoding="utf-8") as file:
        return file.read()


def resolve_input_text(value):
    # Support both raw text input and file-path input for the CLI flow.
    if isinstance(value, str) and os.path.isfile(value):
        return load_text(value)

    return value


def generate_questions(resume_input, jd_input):
    # Generate interview questions tailored to the provided resume and JD.
    llm = get_llm()
    prompt = get_question_prompt()

    resume = resolve_input_text(resume_input)
    jd = resolve_input_text(jd_input)

    chain = prompt | llm
    response = chain.invoke({
        "resume": resume,
        "jd": jd,
    })

    try:
        return extract_json(response.content)
    except Exception:
        return {
            "error": "Invalid JSON",
            "raw": response.content,
        }


def build_question_payload(result):
    question_groups = {
        "technical": result.get("technical", []),
        "project_based": result.get("project_based", []),
        "scenario_based": result.get("scenario_based", []),
        "hr": result.get("hr", []),
    }
    questions = dedupe_questions([
        *question_groups["technical"],
        *question_groups["project_based"],
        *question_groups["scenario_based"],
        *question_groups["hr"],
    ])

    return {
        "question_groups": question_groups,
        "questions": questions,
        "weak_areas": result.get("weak_areas", []),
    }
