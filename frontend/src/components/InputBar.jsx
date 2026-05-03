/**
 * InputBar — Floating glass-morphism input bar with file upload and send action.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPaperAirplane } from 'react-icons/hi2';
import { HiOutlineDocumentText, HiOutlinePhotograph, HiOutlineMicrophone } from 'react-icons/hi';
import useChatStore from '../store/chatStore';

export default function InputBar() {
  const [text, setText] = useState('');
  const { ask, ingest, loadingStage, isIngesting, ingestProgress } = useChatStore();
  const pdfRef = useRef(null);
  const imgRef = useRef(null);
  const audioRef = useRef(null);
  const isLoading = !!loadingStage || isIngesting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      ask(text.trim());
      setText('');
    }
  };

  const handleFile = (file, modality) => {
    if (file) ingest(file, modality);
  };

  const uploadBtns = [
    { ref: pdfRef, accept: '.pdf', modality: 'pdf', icon: <HiOutlineDocumentText size={20} />, color: '#FF3366' },
    { ref: imgRef, accept: '.jpg,.jpeg,.png,.gif,.webp', modality: 'image', icon: <HiOutlinePhotograph size={20} />, color: '#00FFAA' },
    { ref: audioRef, accept: '.wav,.mp3,.ogg,.flac,.m4a', modality: 'audio', icon: <HiOutlineMicrophone size={20} />, color: '#00CCFF' },
  ];

  return (
    <div className="p-6 relative z-30">
      {/* Ingest progress toast-like notification */}
      <AnimatePresence>
        {ingestProgress && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 glass-panel rounded-full border border-accent/30 text-[10px] font-mono text-accent uppercase tracking-tighter"
          >
            {ingestProgress}
          </motion.div>
        )}
      </AnimatePresence>

      <form 
        onSubmit={handleSubmit} 
        className={`glass-panel max-w-4xl mx-auto flex items-center gap-2 p-1.5 rounded-2xl border-2 transition-all duration-300 shadow-2xl ${
          isLoading ? 'opacity-70 pointer-events-none' : 'border-border-bright group-focus-within:border-accent'
        }`}
      >
        {/* Upload Action Group */}
        <div className="flex items-center gap-1 pl-2">
          {uploadBtns.map((btn) => (
            <div key={btn.modality} className="relative">
              <input 
                ref={btn.ref} 
                type="file" 
                accept={btn.accept} 
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0], btn.modality)} 
              />
              <button 
                type="button" 
                onClick={() => btn.ref.current?.click()} 
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-90"
                style={{ color: btn.color }}
                title={`Upload ${btn.modality}`}
              >
                {btn.icon}
              </button>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-white/10 mx-1" />

        {/* Query Input */}
        <input
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder={isLoading ? 'Analyzing knowledge base...' : 'Ask a follow-up question...'} 
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-white text-base placeholder:text-text-muted"
          style={{ fontFamily: 'var(--font-family-body)' }}
        />

        {/* Send Button */}
        <button 
          type="submit" 
          disabled={!text.trim() || isLoading}
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
            text.trim() && !isLoading 
              ? 'bg-accent text-bg shadow-[0_0_15px_rgba(0,255,170,0.3)]' 
              : 'bg-white/5 text-text-muted'
          }`}
        >
          <HiPaperAirplane size={20} className={text.trim() && !isLoading ? 'rotate-0' : 'rotate-12 opacity-50'} />
        </button>
      </form>
    </div>
  );
}
