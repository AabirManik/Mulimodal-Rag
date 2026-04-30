# 🤖 Offline Multimodal RAG Assistant

A **fully offline, privacy-first AI system** that accepts Text, PDF, Image, and Audio inputs, performs semantic retrieval via FAISS, and generates grounded responses using a local LLM — all running on your machine with zero internet dependency.

![Neobrutalism UI](https://img.shields.io/badge/UI-Neobrutalism-00FFAA?style=for-the-badge)
![Offline](https://img.shields.io/badge/Mode-100%25_Offline-FF4444?style=for-the-badge)
![Python](https://img.shields.io/badge/Backend-Python_FastAPI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge)

---

## 🏗️ Architecture

```
User Input (Text/PDF/Image/Audio)
        │
        ▼
┌─────────────────┐
│  Input Layer     │  PDF→PyPDF2 | Image→LLaVA | Audio→Vosk
└────────┬────────┘
         ▼
┌─────────────────┐
│  Embedding       │  Sentence Transformers (all-MiniLM-L6-v2)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Vector Store    │  FAISS (local, on-disk persistence)
└────────┬────────┘
         ▼
┌─────────────────┐
│  RAG Retriever   │  Top-K similarity search
└────────┬────────┘
         ▼
┌─────────────────┐
│  Prompt Builder  │  Context injection + multi-turn memory
└────────┬────────┘
         ▼
┌─────────────────┐
│  LLM Generator   │  Mistral 7B via Ollama
└────────┬────────┘
         ▼
    Structured Response
    (Answer + Key Points + Sources)
```

---

## ⚡ Prerequisites

### 1. Python 3.10+
```bash
python --version
```

### 2. Node.js 18+
```bash
node --version
```

### 3. Ollama (Local LLM Runtime)
Download from: https://ollama.com/download

Then pull the required models:
```bash
ollama pull mistral
ollama pull llava
```

Start the server:
```bash
ollama serve
```

### 4. Vosk Model (Offline Speech-to-Text)
Download the small English model:
```bash
# From the backend directory
mkdir -p models
cd models
# Download from https://alphacephei.com/vosk/models
# Extract to: backend/models/vosk-model-small-en-us-0.15/
```

### 5. FFmpeg (for audio conversion)
Download from: https://ffmpeg.org/download.html
Add to your system PATH.

---

## 🚀 Quick Start

### Backend

```bash
# From project root
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
cd ..
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
# From project root
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📂 Project Structure

```
Rag_Model/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Central configuration
│   ├── requirements.txt     # Python dependencies
│   ├── api/
│   │   └── routes.py        # API endpoints
│   ├── ingest/
│   │   ├── pdf_processor.py   # PDF text extraction + chunking
│   │   ├── image_processor.py # LLaVA image captioning
│   │   └── audio_processor.py # Vosk speech-to-text
│   ├── embeddings/
│   │   └── embedder.py      # Sentence Transformer embeddings
│   ├── vectorstore/
│   │   └── faiss_store.py   # FAISS index + metadata
│   ├── rag/
│   │   ├── retriever.py     # Similarity search
│   │   ├── prompt_builder.py # Grounded prompt construction
│   │   ├── generator.py     # Ollama LLM generation
│   │   └── pipeline.py      # Full RAG orchestration
│   └── data/                # Auto-created at runtime
│       ├── uploads/
│       ├── faiss_index/
│       └── sessions/
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css          # Neobrutalism design system
        ├── api/
        │   └── client.js      # Axios API client
        ├── store/
        │   └── chatStore.js   # Zustand state management
        └── components/
            ├── Navbar.jsx
            ├── InitialView.jsx
            ├── Sidebar.jsx
            ├── ChatArea.jsx
            ├── MessageBubble.jsx
            ├── SourceCard.jsx
            ├── InputBar.jsx
            └── LoadingStates.jsx
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `POST` | `/api/ingest` | Upload & ingest file (PDF/image/audio) |
| `POST` | `/api/query` | Send query, get RAG response |
| `POST` | `/api/sessions` | Create new chat session |
| `GET` | `/api/sessions` | List all sessions |
| `GET` | `/api/sessions/{id}` | Get session with history |
| `DELETE` | `/api/sessions/{id}` | Delete a session |
| `GET` | `/api/vectorstore/stats` | Vector store statistics |
| `POST` | `/api/vectorstore/clear` | Clear all vectors |

---

## 🧪 Test Cases

### 1. PDF Query
```bash
# Ingest a PDF
curl -X POST http://localhost:8000/api/ingest \
  -F "file=@document.pdf" -F "modality=pdf"

# Query it
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic of this document?"}'
```

### 2. Image Reasoning
```bash
curl -X POST http://localhost:8000/api/ingest \
  -F "file=@photo.jpg" -F "modality=image"

curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Describe what was in the uploaded image."}'
```

### 3. Audio Query
```bash
curl -X POST http://localhost:8000/api/ingest \
  -F "file=@recording.wav" -F "modality=audio"

curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What was discussed in the audio recording?"}'
```

### 4. Multi-turn Conversation
```bash
# Create session
curl -X POST http://localhost:8000/api/sessions

# Query with session (replace SESSION_ID)
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me more about that.", "session_id": "SESSION_ID"}'
```

---

## 🎨 Design System (Neobrutalism)

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A0A` | Page background |
| Card | `#111111` | Card surfaces |
| Accent | `#00FFAA` | Interactive elements |
| Border | `#FFFFFF` | 2.5px solid borders |
| Text | `#FFFFFF` | Primary text |
| Font Display | Space Grotesk | Headings, buttons |
| Font Mono | JetBrains Mono | Code, labels |
| Font Body | Inter | Body text |

---

## ⚡ Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **LLM**: Mistral 7B (via Ollama)
- **Vision**: LLaVA (via Ollama)
- **Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector DB**: FAISS (local)
- **STT**: Vosk (offline)
- **Frontend**: React, Vite, TailwindCSS v4, Framer Motion, Zustand
- **PDF**: PyPDF2

---

## 🔒 Privacy

- **Zero internet calls** during operation
- All models run locally
- Data never leaves your machine
- No telemetry, no tracking
