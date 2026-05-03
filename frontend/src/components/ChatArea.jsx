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
    <div className="flex flex-col flex-1 h-full overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-10 z-10 scrollbar-thin">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] opacity-30">
              <div className="w-12 h-12 border border-dashed border-text-muted rounded-full mb-4 animate-spin-slow" />
              <p className="text-xs font-mono uppercase tracking-[0.2em]">
                Awaiting connection to knowledge base
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id} message={msg} />
              ) : (
                <AIMessage key={msg.id} message={msg} />
              )
            )}
          </AnimatePresence>

          {loadingStage && <LoadingStates stage={loadingStage} />}

          <div ref={bottomRef} className="h-10" />
        </div>
      </div>

      {/* Input - Sticky at bottom but floating visually */}
      <div className="relative z-20">
        <InputBar />
      </div>
    </div>
  );
}
