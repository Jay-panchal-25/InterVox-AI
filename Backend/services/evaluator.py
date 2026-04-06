import os
import json
import re
from typing import List, Dict, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=_api_key) if _api_key else None
MODEL = "llama3-70b-8192"


class Evaluator:
    _STOPWORDS = {
        "the", "and", "for", "with", "that", "this", "from", "your", "you",
        "are", "was", "were", "have", "has", "had", "but", "not", "all",
        "can", "could", "would", "should", "about", "into", "over", "when",
        "what", "which", "who", "how", "why", "where", "while", "then",
        "than", "also", "just", "like", "they", "them", "their", "our",
        "we", "i", "me", "my", "it", "its", "as", "an", "a", "to", "of",
        "in", "on", "is", "be", "if", "or", "at", "by", "do", "did", "so",
    }

    _STRUCTURE_HINTS = {
        "first", "second", "third", "finally", "next", "then", "because",
        "for example", "for instance", "in summary", "overall", "tradeoff",
    }

    _TECH_HINTS = {
        "api", "database", "latency", "throughput", "scalability", "cache",
        "ci/cd", "pipeline", "deployment", "testing", "monitoring", "design",
        "architecture", "optimize", "performance", "security",
    }

    def _extract_json(self, raw: str) -> Optional[Dict]:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None
        snippet = raw[start:end + 1]
        return json.loads(snippet)

    def _tokenize(self, text: str) -> List[str]:
        tokens = re.findall(r"[a-zA-Z]{3,}", text.lower())
        return [t for t in tokens if t not in self._STOPWORDS]

    def _clamp(self, value: float, low: float = 0.0, high: float = 10.0) -> float:
        return max(low, min(high, value))

    def _heuristic_evaluation(self, question: str, answer: str) -> Dict:
        if not answer.strip():
            return {
                "relevance_score": 0.0,
                "depth_score": 0.0,
                "clarity_score": 0.0,
                "feedback": "Answer is empty. Provide a specific response with concrete details.",
            }

        q_tokens = set(self._tokenize(question))
        a_tokens = set(self._tokenize(answer))
        overlap = len(q_tokens & a_tokens)
        relevance = 2.0 + (8.0 * (overlap / max(len(q_tokens), 1)))

        word_count = len(re.findall(r"\\b\\w+\\b", answer))
        if word_count < 20:
            depth = 3.0
        elif word_count < 50:
            depth = 5.0
        elif word_count < 100:
            depth = 6.5
        elif word_count < 160:
            depth = 7.5
        else:
            depth = 8.5

        tech_bonus = sum(1 for t in self._TECH_HINTS if t in answer.lower())
        depth += min(1.5, tech_bonus * 0.3)

        sentence_count = len(re.findall(r"[.!?]", answer))
        clarity = 4.0
        if sentence_count >= 2:
            clarity += 2.0
        if any(hint in answer.lower() for hint in self._STRUCTURE_HINTS):
            clarity += 2.0
        if word_count >= 30:
            clarity += 1.0

        relevance = self._clamp(relevance)
        depth = self._clamp(depth)
        clarity = self._clamp(clarity)

        feedback_parts = []
        if relevance < 6:
            feedback_parts.append("Address the question more directly before adding details.")
        if depth < 6:
            feedback_parts.append("Add more technical depth with concrete examples or metrics.")
        if clarity < 6:
            feedback_parts.append("Structure the answer with a clear beginning, middle, and end.")
        if not feedback_parts:
            feedback_parts.append("Strong response with clear structure and relevant detail.")

        return {
            "relevance_score": relevance,
            "depth_score": depth,
            "clarity_score": clarity,
            "feedback": " ".join(feedback_parts),
        }

    def _fallback_final_feedback(
        self,
        evaluations: List[Dict],
        resume_score: float,
        interview_score: float,
    ) -> Dict:
        if not evaluations:
            return {
                "strengths": ["Completed the interview", "Showed effort", "Stayed engaged"],
                "improvements": ["Provide more detail", "Be more specific", "Structure answers clearly"],
                "overall_feedback": "You completed the interview. Keep practicing to improve.",
            }

        avg_relevance = sum(e["relevance_score"] for e in evaluations) / len(evaluations)
        avg_depth = sum(e["depth_score"] for e in evaluations) / len(evaluations)
        avg_clarity = sum(e["clarity_score"] for e in evaluations) / len(evaluations)

        strengths = []
        if avg_relevance >= 7:
            strengths.append("Addressed questions directly")
        if avg_depth >= 7:
            strengths.append("Added technical depth")
        if avg_clarity >= 7:
            strengths.append("Communicated clearly")

        while len(strengths) < 3:
            strengths.append("Stayed composed during the interview")

        improvements = []
        if avg_relevance < 6:
            improvements.append("Focus on answering the question before adding extra details")
        if avg_depth < 6:
            improvements.append("Include more concrete examples and technical specifics")
        if avg_clarity < 6:
            improvements.append("Use a structured format to make answers easier to follow")

        while len(improvements) < 3:
            improvements.append("Practice concise, high-impact responses")

        overall_feedback = (
            f"Your resume match score is {resume_score:.1f}/100 and your interview score is {interview_score:.1f}/100. "
            "You showed solid effort. Focus on more direct, structured, and detailed answers to raise your score."
        )

        return {
            "strengths": strengths[:3],
            "improvements": improvements[:3],
            "overall_feedback": overall_feedback,
        }

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        job_description: str = "",
    ) -> Dict:
        """
        Evaluate a single interview answer using Groq LLM.
        Returns scores for relevance, depth, clarity + feedback.
        """
        prompt = f"""You are a strict but fair interview evaluator.
Evaluate the following interview answer on 3 criteria, each scored from 0 to 10.
Write feedback that is specific to the answer and gives 1-2 concrete improvements.

Job Context: {job_description[:300] if job_description else "General role"}
Question: {question}
Candidate Answer: {answer}

Scoring Criteria:
- relevance_score (0-10): How directly the answer addresses the question
- depth_score (0-10): Technical depth and detail of the answer
- clarity_score (0-10): How clearly and structured the answer is communicated

Return ONLY a valid JSON object with this exact structure, nothing else:
{{
  "relevance_score": <float>,
  "depth_score": <float>,
  "clarity_score": <float>,
  "feedback": "<2-4 sentences of constructive feedback>"
}}
"""
        if client is None:
            data = self._heuristic_evaluation(question, answer)
            relevance = float(data.get("relevance_score", 5.0))
            depth = float(data.get("depth_score", 5.0))
            clarity = float(data.get("clarity_score", 5.0))
            feedback = data.get("feedback", "Good attempt. Try to be more specific.")
        else:
            try:
                response = client.chat.completions.create(
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_tokens=512,
                )
                raw = response.choices[0].message.content.strip()
                data = self._extract_json(raw) or {}
                relevance = float(data.get("relevance_score", 5.0))
                depth = float(data.get("depth_score", 5.0))
                clarity = float(data.get("clarity_score", 5.0))
                feedback = data.get("feedback", "Good attempt. Try to be more specific.")
            except Exception:
                data = self._heuristic_evaluation(question, answer)
                relevance = float(data.get("relevance_score", 5.0))
                depth = float(data.get("depth_score", 5.0))
                clarity = float(data.get("clarity_score", 5.0))
                feedback = data.get("feedback", "Good attempt. Try to be more specific.")

        overall = round((relevance + depth + clarity) / 3, 2)

        return {
            "question": question,
            "answer": answer,
            "relevance_score": relevance,
            "depth_score": depth,
            "clarity_score": clarity,
            "overall_score": overall,
            "feedback": feedback,
        }

    def evaluate_all_answers(
        self,
        qa_pairs: List[Dict],
        job_description: str = "",
    ) -> List[Dict]:
        """Evaluate all Q&A pairs from a session."""
        evaluations = []
        for pair in qa_pairs:
            eval_result = self.evaluate_answer(
                question=pair["question"],
                answer=pair["answer"],
                job_description=job_description,
            )
            evaluations.append(eval_result)
        return evaluations

    def compute_interview_score(self, evaluations: List[Dict]) -> float:
        """
        Compute overall interview score (0-100) from all evaluations.
        """
        if not evaluations:
            return 0.0
        avg_score = sum(e["overall_score"] for e in evaluations) / len(evaluations)
        return round((avg_score / 10) * 100, 2)

    def generate_final_feedback(
        self,
        evaluations: List[Dict],
        resume_score: float,
        interview_score: float,
        job_description: str = "",
    ) -> Dict:
        """
        Generate strengths, improvement areas, and overall feedback
        using the full session context.
        """
        summary_data = json.dumps([
            {
                "question": e["question"],
                "overall_score": e["overall_score"],
                "feedback": e["feedback"]
            }
            for e in evaluations
        ], indent=2)

        prompt = f"""You are a career coach reviewing an interview performance.

Resume Match Score: {resume_score}/100
Interview Score: {interview_score}/100
Job Description: {job_description[:400] if job_description else "General role"}

Individual Answer Evaluations:
{summary_data}

Based on this, generate:
1. Top 3 strengths shown
2. Top 3 areas for improvement
3. A motivating overall feedback paragraph (3-4 sentences)

Return ONLY valid JSON with this structure:
{{
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "overall_feedback": "..."
}}
"""
        if client is None:
            return self._fallback_final_feedback(evaluations, resume_score, interview_score)

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=700,
            )
            raw = response.choices[0].message.content.strip()
            data = self._extract_json(raw) or {}
            return {
                "strengths": data.get("strengths", []),
                "improvements": data.get("improvements", []),
                "overall_feedback": data.get("overall_feedback", ""),
            }
        except Exception:
            return self._fallback_final_feedback(evaluations, resume_score, interview_score)


# Singleton instance
evaluator = Evaluator()
