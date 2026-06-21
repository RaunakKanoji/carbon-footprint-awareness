import { NextResponse } from 'next/server';

import {
  getCarbonInterfaceEndpointStatus,
  isCarbonInterfacePlaygroundEnabled,
} from '@/src/integrations/carbon-interface/constants';
import { getCurrentUser } from '@/src/lib/auth';

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET() {
  const enabled = isCarbonInterfacePlaygroundEnabled();

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

  return NextResponse.json({
    enabled,
    baseUrlConfigured: Boolean(process.env.CARBON_INTERFACE_BASE_URL),
    apiKeyConfigured: Boolean(process.env.CARBON_INTERFACE_API_KEY),
    missingVariables: [
      !process.env.CARBON_INTERFACE_BASE_URL ? 'CARBON_INTERFACE_BASE_URL' : null,
      !process.env.CARBON_INTERFACE_API_KEY ? 'CARBON_INTERFACE_API_KEY' : null,
    ].filter(Boolean),
    endpoints: getCarbonInterfaceEndpointStatus(),
  });
}
