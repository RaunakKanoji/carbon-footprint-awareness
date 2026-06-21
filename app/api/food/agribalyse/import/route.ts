import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Use /api/dev/agribalyse/import-preview and /api/dev/agribalyse/import-confirm for imports.' },
    { status: 400 },
  );
}
