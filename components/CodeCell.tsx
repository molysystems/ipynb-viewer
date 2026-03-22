'use client';

import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import type { NotebookCell } from '@/lib/ipynb-parser';
import OutputRenderer from './OutputRenderer';

interface Props {
  cell: NotebookCell;
  language?: string;
  onImageClick?: (src: string) => void;
}

export default function CodeCell({ cell, language, onImageClick }: Props) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && cell.source) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [cell.source, language]);

  const lang = language ?? 'python';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
        <span className="text-blue-600 dark:text-blue-400">
          In [{cell.executionCount ?? ' '}]:
        </span>
      </div>

      {/* Source */}
      <div className="overflow-x-auto">
        <pre className="m-0 rounded-none text-sm leading-relaxed">
          <code ref={codeRef} className={`language-${lang}`}>
            {cell.source}
          </code>
        </pre>
      </div>

      {/* Outputs */}
      {cell.outputs.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-1">
            Out [{cell.executionCount ?? ' '}]:
          </div>
          {cell.outputs.map((output, i) => (
            <OutputRenderer
              key={i}
              output={output}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
