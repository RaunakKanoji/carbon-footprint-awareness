import { notFound, redirect } from 'next/navigation';

import CarbonInterfacePlayground from '@/src/features/dev-tools/components/CarbonInterfacePlayground';
import { isCarbonInterfacePlaygroundEnabled } from '@/src/integrations/carbon-interface/constants';
import { getCurrentUser } from '@/src/lib/auth';

export default async function CarbonInterfacePlaygroundPage() {
  if (!isCarbonInterfacePlaygroundEnabled()) {
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

  return <CarbonInterfacePlayground />;
}
