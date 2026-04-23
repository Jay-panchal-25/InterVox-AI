import json
import os
import re
from services.llm import get_llm
from services.prompt import get_question_prompt

def extract_json(text):
    try:
        # Try extracting from ```json block
        match = re.search(r"```json(.*?)```", text, re.DOTALL)
        if match:
            return json.loads(match.group(1).strip())

        # Fallback: direct JSON
        return json.loads(text)

    except Exception:
        return {
            "error": "Invalid JSON",
            "raw": text
        }

def load_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def resolve_input_text(value):
    if isinstance(value, str) and os.path.isfile(value):
        return load_text(value)
    return value

def generate_questions(resume_input, jd_input):
    llm = get_llm()
    prompt = get_question_prompt()

    resume = resolve_input_text(resume_input)
    jd = resolve_input_text(jd_input)

    chain = prompt | llm

    response = chain.invoke({
        "resume": resume,
        "jd": jd
    })

    try:
        return extract_json(response.content) 
    except:
        return {"error": "Invalid JSON", "raw": response.content}
    
