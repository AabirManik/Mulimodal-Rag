/**
 * Chat Store — Zustand state management for the RAG assistant.
 */

import { create } from 'zustand';
import {
  sendQuery,
  ingestFile,
  createSession,
  listSessions,
  getSession,
  deleteSession,
  checkHealth,
} from '../api/client';

const useChatStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────
  messages: [],
  sessions: [],
  activeSessionId: null,
  isInChat: false,

  // Loading states
  loadingStage: null, // null | 'processing' | 'retrieving' | 'generating'
  isIngesting: false,
  ingestProgress: null,

  // System
  health: null,
  error: null,

  // ─── Actions ────────────────────────────────────────

  /** Initialize — check health and load sessions */
  initialize: async () => {
    try {
      const health = await checkHealth();
      const sessions = await listSessions();
      set({ health, sessions, error: null });
    } catch (err) {
      set({ error: 'Cannot connect to backend. Is the server running?' });
    }
  },

  /** Create a new chat session */
  newChat: async () => {
    try {
      const session = await createSession();
      const sessions = await listSessions();
      set({
        activeSessionId: session.id,
        messages: [],
        sessions,
        isInChat: true,
        error: null,
      });
    } catch (err) {
      set({ error: 'Failed to create session' });
    }
  },

  /** Load an existing session */
  loadSession: async (sessionId) => {
    try {
      const session = await getSession(sessionId);
      const messages = (session.messages || []).map((m, i) => ({
        id: `hist-${i}`,
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      }));
      set({
        activeSessionId: sessionId,
        messages,
        isInChat: true,
        error: null,
      });
    } catch (err) {
      set({ error: 'Failed to load session' });
    }
  },

  /** Delete a session */
  removeSession: async (sessionId) => {
    try {
      await deleteSession(sessionId);
      const sessions = await listSessions();
      const state = get();
      if (state.activeSessionId === sessionId) {
        set({ activeSessionId: null, messages: [], isInChat: false });
      }
      set({ sessions, error: null });
    } catch (err) {
      set({ error: 'Failed to delete session' });
    }
  },

  /** Send a query */
  ask: async (question) => {
    const state = get();
    let sessionId = state.activeSessionId;

    // Auto-create session if needed
    if (!sessionId) {
      try {
        const session = await createSession();
        sessionId = session.id;
        set({ activeSessionId: sessionId, isInChat: true });
      } catch {
        set({ error: 'Failed to create session' });
        return;
      }
    }

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      loadingStage: 'retrieving',
      error: null,
    }));

    try {
      // Simulate staged loading
      setTimeout(() => {
        if (get().loadingStage === 'retrieving') {
          set({ loadingStage: 'generating' });
        }
      }, 1500);

      const result = await sendQuery(question, sessionId);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        keyPoints: result.key_points || [],
        sources: result.sources || [],
        contextUsed: result.context_used,
        timestamp: new Date().toISOString(),
      };

      const sessions = await listSessions();

      set((s) => ({
        messages: [...s.messages, aiMsg],
        loadingStage: null,
        sessions,
      }));
    } catch (err) {
      set({
        loadingStage: null,
        error: err.response?.data?.detail || 'Query failed. Is Ollama running?',
      });
    }
  },

  /** Ingest a file */
  ingest: async (file, modality) => {
    set({ isIngesting: true, ingestProgress: `Processing ${file.name}...`, error: null });

    try {
      const result = await ingestFile(file, modality);
      set({
        isIngesting: false,
        ingestProgress: `✓ Ingested ${result.file} — ${result.chunks} chunks added`,
      });

      // Clear progress after 3s
      setTimeout(() => set({ ingestProgress: null }), 3000);
      return result;
    } catch (err) {
      set({
        isIngesting: false,
        ingestProgress: null,
        error: err.response?.data?.detail || `Failed to ingest ${file.name}`,
      });
      return null;
    }
  },

  /** Go back to initial view */
  goHome: () => {
    set({ isInChat: false, activeSessionId: null, messages: [] });
  },

  /** Clear error */
  clearError: () => set({ error: null }),
}));

export default useChatStore;
