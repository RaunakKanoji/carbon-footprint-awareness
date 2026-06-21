import { NextResponse } from 'next/server';

import {
  getOpenRouteServiceEndpointStatus,
  isOpenRouteServicePlaygroundEnabled,
} from '@/src/integrations/openrouteservice/constants';
import { getCurrentUser } from '@/src/lib/auth';

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET() {
  const enabled = isOpenRouteServicePlaygroundEnabled();

  if (!enabled) {
    return NextResponse.json(
      { enabled: false, error: 'Developer API playground is disabled' },
      { status: 403 },
    );
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ enabled, error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    return NextResponse.json({ enabled, error: 'Forbidden' }, { status: 403 });
  }

  const missingVariables = [
    !process.env.OPENROUTESERVICE_BASE_URL ? 'OPENROUTESERVICE_BASE_URL' : null,
    !process.env.OPENROUTESERVICE_API_KEY ? 'OPENROUTESERVICE_API_KEY' : null,
  ].filter(Boolean);

  return NextResponse.json({
    enabled,
    baseUrlConfigured: Boolean(process.env.OPENROUTESERVICE_BASE_URL),
    apiKeyConfigured: Boolean(process.env.OPENROUTESERVICE_API_KEY),
    missingVariables,
    endpoints: getOpenRouteServiceEndpointStatus(),
  });
}
