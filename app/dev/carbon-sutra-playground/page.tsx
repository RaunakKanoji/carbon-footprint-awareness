import { notFound, redirect } from 'next/navigation';

import CarbonSutraPlayground from '@/src/features/dev-tools/components/CarbonSutraPlayground';
import { isDevApiPlaygroundEnabled } from '@/src/integrations/carbonsutra/endpoints';
import { getCurrentUser } from '@/src/lib/auth';

export default async function CarbonPlaygroundPage() {
  if (!isDevApiPlaygroundEnabled()) {
    notFound();
  }

  const dbUser = await getCurrentUser();
  if (!dbUser) {
    redirect('/');
  }

  const adminEmails = (process.env.DEV_API_PLAYGROUND_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length > 0 && !adminEmails.includes(dbUser.email.toLowerCase())) {
    notFound();
  }

  return <CarbonSutraPlayground />;
}
