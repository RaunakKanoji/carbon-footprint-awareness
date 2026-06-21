import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';
import { DEFAULT_AGRIBALYSE_VERSION } from '@/src/integrations/agribalyse/constants';
import { detectColumnMapping, mapRawRowToNormalizedFactor, validateColumnMapping } from '@/src/integrations/agribalyse/column-mapper';
import { parseAgribalyseCsv } from '@/src/integrations/agribalyse/import-parser';
import type { AgribalyseColumnMapping, AgribalyseRawRow } from '@/src/integrations/agribalyse/types';

function jobDelegate() {
  if (!prisma.agribalyseImportJob) {
    throw new Error('Agribalyse import table is unavailable. Apply the Agribalyse migration and restart the dev server.');
  }
  return prisma.agribalyseImportJob;
}

function factorDelegate() {
  if (!prisma.agribalyseFoodFactor) {
    throw new Error('Agribalyse factor table is unavailable. Apply the Agribalyse migration and restart the dev server.');
  }
  return prisma.agribalyseFoodFactor;
}

export async function createAgribalyseImportPreview(input: {
  file: File | Buffer;
  filename: string;
  version?: string;
}) {
  const buffer = Buffer.isBuffer(input.file)
    ? input.file
    : Buffer.from(await input.file.arrayBuffer());
  const extension = input.filename.toLowerCase().split('.').pop();
  if (extension !== 'csv') throw new Error('Only CSV import is supported for MVP.');

  const rows = await parseAgribalyseCsv(buffer);
  const headers = Object.keys(rows[0] ?? {});
  const detectedMapping = detectColumnMapping(headers);
  const validation = validateColumnMapping(detectedMapping);
  const previewRows = rows.slice(0, 10);

  const job = await jobDelegate().create({
    data: {
      filename: input.filename,
      version: input.version ?? DEFAULT_AGRIBALYSE_VERSION,
      status: 'PREVIEWED',
      totalRows: rows.length,
      columnMapping: detectedMapping as Prisma.InputJsonValue,
      previewRows: rows as Prisma.InputJsonValue,
      errorLog: { previewRows, missingRequiredColumns: validation.missing } as Prisma.InputJsonValue,
    },
  });

  return {
    jobId: job.id,
    headers,
    detectedMapping,
    previewRows,
    totalRows: rows.length,
    missingRequiredColumns: validation.missing,
  };
}

export async function confirmAgribalyseImport(input: {
  jobId: string;
  columnMapping: AgribalyseColumnMapping;
  version: string;
  replaceExistingVersion?: boolean;
}) {
  const validation = validateColumnMapping(input.columnMapping);
  if (!validation.valid) {
    throw new Error(`Missing required columns: ${validation.missing.join(', ')}`);
  }

  const job = await jobDelegate().findUnique({ where: { id: input.jobId } });
  if (!job) throw new Error('Import job not found');

  const rows = (job.previewRows as AgribalyseRawRow[] | null) ?? [];
  let validRows = 0;
  let invalidRows = 0;
  let importedRows = 0;

  await jobDelegate().update({ where: { id: input.jobId }, data: { status: 'IMPORTING' } });

  if (input.replaceExistingVersion) {
    await factorDelegate().updateMany({
      where: { version: input.version, source: 'AGRIBALYSE' },
      data: { isActive: false },
    });
  }

  for (const row of rows) {
    const normalized = mapRawRowToNormalizedFactor({
      row,
      mapping: input.columnMapping,
      version: input.version,
    });
    if (!normalized) {
      invalidRows += 1;
      continue;
    }
    validRows += 1;
    await factorDelegate().create({
      data: {
        ...normalized,
        rawRow: normalized.rawRow as Prisma.InputJsonValue,
      },
    });
    importedRows += 1;
  }

  await jobDelegate().update({
    where: { id: input.jobId },
    data: {
      status: 'COMPLETED',
      validRows,
      invalidRows,
      importedRows,
      columnMapping: input.columnMapping as Prisma.InputJsonValue,
      version: input.version,
    },
  });

  return { totalRows: rows.length, validRows, invalidRows, importedRows, version: input.version };
}

export async function getAgribalyseImportJob(jobId: string) {
  return jobDelegate().findUnique({ where: { id: jobId } });
}

export async function listAgribalyseImportJobs() {
  return jobDelegate().findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
}
