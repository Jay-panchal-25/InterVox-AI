from services.llm import get_llm
from services.prompt import get_question_prompt
import json
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

def generate_questions(resume_path, jd_path):
    llm = get_llm()
    prompt = get_question_prompt()

    resume = load_text(resume_path)
    jd = load_text(jd_path)

    chain = prompt | llm

    response = chain.invoke({
        "resume": resume,
        "jd": jd
    })

    try:
        return extract_json(response.content) 
    except:
        return {"error": "Invalid JSON", "raw": response.content}
    
