import { PrismaClient, ActivityCategory, CalculationProvider, CarbonEstimateConfidence } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = 'usr_mock_aarav';

  // 1. Create Carbon Profile
  await prisma.carbonProfile.upsert({
    where: { userId },
    update: {
      monthlyFootprintKg: 450,
      yearlyFootprintKg: 5400,
      mainImpactCategory: 'TRANSPORT',
      categoryBreakdown: {
        TRANSPORT: 220,
        FOOD: 110,
        ENERGY: 80,
        SHOPPING: 30,
        WASTE: 10,
      },
      confidence: CarbonEstimateConfidence.HIGH,
      dataSources: ['OpenRouteService', 'Agribalyse', 'CarbonSutra'],
    },
    create: {
      userId,
      monthlyFootprintKg: 450,
      yearlyFootprintKg: 5400,
      mainImpactCategory: 'TRANSPORT',
      categoryBreakdown: {
        TRANSPORT: 220,
        FOOD: 110,
        ENERGY: 80,
        SHOPPING: 30,
        WASTE: 10,
      },
      confidence: CarbonEstimateConfidence.HIGH,
      dataSources: ['OpenRouteService', 'Agribalyse', 'CarbonSutra'],
    },
  });
  console.log('Seeded CarbonProfile for mock_aarav');

  // 2. Create Budget for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  await prisma.budget.upsert({
    where: {
      userId_month: {
        userId,
        month: startOfMonth,
      },
    },
    update: {
      targetKg: 380,
      weeklyTargetKg: 95,
      reductionPercentage: 15,
    },
    create: {
      userId,
      month: startOfMonth,
      targetKg: 380,
      weeklyTargetKg: 95,
      reductionPercentage: 15,
      budgetType: 'STANDARD',
    },
  });
  console.log('Seeded Budget for mock_aarav');

  // 3. Create some Activity Logs for this week
  const activities = [
    {
      category: ActivityCategory.FOOD,
      subType: 'veganMeal',
      activityType: 'Dinner',
      quantity: 1,
      unit: 'meal',
      co2eKg: 0.7,
      provider: CalculationProvider.AGRIBALYSE,
      confidence: CarbonEstimateConfidence.HIGH,
      note: 'Delicious vegan curry',
      occurredAt: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
    },
    {
      category: ActivityCategory.TRANSPORT,
      subType: 'metro',
      activityType: 'Commute',
      quantity: 15,
      unit: 'km',
      co2eKg: 0.525,
      provider: CalculationProvider.INTERNAL,
      confidence: CarbonEstimateConfidence.HIGH,
      note: 'Metro ride to work',
      occurredAt: new Date(now.getTime() - 8 * 3600000), // 8 hours ago
    },
    {
      category: ActivityCategory.FOOD,
      subType: 'beefMeal',
      activityType: 'Lunch',
      quantity: 1,
      unit: 'meal',
      co2eKg: 7.0,
      provider: CalculationProvider.AGRIBALYSE,
      confidence: CarbonEstimateConfidence.HIGH,
      note: 'Beef burger',
      occurredAt: new Date(now.getTime() - 24 * 3600000), // 1 day ago
    },
    {
      category: ActivityCategory.ENERGY,
      subType: 'indiaGrid',
      activityType: 'Electricity',
      quantity: 10,
      unit: 'kWh',
      co2eKg: 7.1,
      provider: CalculationProvider.CARBONSUTRA,
      confidence: CarbonEstimateConfidence.HIGH,
      note: 'Daily AC and appliance use',
      occurredAt: new Date(now.getTime() - 1.5 * 24 * 3600000), // 1.5 days ago
    },
    {
      category: ActivityCategory.SHOPPING,
      subType: 'clothingItem',
      activityType: 'Purchase',
      quantity: 1,
      unit: 'item',
      co2eKg: 8.0,
      provider: CalculationProvider.CLIMATIQ,
      confidence: CarbonEstimateConfidence.MEDIUM,
      note: 'Cotton T-Shirt',
      occurredAt: new Date(now.getTime() - 3 * 24 * 3600000), // 3 days ago
    },
    {
      category: ActivityCategory.TRANSPORT,
      subType: 'petrolCar',
      activityType: 'Drive',
      quantity: 30,
      unit: 'km',
      co2eKg: 5.76,
      provider: CalculationProvider.CARBONSUTRA,
      confidence: CarbonEstimateConfidence.HIGH,
      note: 'Weekend drive to mall',
      occurredAt: new Date(now.getTime() - 4 * 24 * 3600000), // 4 days ago
    },
  ];

  // Clear previous activity logs for this user to avoid duplicating them on multiple runs
  await prisma.activityLog.deleteMany({
    where: { userId },
  });

  for (const act of activities) {
    await prisma.activityLog.create({
      data: {
        userId,
        ...act,
      },
    });
  }
  console.log(`Seeded ${activities.length} ActivityLogs for mock_aarav`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
