import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';

import { ActivityCategory, PrismaClient } from '../app/generated/prisma';

const emissionFactors = [
  {
    category: ActivityCategory.TRANSPORT,
    subType: 'petrolCar',
    unit: 'km',
    factor: 0.192,
    description: 'Petrol car per kilometer',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.TRANSPORT,
    subType: 'dieselCar',
    unit: 'km',
    factor: 0.171,
    description: 'Diesel car per kilometer',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.TRANSPORT,
    subType: 'bus',
    unit: 'km',
    factor: 0.105,
    description: 'Bus travel per passenger kilometer',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.TRANSPORT,
    subType: 'metro',
    unit: 'km',
    factor: 0.035,
    description: 'Metro travel per passenger kilometer',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.TRANSPORT,
    subType: 'train',
    unit: 'km',
    factor: 0.041,
    description: 'Train travel per passenger kilometer',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.FOOD,
    subType: 'veganMeal',
    unit: 'meal',
    factor: 0.7,
    description: 'Average vegan meal',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.FOOD,
    subType: 'vegetarianMeal',
    unit: 'meal',
    factor: 1.2,
    description: 'Average vegetarian meal',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.FOOD,
    subType: 'chickenMeal',
    unit: 'meal',
    factor: 2.5,
    description: 'Average chicken-based meal',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.FOOD,
    subType: 'beefMeal',
    unit: 'meal',
    factor: 7.0,
    description: 'Average beef-based meal',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.ENERGY,
    subType: 'indiaGrid',
    unit: 'kWh',
    factor: 0.71,
    description: 'India grid electricity per kWh',
    source: 'Initial development seed dataset',
    region: 'IN',
  },
  {
    category: ActivityCategory.WASTE,
    subType: 'landfillWaste',
    unit: 'kg',
    factor: 0.45,
    description: 'General landfill waste per kg',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.SHOPPING,
    subType: 'clothingItem',
    unit: 'item',
    factor: 8.0,
    description: 'Average clothing item',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const factor of emissionFactors) {
      await prisma.emissionFactor.upsert({
        where: {
          category_subType_unit_region: {
            category: factor.category,
            subType: factor.subType,
            unit: factor.unit,
            region: factor.region,
          },
        },
        update: {
          factor: factor.factor,
          description: factor.description,
          source: factor.source,
          isActive: true,
        },
        create: factor,
      });
    }

    const count = await prisma.emissionFactor.count();

    console.log(`Seed completed successfully.`);
    console.log(`Emission factors available: ${count}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:');
  console.error(error);
  process.exit(1);
});
