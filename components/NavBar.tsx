'use client';

import { useState } from 'react';
import type { NotebookCell } from '@/lib/ipynb-parser';
import type { TableMode } from './MarkdownCell';

export type FilterMode = 'all' | 'code' | 'markdown' | 'output';

interface Props {
  cells: NotebookCell[];
  currentIndex: number;
  filter: FilterMode;
  tableMode: TableMode;
  onNavigate: (index: number) => void;
  onFilterChange: (f: FilterMode) => void;
  onTableModeChange: (m: TableMode) => void;
  onToggleDark: () => void;
  isDark: boolean;
}

export default function NavBar({
  cells,
  currentIndex,
  filter,
  tableMode,
  onNavigate,
  onFilterChange,
  onTableModeChange,
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

  const chipBase = 'px-2 py-1 rounded-full text-xs font-medium transition-colors';
  const chipActive = 'bg-[#4d9fff] text-white';
  const chipInactive = 'bg-gray-100 dark:bg-[#162040] text-gray-600 dark:text-[#8896b0]';

  return (
    <>
      {/* TOC Overlay */}
      {tocOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setTocOpen(false)}
        >
          <div
            className="absolute bottom-20 left-2 right-2 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-[#0f1628] shadow-2xl border border-gray-200 dark:border-[#1e2a4a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-[#0f1628] px-4 py-2 border-b border-gray-200 dark:border-[#1e2a4a] text-sm font-semibold text-gray-700 dark:text-[#e0e8f8]">
              Cells ({cells.length})
            </div>
            {filteredIndices.map(({ cell, index }) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 dark:border-[#1e2a4a] hover:bg-gray-50 dark:hover:bg-[#162040] ${
                  index === currentIndex
                    ? 'bg-blue-50 dark:bg-[#162040] text-[#4d9fff]'
                    : 'text-gray-700 dark:text-[#e0e8f8]'
                }`}
                onClick={() => { onNavigate(index); setTocOpen(false); }}
              >
                <span className="font-mono text-xs text-gray-400 dark:text-[#8896b0] mr-2">[{index + 1}]</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${
                  cell.cellType === 'code'
                    ? 'bg-blue-100 dark:bg-[#162040] text-blue-700 dark:text-[#4d9fff]'
                    : cell.cellType === 'markdown'
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-[#162040] text-gray-600 dark:text-[#8896b0]'
                }`}>
                  {cell.cellType}
                </span>
                <span className="truncate">{cell.source.slice(0, 60)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NavBar — rendered as normal flex item, no fixed positioning needed */}
      <nav className="bg-white dark:bg-[#0f1628] border-t border-gray-200 dark:border-[#1e2a4a] px-3 py-2 safe-area-bottom shrink-0">
        <div className="flex items-center gap-1.5 max-w-3xl mx-auto">
          {/* Filter chips */}
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                className={`${chipBase} ${filter === f.value ? chipActive : chipInactive}`}
                onClick={() => onFilterChange(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table mode toggle */}
          <button
            className={`${chipBase} ${chipInactive} border border-gray-200 dark:border-[#1e2a4a]`}
            onClick={() => onTableModeChange(tableMode === 'wrap' ? 'scroll' : 'wrap')}
            title={tableMode === 'wrap' ? 'Switch to table scroll mode' : 'Switch to table wrap mode'}
          >
            {tableMode === 'wrap' ? '⇔' : '↵'}
          </button>

          <div className="flex-1" />

          {/* Navigation */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#162040] disabled:opacity-30 text-gray-700 dark:text-[#e0e8f8]"
            onClick={() => navigate(-1)}
            disabled={currentFiltered <= 0}
            aria-label="Previous cell"
          >
            ▲
          </button>

          <button
            className="px-2 py-1 text-xs font-mono text-gray-500 dark:text-[#8896b0] hover:bg-gray-100 dark:hover:bg-[#162040] rounded"
            onClick={() => setTocOpen(!tocOpen)}
          >
            {currentIndex + 1}/{cells.length}
          </button>

          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#162040] disabled:opacity-30 text-gray-700 dark:text-[#e0e8f8]"
            onClick={() => navigate(1)}
            disabled={currentFiltered >= filteredIndices.length - 1}
            aria-label="Next cell"
          >
            ▼
          </button>

          {/* Dark mode toggle */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#162040] text-base"
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
