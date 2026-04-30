/**
 * SourceCard — Expandable card showing a retrieved document chunk.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDocument, HiOutlinePhotograph, HiOutlineMicrophone, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const MODALITY_ICONS = {
  pdf: <HiOutlineDocument size={14} />,
  image: <HiOutlinePhotograph size={14} />,
  audio: <HiOutlineMicrophone size={14} />,
};

const MODALITY_COLORS = {
  pdf: '#FF6B6B',
  image: '#4ECDC4',
  audio: '#FFE66D',
};

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  const icon = MODALITY_ICONS[source.modality] || MODALITY_ICONS.pdf;
  const color = MODALITY_COLORS[source.modality] || '#FFFFFF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2"
      style={{
        border: `2px solid ${color}40`,
        background: 'var(--color-card)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text)',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-family-mono)', color }}
          >
            {source.source}
          </span>
          <span
            className="text-xs px-1.5 py-0.5"
            style={{
              background: `${color}20`,
              color,
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            {(source.score * 100).toFixed(0)}%
          </span>
        </div>
        <span style={{ color: 'var(--color-text-muted)' }}>
          {expanded ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
        </span>
      </button>

      {/* Snippet (always visible) */}
      <div
        className="px-3 pb-2 text-xs leading-relaxed"
        style={{
          color: 'var(--color-text-dim)',
          fontFamily: 'var(--font-family-mono)',
        }}
      >
        {source.snippet}
      </div>

      {/* Expanded full content */}
      <AnimatePresence>
        {expanded && source.full_content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-3 pb-3 text-xs leading-relaxed"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-family-mono)',
                borderTop: `1px solid ${color}30`,
                paddingTop: '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              {source.full_content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
