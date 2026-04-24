from langchain_groq import ChatGroq


def get_llm():
    # Create the shared Groq-backed chat model used across backend services.
    return ChatGroq(
        model_name="llama-3.1-8b-instant",
        temperature=0.5,
    )
