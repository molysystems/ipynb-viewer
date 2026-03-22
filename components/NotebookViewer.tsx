'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ParsedNotebook } from '@/lib/ipynb-parser';
import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import RawCell from './RawCell';
import ImageModal from './ImageModal';
import NavBar, { type FilterMode } from './NavBar';

interface Props {
  notebook: ParsedNotebook;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function NotebookViewer({ notebook, isDark, onToggleDark }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredIndices = notebook.cells
    .map((c, i) => ({ cell: c, index: i }))
    .filter(({ cell }) => {
      if (filter === 'all') return true;
      if (filter === 'code') return cell.cellType === 'code';
      if (filter === 'markdown') return cell.cellType === 'markdown';
      if (filter === 'output') return cell.cellType === 'code' && cell.outputs.length > 0;
      return true;
    });

  const navigateTo = useCallback((index: number) => {
    setCurrentIndex(index);
    cellRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Track visible cell via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visible = new Set<number>();

    cellRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visible.add(i);
          } else {
            visible.delete(i);
          }
          if (visible.size > 0) {
            setCurrentIndex(Math.min(...visible));
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [notebook.cells]);

  return (
    <div className="pb-20">
      {/* Notebook header */}
      {notebook.metadata.kernelName && (
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
          Kernel: {notebook.metadata.kernelName}
          {notebook.metadata.language && ` · ${notebook.metadata.language}`}
        </div>
      )}

      {/* Cells */}
      <div className="px-3 py-3 space-y-3">
        {notebook.cells.map((cell, index) => {
          const isFiltered =
            filter === 'all' ||
            (filter === 'code' && cell.cellType === 'code') ||
            (filter === 'markdown' && cell.cellType === 'markdown') ||
            (filter === 'output' && cell.cellType === 'code' && cell.outputs.length > 0);

          if (!isFiltered) return null;

          return (
            <div
              key={cell.id}
              ref={(el) => { cellRefs.current[index] = el; }}
              className="scroll-mt-4"
            >
              {cell.cellType === 'code' && (
                <CodeCell
                  cell={cell}
                  language={notebook.metadata.language}
                  onImageClick={setModalSrc}
                />
              )}
              {cell.cellType === 'markdown' && <MarkdownCell cell={cell} />}
              {cell.cellType === 'raw' && <RawCell cell={cell} />}
            </div>
          );
        })}
      </div>

      <NavBar
        cells={notebook.cells}
        currentIndex={currentIndex}
        filter={filter}
        onNavigate={navigateTo}
        onFilterChange={setFilter}
        onToggleDark={onToggleDark}
        isDark={isDark}
      />

      {modalSrc && (
        <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />
      )}
    </div>
  );
}
