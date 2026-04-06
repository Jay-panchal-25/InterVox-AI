import uuid
import re
from typing import List


def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix."""
    uid = str(uuid.uuid4()).replace("-", "")[:12]
    return f"{prefix}_{uid}" if prefix else uid


def clean_text(text: str) -> str:
    """Remove extra whitespace and normalize text."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_emails(text: str) -> List[str]:
    """Extract email addresses from text."""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    return re.findall(pattern, text)


def extract_phone_numbers(text: str) -> List[str]:
    """Extract phone numbers from text."""
    pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    return re.findall(pattern, text)


def clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Clamp a value between min and max."""
    return max(min_val, min(max_val, value))


def calculate_final_score(resume_score: float, interview_score: float) -> float:
    """
    Final Score = (Resume * 0.4) + (Interview * 0.6)
    Both scores should be in range 0-100.
    """
    return clamp(round((resume_score * 0.4) + (interview_score * 0.6), 2))


def normalize_score(score: float, out_of: float = 10.0) -> float:
    """Normalize a score to 0-100 range."""
    return clamp(round((score / out_of) * 100, 2))
