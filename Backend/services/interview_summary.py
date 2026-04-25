DIMENSION_LABELS = {
    "technical_accuracy": "technical accuracy",
    "depth": "depth",
    "clarity": "clarity",
    "structure": "structure",
    "communication": "communication",
}


def clamp_score(value):
    try:
        score = float(value or 0)
    except (TypeError, ValueError):
        return 0

    return max(0, min(score, 10))


def average_metric(results, key):
    if not results:
        return 0

    total = sum(clamp_score(result.get(key)) for result in results)
    return round(total / len(results), 1)


def get_performance_label(score):
    if score >= 8:
        return "Strong"
    if score >= 6:
        return "Good"
    if score >= 4:
        return "Needs work"
    return "Weak"


def build_feedback(answered_count, average_score, strongest_areas, weakest_areas):
    strengths = ", ".join(strongest_areas) if strongest_areas else "overall consistency"
    weaknesses = ", ".join(weakest_areas) if weakest_areas else "answer depth"

    return (
        f"You completed {answered_count} interview questions with an average score of "
        f"{average_score}/10. Your strongest areas were {strengths}. "
        f"The main gaps showed up in {weaknesses}, so your answers will improve most by "
        f"being more specific, technical, and structured."
    )


def build_suggestions(weakest_areas):
    keys = {area["key"] for area in weakest_areas}
    suggestions = []

    if {"technical_accuracy", "depth"} & keys:
        suggestions.append(
            "Add one concrete example, technical tradeoff, or measurable result in each answer."
        )

    if {"clarity", "structure"} & keys:
        suggestions.append(
            "Lead with the direct answer first, then explain your steps and final impact in order."
        )

    if "communication" in keys:
        suggestions.append(
            "Keep your delivery tighter and end each answer with the outcome you achieved."
        )

    if not suggestions:
        suggestions.append("Keep practicing concise, specific answers to maintain consistency.")

    return suggestions[:4]


def summarize_interview(results):
    answered_count = len(results)
    total_score = round(sum(clamp_score(result.get("overall_score")) for result in results), 1)
    max_score = answered_count * 10
    average_score = round(total_score / answered_count, 1) if answered_count else 0

    dimension_scores = [
        {
            "key": key,
            "label": label,
            "score": average_metric(results, key),
        }
        for key, label in DIMENSION_LABELS.items()
    ]
    ranked = sorted(dimension_scores, key=lambda item: item["score"], reverse=True)
    strongest = ranked[:2]
    weakest = list(reversed(ranked))[:2]

    return {
        "answered_count": answered_count,
        "total_score": total_score,
        "max_score": max_score,
        "average_score": average_score,
        "performance": get_performance_label(average_score),
        "dimension_scores": dimension_scores,
        "feedback": build_feedback(
            answered_count,
            average_score,
            [item["label"] for item in strongest],
            [item["label"] for item in weakest],
        ),
        "improvement_suggestions": build_suggestions(weakest),
    }
