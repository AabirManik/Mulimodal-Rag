/**
 * Navbar — Top navigation bar with logo and status badge.
 */

import { motion } from 'framer-motion';
import { HiOutlineCpuChip } from 'react-icons/hi2';
import { IoShieldCheckmark } from 'react-icons/io5';
import useChatStore from '../store/chatStore';

export default function Navbar() {
  const { goHome } = useChatStore();

  return (
    <motion.nav
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-panel border-b-white/5"
    >
      {/* Left: Logo + Title */}
      <button
        onClick={goHome}
        className="flex items-center gap-4 group transition-all duration-300"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 group-hover:bg-accent group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,170,0.1)]">
          <HiOutlineCpuChip size={22} className="text-accent group-hover:text-bg transition-colors" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="font-display text-xl font-black tracking-tighter text-white">
            RAG ASSISTANT
          </span>
          <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-accent/70 mt-1">
            HYBRID INTELLIGENCE
          </span>
        </div>
      </button>

      {/* Right: Status */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#00FFAA]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-dim">
            Groq API Online
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5">
          <IoShieldCheckmark size={14} className="text-accent" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
            Cloud Enhanced
          </span>
        </div>
      </div>
    </motion.nav>
  );
}
