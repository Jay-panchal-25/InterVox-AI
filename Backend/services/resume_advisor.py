import os
import json
from typing import Dict, List
from groq import Groq
from dotenv import load_dotenv

from services.scorer import resume_scorer

load_dotenv()

_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=_api_key) if _api_key else None
MODEL = "llama3-70b-8192"


class ResumeAdvisor:
    def _extract_json(self, raw: str) -> Dict:
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return {}
        try:
            return json.loads(raw[start:end + 1])
        except Exception:
            return {}

    def _fallback_suggestions(self, resume_data: Dict, job_description: str) -> Dict:
        score = resume_scorer.compute_score(resume_data, job_description)
        missing = score.get("missing_skills", [])
        suggestions: List[str] = []

        if missing:
            suggestions.append(
                "Add or emphasize experience with: " + ", ".join(missing[:6]) + "."
            )
        else:
            suggestions.append(
                "Highlight measurable impact in recent projects (metrics, outcomes, scale)."
            )

        suggestions.extend([
            "Tailor your summary to mirror the job description keywords.",
            "Add 2-3 bullet points per role that show results, not just responsibilities.",
            "Include tools, frameworks, and cloud platforms used in each project.",
            "Ensure the skills section matches the role priorities and is easy to scan.",
        ])

        overall_summary = (
            "Your resume is a good start. Focus on aligning keywords with the job description "
            "and adding specific results to strengthen your impact."
        )

        return {
            "suggestions": suggestions[:6],
            "overall_summary": overall_summary,
        }

    def generate_suggestions(self, resume_data: Dict, job_description: str) -> Dict:
        score = resume_scorer.compute_score(resume_data, job_description)
        prompt = f"""You are a resume reviewer.
Provide 5-7 concise, actionable suggestions to improve this resume for the job description.
Also return a 2-3 sentence summary of the overall improvement focus.

Resume Summary:
Name: {resume_data.get("name") or "Candidate"}
Skills: {", ".join(resume_data.get("skills", [])[:20])}
Experience (years): {resume_data.get("experience_years", 0)}
Education: {", ".join(resume_data.get("education", [])[:3])}

Resume Match Score: {score.get("match_score", 0)}/100
Missing Skills: {", ".join(score.get("missing_skills", [])[:10])}
Job Description: {job_description[:800]}

Return ONLY valid JSON with this structure:
{{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "overall_summary": "..."
}}
"""
        if client is None:
            return self._fallback_suggestions(resume_data, job_description)

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=700,
            )
            raw = response.choices[0].message.content.strip()
            data = self._extract_json(raw)
            suggestions = data.get("suggestions", [])
            overall = data.get("overall_summary", "")
            if not isinstance(suggestions, list) or not suggestions or not overall:
                return self._fallback_suggestions(resume_data, job_description)
            return {
                "suggestions": suggestions[:7],
                "overall_summary": overall,
            }
        except Exception:
            return self._fallback_suggestions(resume_data, job_description)


resume_advisor = ResumeAdvisor()
