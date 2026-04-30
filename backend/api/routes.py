"""
API Routes — FastAPI endpoints for the RAG system.
"""

import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from backend.config import UPLOAD_DIR
from backend.rag.pipeline import (
    query,
    ingest_file,
    create_session,
    get_session,
    list_sessions,
    delete_session,
)
from backend.rag.generator import check_ollama_status
from backend.vectorstore.faiss_store import store


router = APIRouter(prefix="/api")


# ─── Request/Response Models ─────────────────────────────────

class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    top_k: int = 5


class QueryResponse(BaseModel):
    answer: str
    key_points: list
    sources: list
    context_used: int
    total_vectors: int
    session_id: Optional[str] = None


class IngestResponse(BaseModel):
    status: str
    file: str
    modality: str
    chunks: int
    total_vectors: int
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    ollama: dict
    vector_count: int


class SessionResponse(BaseModel):
    id: str
    title: str
    messages: list = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ─── Health ──────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check system health: Ollama status, vector store count."""
    ollama = check_ollama_status()
    return {
        "status": "healthy",
        "ollama": ollama,
        "vector_count": store.count,
    }


# ─── Ingest ──────────────────────────────────────────────────

@router.post("/ingest", response_model=IngestResponse)
async def ingest_endpoint(
    file: UploadFile = File(...),
    modality: str = Form(...),
):
    """
    Upload and ingest a file (PDF, image, or audio).
    The file is saved locally and processed into the vector store.
    """
    # Validate modality
    valid_modalities = {"pdf", "image", "audio"}
    if modality not in valid_modalities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid modality '{modality}'. Must be one of: {valid_modalities}"
        )

    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    ext_map = {
        "pdf": [".pdf"],
        "image": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
        "audio": [".wav", ".mp3", ".ogg", ".flac", ".m4a", ".webm"],
    }
    if ext not in ext_map.get(modality, []):
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' not supported for modality '{modality}'. "
                   f"Supported: {ext_map[modality]}"
        )

    # Save file
    save_path = UPLOAD_DIR / file.filename
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Ingest
    result = ingest_file(str(save_path), modality)

    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error", "Ingest failed"))

    return result


# ─── Query ───────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse)
async def query_endpoint(req: QueryRequest):
    """
    Send a question and get a RAG-grounded response.
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    result = query(
        question=req.question,
        session_id=req.session_id,
        top_k=req.top_k,
    )

    return result


# ─── Sessions ────────────────────────────────────────────────

@router.post("/sessions")
async def create_session_endpoint():
    """Create a new chat session."""
    session = create_session()
    return session


@router.get("/sessions")
async def list_sessions_endpoint():
    """List all chat sessions."""
    return list_sessions()


@router.get("/sessions/{session_id}")
async def get_session_endpoint(session_id: str):
    """Get a specific session with full history."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/sessions/{session_id}")
async def delete_session_endpoint(session_id: str):
    """Delete a chat session."""
    success = delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted", "id": session_id}


# ─── Vector Store ────────────────────────────────────────────

@router.get("/vectorstore/stats")
async def vectorstore_stats():
    """Get vector store statistics."""
    return {
        "total_vectors": store.count,
    }


@router.post("/vectorstore/clear")
async def vectorstore_clear():
    """Clear the entire vector store."""
    store.clear()
    return {"status": "cleared", "total_vectors": 0}
