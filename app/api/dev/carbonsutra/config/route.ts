import { NextResponse } from 'next/server';

import {
  getCarbonSutraEndpointStatus,
  isDevApiPlaygroundEnabled,
} from '@/src/integrations/carbonsutra/endpoints';
import { getCurrentUser } from '@/src/lib/auth';

export async function GET() {
  const enabled = isDevApiPlaygroundEnabled();

  if (!enabled) {
    return NextResponse.json({ enabled: false, error: 'Developer API playground is disabled' }, { status: 403 });
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ enabled, error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ enabled, error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    enabled,
    baseUrlConfigured: Boolean(process.env.CARBONSUTRA_BASE_URL),
    apiKeyConfigured: Boolean(process.env.CARBONSUTRA_API_KEY),
    hostConfigured: Boolean(process.env.CARBONSUTRA_API_HOST),
    endpoints: getCarbonSutraEndpointStatus(),
  });
}
