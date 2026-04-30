/**
 * LoadingStates — Animated loading indicators showing RAG pipeline stages.
 */

import { motion } from 'framer-motion';

const STAGES = {
  processing: { label: 'Processing input...', icon: '⚙️' },
  retrieving: { label: 'Retrieving relevant context...', icon: '🔍' },
  generating: { label: 'Generating response...', icon: '✨' },
};

export default function LoadingStates({ stage }) {
  if (!stage || !STAGES[stage]) return null;

  const current = STAGES[stage];
  const stageKeys = Object.keys(STAGES);
  const currentIndex = stageKeys.indexOf(stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 max-w-2xl mb-4"
    >
      <div
        className="w-8 h-8 flex items-center justify-center shrink-0 mt-1"
        style={{
          background: 'var(--color-accent)',
          border: '2px solid var(--color-border)',
        }}
      >
        <span className="text-sm">🤖</span>
      </div>

      <div
        className="flex-1 p-4"
        style={{
          border: '2px solid var(--color-accent)',
          background: 'var(--color-accent-glow)',
        }}
      >
        {/* Stage indicators */}
        <div className="flex flex-col gap-2">
          {stageKeys.map((key, i) => {
            const s = STAGES[key];
            const isActive = i === currentIndex;
            const isDone = i < currentIndex;

            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-base">{s.icon}</span>
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    color: isActive
                      ? 'var(--color-accent)'
                      : isDone
                        ? 'var(--color-text-dim)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {s.label}
                </span>
                {isActive && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-2 h-2"
                    style={{ background: 'var(--color-accent)' }}
                  />
                )}
                {isDone && (
                  <span style={{ color: 'var(--color-accent)' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
