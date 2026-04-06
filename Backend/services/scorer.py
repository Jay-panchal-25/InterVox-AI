import re
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from services.resume_parser import TECH_SKILLS


class ResumeScorer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        )

    def extract_skills_from_jd(self, job_description: str) -> List[str]:
        """Extract required skills from a job description."""
        jd_lower = job_description.lower()
        found_skills = set()
        for skill in TECH_SKILLS:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, jd_lower):
                found_skills.add(skill.title())
        return sorted(list(found_skills))

    def skill_match_score(
        self,
        resume_skills: List[str],
        jd_skills: List[str]
    ) -> Tuple[float, List[str], List[str]]:
        """
        Compare resume skills vs JD skills.
        Returns (score 0-100, matched_skills, missing_skills).
        """
        if not jd_skills:
            return 50.0, resume_skills, []

        resume_set = {s.lower() for s in resume_skills}
        jd_set = {s.lower() for s in jd_skills}

        matched = [s for s in jd_skills if s.lower() in resume_set]
        missing = [s for s in jd_skills if s.lower() not in resume_set]

        score = (len(matched) / len(jd_set)) * 100 if jd_set else 0.0
        return round(score, 2), matched, missing

    def semantic_similarity_score(
        self,
        resume_text: str,
        job_description: str
    ) -> float:
        """
        TF-IDF cosine similarity between resume and JD.
        Returns score 0-100.
        """
        try:
            tfidf_matrix = self.vectorizer.fit_transform([resume_text, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return round(float(similarity) * 100, 2)
        except Exception:
            return 0.0

    def experience_match(
        self,
        resume_years: float,
        job_description: str
    ) -> bool:
        """Check if candidate's experience meets JD requirements."""
        jd_lower = job_description.lower()
        patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'minimum\s+(\d+)\s+years?',
            r'at\s+least\s+(\d+)\s+years?',
        ]
        for pattern in patterns:
            match = re.search(pattern, jd_lower)
            if match:
                required = float(match.group(1))
                return resume_years >= required
        return True  # No experience requirement found

    def compute_score(
        self,
        resume_data: Dict,
        job_description: str
    ) -> Dict:
        """
        Full scoring pipeline.
        Returns match_score, matched_skills, missing_skills, etc.
        """
        resume_skills = resume_data.get("skills", [])
        resume_text = resume_data.get("raw_text", "")
        experience_years = resume_data.get("experience_years", 0.0)

        # 1. Skill match (60% weight)
        jd_skills = self.extract_skills_from_jd(job_description)
        skill_score, matched, missing = self.skill_match_score(resume_skills, jd_skills)

        # 2. Semantic similarity (40% weight)
        semantic_score = self.semantic_similarity_score(resume_text, job_description)

        # 3. Combined resume score
        match_score = round((skill_score * 0.6) + (semantic_score * 0.4), 2)

        # 4. Experience match
        exp_match = self.experience_match(experience_years, job_description)

        # 5. Summary
        if match_score >= 75:
            summary = "Strong match! Your profile aligns well with this job."
        elif match_score >= 50:
            summary = "Moderate match. You meet core requirements but have some gaps."
        else:
            summary = "Weak match. Consider developing the missing skills before applying."

        return {
            "match_score": match_score,
            "skill_score": skill_score,
            "semantic_score": semantic_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "experience_match": exp_match,
            "summary": summary,
        }


# Singleton instance
resume_scorer = ResumeScorer()
