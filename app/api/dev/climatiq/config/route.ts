import { NextResponse } from 'next/server';

import {
  getClimatiqEndpointStatus,
  isClimatiqPlaygroundEnabled,
} from '@/src/integrations/climatiq/constants';
import { getCurrentUser } from '@/src/lib/auth';

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET() {
  const enabled = isClimatiqPlaygroundEnabled();

  if (!enabled) {
    return NextResponse.json({ enabled: false, error: 'Developer API playground is disabled' }, { status: 403 });
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
    !process.env.CLIMATIQ_BASE_URL ? 'CLIMATIQ_BASE_URL' : null,
    !process.env.CLIMATIQ_API_KEY ? 'CLIMATIQ_API_KEY' : null,
    !process.env.CLIMATIQ_DATA_VERSION ? 'CLIMATIQ_DATA_VERSION' : null,
  ].filter(Boolean);

  return NextResponse.json({
    enabled,
    baseUrlConfigured: Boolean(process.env.CLIMATIQ_BASE_URL),
    apiKeyConfigured: Boolean(process.env.CLIMATIQ_API_KEY),
    dataVersionConfigured: Boolean(process.env.CLIMATIQ_DATA_VERSION),
    missingVariables,
    endpoints: getClimatiqEndpointStatus(),
  });
}
