import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { createAgribalyseImportPreview } from '@/src/server/food/agribalyse-import.service';

async function guard() {
  if (!isAgribalysePlaygroundEnabled()) return NextResponse.json({ error: 'Developer API playground is disabled' }, { status: 403 });
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing CSV file upload' }, { status: 400 });
  }
  const version = typeof formData.get('version') === 'string' ? String(formData.get('version')) : undefined;
  try {
    return NextResponse.json(await createAgribalyseImportPreview({ file, filename: file.name, version }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import preview failed' }, { status: 400 });
  }
}
