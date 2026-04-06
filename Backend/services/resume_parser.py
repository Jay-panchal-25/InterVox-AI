import fitz  # PyMuPDF
import spacy
import re
import os
from typing import List, Dict, Optional

# Load spaCy model (run: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# ── Skill Keywords Database ───────────────────────────────────────────────────
TECH_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "kotlin", "swift", "php", "ruby", "scala", "r", "matlab",
    # Web
    "react", "angular", "vue", "nextjs", "nodejs", "express", "fastapi",
    "django", "flask", "html", "css", "tailwind", "bootstrap",
    # Data / ML
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "matplotlib", "seaborn", "hugging face", "transformers",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
    "github actions", "jenkins", "linux", "bash",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "sqlite", "firebase", "supabase",
    # Tools
    "git", "github", "gitlab", "jira", "figma", "postman",
    # Soft Skills
    "communication", "leadership", "problem solving", "teamwork",
    "project management", "agile", "scrum",
}

# ── Degree Keywords ───────────────────────────────────────────────────────────
DEGREE_KEYWORDS = [
    "bachelor", "master", "phd", "b.tech", "m.tech", "b.e", "m.e",
    "b.sc", "m.sc", "mba", "b.com", "diploma", "associate",
]

# ── Experience Patterns ───────────────────────────────────────────────────────
EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
    r'experience\s+of\s+(\d+)\+?\s*years?',
    r'(\d+)\+?\s*yrs?\s+(?:of\s+)?experience',
]


class ResumeParser:
    def __init__(self):
        self.nlp = nlp

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract raw text from a PDF file."""
        text = ""
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
        return text

    def extract_name(self, text: str) -> Optional[str]:
        """Extract candidate name using spaCy NER."""
        doc = self.nlp(text[:500])  # Name usually at top
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text.strip()
        # Fallback: first line
        first_line = text.strip().split('\n')[0].strip()
        if len(first_line.split()) <= 4 and first_line.replace(' ', '').isalpha():
            return first_line
        return None

    def extract_email(self, text: str) -> Optional[str]:
        """Extract email address."""
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        matches = re.findall(pattern, text)
        return matches[0] if matches else None

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills by matching against known skill keywords."""
        text_lower = text.lower()
        found_skills = set()

        for skill in TECH_SKILLS:
            # Use word boundary matching for short skills
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(skill.title())

        return sorted(list(found_skills))

    def extract_experience_years(self, text: str) -> float:
        """Extract years of experience from resume text."""
        text_lower = text.lower()
        for pattern in EXPERIENCE_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                return float(match.group(1))

        # Count job entries as fallback (rough heuristic)
        job_patterns = len(re.findall(
            r'\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)\b',
            text_lower
        ))
        return float(max(job_patterns - 1, 0)) if job_patterns > 1 else 0.0

    def extract_education(self, text: str) -> List[str]:
        """Extract education qualifications."""
        text_lower = text.lower()
        found = []
        for degree in DEGREE_KEYWORDS:
            if degree in text_lower:
                # Find the sentence containing the degree
                sentences = re.split(r'[\n.;]', text)
                for sentence in sentences:
                    if degree in sentence.lower():
                        clean = sentence.strip()
                        if clean and len(clean) < 200:
                            found.append(clean)
                            break
        return list(dict.fromkeys(found))  # Remove duplicates, preserve order

    def parse(self, pdf_path: str) -> Dict:
        """Full resume parsing pipeline."""
        text = self.extract_text_from_pdf(pdf_path)

        return {
            "raw_text": text,
            "name": self.extract_name(text),
            "email": self.extract_email(text),
            "skills": self.extract_skills(text),
            "experience_years": self.extract_experience_years(text),
            "education": self.extract_education(text),
        }


# Singleton instance
resume_parser = ResumeParser()
