from services.llm import get_llm
from services.evaluator_prompt import get_evaluation_prompt
import json

def calculate_score(result):
    weights = {
        "technical_accuracy": 0.35,
        "depth": 0.25,
        "clarity": 0.15,
        "structure": 0.15,
        "communication": 0.10
    }

    score = 0

    for key in weights:
        score += result.get(key, 0) * weights[key]

    return round(score, 2)

def evaluate_answer(question, answer):
    llm = get_llm()
    prompt = get_evaluation_prompt()

    chain = prompt | llm

    response = chain.invoke({
        "question": question,
        "answer": answer
    })

    content = response.content

    try:
        result = json.loads(content)

# ✅ Add calculated score
        result["overall_score"] = calculate_score(result)

        return result
    except:
        return {
            "error": "Invalid JSON from LLM",
            "raw_output": content
        }