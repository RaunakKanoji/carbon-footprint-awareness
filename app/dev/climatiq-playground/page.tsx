import { notFound, redirect } from 'next/navigation';

import ClimatiqPlayground from '@/src/features/dev-tools/components/ClimatiqPlayground';
import { isClimatiqPlaygroundEnabled } from '@/src/integrations/climatiq/constants';
import { getCurrentUser } from '@/src/lib/auth';

export default async function ClimatiqPlaygroundPage() {
  if (!isClimatiqPlaygroundEnabled()) {
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

  return <ClimatiqPlayground />;
}
