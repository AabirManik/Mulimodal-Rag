/**
 * InitialView — Landing state with title, input, and upload buttons.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlinePhotograph, HiOutlineMicrophone } from 'react-icons/hi';
import { HiPaperAirplane } from 'react-icons/hi2';
import useChatStore from '../store/chatStore';

export default function InitialView() {
  const [query, setQuery] = useState('');
  const { ask, ingest, isIngesting, ingestProgress } = useChatStore();
  const pdfRef = useRef(null);
  const imgRef = useRef(null);
  const audioRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      ask(query.trim());
      setQuery('');
    }
  };

  const handleFileUpload = async (file, modality) => {
    if (file) {
      await ingest(file, modality);
    }
  };

  const uploadButtons = [
    {
      label: 'PDF',
      icon: <HiOutlineDocumentText size={22} />,
      ref: pdfRef,
      accept: '.pdf',
      modality: 'pdf',
      color: '#FF3366',
    },
    {
      label: 'Image',
      icon: <HiOutlinePhotograph size={22} />,
      ref: imgRef,
      accept: '.jpg,.jpeg,.png,.gif,.webp',
      modality: 'image',
      color: '#00FFAA',
    },
    {
      label: 'Audio',
      icon: <HiOutlineMicrophone size={22} />,
      ref: audioRef,
      accept: '.wav,.mp3,.ogg,.flac,.m4a',
      modality: 'audio',
      color: '#00CCFF',
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-glow rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />

      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16 relative z-10"
      >
        <div className="inline-block px-4 py-1 mb-6 text-xs font-mono tracking-widest text-accent border border-accent/30 bg-accent/5 rounded-full reveal-anim">
          HYBRID RAG ASSISTANT
        </div>
        <h1
          className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter reveal-anim"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Query Your <br />
          <span className="accent-gradient glow-text">Knowledge</span>
        </h1>
        <p
          className="text-lg md:text-xl max-w-xl mx-auto text-text-dim leading-relaxed reveal-anim"
          style={{ animationDelay: '0.1s' }}
        >
          A powerful, multimodal workspace. Upload documents, images, or audio—then chat with your data in real-time.
        </p>
      </motion.div>

      {/* Main Action Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-3xl z-10"
      >
        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="relative mb-10 group"
        >
          <div className="glass-panel p-1 rounded-2xl border-2 border-border-bright group-focus-within:border-accent transition-all duration-300 shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your data..."
                className="flex-1 bg-transparent border-none outline-none text-xl py-4 px-2 placeholder:text-text-muted"
                style={{ fontFamily: 'var(--font-family-body)' }}
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
                  query.trim() 
                    ? 'bg-accent text-bg shadow-[0_0_20px_rgba(0,255,170,0.4)] translate-y-0' 
                    : 'bg-border-bright text-text-muted cursor-not-allowed'
                }`}
              >
                <HiPaperAirplane size={22} className={query.trim() ? 'rotate-0' : 'rotate-12 opacity-50'} />
              </button>
            </div>
          </div>
        </form>

        {/* Upload Quick-Actions */}
        <div className="flex flex-wrap justify-center gap-6">
          {uploadButtons.map((btn, idx) => (
            <motion.div 
              key={btn.modality}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
            >
              <input
                ref={btn.ref}
                type="file"
                accept={btn.accept}
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0], btn.modality)}
              />
              <button
                onClick={() => btn.ref.current?.click()}
                disabled={isIngesting}
                className="group flex flex-col items-center gap-3"
              >
                <div 
                  className="w-16 h-16 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 group-hover:scale-110 group-active:scale-95 shadow-xl"
                  style={{ 
                    borderColor: btn.color + '44', 
                    background: btn.color + '11',
                    color: btn.color 
                  }}
                >
                  {btn.icon}
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-text-dim group-hover:text-white transition-colors">
                  {btn.label}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ingest Progress Overlay */}
      {ingestProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 glass-panel rounded-full border border-accent/50 shadow-[0_0_40px_rgba(0,255,170,0.2)] flex items-center gap-4 z-50"
        >
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_#00FFAA]" />
          <span className="font-mono text-xs font-bold text-accent tracking-tighter uppercase">
            {ingestProgress}
          </span>
        </motion.div>
      )}

      {/* Footer Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">
          Secured with Groq & HuggingFace
        </p>
      </motion.div>
    </div>
  );
}
