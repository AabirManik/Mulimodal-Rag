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
      color: '#FF6B6B',
    },
    {
      label: 'Image',
      icon: <HiOutlinePhotograph size={22} />,
      ref: imgRef,
      accept: '.jpg,.jpeg,.png,.gif,.webp',
      modality: 'image',
      color: '#4ECDC4',
    },
    {
      label: 'Audio',
      icon: <HiOutlineMicrophone size={22} />,
      ref: audioRef,
      accept: '.wav,.mp3,.ogg,.flac,.m4a',
      modality: 'audio',
      color: '#FFE66D',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1
          className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Query Your
          <br />
          <span style={{ color: 'var(--color-accent)' }}>Local Knowledge</span>
        </h1>
        <p
          className="text-lg max-w-md mx-auto"
          style={{ color: 'var(--color-text-dim)' }}
        >
          Upload documents, images, or audio — then ask anything. 100% offline.
        </p>
      </motion.div>

      {/* Input Box */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-2xl mb-8"
      >
        <div className="relative flex items-center" style={{ border: '2.5px solid var(--color-border)' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 px-5 py-4 text-lg bg-transparent outline-none"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-family-body)',
              border: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center justify-center w-14 h-14 cursor-pointer"
            style={{
              background: query.trim() ? 'var(--color-accent)' : 'var(--color-border-dim)',
              border: 'none',
              borderLeft: '2.5px solid var(--color-border)',
              transition: 'background 0.15s',
            }}
          >
            <HiPaperAirplane size={20} color="#0A0A0A" />
          </button>
        </div>
      </motion.form>

      {/* Upload Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex gap-4 flex-wrap justify-center mb-6"
      >
        {uploadButtons.map((btn) => (
          <div key={btn.modality}>
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
              className="neo-btn"
              style={{
                borderColor: btn.color,
                minWidth: '140px',
                justifyContent: 'center',
              }}
            >
              {btn.icon}
              <span>Upload {btn.label}</span>
            </button>
          </div>
        ))}
      </motion.div>

      {/* Ingest Progress */}
      {ingestProgress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-5 py-3 text-sm font-mono"
          style={{
            border: '2px solid var(--color-accent)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-family-mono)',
            background: 'var(--color-accent-glow)',
          }}
        >
          {ingestProgress}
        </motion.div>
      )}

      {/* Keyboard hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-xs"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}
      >
        Upload files to build your knowledge base, then ask questions
      </motion.p>
    </div>
  );
}
