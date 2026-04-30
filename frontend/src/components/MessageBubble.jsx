/**
 * MessageBubble — Renders user and AI messages with structured content.
 */

import { motion } from 'framer-motion';
import SourceCard from './SourceCard';

export function UserMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-end mb-4"
    >
      <div
        className="max-w-xl px-5 py-3"
        style={{
          background: 'var(--color-user-msg)',
          border: '2.5px solid var(--color-border)',
          boxShadow: '3px 3px 0px var(--color-border)',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

export function AIMessage({ message }) {
  const hasKeyPoints = message.keyPoints && message.keyPoints.length > 0;
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 mb-6 max-w-3xl"
    >
      <div
        className="w-8 h-8 flex items-center justify-center shrink-0 mt-1"
        style={{ background: 'var(--color-accent)', border: '2px solid var(--color-border)' }}
      >
        <span className="text-sm font-bold" style={{ color: 'var(--color-bg)' }}>AI</span>
      </div>

      <div className="flex-1 space-y-3">
        {/* Answer */}
        <div className="p-4" style={{ background: 'var(--color-ai-msg)', border: '2.5px solid var(--color-border-dim)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-family-mono)' }}>
            Answer
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
            {message.content}
          </p>
        </div>

        {/* Key Points */}
        {hasKeyPoints && (
          <div className="p-4" style={{ background: 'var(--color-card)', border: '2px solid var(--color-accent)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-family-mono)' }}>
              Key Points
            </p>
            <ul className="space-y-1.5">
              {message.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-dim)' }}>
                  <span style={{ color: 'var(--color-accent)' }}>▸</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {hasSources && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
              Sources ({message.sources.length})
            </p>
            {message.sources.map((source, i) => (
              <SourceCard key={i} source={source} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
