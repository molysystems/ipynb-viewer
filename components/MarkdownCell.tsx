'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import type { NotebookCell } from '@/lib/ipynb-parser';

export type TableMode = 'wrap' | 'scroll';

interface Props {
  cell: NotebookCell;
  tableMode: TableMode;
}

export default function MarkdownCell({ cell, tableMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll('pre code').forEach((block) => {
        const el = block as HTMLElement;
        el.removeAttribute('data-highlighted');
        hljs.highlightElement(el);
      });
    }
  }, [cell.source]);

  return (
    <div
      ref={containerRef}
      className={`markdown-body prose prose-base dark:prose-invert max-w-none px-1
        prose-headings:font-semibold
        prose-code:before:content-none prose-code:after:content-none
        prose-code:bg-gray-100 prose-code:dark:bg-[#162040]
        prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-code:text-sm prose-code:font-mono
        prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:overflow-x-auto
        ${tableMode === 'scroll' ? 'table-scroll-mode' : 'table-wrap-mode'}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cell.source}
      </ReactMarkdown>
    </div>
  );
}
