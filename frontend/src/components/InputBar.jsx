/**
 * InputBar — Fixed bottom input with text field and file upload buttons.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
    { ref: pdfRef, accept: '.pdf', modality: 'pdf', icon: <HiOutlineDocumentText size={16} />, color: '#FF6B6B' },
    { ref: imgRef, accept: '.jpg,.jpeg,.png,.gif,.webp', modality: 'image', icon: <HiOutlinePhotograph size={16} />, color: '#4ECDC4' },
    { ref: audioRef, accept: '.wav,.mp3,.ogg,.flac,.m4a', modality: 'audio', icon: <HiOutlineMicrophone size={16} />, color: '#FFE66D' },
  ];

  return (
    <div className="shrink-0" style={{ borderTop: '2.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
      {/* Ingest progress */}
      {ingestProgress && (
        <div className="px-4 py-2 text-xs" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-family-mono)', background: 'var(--color-accent-glow)', borderBottom: '1px solid var(--color-accent)' }}>
          {ingestProgress}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-0">
        {/* Upload buttons */}
        <div className="flex items-center pl-2 gap-1">
          {uploadBtns.map((btn) => (
            <div key={btn.modality}>
              <input ref={btn.ref} type="file" accept={btn.accept} className="hidden"
                onChange={(e) => handleFile(e.target.files[0], btn.modality)} />
              <button type="button" onClick={() => btn.ref.current?.click()} disabled={isLoading}
                className="p-2 cursor-pointer" title={`Upload ${btn.modality}`}
                style={{ background: 'transparent', border: 'none', color: btn.color, opacity: isLoading ? 0.4 : 1, transition: 'opacity 0.15s' }}>
                {btn.icon}
              </button>
            </div>
          ))}
        </div>

        {/* Text input */}
        <input
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={isLoading ? 'Processing...' : 'Ask a question...'} disabled={isLoading}
          className="flex-1 px-4 py-4 text-sm bg-transparent outline-none"
          style={{ color: 'var(--color-text)', border: 'none', fontFamily: 'var(--font-family-body)' }}
        />

        {/* Send */}
        <button type="submit" disabled={!text.trim() || isLoading}
          className="flex items-center justify-center w-12 h-12 mr-2 cursor-pointer"
          style={{ background: text.trim() && !isLoading ? 'var(--color-accent)' : 'var(--color-border-dim)', border: '2px solid var(--color-border)', transition: 'background 0.15s' }}>
          <HiPaperAirplane size={16} color="#0A0A0A" />
        </button>
      </form>
    </div>
  );
}
