'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { ParsedNotebook } from '@/lib/ipynb-parser';
import type { FilterMode } from './NavBar';
import type { TableMode } from './MarkdownCell';
import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import RawCell from './RawCell';
import ImageModal from './ImageModal';

interface Props {
  notebook: ParsedNotebook;
  isDark: boolean;
  filter: FilterMode;
  tableMode: TableMode;
  currentIndex: number;
  onCurrentIndexChange: (i: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export interface NotebookViewerHandle {
  navigateTo: (index: number) => void;
  captureScrollAnchor: () => void;
}

const NotebookViewer = forwardRef<NotebookViewerHandle, Props>(function NotebookViewer(
  { notebook, isDark, filter, tableMode, currentIndex, onCurrentIndexChange, scrollContainerRef },
  ref,
) {
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollAnchorRef = useRef<{ element: Element; top: number } | null>(null);

  useImperativeHandle(ref, () => ({
    navigateTo(index: number) {
      onCurrentIndexChange(index);
      cellRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    captureScrollAnchor() {
      const containerTop = scrollContainerRef.current?.getBoundingClientRect().top ?? 0;
      for (const el of cellRefs.current) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > containerTop) {
          scrollAnchorRef.current = { element: el, top: rect.top };
          break;
        }
      }
    },
  }));

  // Correct scroll position after tableMode change, before paint
  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current;
    if (!anchor) return;
    scrollAnchorRef.current = null;

    const newTop = anchor.element.getBoundingClientRect().top;
    const delta = newTop - anchor.top;
    if (Math.abs(delta) > 1) {
      scrollContainerRef.current?.scrollBy({ top: delta, behavior: 'instant' });
    }
  });

  const navigateTo = useCallback((index: number) => {
    onCurrentIndexChange(index);
    cellRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [onCurrentIndexChange]);

  // Track visible cell via IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current;
    const observers: IntersectionObserver[] = [];
    const visible = new Set<number>();

    cellRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.add(i);
          else visible.delete(i);
          if (visible.size > 0) onCurrentIndexChange(Math.min(...visible));
        },
        { root: container, threshold: 0.3 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [notebook.cells, scrollContainerRef, onCurrentIndexChange]);

  return (
    <div>
      {notebook.metadata.kernelName && (
        <div className="px-4 py-1.5 text-xs text-gray-400 dark:text-[#8896b0] border-b border-gray-100 dark:border-[#1e2a4a]">
          Kernel: {notebook.metadata.kernelName}
          {notebook.metadata.language && ` · ${notebook.metadata.language}`}
        </div>
      )}

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

      {modalSrc && (
        <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />
      )}
    </div>
  );
});

export default NotebookViewer;
