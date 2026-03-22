import type { NotebookCell } from '@/lib/ipynb-parser';

interface Props {
  cell: NotebookCell;
}

export default function RawCell({ cell }: Props) {
  if (!cell.source) return null;
  return (
    <pre className="text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto px-1">
      {cell.source}
    </pre>
  );
}
