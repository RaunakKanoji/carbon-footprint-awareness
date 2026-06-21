import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import fs from 'fs';
import { Pool } from 'pg';
import { stdin as input, stdout as output } from 'process';
import readline from 'readline/promises';

import { Prisma, PrismaClient } from '../src/generated/prisma';
import {
  detectColumnMapping,
  mapRawRowToNormalizedFactor,
  parseLocalizedNumber,
  validateColumnMapping,
} from '../src/integrations/agribalyse/column-mapper';
import { DEFAULT_AGRIBALYSE_VERSION } from '../src/integrations/agribalyse/constants';
import { parseAgribalyseCsv } from '../src/integrations/agribalyse/import-parser';
import type { AgribalyseRawRow } from '../src/integrations/agribalyse/types';

/**
 * Climate change stage columns in the detail-par-etape CSV.
 * When --sum-climate-stages is passed, these are summed to produce the aggregate value.
 */
const CLIMATE_STAGE_COLUMNS = [
  'Changement climatique - Agriculture',
  'Changement climatique - Transformation',
  'Changement climatique - Emballage',
  'Changement climatique - Transport',
  'Changement climatique - Supermarché et distribution',
  'Changement climatique - Consommation',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith('--'));
  const flags = Object.fromEntries(
    args
      .filter((arg) => arg.startsWith('--'))
      .map((arg) => {
        const [key, value] = arg.slice(2).split('=');
        return [key, value ?? true];
      }),
  );
  return { file, flags };
}

/**
 * For detail-par-etape CSVs: synthesize a "Changement climatique" column
 * by summing the individual stage columns.
 */
function synthesizeClimateColumn(rows: AgribalyseRawRow[]): AgribalyseRawRow[] {
  return rows.map((row) => {
    let total = 0;
    let allValid = true;

    for (const col of CLIMATE_STAGE_COLUMNS) {
      const val = parseLocalizedNumber(row[col]);
      if (val === null) {
        allValid = false;
        break;
      }
      total += val;
    }

    return {
      ...row,
      'Changement climatique': allValid ? String(total) : '',
    };
  });
}

async function main() {
  const { file, flags } = parseArgs();
  if (!file)
    throw new Error(
      'Usage: npx tsx scripts/import-agribalyse.ts ./data/agribalyse/agribalyse.csv --version=3.1 --yes\n' +
        'Flags: --version=X  --yes  --replace  --dry-run  --sum-climate-stages  --source-variant=synthese|etape|ingredient',
    );
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not defined');

  const version = String(flags.version ?? DEFAULT_AGRIBALYSE_VERSION);
  const sourceVariant = String(flags['source-variant'] ?? 'synthese');
  const buffer = fs.readFileSync(file);
  let rows = await parseAgribalyseCsv(buffer);

  // For detail-par-etape: sum individual climate stage columns into an aggregate
  if (flags['sum-climate-stages']) {
    console.log('Summing climate stage columns into aggregate "Changement climatique"...');
    rows = synthesizeClimateColumn(rows);
  }

  const headers = Object.keys(rows[0] ?? {});
  const mapping = detectColumnMapping(headers);
  const validation = validateColumnMapping(mapping);

  console.log(
    'Detected headers:',
    headers.slice(0, 20),
    headers.length > 20 ? `... (${headers.length} total)` : '',
  );
  console.log('Detected mapping:', mapping);
  console.log('Total rows:', rows.length);
  console.log('Source variant:', sourceVariant);

  if (!validation.valid) {
    throw new Error(`Missing required mapping columns: ${validation.missing.join(', ')}`);
  }

  let validRows = 0;
  let invalidRows = 0;
  const normalized = rows.flatMap((row) => {
    const factor = mapRawRowToNormalizedFactor({
      row,
      mapping: mapping as typeof mapping & { name: string; climateChangeKgCo2ePerKg: string },
      version,
    });
    if (!factor) {
      invalidRows += 1;
      return [];
    }
    validRows += 1;
    return [factor];
  });

  if (flags['dry-run']) {
    console.log({
      totalRows: rows.length,
      validRows,
      invalidRows,
      importedRows: 0,
      version,
      sourceVariant,
    });
    return;
  }

  if (!flags.yes) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      `Import ${validRows} Agribalyse rows (${sourceVariant}) for version ${version}? Type yes: `,
    );
    rl.close();
    if (answer !== 'yes') return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const source = `AGRIBALYSE_${sourceVariant.toUpperCase()}`;

  if (flags.replace) {
    await prisma.agribalyseFoodFactor.updateMany({
      where: { version, source },
      data: { isActive: false },
    });
  }

  let importedRows = 0;
  const BATCH_SIZE = 100;
  for (let i = 0; i < normalized.length; i += BATCH_SIZE) {
    const batch = normalized.slice(i, i + BATCH_SIZE);
    await prisma.agribalyseFoodFactor.createMany({
      data: batch.map((factor) => ({
        ...factor,
        source,
        rawRow: factor.rawRow as Prisma.InputJsonValue,
      })),
    });
    importedRows += batch.length;
    if (importedRows % 500 === 0 || importedRows === normalized.length) {
      console.log(`  Imported ${importedRows} / ${normalized.length}...`);
    }
  }

  await prisma.agribalyseImportJob.create({
    data: {
      filename: file,
      version,
      source,
      status: 'COMPLETED',
      totalRows: rows.length,
      validRows,
      invalidRows,
      importedRows,
      columnMapping: mapping as Prisma.InputJsonValue,
    },
  });

  await prisma.$disconnect();
  await pool.end();

  console.log('\n✅ Import complete:', {
    totalRows: rows.length,
    validRows,
    invalidRows,
    importedRows,
    version,
    source,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
