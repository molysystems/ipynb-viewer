export interface CellOutput {
  outputType: 'stream' | 'execute_result' | 'display_data' | 'error';
  text?: string;
  html?: string;
  imageBase64?: string;
  imageSvg?: string;
  errorName?: string;
  errorValue?: string;
  traceback?: string[];
}

export interface NotebookCell {
  id: string;
  cellType: 'code' | 'markdown' | 'raw';
  source: string;
  outputs: CellOutput[];
  executionCount: number | null;
}

export interface NotebookMetadata {
  kernelName?: string;
  language?: string;
}

export interface ParsedNotebook {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
}

function joinSource(source: string | string[]): string {
  if (Array.isArray(source)) return source.join('');
  return source ?? '';
}

function parseOutput(raw: Record<string, unknown>): CellOutput {
  const outputType = raw.output_type as CellOutput['outputType'];

  if (outputType === 'stream') {
    return {
      outputType: 'stream',
      text: joinSource(raw.text as string | string[]),
    };
  }

  if (outputType === 'error') {
    return {
      outputType: 'error',
      errorName: raw.ename as string,
      errorValue: raw.evalue as string,
      traceback: raw.traceback as string[],
    };
  }

  // execute_result or display_data
  const data = (raw.data ?? {}) as Record<string, unknown>;
  const output: CellOutput = { outputType };

  if (data['image/png']) {
    output.imageBase64 = data['image/png'] as string;
  } else if (data['image/svg+xml']) {
    output.imageSvg = joinSource(data['image/svg+xml'] as string | string[]);
  } else if (data['text/html']) {
    output.html = joinSource(data['text/html'] as string | string[]);
  } else if (data['text/plain']) {
    output.text = joinSource(data['text/plain'] as string | string[]);
  }

  return output;
}

export function parseNotebook(json: unknown): ParsedNotebook {
  const nb = json as Record<string, unknown>;

  if (!nb || typeof nb !== 'object') {
    throw new Error('Invalid notebook format');
  }

  const rawCells = (nb.cells as Record<string, unknown>[]) ?? [];

  const cells: NotebookCell[] = rawCells.map((raw, index) => {
    const cellType = raw.cell_type as NotebookCell['cellType'];
    const rawOutputs = (raw.outputs as Record<string, unknown>[]) ?? [];

    return {
      id: (raw.id as string) ?? String(index),
      cellType,
      source: joinSource(raw.source as string | string[]),
      outputs: rawOutputs.map(parseOutput),
      executionCount: (raw.execution_count as number | null) ?? null,
    };
  });

  const meta = (nb.metadata as Record<string, unknown>) ?? {};
  const kernelspec = (meta.kernelspec as Record<string, unknown>) ?? {};
  const langInfo = (meta.language_info as Record<string, unknown>) ?? {};

  return {
    cells,
    metadata: {
      kernelName: (kernelspec.display_name as string) ?? (kernelspec.name as string),
      language: (langInfo.name as string) ?? (kernelspec.language as string),
    },
    nbformat: (nb.nbformat as number) ?? 4,
  };
}
