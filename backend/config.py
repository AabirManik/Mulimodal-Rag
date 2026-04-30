"""
Central configuration for the Offline Multimodal RAG system.
All paths, model names, and parameters are defined here.
"""

import os
from pathlib import Path

# ─── Base Paths ───────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
FAISS_DIR = DATA_DIR / "faiss_index"
UPLOAD_DIR = DATA_DIR / "uploads"
SESSIONS_DIR = DATA_DIR / "sessions"

# Create directories
for d in [DATA_DIR, MODELS_DIR, FAISS_DIR, UPLOAD_DIR, SESSIONS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ─── Ollama Configuration ────────────────────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "mistral")
VISION_MODEL = os.getenv("VISION_MODEL", "llava")

# ─── Embedding Model ─────────────────────────────────────────
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384

# ─── Chunking ────────────────────────────────────────────────
CHUNK_SIZE = 512          # tokens per chunk
CHUNK_OVERLAP = 64        # overlap between chunks
MAX_CHUNK_SIZE = 1024

# ─── Retrieval ───────────────────────────────────────────────
TOP_K = 5                 # number of chunks to retrieve
SIMILARITY_THRESHOLD = 0.3

# ─── Multi-turn Memory ──────────────────────────────────────
MAX_HISTORY_TURNS = 5     # last N turns to include in prompt

# ─── Vosk ────────────────────────────────────────────────────
VOSK_MODEL_PATH = os.getenv(
    "VOSK_MODEL_PATH",
    str(MODELS_DIR / "vosk-model-small-en-us-0.15")
)

# ─── API ─────────────────────────────────────────────────────
API_HOST = "0.0.0.0"
API_PORT = 8000
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
