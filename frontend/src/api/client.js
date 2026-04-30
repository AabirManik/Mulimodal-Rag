/**
 * API Client — Axios instance for communicating with the FastAPI backend.
 */

import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min timeout for LLM generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Health ──────────────────────────────────────────────────

export async function checkHealth() {
  const res = await client.get('/health');
  return res.data;
}

// ─── Ingest ──────────────────────────────────────────────────

export async function ingestFile(file, modality) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('modality', modality);

  const res = await client.post('/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return res.data;
}

// ─── Query ───────────────────────────────────────────────────

export async function sendQuery(question, sessionId = null, topK = 5) {
  const res = await client.post('/query', {
    question,
    session_id: sessionId,
    top_k: topK,
  });
  return res.data;
}

// ─── Sessions ────────────────────────────────────────────────

export async function createSession() {
  const res = await client.post('/sessions');
  return res.data;
}

export async function listSessions() {
  const res = await client.get('/sessions');
  return res.data;
}

export async function getSession(sessionId) {
  const res = await client.get(`/sessions/${sessionId}`);
  return res.data;
}

export async function deleteSession(sessionId) {
  const res = await client.delete(`/sessions/${sessionId}`);
  return res.data;
}

// ─── Vector Store ────────────────────────────────────────────

export async function getVectorStats() {
  const res = await client.get('/vectorstore/stats');
  return res.data;
}

export async function clearVectorStore() {
  const res = await client.post('/vectorstore/clear');
  return res.data;
}

export default client;
