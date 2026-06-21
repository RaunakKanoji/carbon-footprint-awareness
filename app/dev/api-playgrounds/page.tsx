import { notFound, redirect } from 'next/navigation';

import { ApiPlaygroundShell, PlaygroundIndexCard } from '@/src/features/dev-tools/components/ApiPlaygroundConsole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { getCurrentUser } from '@/src/lib/auth';
import { isAgribalysePlaygroundEnabled } from '@/src/integrations/agribalyse/constants';
import { isCarbonInterfacePlaygroundEnabled } from '@/src/integrations/carbon-interface/constants';
import { isDevApiPlaygroundEnabled } from '@/src/integrations/carbonsutra/endpoints';
import { isClimatiqPlaygroundEnabled } from '@/src/integrations/climatiq/constants';
import { isOpenFoodFactsPlaygroundEnabled } from '@/src/integrations/open-food-facts/constants';
import { isOpenRouteServicePlaygroundEnabled } from '@/src/integrations/openrouteservice/constants';

export default async function ApiPlaygroundsPage() {
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

  const playgrounds = [
    {
      title: 'CarbonSutra',
      href: '/dev/carbon-sutra-playground',
      purpose: 'Lifestyle carbon calculation provider',
      feature: 'Used for commute, electricity, flights, fuel, hotels, freight, and shipment estimates.',
      status: isDevApiPlaygroundEnabled() ? 'configured' : 'disabled',
      badges: ['Carbon provider', 'Estimate'],
    },
    {
      title: 'Carbon Interface',
      href: '/dev/carbon-interface-playground',
      purpose: 'Fallback/simple estimate provider',
      feature: 'Used for vehicle, electricity, shipping, flight, and fuel combustion fallback tests.',
      status: isCarbonInterfacePlaygroundEnabled() ? 'configured' : 'disabled',
      badges: ['Carbon provider', 'Vehicle metadata'],
    },
    {
      title: 'Climatiq',
      href: '/dev/climatiq-playground',
      purpose: 'Emission factor and advanced estimate provider',
      feature: 'Used for factor search, saved mappings, single estimates, and batch estimates.',
      status: isClimatiqPlaygroundEnabled() ? 'configured' : 'disabled',
      badges: ['Mappings', 'Batch'],
    },
    {
      title: 'OpenRouteService',
      href: '/dev/openrouteservice-playground',
      purpose: 'Routing and distance provider',
      feature: 'Used for commute distance before carbon estimation.',
      status: isOpenRouteServicePlaygroundEnabled() ? 'configured' : 'disabled',
      badges: ['Support provider', 'Distance'],
    },
    {
      title: 'Open Food Facts',
      href: '/dev/open-food-facts-playground',
      purpose: 'Barcode and product metadata provider',
      feature: 'Used for barcode lookup before food carbon mapping.',
      status: isOpenFoodFactsPlaygroundEnabled() ? 'configured' : 'disabled',
      badges: ['Metadata only', 'No key required'],
    },
    {
      title: 'Agribalyse',
      href: '/dev/agribalyse-playground',
      purpose: 'Local food LCA dataset provider',
      feature: 'Used for food factor search, estimates, and Open Food Facts category mappings.',
      status: isAgribalysePlaygroundEnabled() ? 'configured' : 'disabled',
      badges: ['Dataset', 'Food carbon'],
    },
  ] as const;

  const routingRows = [
    ['Commute distance', 'OpenRouteService'],
    ['Commute carbon', 'CarbonSutra / Climatiq'],
    ['India electricity', 'CarbonSutra / Climatiq'],
    ['US electricity', 'Carbon Interface / Climatiq'],
    ['Food barcode', 'Open Food Facts'],
    ['Food carbon', 'Agribalyse / Climatiq'],
    ['Product/material', 'Climatiq'],
    ['Receipt/batch', 'Climatiq batch'],
  ];

  return (
    <ApiPlaygroundShell
      title="API Playgrounds"
      description="Understand, test, and debug Carbon Compass integrations."
      providerType="Developer console"
      status="enabled"
      badges={['Admin only', 'No secrets shown']}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {playgrounds.map((playground) => (
          <PlaygroundIndexCard key={playground.href} {...playground} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routing guide</CardTitle>
          <CardDescription>Choose the provider that matches the job before testing payloads.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-border-default">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-bg-base text-text-secondary">
                <tr>
                  <th className="p-3 font-semibold">Task</th>
                  <th className="p-3 font-semibold">Recommended API</th>
                </tr>
              </thead>
              <tbody>
                {routingRows.map(([task, provider]) => (
                  <tr key={task} className="border-t border-border-default">
                    <td className="p-3 font-medium text-text-primary">{task}</td>
                    <td className="p-3 text-text-secondary">{provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </ApiPlaygroundShell>
  );
}
