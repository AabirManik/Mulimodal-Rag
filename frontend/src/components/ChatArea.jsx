/**
 * ChatArea — Main chat view with messages, loading states, and input bar.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UserMessage, AIMessage } from './MessageBubble';
import LoadingStates from './LoadingStates';
import InputBar from './InputBar';
import useChatStore from '../store/chatStore';

export default function ChatArea() {
  const { messages, loadingStage } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingStage]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
              Start by uploading a document or asking a question.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} message={msg} />
            ) : (
              <AIMessage key={msg.id} message={msg} />
            )
          )}
        </AnimatePresence>

        {loadingStage && <LoadingStates stage={loadingStage} />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputBar />
    </div>
  );
}
