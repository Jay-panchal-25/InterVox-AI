from dotenv import load_dotenv
from services.generator import generate_questions
from services.evaluator import evaluate_answer
from services.voice import speak, listen
# ==============================
# CONFIG
# ==============================
RESUME_PATH = "content/resume.txt"
JD_PATH = "content/job_description.txt"
MAX_QUESTIONS = 5


# ==============================
# LOAD ENV
# ==============================
def setup():
    load_dotenv()


# ==============================
# GET QUESTIONS
# ==============================
def get_questions():
    data = generate_questions(RESUME_PATH, JD_PATH)

    if "error" in data:
        print("Error generating questions")
        print(data)
        exit()

    questions = (
        data.get("technical", []) +
        data.get("project_based", []) +
        data.get("scenario_based", []) +
        data.get("hr", [])
    )

    return questions[:MAX_QUESTIONS]


# ==============================
# RUN INTERVIEW
# ==============================
def run_interview(questions):
    results = []

    for i, question in enumerate(questions, 1):

        # ✅ ALWAYS define first
        if isinstance(question, dict):
            question_text = question.get("question", "")
        else:
            question_text = str(question)

        # Now safe to use
        print(f"\nQ{i}: {question_text}")

        speak(question_text)

        answer = listen()

        if not answer:
            print("⚠️ No input detected. Try again...")
            answer = listen()

            if not answer:
                print("❌ Skipping question...")
                continue

        evaluation = evaluate_answer(question_text, answer)

        results.append(evaluation)

        print("\n--- Evaluation ---")
        print("Score:", evaluation["overall_score"])
        print("Feedback:", evaluation["feedback"])

    return results

# ==============================
# GENERATE FINAL REPORT
# ==============================
def generate_report(results):
  
    print("\n===== FINAL REPORT =====")
    if len(results) == 0:
        print("❌ No valid answers recorded.")
        return

    total_score = sum(r["overall_score"] for r in results)
    avg_score = round(total_score / len(results), 2)

    print("Average Score:", avg_score)

    weak_areas = []

    for r in results:
        if r["technical_accuracy"] < 6:
            weak_areas.append("technical_accuracy")
        if r["depth"] < 6:
            weak_areas.append("depth")
        if r["clarity"] < 6:
            weak_areas.append("clarity")

    print("Weak Areas:", list(set(weak_areas)))


# ==============================
# MAIN ENTRY
# ==============================
def main():
    print("\n===== INTERVOX AI STARTED =====\n")

    setup()

    questions = get_questions()

    results = run_interview(questions)

    generate_report(results)

    print("\n===== INTERVIEW COMPLETED =====\n")


if __name__ == "__main__":
    main()