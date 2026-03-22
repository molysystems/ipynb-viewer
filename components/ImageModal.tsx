'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  onClose: () => void;
}

export default function ImageModal({ src, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleWheelZoom(e: React.WheelEvent) {
    e.preventDefault();
    setScale((s) => Math.min(10, Math.max(0.5, s - e.deltaY * 0.001)));
  }

  function handleReset() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Controls */}
      <div
        className="absolute top-4 right-4 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="rounded bg-white/20 px-3 py-1.5 text-white text-sm hover:bg-white/30"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="rounded bg-white/20 px-3 py-1.5 text-white text-sm hover:bg-white/30"
          onClick={onClose}
        >
          Close ✕
        </button>
      </div>

      <div
        className="overflow-hidden"
        onWheel={handleWheelZoom}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imgRef}
          src={src}
          alt="full screen"
          className="max-h-screen max-w-screen object-contain transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
          }}
        />
      </div>
    </div>
  );
}
