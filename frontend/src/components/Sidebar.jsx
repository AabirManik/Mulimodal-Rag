/**
 * Sidebar — Chat session list with new chat button.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import useChatStore from '../store/chatStore';

export default function Sidebar() {
  const {
    sessions,
    activeSessionId,
    newChat,
    loadSession,
    removeSession,
  } = useChatStore();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col w-64 h-full shrink-0 overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        borderRight: '2.5px solid var(--color-border)',
      }}
    >
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={newChat}
          className="neo-btn neo-btn-accent w-full justify-center"
          style={{ padding: '0.75rem' }}
        >
          <HiOutlinePlus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p
          className="text-xs font-bold uppercase tracking-widest px-2 mb-3"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          History
        </p>

        <AnimatePresence>
          {sessions.length === 0 ? (
            <p
              className="text-xs px-2 mt-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No conversations yet.
            </p>
          ) : (
            sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center gap-2 mb-1"
              >
                <button
                  onClick={() => loadSession(session.id)}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 text-left text-sm cursor-pointer truncate"
                  style={{
                    background: activeSessionId === session.id
                      ? 'var(--color-card-hover)'
                      : 'transparent',
                    border: activeSessionId === session.id
                      ? '2px solid var(--color-accent)'
                      : '2px solid transparent',
                    color: activeSessionId === session.id
                      ? 'var(--color-accent)'
                      : 'var(--color-text-dim)',
                    fontFamily: 'var(--font-family-body)',
                    transition: 'all 0.1s',
                  }}
                >
                  <HiOutlineChatBubbleLeftRight size={14} className="shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-danger)',
                    transition: 'opacity 0.15s',
                  }}
                >
                  <HiOutlineTrash size={14} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 text-xs"
        style={{
          borderTop: '2px solid var(--color-border-dim)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-family-mono)',
        }}
      >
        <span>100% Local • Private</span>
      </div>
    </motion.aside>
  );
}
