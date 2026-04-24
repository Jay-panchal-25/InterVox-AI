from langchain_core.prompts import ChatPromptTemplate


def get_question_prompt():
    # Prompt template for structured interview-question generation.
    return ChatPromptTemplate.from_template(
        """
You are a senior technical interviewer.

Analyze the candidate's resume and the job description carefully.

Resume:
{resume}

Job Description:
{jd}

Generate high-quality interview questions in STRICT JSON format:
{{
  "technical": [],
  "project_based": [],
  "scenario_based": [],
  "hr": [],
  "weak_areas": []
}}

IMPORTANT:
- Return ONLY JSON
- Do NOT include ```json or ```
- Do NOT add explanation before or after JSON

Rules:
- Questions must be specific to candidate experience
- Avoid generic questions
- Focus on depth and real-world application
"""
    )
