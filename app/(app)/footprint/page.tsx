import Link from 'next/link';
import { redirect } from 'next/navigation';

import PageHeader from '@/src/app-shell/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { calculateBaselineFootprint } from '@/src/server/carbon/carbon-engine.service';

export default async function FootprintPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (!user.profile?.onboardingComplete) redirect('/onboarding');
  let carbonProfile = user.carbonProfile;
  if (!carbonProfile) {
    const profile = user.profile;
    const monthlyFootprintKg = calculateBaselineFootprint({
      dietType: profile.dietType?.toLowerCase() ?? 'mixed',
      commuteMode: profile.commuteMode?.toLowerCase() ?? 'remote',
      commuteDistance: profile.commuteDistanceKm ?? 0,
      monthlyKwh: profile.electricityUsageKwh ?? 0,
    });
    const categoryBreakdown = {
      food: monthlyFootprintKg * 0.3,
      transport: monthlyFootprintKg * 0.3,
      energy: monthlyFootprintKg * 0.25,
      shopping: monthlyFootprintKg * 0.1,
      waste: monthlyFootprintKg * 0.05,
      travel: 0,
    };
    carbonProfile = await prisma.carbonProfile.create({
      data: {
        userId: user.id,
        monthlyFootprintKg,
        yearlyFootprintKg: monthlyFootprintKg * 12,
        mainImpactCategory: 'TRANSPORT',
        categoryBreakdown,
        confidence: 'LOW',
        dataSources: ['Existing profile migration', 'Carbon Compass internal factors'],
      },
    });
  }

  const breakdown = carbonProfile.categoryBreakdown as Record<string, number>;
  const sources = carbonProfile.dataSources as string[];

  return (
    <div className="flex min-h-0 w-full flex-col gap-6 pb-6">
      <PageHeader
        title="Your Footprint"
        description="Your estimated baseline based on the lifestyle information you provided."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly footprint</CardTitle>
          </CardHeader>
          <CardContent>{carbonProfile.monthlyFootprintKg.toFixed(1)} kg CO₂e</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yearly footprint</CardTitle>
          </CardHeader>
          <CardContent>{carbonProfile.yearlyFootprintKg.toFixed(1)} kg CO₂e</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Main impact</CardTitle>
          </CardHeader>
          <CardContent>{carbonProfile.mainImpactCategory}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {Object.entries(breakdown).map(([category, value]) => (
            <div
              key={category}
              className="flex justify-between border-b border-border-subtle py-2 text-sm"
            >
              <span className="capitalize text-text-secondary">{category}</span>
              <span className="font-semibold text-text-primary">{value.toFixed(1)} kg CO₂e</span>
            </div>
          ))}
          <p className="text-sm text-text-secondary">Confidence: {carbonProfile.confidence}</p>
          <p className="text-sm text-text-secondary">Sources: {sources.join(', ')}</p>
        </CardContent>
      </Card>
      <div>
        <Link
          href="/goals"
          className="inline-flex h-10 items-center rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white"
        >
          Review Carbon Goals
        </Link>
      </div>
    </div>
  );
}
