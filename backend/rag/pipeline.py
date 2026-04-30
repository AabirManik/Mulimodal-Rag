"""
RAG Pipeline — Orchestrates the full ingest → embed → retrieve → generate flow.
Manages sessions and multi-turn memory.
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from backend.config import UPLOAD_DIR, SESSIONS_DIR
from backend.ingest.pdf_processor import process_pdf
from backend.ingest.image_processor import process_image
from backend.ingest.audio_processor import process_audio
from backend.vectorstore.faiss_store import store
from backend.rag.retriever import retrieve, format_context
from backend.rag.prompt_builder import build_prompt
from backend.rag.generator import generate


# ─── Session Management ─────────────────────────────────────

def _session_path(session_id: str) -> Path:
    return SESSIONS_DIR / f"{session_id}.json"


def create_session() -> Dict:
    """Create a new chat session."""
    session_id = str(uuid.uuid4())[:8]
    session = {
        "id": session_id,
        "title": "New Chat",
        "messages": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    with open(_session_path(session_id), "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2)
    return session


def get_session(session_id: str) -> Optional[Dict]:
    """Get a session by ID."""
    path = _session_path(session_id)
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_session(session: Dict):
    """Save a session to disk."""
    session["updated_at"] = datetime.now().isoformat()
    with open(_session_path(session["id"]), "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2)


def list_sessions() -> List[Dict]:
    """List all sessions (summary only)."""
    sessions = []
    for path in SESSIONS_DIR.glob("*.json"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                sessions.append({
                    "id": data["id"],
                    "title": data.get("title", "Untitled"),
                    "created_at": data.get("created_at"),
                    "updated_at": data.get("updated_at"),
                    "message_count": len(data.get("messages", [])),
                })
        except Exception:
            continue
    sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return sessions


def delete_session(session_id: str) -> bool:
    """Delete a session."""
    path = _session_path(session_id)
    if path.exists():
        path.unlink()
        return True
    return False


# ─── Ingest Pipeline ────────────────────────────────────────

def ingest_file(file_path: str, modality: str) -> Dict:
    """
    Ingest a file into the vector store.
    Returns ingest summary.
    """
    processors = {
        "pdf": process_pdf,
        "image": process_image,
        "audio": process_audio,
    }

    processor = processors.get(modality)
    if not processor:
        return {"error": f"Unsupported modality: {modality}", "chunks": 0}

    try:
        documents = processor(file_path)
        num_added = store.add_documents(documents)
        return {
            "status": "success",
            "file": Path(file_path).name,
            "modality": modality,
            "chunks": num_added,
            "total_vectors": store.count,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "file": Path(file_path).name,
            "chunks": 0,
        }


# ─── Query Pipeline ─────────────────────────────────────────

def query(
    question: str,
    session_id: Optional[str] = None,
    top_k: int = 5,
) -> Dict:
    """
    Full RAG query pipeline:
    1. Retrieve relevant chunks
    2. Build grounded prompt
    3. Generate answer
    4. Save to session history
    """
    # Get session history for multi-turn
    history = []
    session = None
    if session_id:
        session = get_session(session_id)
        if session:
            history = session.get("messages", [])

    # Step 1: Retrieve
    results = retrieve(question, top_k=top_k)
    context = format_context(results)

    # Step 2: Build prompt
    prompt = build_prompt(question, context, history)

    # Step 3: Generate
    answer = generate(prompt)

    # Step 4: Parse structured response
    parsed = _parse_response(answer)

    # Build sources from retrieved chunks
    sources = []
    for r in results:
        sources.append({
            "source": r["metadata"].get("source", "unknown"),
            "modality": r["metadata"].get("modality", "text"),
            "score": r.get("score", 0),
            "snippet": r["content"][:200] + "..." if len(r["content"]) > 200 else r["content"],
            "full_content": r["content"],
        })

    # Build response
    response = {
        "answer": parsed.get("answer", answer),
        "key_points": parsed.get("key_points", []),
        "sources": sources,
        "context_used": len(results),
        "total_vectors": store.count,
    }

    # Save to session
    if session:
        session["messages"].append({"role": "user", "content": question})
        session["messages"].append({"role": "assistant", "content": answer})
        # Auto-title from first query
        if len(session["messages"]) == 2:
            session["title"] = question[:50] + ("..." if len(question) > 50 else "")
        save_session(session)
        response["session_id"] = session["id"]

    return response


def _parse_response(text: str) -> Dict:
    """
    Parse the LLM response into structured sections.
    Looks for Answer, Key Points, and Sources sections.
    """
    result = {"answer": text, "key_points": []}

    # Try to extract Answer section
    if "**Answer**:" in text or "**Answer**" in text:
        parts = text.split("**Key Points**")
        if len(parts) >= 2:
            answer_part = parts[0].replace("**Answer**:", "").replace("**Answer**", "").strip()
            result["answer"] = answer_part

            kp_text = parts[1]
            if "**Sources**" in kp_text:
                kp_text = kp_text.split("**Sources**")[0]

            # Extract bullet points
            lines = kp_text.strip().split("\n")
            for line in lines:
                line = line.strip().lstrip("-*•").strip()
                if line and len(line) > 3:
                    result["key_points"].append(line)

    return result
