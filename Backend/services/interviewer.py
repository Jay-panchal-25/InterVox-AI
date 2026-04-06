import os
import json
from typing import List, Dict, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=_api_key) if _api_key else None
MODEL = "llama3-70b-8192"

# ── In-memory session store ───────────────────────────────────────────────────
# Structure: { session_id: { questions, current_index, resume_data, jd } }
interview_sessions: Dict[str, Dict] = {}


class Interviewer:
    def _fallback_questions(
        self,
        resume_data: Dict,
        job_description: str,
        num_questions: int,
        job_title: Optional[str] = None,
    ) -> List[str]:
        role = (job_title or "").strip() or "this role"
        skills = resume_data.get("skills", []) or []
        experience = resume_data.get("experience_years", 0)

        questions: List[str] = []
        questions.append(
            f"Tell me about your background and how it prepares you for {role}."
        )

        skill_templates = [
            "Tell me about a project where you used {skill}. What was your role and impact?",
            "What challenges have you faced with {skill}, and how did you resolve them?",
            "How do you decide when to use {skill} versus alternative approaches?",
        ]

        for i, skill in enumerate(skills):
            if len(questions) >= num_questions:
                break
            template = skill_templates[i % len(skill_templates)]
            questions.append(template.format(skill=skill))

        if experience and len(questions) < num_questions:
            questions.append(
                f"With about {experience} years of experience, how has your approach to problem solving evolved?"
            )

        behavioral = [
            "Describe a time you had to handle competing priorities. How did you decide what to do first?",
            "Tell me about a mistake you made on a project and what you learned from it.",
            "How do you collaborate with teammates who have different opinions about the best solution?",
            "What does your ideal code review process look like, and why?",
            "If you joined this team tomorrow, what would your first 30 days look like?",
        ]

        for q in behavioral:
            if len(questions) >= num_questions:
                break
            questions.append(q)

        if len(questions) < num_questions:
            filler = [
                "What is a recent technical topic you learned, and why did you choose it?",
                f"What is the most important skill for success in {role}?",
            ]
            for q in filler:
                if len(questions) >= num_questions:
                    break
                questions.append(q)

        return questions[:num_questions]

    def generate_questions(
        self,
        resume_data: Dict,
        job_description: str,
        num_questions: int = 5,
        job_title: Optional[str] = None,
    ) -> List[str]:
        """
        Use Groq LLM to generate role-specific interview questions
        based on resume and job description.
        """
        skills = ", ".join(resume_data.get("skills", [])[:15])
        experience = resume_data.get("experience_years", 0)
        name = resume_data.get("name", "the candidate")
        role_title = (job_title or "").strip()

        prompt = f"""You are an expert technical interviewer. 
Generate exactly {num_questions} interview questions for a candidate with the following profile:

Candidate Skills: {skills}
Experience: {experience} years
Target Role: {role_title if role_title else "the role described"}
Job Description: {job_description[:800]}

Rules:
- Mix technical and behavioral questions
- Make questions specific to the skills and JD
- Start with a warm-up question, then increase difficulty
- No numbering or bullet points, just the questions
- Return ONLY a JSON array of strings, nothing else

Example format:
["Question 1?", "Question 2?", "Question 3?"]
"""
        if client is None:
            return self._fallback_questions(resume_data, job_description, num_questions, job_title)

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1024,
            )

            raw = response.choices[0].message.content.strip()

            # Parse JSON array
            try:
                # Handle possible markdown code blocks
                if "```" in raw:
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                questions = json.loads(raw)
                if isinstance(questions, list):
                    return questions[:num_questions]
            except Exception:
                pass

            # Fallback: split by newlines
            lines = [l.strip() for l in raw.split("\n") if l.strip() and "?" in l]
            if lines:
                return lines[:num_questions]
        except Exception:
            pass

        return self._fallback_questions(resume_data, job_description, num_questions, job_title)

    def create_session(
        self,
        session_id: str,
        resume_data: Dict,
        job_description: str,
        num_questions: int = 5,
        job_title: Optional[str] = None,
    ) -> str:
        """Create a new interview session and return the first question."""
        questions = self.generate_questions(resume_data, job_description, num_questions, job_title)

        interview_sessions[session_id] = {
            "questions": questions,
            "current_index": 0,
            "resume_data": resume_data,
            "job_description": job_description,
            "job_title": job_title,
            "answers": [],
        }
        return questions[0]

    def get_next_question(self, session_id: str) -> Optional[str]:
        """Advance to next question. Returns None if interview is over."""
        session = interview_sessions.get(session_id)
        if not session:
            return None

        session["current_index"] += 1
        idx = session["current_index"]
        questions = session["questions"]

        if idx >= len(questions):
            return None
        return questions[idx]

    def get_session(self, session_id: str) -> Optional[Dict]:
        return interview_sessions.get(session_id)

    def save_answer(self, session_id: str, question: str, answer: str):
        """Store a Q&A pair in the session."""
        session = interview_sessions.get(session_id)
        if session:
            session["answers"].append({"question": question, "answer": answer})

    def get_total_questions(self, session_id: str) -> int:
        session = interview_sessions.get(session_id)
        return len(session["questions"]) if session else 0

    def get_current_index(self, session_id: str) -> int:
        session = interview_sessions.get(session_id)
        return session["current_index"] if session else 0


# Singleton instance
interviewer = Interviewer()
