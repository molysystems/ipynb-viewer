'use client';

import { useEffect, useRef, useState } from 'react';
import type { CellOutput } from '@/lib/ipynb-parser';

interface Props {
  output: CellOutput;
  onImageClick?: (src: string) => void;
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

export default function OutputRenderer({ output, onImageClick }: Props) {
  const htmlRef = useRef<HTMLDivElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    if (output.html && typeof window !== 'undefined') {
      import('dompurify').then((mod) => {
        const DOMPurify = mod.default;
        setSanitizedHtml(DOMPurify.sanitize(output.html!));
      });
    }
  }, [output.html]);

  if (output.outputType === 'error') {
    const lines = output.traceback ?? [];
    return (
      <div className="mt-1 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 font-mono text-sm overflow-x-auto">
        <div className="text-red-700 dark:text-red-400 font-semibold">
          {output.errorName}: {output.errorValue}
        </div>
        {lines.length > 0 && (
          <pre className="mt-1 text-red-600 dark:text-red-300 text-xs whitespace-pre-wrap">
            {lines.map(stripAnsi).join('\n')}
          </pre>
        )}
      </div>
    );
  }

  if (output.imageBase64) {
    const src = `data:image/png;base64,${output.imageBase64}`;
    return (
      <div className="mt-1 dark:bg-white dark:rounded p-1 inline-block max-w-full">
        <img
          src={src}
          alt="notebook output"
          className="max-w-full cursor-pointer"
          onClick={() => onImageClick?.(src)}
        />
      </div>
    );
  }

  if (output.imageSvg) {
    return (
      <div
        className="mt-1 dark:bg-white dark:rounded p-1 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: output.imageSvg }}
      />
    );
  }

  if (output.html) {
    return (
      <div
        ref={htmlRef}
        className="mt-1 overflow-x-auto prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  if (output.text) {
    return (
      <pre className="mt-1 text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 overflow-x-auto">
        {output.text}
      </pre>
    );
  }

  return null;
}
