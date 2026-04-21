from langchain_core.prompts import ChatPromptTemplate

def get_evaluation_prompt():
    return ChatPromptTemplate.from_template("""
You are a senior technical interviewer.

Evaluate the candidate's answer strictly based on the given question.

Question:
{question}

Answer:
{answer}

Evaluate on the following dimensions (score out of 10):
1. Technical Accuracy
2. Depth of Explanation
3. Clarity
4. Structure
5. Communication
                                            
Scoring Guidelines:

9-10 → Expert-level, deep explanation, includes examples and edge cases  
7-8 → Strong understanding, minor gaps  
5-6 → Basic understanding, lacks depth  
3-4 → Weak understanding  
0-2 → Incorrect or irrelevant answer

Return STRICT JSON:

{{
  "technical_accuracy": int,
  "depth": int,
  "clarity": int,
  "structure": int,
  "communication": int,
  "feedback": "detailed feedback",
  "improvement_suggestions": ["point1", "point2"]
}}

Rules:
- Be strict and realistic
- Do not inflate scores
- Penalize vague answers
""")