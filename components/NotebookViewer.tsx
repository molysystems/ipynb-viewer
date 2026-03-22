'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ParsedNotebook } from '@/lib/ipynb-parser';
import CodeCell from './CodeCell';
import MarkdownCell, { type TableMode } from './MarkdownCell';
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
  const [tableMode, setTableMode] = useState<TableMode>('wrap');
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll anchor: capture before state change, restore after layout
  const scrollAnchorRef = useRef<{ element: Element; top: number } | null>(null);

  function handleTableModeChange(mode: TableMode) {
    // Capture an anchor element just below the fixed header
    const headerHeight = document.querySelector('header')?.offsetHeight ?? 52;
    const anchor = document.elementFromPoint(window.innerWidth / 2, headerHeight + 4);
    if (anchor && anchor !== document.documentElement && anchor !== document.body) {
      scrollAnchorRef.current = {
        element: anchor,
        top: anchor.getBoundingClientRect().top,
      };
    }
    setTableMode(mode);
  }

  // Runs synchronously after DOM mutations, before paint
  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current;
    if (!anchor) return;
    scrollAnchorRef.current = null;

    const newTop = anchor.element.getBoundingClientRect().top;
    const delta = newTop - anchor.top;
    if (Math.abs(delta) > 1) {
      window.scrollBy({ top: delta, behavior: 'instant' });
    }
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
          if (entry.isIntersecting) visible.add(i);
          else visible.delete(i);
          if (visible.size > 0) setCurrentIndex(Math.min(...visible));
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
      {/* Kernel info */}
      {notebook.metadata.kernelName && (
        <div className="px-4 py-1.5 text-xs text-gray-400 dark:text-[#8896b0] border-b border-gray-100 dark:border-[#1e2a4a]">
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
              {cell.cellType === 'markdown' && (
                <MarkdownCell cell={cell} tableMode={tableMode} />
              )}
              {cell.cellType === 'raw' && <RawCell cell={cell} />}
            </div>
          );
        })}
      </div>

      <NavBar
        cells={notebook.cells}
        currentIndex={currentIndex}
        filter={filter}
        tableMode={tableMode}
        onNavigate={navigateTo}
        onFilterChange={setFilter}
        onTableModeChange={handleTableModeChange}
        onToggleDark={onToggleDark}
        isDark={isDark}
      />

      {modalSrc && (
        <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />
      )}
    </div>
  );
}
