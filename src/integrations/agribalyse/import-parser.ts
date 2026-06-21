import { detectColumnMapping } from './column-mapper';
import type { AgribalyseRawRow } from './types';

function detectDelimiter(line: string) {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

function parseCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values.map((value) => value.trim());
}

export async function parseAgribalyseCsv(buffer: Buffer): Promise<AgribalyseRawRow[]> {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

export async function parseAgribalyseXlsx(): Promise<AgribalyseRawRow[]> {
  throw new Error('XLSX import requires adding a spreadsheet parser dependency. Use CSV for MVP.');
}

export function detectAgribalyseColumns(rows: AgribalyseRawRow[]) {
  const headers = Object.keys(rows[0] ?? {});
  return detectColumnMapping(headers);
}
