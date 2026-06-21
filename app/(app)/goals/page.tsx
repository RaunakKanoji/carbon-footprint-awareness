import { redirect } from 'next/navigation';

import PageHeader from '@/src/app-shell/page-header';
import BudgetSetupClient from '@/src/features/goals/components/BudgetSetupClient';
import { getCurrentUser } from '@/src/lib/auth';

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (!user.profile?.onboardingComplete) redirect('/onboarding');
  if (!user.carbonProfile) redirect('/footprint');

  return (
    <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
      <PageHeader
        title="Goals"
        description="Choose a practical reduction target based on your generated baseline."
      />
      <BudgetSetupClient baseline={user.carbonProfile.monthlyFootprintKg} />
    </div>
  );
}
