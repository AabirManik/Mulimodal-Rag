"""
Embedder — Sentence Transformer embedding model with singleton pattern.
"""

import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer
from backend.config import EMBEDDING_MODEL_NAME, EMBEDDING_DIMENSION


class Embedder:
    """
    Singleton wrapper around SentenceTransformer.
    Lazily loads the model on first use.
    """
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is None:
            print(f"[Embedder] Loading model: {EMBEDDING_MODEL_NAME}...")
            self._model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            print(f"[Embedder] Model loaded. Dimension: {EMBEDDING_DIMENSION}")

    def embed(self, texts: List[str]) -> np.ndarray:
        """Embed a list of text strings into vectors."""
        self._load_model()
        embeddings = self._model.encode(
            texts,
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embeddings.astype(np.float32)

    def embed_single(self, text: str) -> np.ndarray:
        """Embed a single text string."""
        return self.embed([text])[0]

    @property
    def dimension(self) -> int:
        return EMBEDDING_DIMENSION


# Module-level convenience instance
embedder = Embedder()
