"""
Prompt Builder — Constructs grounded prompts for the LLM with context and history.
"""

from typing import List, Dict, Optional
from backend.config import MAX_HISTORY_TURNS


SYSTEM_PROMPT = """You are a helpful, accurate AI assistant. Your responses must follow these rules:

1. Use the provided context below to answer the user's question accurately.
2. If the context contains the answer, prioritize it and cite your sources.
3. If the context does NOT contain the answer, you may use your own knowledge to help the user, but start by mentioning: "Based on my general knowledge (as this wasn't in your documents)..."
4. If no documents have been uploaded yet, answer normally as a helpful assistant.
5. Structure your response as:
   - **Answer**: A clear, direct answer
   - **Key Points**: Bullet points of the most important facts
   - **Sources**: List the sources used (or "General Knowledge" if no documents applied)

Be concise, accurate, and helpful. Never make up information."""


def build_prompt(
    query: str,
    context: str,
    history: Optional[List[Dict]] = None,
) -> str:
    """
    Build a complete prompt with system instructions, context, history, and query.
    """
    parts = [SYSTEM_PROMPT]

    # Add conversation history (last N turns)
    if history:
        recent = history[-MAX_HISTORY_TURNS:]
        history_text = "\n--- Conversation History ---\n"
        for turn in recent:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role == "user":
                history_text += f"User: {content}\n"
            else:
                history_text += f"Assistant: {content}\n"
        parts.append(history_text)

    # Add retrieved context
    parts.append(f"\n--- Retrieved Context ---\n{context}")

    # Add the user query
    parts.append(f"\n--- User Question ---\n{query}")

    parts.append("\n--- Your Response ---")

    return "\n".join(parts)


def build_ingest_summary_prompt(content: str, source: str, modality: str) -> str:
    """
    Build a prompt to summarize ingested content (optional — for pre-processing).
    """
    return (
        f"Summarize the following {modality} content from '{source}' in 2-3 sentences:\n\n"
        f"{content[:2000]}"
    )
