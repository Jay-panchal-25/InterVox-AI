from dotenv import load_dotenv

from services.evaluator import evaluate_answer
from services.generator import generate_questions
from services.voice import listen, speak

RESUME_PATH = "content/resume.txt"
JD_PATH = "content/job_description.txt"
MAX_QUESTIONS = 5


def setup():
    # Load environment variables for the CLI workflow.
    load_dotenv()


def get_questions():
    # Build a short interview set from the generated categories.
    data = generate_questions(RESUME_PATH, JD_PATH)

    if "error" in data:
        print("Error generating questions")
        print(data)
        raise SystemExit(1)

    questions = (
        data.get("technical", [])
        + data.get("project_based", [])
        + data.get("scenario_based", [])
        + data.get("hr", [])
    )

    return questions[:MAX_QUESTIONS]


def run_interview(questions):
    # Run the local voice interview loop and collect per-answer evaluations.
    results = []

    for index, question in enumerate(questions, 1):
        # Questions can arrive as raw strings or structured objects.
        if isinstance(question, dict):
            question_text = question.get("question", "")
        else:
            question_text = str(question)

        print(f"\nQ{index}: {question_text}")
        speak(question_text)

        answer = listen()

        if not answer:
            print("No input detected. Try again...")
            answer = listen()

            if not answer:
                print("Skipping question...")
                continue

        evaluation = evaluate_answer(question_text, answer)
        results.append(evaluation)

        print("\n--- Evaluation ---")
        print("Score:", evaluation["overall_score"])
        print("Feedback:", evaluation["feedback"])

    return results


def generate_report(results):
    # Print a compact CLI summary after the interview completes.
    print("\n===== FINAL REPORT =====")

    if not results:
        print("No valid answers recorded.")
        return

    total_score = sum(result["overall_score"] for result in results)
    avg_score = round(total_score / len(results), 2)

    print("Average Score:", avg_score)

    weak_areas = []

    for result in results:
        if result["technical_accuracy"] < 6:
            weak_areas.append("technical_accuracy")
        if result["depth"] < 6:
            weak_areas.append("depth")
        if result["clarity"] < 6:
            weak_areas.append("clarity")

    print("Weak Areas:", sorted(set(weak_areas)))


def main():
    print("\n===== INTERVOX AI STARTED =====\n")

    setup()
    questions = get_questions()
    results = run_interview(questions)
    generate_report(results)

    print("\n===== INTERVIEW COMPLETED =====\n")


if __name__ == "__main__":
    main()
