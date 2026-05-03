/**
 * LoadingStates — Animated loading indicators showing RAG pipeline stages.
 */

import { motion } from 'framer-motion';

const STAGES = {
  processing: { label: 'Analyzing Intent', icon: '◈' },
  retrieving: { label: 'Deep Knowledge Retrieval', icon: '◇' },
  generating: { label: 'Synthesizing Response', icon: '◆' },
};

export default function LoadingStates({ stage }) {
  if (!stage || !STAGES[stage]) return null;

  const stageKeys = Object.keys(STAGES);
  const currentIndex = stageKeys.indexOf(stage);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-start gap-4 mb-8 max-w-2xl"
    >
      <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-1 rounded-xl glass-panel border border-accent/20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full" 
        />
      </div>

      <div className="flex-1 glass-panel p-5 rounded-2xl rounded-tl-none border-accent/20">
        <div className="space-y-4">
          {stageKeys.map((key, i) => {
            const s = STAGES[key];
            const isActive = i === currentIndex;
            const isDone = i < currentIndex;

            return (
              <div key={key} className="flex items-center gap-4 transition-all duration-500">
                <span className={`text-lg transition-colors duration-500 ${
                  isActive ? 'text-accent shadow-[0_0_10px_#00FFAA]' : isDone ? 'text-accent/40' : 'text-text-muted'
                }`}>
                  {s.icon}
                </span>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-mono font-bold tracking-wider transition-colors duration-500 ${
                      isActive ? 'text-white' : isDone ? 'text-text-dim' : 'text-text-muted'
                    }`}>
                      {s.label}
                    </span>
                    {isDone && <span className="text-[10px] text-accent font-bold">COMPLETE</span>}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    {isActive && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "70%" }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        className="h-full bg-accent shadow-[0_0_10px_#00FFAA]"
                      />
                    )}
                    {isDone && <div className="h-full w-full bg-accent/40" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
