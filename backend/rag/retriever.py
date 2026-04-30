"""
Retriever — Queries FAISS for semantically similar document chunks.
"""

from typing import List, Dict
from backend.vectorstore.faiss_store import store
from backend.config import TOP_K


def retrieve(query: str, top_k: int = TOP_K) -> List[Dict]:
    """
    Retrieve top-k most relevant document chunks for a query.
    Returns list of {content, metadata, score}.
    """
    results = store.search(query, top_k=top_k)

    # Sort by score descending (most relevant first)
    results.sort(key=lambda x: x["score"], reverse=True)

    return results


def format_context(results: List[Dict]) -> str:
    """
    Format retrieved results into a context string for the LLM prompt.
    """
    if not results:
        return "No relevant context found."

    context_parts = []
    for i, result in enumerate(results, 1):
        source = result["metadata"].get("source", "unknown")
        modality = result["metadata"].get("modality", "text")
        score = result.get("score", 0)
        content = result["content"]

        context_parts.append(
            f"[Source {i}: {source} ({modality}) | Relevance: {score:.2f}]\n{content}"
        )

    return "\n\n---\n\n".join(context_parts)
