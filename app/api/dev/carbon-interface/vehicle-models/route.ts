import { NextResponse } from 'next/server';

import { isCarbonInterfacePlaygroundEnabled } from '@/src/integrations/carbon-interface/constants';
import { getCarbonInterfaceVehicleModels } from '@/src/server/carbon/carbon-interface.service';
import { getCurrentUser } from '@/src/lib/auth';

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(req: Request) {
  if (!isCarbonInterfacePlaygroundEnabled()) {
    return NextResponse.json({ ok: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const makeId = new URL(req.url).searchParams.get('makeId')?.trim();
  if (!makeId) {
    return NextResponse.json({ ok: false, error: 'Missing makeId query parameter' }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, data: await getCarbonInterfaceVehicleModels(makeId) });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not load vehicle models',
      },
      { status: 400 },
    );
  }
}
