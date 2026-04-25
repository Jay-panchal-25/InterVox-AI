import json
import re
from collections import Counter

from langchain_core.prompts import ChatPromptTemplate

from services.llm import get_llm

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "to",
    "with",
    "will",
    "you",
    "your",
    "using",
    "use",
    "used",
    "required",
    "preferred",
    "candidate",
    "role",
    "job",
    "experience",
    "skills",
    "skill",
    "work",
    "years",
    "year",
}

SECTION_HINTS = {
    "experience": ["experience", "employment", "work history"],
    "skills": ["skills", "technical skills", "core skills"],
    "education": ["education", "academic", "qualification"],
    "projects": ["projects", "project experience", "key projects"],
}


def extract_json(content):
    # Accept plain JSON or JSON wrapped in markdown code fences.
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"```json(.*?)```", content, re.DOTALL)

        if match:
            return json.loads(match.group(1).strip())

        raise


def normalize_text(text):
    return re.sub(r"\s+", " ", text or "").strip()


def tokenize(text):
    return re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-]{1,}", (text or "").lower())


def extract_top_keywords(text, limit=20):
    tokens = [
        token
        for token in tokenize(text)
        if len(token) > 2 and token not in STOPWORDS
    ]

    counts = Counter(tokens)
    ranked = sorted(
        counts.items(),
        key=lambda item: (-item[1], -len(item[0]), item[0]),
    )
    return [token for token, _ in ranked[:limit]]


def find_matched_keywords(resume_text, keywords):
    lowered_resume = (resume_text or "").lower()
    return [keyword for keyword in keywords if keyword in lowered_resume]


def calculate_section_score(resume_text):
    lowered_resume = (resume_text or "").lower()
    matched_sections = 0

    for hints in SECTION_HINTS.values():
        if any(hint in lowered_resume for hint in hints):
            matched_sections += 1

    return round((matched_sections / len(SECTION_HINTS)) * 20)


def calculate_format_score(resume_text):
    text = resume_text or ""
    bullets = len(re.findall(r"(^|\n)\s*[-*]", text))
    email_present = bool(re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I))
    phone_present = bool(re.search(r"(\+?\d[\d\s().-]{7,}\d)", text))

    score = min(bullets, 5) * 2

    if email_present:
        score += 5
    if phone_present:
        score += 5

    return min(score, 20)


def calculate_ats_score(resume_text, jd_text):
    keywords = extract_top_keywords(jd_text)
    matched_keywords = find_matched_keywords(resume_text, keywords)
    missing_keywords = [keyword for keyword in keywords if keyword not in matched_keywords]

    keyword_score = round((len(matched_keywords) / max(len(keywords), 1)) * 60)
    section_score = calculate_section_score(resume_text)
    format_score = calculate_format_score(resume_text)
    ats_score = min(keyword_score + section_score + format_score, 100)

    return {
        "ats_score": ats_score,
        "matched_keywords": matched_keywords[:8],
        "missing_keywords": missing_keywords[:8],
    }


def build_prompt():
    return ChatPromptTemplate.from_template(
        """
You are an expert resume reviewer and hiring coach.

Review the resume against the job description and return STRICT JSON only:
{{
  "jd_match_score": 0,
  "feedback": "",
  "strengths": [],
  "mistakes": [],
  "suggestions": []
}}

Rules:
- "jd_match_score" must be an integer from 0 to 100
- "strengths" must contain 3 short bullet-style strings
- "mistakes" must contain 3 to 5 specific issues in the resume for this job
- "suggestions" must contain 3 to 5 direct improvements
- Keep feedback concise and practical
- Return JSON only with no markdown

Resume:
{resume}

Job Description:
{jd}
"""
    )


def default_llm_analysis(ats_result):
    missing_keywords = ats_result["missing_keywords"]
    matched_keywords = ats_result["matched_keywords"]
    strengths = []
    mistakes = []
    suggestions = []

    if matched_keywords:
        strengths.append(
            f"Your resume already reflects relevant keywords such as {', '.join(matched_keywords[:3])}."
        )
    strengths.append("The resume includes core candidate details that ATS systems typically expect.")
    strengths.append("The profile appears usable as a base for interview preparation.")

    if missing_keywords:
        mistakes.append(
            f"Important JD terms are missing or under-emphasized: {', '.join(missing_keywords[:4])}."
        )
        suggestions.append(
            f"Add evidence for JD keywords like {', '.join(missing_keywords[:4])} where they are genuinely relevant."
        )

    mistakes.append("Some achievements may not be quantified strongly enough for ATS and recruiters.")
    mistakes.append("The resume can be tailored more directly to the target role.")
    suggestions.append("Rewrite experience bullets to highlight measurable impact, tools, and outcomes.")
    suggestions.append("Move the most job-relevant skills and projects closer to the top of the resume.")

    return {
        "jd_match_score": max(ats_result["ats_score"] - 5, 0),
        "feedback": "Your resume has a workable foundation, but it should be tailored more tightly to the job description before applying.",
        "strengths": strengths[:3],
        "mistakes": mistakes[:4],
        "suggestions": suggestions[:4],
    }


def analyze_resume(resume_text, jd_text):
    raw_resume_text = resume_text or ""
    raw_jd_text = jd_text or ""
    ats_result = calculate_ats_score(raw_resume_text, raw_jd_text)
    prompt_resume = normalize_text(raw_resume_text)
    prompt_jd = normalize_text(raw_jd_text)

    try:
        llm = get_llm()
        prompt = build_prompt()
        chain = prompt | llm
        response = chain.invoke({
            "resume": prompt_resume,
            "jd": prompt_jd,
        })
        llm_result = extract_json(response.content)
    except Exception:
        llm_result = default_llm_analysis(ats_result)

    strengths = [item for item in llm_result.get("strengths", []) if item]
    mistakes = [item for item in llm_result.get("mistakes", []) if item]
    suggestions = [item for item in llm_result.get("suggestions", []) if item]

    return {
        "ats_score": ats_result["ats_score"],
        "jd_match_score": max(
            0,
            min(int(llm_result.get("jd_match_score", ats_result["ats_score"])), 100),
        ),
        "feedback": llm_result.get("feedback", ""),
        "strengths": strengths[:3],
        "mistakes": mistakes[:5],
        "suggestions": suggestions[:5],
        "matched_keywords": ats_result["matched_keywords"],
        "missing_keywords": ats_result["missing_keywords"],
    }
