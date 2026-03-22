'use client';

import { useState } from 'react';
import type { NotebookCell } from '@/lib/ipynb-parser';

export type FilterMode = 'all' | 'code' | 'markdown' | 'output';

interface Props {
  cells: NotebookCell[];
  currentIndex: number;
  filter: FilterMode;
  onNavigate: (index: number) => void;
  onFilterChange: (f: FilterMode) => void;
  onToggleDark: () => void;
  isDark: boolean;
}

export default function NavBar({
  cells,
  currentIndex,
  filter,
  onNavigate,
  onFilterChange,
  onToggleDark,
  isDark,
}: Props) {
  const [tocOpen, setTocOpen] = useState(false);

  const filteredIndices = cells
    .map((c, i) => ({ cell: c, index: i }))
    .filter(({ cell }) => {
      if (filter === 'all') return true;
      if (filter === 'code') return cell.cellType === 'code';
      if (filter === 'markdown') return cell.cellType === 'markdown';
      if (filter === 'output') return cell.cellType === 'code' && cell.outputs.length > 0;
      return true;
    });

  const currentFiltered = filteredIndices.findIndex((f) => f.index === currentIndex);

  function navigate(delta: number) {
    const next = currentFiltered + delta;
    if (next >= 0 && next < filteredIndices.length) {
      onNavigate(filteredIndices[next].index);
    }
  }

  const filters: { label: string; value: FilterMode }[] = [
    { label: 'All', value: 'all' },
    { label: 'Code', value: 'code' },
    { label: 'MD', value: 'markdown' },
    { label: 'Out', value: 'output' },
  ];

  return (
    <>
      {/* TOC Overlay */}
      {tocOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setTocOpen(false)}
        >
          <div
            className="absolute bottom-20 left-2 right-2 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Cells ({cells.length})
            </div>
            {filteredIndices.map(({ cell, index }) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  index === currentIndex ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => {
                  onNavigate(index);
                  setTocOpen(false);
                }}
              >
                <span className="font-mono text-xs text-gray-400 mr-2">[{index + 1}]</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${
                  cell.cellType === 'code'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : cell.cellType === 'markdown'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {cell.cellType}
                </span>
                <span className="truncate">{cell.source.slice(0, 60)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NavBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-3 py-2 safe-area-bottom">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {/* Filter chips */}
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => onFilterChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Navigation */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
            onClick={() => navigate(-1)}
            disabled={currentFiltered <= 0}
            aria-label="Previous cell"
          >
            ▲
          </button>

          <button
            className="px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            onClick={() => setTocOpen(!tocOpen)}
          >
            {currentIndex + 1}/{cells.length}
          </button>

          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
            onClick={() => navigate(1)}
            disabled={currentFiltered >= filteredIndices.length - 1}
            aria-label="Next cell"
          >
            ▼
          </button>

          {/* Dark mode toggle */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </>
  );
}
