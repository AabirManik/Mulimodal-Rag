/**
 * Navbar — Top navigation bar with logo and offline status badge.
 */

import { motion } from 'framer-motion';
import { HiOutlineCpuChip } from 'react-icons/hi2';
import { IoShieldCheckmark } from 'react-icons/io5';
import useChatStore from '../store/chatStore';

export default function Navbar() {
  const { goHome, health } = useChatStore();
  const ollamaOnline = health?.ollama?.status === 'online';

  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'var(--color-bg)',
        borderBottom: '2.5px solid var(--color-border)',
      }}
    >
      {/* Left: Logo + Title */}
      <button
        onClick={goHome}
        className="flex items-center gap-3 cursor-pointer bg-transparent border-none"
        style={{ color: 'var(--color-text)' }}
      >
        <div
          className="flex items-center justify-center w-9 h-9"
          style={{
            background: 'var(--color-accent)',
            border: '2px solid var(--color-border)',
          }}
        >
          <HiOutlineCpuChip size={20} color="#0A0A0A" />
        </div>
        <span
          className="font-display text-lg font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          RAG ASSISTANT
        </span>
      </button>

      {/* Right: Status */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{
            border: `2px solid ${ollamaOnline ? 'var(--color-accent)' : 'var(--color-danger)'}`,
            color: ollamaOnline ? 'var(--color-accent)' : 'var(--color-danger)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          <IoShieldCheckmark size={14} />
          <span>Offline Mode</span>
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: ollamaOnline ? 'var(--color-accent)' : 'var(--color-danger)',
              boxShadow: ollamaOnline
                ? '0 0 8px var(--color-accent)'
                : '0 0 8px var(--color-danger)',
            }}
          />
        </div>
      </div>
    </motion.nav>
  );
}
