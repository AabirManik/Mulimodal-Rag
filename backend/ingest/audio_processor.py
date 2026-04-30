"""
Audio Processor — Transcribes audio files using Vosk (offline STT).
"""

import json
import wave
import subprocess
from pathlib import Path
from typing import Dict, List
from backend.config import VOSK_MODEL_PATH, CHUNK_SIZE, CHUNK_OVERLAP
from backend.ingest.pdf_processor import chunk_text


def convert_to_wav(input_path: str, output_path: str) -> str:
    """
    Convert any audio file to WAV format (16kHz mono) using ffmpeg.
    If already WAV, copies. Otherwise converts.
    """
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", input_path,
                "-ar", "16000", "-ac", "1", "-f", "wav", output_path
            ],
            capture_output=True, check=True, timeout=60
        )
        return output_path
    except FileNotFoundError:
        raise RuntimeError(
            "ffmpeg not found. Install ffmpeg for audio conversion."
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Audio conversion failed: {e.stderr.decode()}")


def transcribe_audio(file_path: str) -> str:
    """
    Transcribe an audio file using Vosk offline speech recognition.
    """
    try:
        from vosk import Model, KaldiRecognizer
    except ImportError:
        return "[Error: Vosk is not installed. Install it with: pip install vosk]"

    # Convert to WAV if needed
    wav_path = file_path
    if not file_path.lower().endswith(".wav"):
        wav_path = str(Path(file_path).with_suffix(".converted.wav"))
        convert_to_wav(file_path, wav_path)

    # Load Vosk model
    if not Path(VOSK_MODEL_PATH).exists():
        return (
            f"[Error: Vosk model not found at {VOSK_MODEL_PATH}. "
            "Download from https://alphacephei.com/vosk/models]"
        )

    model = Model(VOSK_MODEL_PATH)

    # Open WAV and transcribe
    wf = wave.open(wav_path, "rb")
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        return "[Error: Audio must be mono WAV at 16kHz. Conversion may have failed.]"

    recognizer = KaldiRecognizer(model, wf.getframerate())
    recognizer.SetWords(True)

    transcription_parts = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            if result.get("text"):
                transcription_parts.append(result["text"])

    # Get final result
    final = json.loads(recognizer.FinalResult())
    if final.get("text"):
        transcription_parts.append(final["text"])

    wf.close()
    return " ".join(transcription_parts).strip()


def process_audio(file_path: str) -> List[Dict]:
    """
    Process an audio file: transcribe and chunk.
    """
    transcription = transcribe_audio(file_path)
    filename = Path(file_path).name

    if transcription.startswith("[Error"):
        return [{
            "content": transcription,
            "metadata": {
                "source": filename,
                "modality": "audio",
                "chunk_index": 0,
                "total_chunks": 1,
            }
        }]

    # Chunk the transcription
    chunks = chunk_text(transcription, CHUNK_SIZE, CHUNK_OVERLAP)
    if not chunks:
        chunks = [transcription]

    documents = []
    for i, chunk in enumerate(chunks):
        documents.append({
            "content": f"[Audio Transcription: {filename}] {chunk}",
            "metadata": {
                "source": filename,
                "modality": "audio",
                "chunk_index": i,
                "total_chunks": len(chunks),
            }
        })

    return documents
