"""
Image Processor — Uses LLaVA (via Ollama) to generate captions for images.
"""

import base64
import requests
from pathlib import Path
from typing import Dict, List
from backend.config import OLLAMA_BASE_URL, VISION_MODEL


def encode_image_to_base64(file_path: str) -> str:
    """Read an image file and encode it as base64."""
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def caption_image(file_path: str) -> str:
    """
    Send image to LLaVA via Ollama and get a descriptive caption.
    """
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


def process_image(file_path: str) -> List[Dict]:
    """
    Process an image file: generate caption and return as document chunk.
    """
    caption = caption_image(file_path)
    filename = Path(file_path).name

    return [{
        "content": f"[Image: {filename}] {caption}",
        "metadata": {
            "source": filename,
            "modality": "image",
            "chunk_index": 0,
            "total_chunks": 1,
        }
    }]
