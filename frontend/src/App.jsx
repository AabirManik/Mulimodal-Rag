/**
 * App — Root component. Switches between InitialView and ChatMode.
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import InitialView from './components/InitialView';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import useChatStore from './store/chatStore';

export default function App() {
  const { isInChat, error, clearError, initialize } = useChatStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-6 py-3 mt-[52px]"
            style={{ background: 'var(--color-danger)', color: '#fff', borderBottom: '2px solid var(--color-border)' }}
          >
            <span className="text-sm font-medium">{error}</span>
            <button onClick={clearError} className="text-sm font-bold cursor-pointer px-2"
              style={{ background: 'transparent', border: 'none', color: '#fff' }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: error ? 0 : '52px' }}>
        <AnimatePresence mode="wait">
          {isInChat ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 overflow-hidden"
            >
              <Sidebar />
              <ChatArea />
            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <InitialView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
