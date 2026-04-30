"""
PDF Processor — Extracts text from PDF files and chunks it intelligently.
"""

import re
from pathlib import Path
from typing import List, Dict
from PyPDF2 import PdfReader
from backend.config import CHUNK_SIZE, CHUNK_OVERLAP


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text.strip())
    return "\n\n".join(text_parts)


def clean_text(text: str) -> str:
    """Clean extracted text — normalize whitespace, remove artifacts."""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into overlapping chunks based on approximate token count.
    Uses word-based splitting as a proxy for tokens (~0.75 words per token).
    """
    words = text.split()
    # Approximate: 1 token ≈ 0.75 words, so chunk_size tokens ≈ chunk_size * 0.75 words
    words_per_chunk = int(chunk_size * 0.75)
    overlap_words = int(overlap * 0.75)

    if len(words) <= words_per_chunk:
        return [text] if text.strip() else []

    chunks = []
    start = 0
    while start < len(words):
        end = start + words_per_chunk
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        start += words_per_chunk - overlap_words

    return chunks


def process_pdf(file_path: str) -> List[Dict]:
    """
    Full PDF processing pipeline.
    Returns list of document chunks with metadata.
    """
    raw_text = extract_text_from_pdf(file_path)
    cleaned = clean_text(raw_text)
    chunks = chunk_text(cleaned)

    filename = Path(file_path).name
    documents = []
    for i, chunk in enumerate(chunks):
        documents.append({
            "content": chunk,
            "metadata": {
                "source": filename,
                "modality": "pdf",
                "chunk_index": i,
                "total_chunks": len(chunks),
            }
        })

    return documents
