"""
FAISS Vector Store — Local vector database with metadata sidecar.
"""

import json
import faiss
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime

from backend.config import FAISS_DIR, EMBEDDING_DIMENSION, TOP_K, SIMILARITY_THRESHOLD
from backend.embeddings.embedder import embedder


FAISS_INDEX_FILE = FAISS_DIR / "index.faiss"
METADATA_FILE = FAISS_DIR / "metadata.json"


class FAISSStore:
    """
    FAISS-backed vector store with JSON metadata sidecar.
    Supports add, search, and persistence.
    """

    def __init__(self):
        self.index: Optional[faiss.IndexFlatIP] = None
        self.metadata: List[Dict] = []
        self._load_or_create()

    def _load_or_create(self):
        """Load existing index or create a new one."""
        if FAISS_INDEX_FILE.exists() and METADATA_FILE.exists():
            print("[FAISSStore] Loading existing index...")
            self.index = faiss.read_index(str(FAISS_INDEX_FILE))
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            print(f"[FAISSStore] Loaded {self.index.ntotal} vectors.")
        else:
            print("[FAISSStore] Creating new index...")
            self.index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
            self.metadata = []

    def add_documents(self, documents: List[Dict]) -> int:
        """
        Add documents to the store.
        Each document: {"content": str, "metadata": dict}
        Returns number of documents added.
        """
        if not documents:
            return 0

        texts = [doc["content"] for doc in documents]
        embeddings = embedder.embed(texts)

        # Normalize for cosine similarity (IndexFlatIP)
        faiss.normalize_L2(embeddings)

        self.index.add(embeddings)

        timestamp = datetime.now().isoformat()
        for doc in documents:
            meta = doc.get("metadata", {}).copy()
            meta["content"] = doc["content"]
            meta["timestamp"] = timestamp
            self.metadata.append(meta)

        self._save()
        return len(documents)

    def search(self, query: str, top_k: int = TOP_K) -> List[Dict]:
        """
        Search for similar documents.
        Returns list of {content, metadata, score}.
        """
        if self.index.ntotal == 0:
            return []

        query_embedding = embedder.embed_single(query).reshape(1, -1)
        faiss.normalize_L2(query_embedding)

        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_embedding, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            if score < SIMILARITY_THRESHOLD:
                continue

            meta = self.metadata[idx].copy()
            content = meta.pop("content", "")
            results.append({
                "content": content,
                "metadata": meta,
                "score": float(score)
            })

        return results

    def _save(self):
        """Persist index and metadata to disk."""
        FAISS_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(FAISS_INDEX_FILE))
        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

    def clear(self):
        """Clear all data."""
        self.index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
        self.metadata = []
        self._save()

    @property
    def count(self) -> int:
        return self.index.ntotal if self.index else 0


# Module-level singleton
store = FAISSStore()
