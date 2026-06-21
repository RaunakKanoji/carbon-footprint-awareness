/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';

import { ActivityCategory, PrismaClient } from '../src/generated/prisma';

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
  {
    category: ActivityCategory.WASTE,
    subType: 'recycling',
    unit: 'kg',
    factor: 0.1,
    description: 'Recycled waste per kg',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.WASTE,
    subType: 'composting',
    unit: 'kg',
    factor: 0.05,
    description: 'Composted organic waste per kg',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.SHOPPING,
    subType: 'electronicsItem',
    unit: 'item',
    factor: 120.0,
    description: 'Average electronics item',
    source: 'Initial development seed dataset',
    region: 'GLOBAL',
  },
  {
    category: ActivityCategory.SHOPPING,
    subType: 'onlineOrder',
    unit: 'item',
    factor: 3.5,
    description: 'Online order delivery',
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
    console.log(`Emission factors available: ${count}`);

    // 1. Seed Milestones
    const milestones = [
      {
        key: 'first_log',
        title: 'First Log',
        description: 'Logged your first carbon activity.',
        category: 'LOGGING',
        targetMetric: 'TOTAL_LOGS',
        targetValue: 1,
        xpReward: 50,
      },
      {
        key: 'seven_day_tracker',
        title: 'Consistent Tracker',
        description: 'Logged activities for 7 days.',
        category: 'LOGGING',
        targetMetric: 'STREAK_DAYS',
        targetValue: 7,
        xpReward: 150,
      },
      {
        key: 'first_10kg_saved',
        title: 'First 10 kg Saved',
        description: 'Saved 10 kg CO₂e compared to your baseline.',
        category: 'IMPACT',
        targetMetric: 'CO2E_SAVED',
        targetValue: 10,
        xpReward: 150,
      },
      {
        key: 'first_friend_mission',
        title: 'First Friend Mission',
        description: 'Completed a weekly mission with a friend.',
        category: 'SOCIAL',
        targetMetric: 'FRIEND_MISSIONS',
        targetValue: 1,
        xpReward: 200,
      },
    ];

    for (const m of milestones) {
      await prisma.milestone.upsert({
        where: { key: m.key },
        update: {
          title: m.title,
          description: m.description,
          category: m.category as any,
          targetMetric: m.targetMetric as any,
          targetValue: m.targetValue,
          xpReward: m.xpReward,
        },
        create: {
          key: m.key,
          title: m.title,
          description: m.description,
          category: m.category as any,
          targetMetric: m.targetMetric as any,
          targetValue: m.targetValue,
          xpReward: m.xpReward,
        },
      });
    }
    console.log(`Milestones seeded.`);

    // 2. Seed Weekly Mission templates
    const weeklyMissions = [
      {
        id: 'tmpl_food_mission',
        title: 'Plant-Based Lunch Week',
        description: 'Log 3 plant-based lunches this week.',
        category: ActivityCategory.FOOD,
        missionType: 'WEEKLY',
        targetMetric: 'ACTIVITY_COUNT',
        targetValue: 3,
        xpReward: 250,
        estimatedCo2eImpactKg: 4.5,
      },
      {
        id: 'tmpl_commute_mission',
        title: 'Low-Carbon Commute',
        description: 'Replace 2 car trips with walking, cycling, or public transport.',
        category: ActivityCategory.TRANSPORT,
        missionType: 'WEEKLY',
        targetMetric: 'ACTIVITY_COUNT',
        targetValue: 2,
        xpReward: 300,
        estimatedCo2eImpactKg: 8.0,
      },
      {
        id: 'tmpl_energy_mission',
        title: 'Smart Energy Week',
        description: 'Log 3 lower-energy home actions.',
        category: ActivityCategory.ENERGY,
        missionType: 'WEEKLY',
        targetMetric: 'ACTIVITY_COUNT',
        targetValue: 3,
        xpReward: 200,
        estimatedCo2eImpactKg: 5.0,
      },
      {
        id: 'tmpl_shopping_mission',
        title: 'Buy Less, Use More',
        description: 'Avoid or replace 1 new purchase with second-hand or no purchase.',
        category: ActivityCategory.SHOPPING,
        missionType: 'WEEKLY',
        targetMetric: 'ACTIVITY_COUNT',
        targetValue: 1,
        xpReward: 300,
        estimatedCo2eImpactKg: 12.0,
      },
      {
        id: 'tmpl_waste_mission',
        title: 'Waste Reset',
        description: 'Log 3 recycling, composting, or reduced-waste actions.',
        category: ActivityCategory.WASTE,
        missionType: 'WEEKLY',
        targetMetric: 'ACTIVITY_COUNT',
        targetValue: 3,
        xpReward: 200,
        estimatedCo2eImpactKg: 2.0,
      },
    ];

    const thisMonday = new Date();
    const day = thisMonday.getDay();
    const diff = thisMonday.getDate() - day + (day === 0 ? -6 : 1);
    thisMonday.setDate(diff);
    thisMonday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(thisMonday);
    nextSunday.setDate(nextSunday.getDate() + 7);
    nextSunday.setHours(23, 59, 59, 999);

    for (const m of weeklyMissions) {
      await prisma.mission.upsert({
        where: { id: m.id },
        update: {
          title: m.title,
          description: m.description,
          category: m.category,
          missionType: m.missionType as any,
          targetMetric: m.targetMetric as any,
          targetValue: m.targetValue,
          xpReward: m.xpReward,
          estimatedCo2eImpactKg: m.estimatedCo2eImpactKg,
          startsAt: thisMonday,
          endsAt: nextSunday,
          isTemplate: true,
        },
        create: {
          id: m.id,
          title: m.title,
          description: m.description,
          category: m.category,
          missionType: m.missionType as any,
          targetMetric: m.targetMetric as any,
          targetValue: m.targetValue,
          xpReward: m.xpReward,
          estimatedCo2eImpactKg: m.estimatedCo2eImpactKg,
          startsAt: thisMonday,
          endsAt: nextSunday,
          isTemplate: true,
        },
      });
    }
    console.log(`Weekly mission templates seeded.`);

    // 3. Seed Mock Users for Leaderboards
    const mockUsers = [
      {
        id: 'usr_mock_aarav',
        clerkId: 'mock_aarav',
        email: 'aarav@example.com',
        name: 'Aarav Mehta',
        city: 'Mumbai',
        country: 'India',
        totalXp: 1200,
        weeklyXp: 450,
        level: 5,
        streak: 5,
        weeklyCo2eSavedKg: 18.2,
      },
      {
        id: 'usr_mock_mira',
        clerkId: 'mock_mira',
        email: 'mira@example.com',
        name: 'Mira Nair',
        city: 'Bengaluru',
        country: 'India',
        totalXp: 750,
        weeklyXp: 300,
        level: 4,
        streak: 4,
        weeklyCo2eSavedKg: 14.1,
      },
      {
        id: 'usr_mock_riya',
        clerkId: 'mock_riya',
        email: 'riya@example.com',
        name: 'Riya Sharma',
        city: 'Mumbai',
        country: 'India',
        totalXp: 400,
        weeklyXp: 180,
        level: 3,
        streak: 2,
        weeklyCo2eSavedKg: 8.4,
      },
      {
        id: 'usr_mock_kabir',
        clerkId: 'mock_kabir',
        email: 'kabir@example.com',
        name: 'Kabir Das',
        city: 'Delhi',
        country: 'India',
        totalXp: 200,
        weeklyXp: 110,
        level: 2,
        streak: 1,
        weeklyCo2eSavedKg: 5.1,
      },
    ];

    for (const u of mockUsers) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          clerkId: u.clerkId,
        },
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          clerkId: u.clerkId,
        },
      });

      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          city: u.city,
          country: u.country,
          onboardingComplete: true,
        },
        create: {
          userId: user.id,
          city: u.city,
          country: u.country,
          onboardingComplete: true,
        },
      });

      await prisma.userGamification.upsert({
        where: { userId: user.id },
        update: {
          totalXp: u.totalXp,
          weeklyXp: u.weeklyXp,
          level: u.level,
          currentStreak: u.streak,
          longestStreak: u.streak,
          weeklyCo2eSavedKg: u.weeklyCo2eSavedKg,
          totalCo2eSavedKg: u.weeklyCo2eSavedKg * 4,
        },
        create: {
          userId: user.id,
          totalXp: u.totalXp,
          weeklyXp: u.weeklyXp,
          level: u.level,
          currentStreak: u.streak,
          longestStreak: u.streak,
          weeklyCo2eSavedKg: u.weeklyCo2eSavedKg,
          totalCo2eSavedKg: u.weeklyCo2eSavedKg * 4,
        },
      });
    }
    console.log(`Mock users and gamification stats seeded.`);

    console.log(`Seed completed successfully.`);
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
