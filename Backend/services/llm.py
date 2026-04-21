import os
from langchain_groq import ChatGroq

def get_llm():
    return ChatGroq(
        model_name="llama-3.1-8b-instant",
        temperature=0.5
    )