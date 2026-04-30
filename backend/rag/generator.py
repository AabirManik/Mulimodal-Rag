"""
Generator — Calls Ollama API to generate responses with Mistral.
"""

import json
import requests
from typing import Optional, Generator
from backend.config import OLLAMA_BASE_URL, LLM_MODEL


def generate(prompt: str, stream: bool = False) -> str:
    """
    Generate a response using the local Mistral model via Ollama.
    """
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "top_p": 0.9,
            "num_predict": 1024,
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=300
        )
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
    except requests.exceptions.ConnectionError:
        return (
            "**Error**: Cannot connect to Ollama. "
            "Make sure Ollama is running (`ollama serve`) with the Mistral model "
            "(`ollama pull mistral`)."
        )
    except requests.exceptions.Timeout:
        return "**Error**: LLM generation timed out. Try a shorter query."
    except Exception as e:
        return f"**Error**: LLM generation failed: {str(e)}"


def generate_stream(prompt: str) -> Generator[str, None, None]:
    """
    Stream a response token-by-token from Ollama.
    Yields text chunks as they arrive.
    """
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": True,
        "options": {
            "temperature": 0.3,
            "top_p": 0.9,
            "num_predict": 1024,
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            stream=True,
            timeout=300
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                token = data.get("response", "")
                if token:
                    yield token
                if data.get("done", False):
                    break
    except Exception as e:
        yield f"\n\n**Error**: Streaming failed: {str(e)}"


def check_ollama_status() -> dict:
    """Check if Ollama is running and which models are available."""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        response.raise_for_status()
        data = response.json()
        models = [m["name"] for m in data.get("models", [])]
        return {
            "status": "online",
            "models": models,
            "has_mistral": any("mistral" in m for m in models),
            "has_llava": any("llava" in m for m in models),
        }
    except Exception:
        return {
            "status": "offline",
            "models": [],
            "has_mistral": False,
            "has_llava": False,
        }
