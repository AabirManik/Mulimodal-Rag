/**
 * MessageBubble — Renders user and AI messages with structured content.
 */

import { motion } from 'framer-motion';
import SourceCard from './SourceCard';

export function UserMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-end mb-6"
    >
      <div className="max-w-xl message-user p-4 rounded-2xl rounded-tr-none shadow-xl reveal-anim">
        <p className="text-[15px] leading-relaxed text-white">
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 mb-10 max-w-4xl reveal-anim"
    >
      {/* AI Avatar */}
      <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-1 rounded-xl glass-panel border border-accent/30 shadow-[0_0_15px_rgba(0,255,170,0.2)]">
        <div className="w-5 h-5 bg-accent rounded-sm animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      </div>

      <div className="flex-1 space-y-4">
        {/* Answer Section */}
        <div className="glass-panel p-6 rounded-2xl rounded-tl-none border-border-bright/50 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 opacity-70">
            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-accent">
              Insight Generation
            </p>
          </div>
          <p className="text-[15px] leading-relaxed text-text-dim whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Key Points Section */}
        {hasKeyPoints && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {message.keyPoints.map((point, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors group"
              >
                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 group-hover:scale-125 transition-transform" />
                <span className="text-sm text-text-dim leading-snug">{point}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sources Section */}
        {hasSources && (
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] flex-1 bg-border-bright/30" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">
                Reference Base ({message.sources.length})
              </p>
              <span className="h-[1px] flex-1 bg-border-bright/30" />
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, i) => (
                <SourceCard key={i} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
