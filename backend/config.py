"""
Central configuration for the Offline Multimodal RAG system.
All paths, model names, and parameters are defined here.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(override=True)

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

# ─── LLM Configuration ───────────────────────────────────────
# LLM Provider: "ollama" or "groq"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").lower()

# Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL_NAME = os.getenv("GROQ_MODEL_NAME", "llama3-70b-8192")

# Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "mistral")
VISION_MODEL = os.getenv("VISION_MODEL", "llava")

# ─── Vision Configuration ────────────────────────────────────
# Vision Provider: "ollama" or "huggingface"
VISION_PROVIDER = os.getenv("VISION_PROVIDER", "ollama").lower()
HF_VISION_MODEL_NAME = os.getenv("HF_VISION_MODEL_NAME", "naver-clova-ix/donut-base-finetuned-docvqa")

# ─── Embedding Model ─────────────────────────────────────────
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
EMBEDDING_DIMENSION = int(os.getenv("EMBEDDING_DIMENSION", "384"))
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

# ─── Chunking ────────────────────────────────────────────────
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "512"))          # tokens per chunk
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "64"))     # overlap between chunks
MAX_CHUNK_SIZE = int(os.getenv("MAX_CHUNK_SIZE", "1024"))

# ─── Retrieval ───────────────────────────────────────────────
TOP_K = int(os.getenv("TOP_K", "15"))                 # number of chunks to retrieve
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.1"))

# ─── Multi-turn Memory ──────────────────────────────────────
MAX_HISTORY_TURNS = int(os.getenv("MAX_HISTORY_TURNS", "5"))     # last N turns to include in prompt

# ─── Vosk ────────────────────────────────────────────────────
VOSK_MODEL_PATH = os.getenv(
    "VOSK_MODEL_PATH",
    str(MODELS_DIR / "vosk-model-small-en-us-0.15")
)

# ─── API ─────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
