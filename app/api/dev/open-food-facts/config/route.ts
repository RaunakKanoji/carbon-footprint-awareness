import { NextResponse } from 'next/server';

import {
  getOpenFoodFactsEndpointStatus,
  isOpenFoodFactsPlaygroundEnabled,
} from '@/src/integrations/open-food-facts/constants';
import { getCurrentUser } from '@/src/lib/auth';

function getAdminEmails() {
  return (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function guard() {
  const enabled = isOpenFoodFactsPlaygroundEnabled();
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

  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  return NextResponse.json({
    enabled: true,
    baseUrlConfigured: Boolean(process.env.OPEN_FOOD_FACTS_BASE_URL),
    userAgentConfigured: Boolean(process.env.OPEN_FOOD_FACTS_USER_AGENT),
    missingVariables: [
      !process.env.OPEN_FOOD_FACTS_USER_AGENT ? 'OPEN_FOOD_FACTS_USER_AGENT' : null,
    ].filter(Boolean),
    endpoints: getOpenFoodFactsEndpointStatus(),
  });
}
