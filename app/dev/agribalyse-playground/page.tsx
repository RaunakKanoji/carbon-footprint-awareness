import { notFound, redirect } from 'next/navigation';

import AgribalysePlayground from '@/src/features/dev-tools/components/AgribalysePlayground';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { getCurrentUser } from '@/src/lib/auth';

export default async function AgribalysePlaygroundPage() {
  if (!isAgribalysePlaygroundEnabled()) notFound();
  const dbUser = await getCurrentUser();
  if (!dbUser) redirect('/');
  return <AgribalysePlayground />;
}
