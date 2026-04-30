"""
Offline Multimodal RAG Assistant — FastAPI Application Entry Point
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import API_HOST, API_PORT, CORS_ORIGINS
from backend.api.routes import router


app = FastAPI(
    title="Offline Multimodal RAG Assistant",
    description="A fully offline, privacy-first RAG system supporting text, PDF, image, and audio inputs.",
    version="1.0.0",
)

# ─── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────
app.include_router(router)


@app.on_event("startup")
async def startup():
    """Pre-load models on startup for faster first requests."""
    print("=" * 60)
    print("  Offline Multimodal RAG Assistant")
    print("  Starting up...")
    print("=" * 60)

    # Pre-load embedding model
    try:
        from backend.embeddings.embedder import embedder
        embedder.embed(["warmup"])
        print("[Startup] Embedding model loaded ✓")
    except Exception as e:
        print(f"[Startup] Warning: Could not pre-load embedding model: {e}")

    # Check Ollama
    from backend.rag.generator import check_ollama_status
    status = check_ollama_status()
    if status["status"] == "online":
        print(f"[Startup] Ollama is online ✓ Models: {status['models']}")
    else:
        print("[Startup] Warning: Ollama is not running. Start it with: ollama serve")

    # Report vector store status
    from backend.vectorstore.faiss_store import store
    print(f"[Startup] Vector store: {store.count} vectors")
    print("=" * 60)
    print(f"  API running at http://localhost:{API_PORT}")
    print(f"  Docs at http://localhost:{API_PORT}/docs")
    print("=" * 60)


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True,
    )
