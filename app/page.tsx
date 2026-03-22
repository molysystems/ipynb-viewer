'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseNotebook, type ParsedNotebook } from '@/lib/ipynb-parser';
import NotebookViewer from '@/components/NotebookViewer';

type DarkMode = 'system' | 'dark' | 'light';

function getSystemDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function Home() {
  const [notebook, setNotebook] = useState<ParsedNotebook | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [darkPref, setDarkPref] = useState<DarkMode>('system');
  const [systemDark, setSystemDark] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSystemDark(getSystemDark());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = darkPref === 'dark' || (darkPref === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Auto-trigger file picker on first load
  useEffect(() => {
    if (!notebook) {
      fileInputRef.current?.click();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleDark() {
    setDarkPref((prev) => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }

  const loadFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name.replace(/\.ipynb$/i, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setNotebook(parseNotebook(json));
      } catch {
        setError('Failed to load file. Please make sure it is a valid .ipynb file.');
      }
    };
    reader.readAsText(file);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.ipynb')) loadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".ipynb"
      className="sr-only"
      onChange={handleFileChange}
    />
  );

  if (notebook) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0e1a] text-gray-900 dark:text-[#e0e8f8]">
        {fileInput}
        {/* Fixed header — always visible, GPU-composited layer */}
        <header
          className="fixed top-0 left-0 right-0 z-20 flex items-center gap-3 px-3 py-2.5 border-b border-gray-200 dark:border-[#1e2a4a] bg-white dark:bg-[#0f1628]"
          style={{ transform: 'translateZ(0)' }}
        >
          <button
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-[#162040] text-gray-700 dark:text-[#e0e8f8] hover:bg-gray-200 dark:hover:bg-[#1e2a4a] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            📂 Open
          </button>
          <span className="text-sm font-medium truncate flex-1 text-gray-600 dark:text-[#8896b0]">
            {fileName || 'Read.ipynb'}
          </span>
          <button
            className="px-2 py-1.5 rounded-lg text-base hover:bg-gray-100 dark:hover:bg-[#162040] transition-colors"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Spacer to push content below fixed header */}
        <div className="pt-[52px]">
          <NotebookViewer notebook={notebook} isDark={isDark} onToggleDark={toggleDark} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-[#0a0e1a] flex flex-col items-center justify-center p-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {fileInput}
      <div className="text-center">
        <div className="text-5xl mb-4">📓</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e0e8f8] mb-1">
          Read.ipynb
        </h1>
        <p className="text-sm text-gray-400 dark:text-[#8896b0] mb-6">
          Jupyter Notebook viewer
        </p>
        <button
          className="px-6 py-3 rounded-xl bg-[#4d9fff] hover:bg-[#3d8fee] text-white font-medium text-sm transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          📂 Open .ipynb file
        </button>
        {error && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <p className="mt-6 text-xs text-gray-300 dark:text-[#8896b0]/60">
          Files are processed locally in your browser
        </p>
      </div>
    </div>
  );
}
