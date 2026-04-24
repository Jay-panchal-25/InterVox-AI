import json
import re

from services.evaluator_prompt import get_evaluation_prompt
from services.llm import get_llm


def calculate_score(result):
    # Apply fixed weights so the final score stays deterministic.
    weights = {
        "technical_accuracy": 0.35,
        "depth": 0.25,
        "clarity": 0.15,
        "structure": 0.15,
        "communication": 0.10,
    }

    score = 0

    for key, weight in weights.items():
        score += result.get(key, 0) * weight

    return round(score, 2)


def parse_evaluation_json(content):
    # Handle plain JSON and fenced JSON returned by the model.
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"```json(.*?)```", content, re.DOTALL)

        if match:
            return json.loads(match.group(1).strip())

        raise


def evaluate_answer(question, answer):
    # Evaluate a single answer and attach the computed overall score.
    llm = get_llm()
    prompt = get_evaluation_prompt()

    chain = prompt | llm
    response = chain.invoke({
        "question": question,
        "answer": answer,
    })

    content = response.content

    try:
        result = parse_evaluation_json(content)
        result["overall_score"] = calculate_score(result)
        return result
    except Exception:
        return {
            "error": "Invalid JSON from LLM",
            "raw_output": content,
        }
