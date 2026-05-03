"""
Image Processor — Uses LLaVA (via Ollama) or Donut (via Hugging Face) to process images.
"""

import base64
import requests
from pathlib import Path
from typing import Dict, List, Optional
from backend.config import (
    OLLAMA_BASE_URL, 
    VISION_MODEL, 
    VISION_PROVIDER, 
    HF_VISION_MODEL_NAME
)

# Lazy loading for Hugging Face pipeline
_hf_vision_pipe = None

def get_hf_vision_pipe():
    global _hf_vision_pipe
    if _hf_vision_pipe is None:
        from transformers import pipeline
        print(f"[ImageProcessor] Loading HF Vision model: {HF_VISION_MODEL_NAME}...")
        _hf_vision_pipe = pipeline("document-question-answering", model=HF_VISION_MODEL_NAME)
    return _hf_vision_pipe


def encode_image_to_base64(file_path: str) -> str:
    """Read an image file and encode it as base64."""
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def caption_image(file_path: str) -> str:
    """
    Get a description or extraction from the image using the configured provider.
    """
    if VISION_PROVIDER == "huggingface":
        return _caption_hf(file_path)
    else:
        return _caption_ollama(file_path)


def _caption_ollama(file_path: str) -> str:
    """Send image to LLaVA via Ollama."""
    image_b64 = encode_image_to_base64(file_path)

    payload = {
        "model": VISION_MODEL,
        "prompt": (
            "Describe this image in detail. Include all visible text, objects, "
            "people, colors, layout, and any important information you can extract. "
            "Be thorough and precise."
        ),
        "images": [image_b64],
        "stream": False
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=120
        )
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
    except requests.exceptions.ConnectionError:
        return "[Error: Cannot connect to Ollama. Make sure Ollama is running with the LLaVA model.]"
    except Exception as e:
        return f"[Error captioning image: {str(e)}]"


def _caption_hf(file_path: str) -> str:
    """Process image using Hugging Face Donut model."""
    try:
        pipe = get_hf_vision_pipe()
        # For Donut, we use it for a general "What is in this document?" question to extract text/context
        result = pipe(
            image=file_path,
            question="What is the content of this document?"
        )
        # result is usually a list of dicts: [{'answer': '...'}]
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("answer", "No answer found.")
        return str(result)
    except Exception as e:
        return f"[Error processing with HF Vision: {str(e)}]"


def process_image(file_path: str) -> List[Dict]:
    """
    Process an image file: generate caption and return as document chunk.
    """
    caption = caption_image(file_path)
    filename = Path(file_path).name

    return [{
        "content": f"[Image Analysis: {filename}] {caption}",
        "metadata": {
            "source": filename,
            "modality": "image",
            "chunk_index": 0,
            "total_chunks": 1,
        }
    }]
