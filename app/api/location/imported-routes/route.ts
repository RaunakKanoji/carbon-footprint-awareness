import { NextResponse } from 'next/server';

import { deleteImportedRoute, listImportedRoutes } from '@/src/server/location/imported-route.service';
import { getCurrentUser } from '@/src/lib/auth';

export async function GET() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, routes: await listImportedRoutes(dbUser.id) });
}

export async function DELETE(req: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'Missing route id' }, { status: 400 });

  return NextResponse.json({ ok: true, route: await deleteImportedRoute(dbUser.id, id) });
}
