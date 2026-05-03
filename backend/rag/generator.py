"""
Generator — Calls Ollama or Groq API to generate responses.
"""

import json
import requests
from typing import Optional, Generator
from groq import Groq
from backend.config import (
    OLLAMA_BASE_URL, 
    LLM_MODEL, 
    LLM_PROVIDER, 
    GROQ_API_KEY, 
    GROQ_MODEL_NAME
)

# Initialize Groq client lazily
_groq_client = None

def get_groq_client():
    global _groq_client
    if _groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set in environment variables.")
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client


def generate(prompt: str, stream: bool = False) -> str:
    """
    Generate a response using the configured provider (Ollama or Groq).
    """
    if LLM_PROVIDER == "groq":
        return _generate_groq(prompt)
    else:
        return _generate_ollama(prompt)


def _generate_ollama(prompt: str) -> str:
    """Generate a response using local Ollama."""
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


def _generate_groq(prompt: str) -> str:
    """Generate a response using Groq API."""
    try:
        client = get_groq_client()
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL_NAME,
            temperature=0.3,
            max_tokens=1024,
            top_p=1,
            stream=False,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"**Error**: Groq generation failed: {str(e)}"


def generate_stream(prompt: str) -> Generator[str, None, None]:
    """
    Stream a response token-by-token from the configured provider.
    """
    if LLM_PROVIDER == "groq":
        yield from _generate_stream_groq(prompt)
    else:
        yield from _generate_stream_ollama(prompt)


def _generate_stream_ollama(prompt: str) -> Generator[str, None, None]:
    """Stream a response token-by-token from Ollama."""
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


def _generate_stream_groq(prompt: str) -> Generator[str, None, None]:
    """Stream a response token-by-token from Groq."""
    try:
        client = get_groq_client()
        stream = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL_NAME,
            temperature=0.3,
            max_tokens=1024,
            top_p=1,
            stream=True,
        )
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token
    except Exception as e:
        yield f"\n\n**Error**: Groq streaming failed: {str(e)}"


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
