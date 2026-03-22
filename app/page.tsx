'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseNotebook, type ParsedNotebook } from '@/lib/ipynb-parser';
import NotebookViewer from '@/components/NotebookViewer';

type DarkMode = 'system' | 'dark' | 'light';

function getSystemDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function Home() {
  const [notebook, setNotebook] = useState<ParsedNotebook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkPref, setDarkPref] = useState<DarkMode>('system');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setSystemDark(getSystemDark());
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark =
    darkPref === 'dark' || (darkPref === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  function toggleDark() {
    setDarkPref((prev) => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }

  const loadFile = useCallback((file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setNotebook(parseNotebook(json));
      } catch {
        setError('ファイルの読み込みに失敗しました。有効な .ipynb ファイルか確認してください。');
      }
    };
    reader.readAsText(file);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.ipynb')) loadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  if (notebook) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-3">
          <button
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => setNotebook(null)}
          >
            ← 戻る
          </button>
          <span className="text-sm font-medium truncate flex-1 text-gray-700 dark:text-gray-300">
            Jupyter Notebook
          </span>
        </header>

        <NotebookViewer
          notebook={notebook}
          isDark={isDark}
          onToggleDark={toggleDark}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📓</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notebook Viewer
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            .ipynb ファイルをモバイルで閲覧
          </p>
        </div>

        {/* Drop zone */}
        <label
          className="block cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-900">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              ファイルを選択
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              または ここにドラッグ&ドロップ
            </p>
            <div className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              .ipynb を開く
            </div>
          </div>
          <input
            type="file"
            accept=".ipynb"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          ファイルはブラウザ内のみで処理されます
        </p>
      </div>
    </div>
  );
}
