import { notFound, redirect } from 'next/navigation';

import OpenFoodFactsPlayground from '@/src/features/dev-tools/components/OpenFoodFactsPlayground';
import { isOpenFoodFactsPlaygroundEnabled } from '@/src/integrations/open-food-facts/constants';
import { getCurrentUser } from '@/src/lib/auth';

export default async function OpenFoodFactsPlaygroundPage() {
  if (!isOpenFoodFactsPlaygroundEnabled()) {
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

  return <OpenFoodFactsPlayground />;
}
