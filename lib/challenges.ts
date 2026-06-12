import { ActivityCategory, ChallengeStatus } from '@/app/generated/prisma';
import { prisma } from '@/lib/prisma';
import { iconMap } from '@/src/lib/icons';

export interface ChallengeTemplate {
  key: string;
  title: string;
  description: string;
  category: ActivityCategory;
  targetCount: number;
  points: number;
  icon: keyof typeof iconMap;
  badgeName: string;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    key: 'veggie-champ',
    title: 'Veggie Champ',
    description:
      'Log 10 plant-based meals (vegetarian or vegan) to prove your green diet dedication.',
    category: ActivityCategory.FOOD,
    targetCount: 10,
    points: 150,
    icon: 'utensils',
    badgeName: 'Dietary Defender',
  },
  {
    key: 'green-commuter',
    title: 'Green Commuter',
    description:
      'Log 5 public transit or active travel trips (bus, metro, train, bicycle, or walking).',
    category: ActivityCategory.TRANSPORT,
    targetCount: 5,
    points: 100,
    icon: 'car',
    badgeName: 'Transit Trailblazer',
  },
  {
    key: 'waste-watcher',
    title: 'Waste Watcher',
    description: 'Log 5 recycling or composting activities to reduce landfill contributions.',
    category: ActivityCategory.WASTE,
    targetCount: 5,
    points: 120,
    icon: 'trash',
    badgeName: 'Zero-Waste Hero',
  },
  {
    key: 'eco-habit',
    title: 'Eco Habit Builder',
    description: 'Log 8 activities of any category to lock in your green tracking habit.',
    category: ActivityCategory.OTHER,
    targetCount: 8,
    points: 200,
    icon: 'bolt',
    badgeName: 'Master Tracker',
  },
];

/**
 * Computes the numerical progress metrics for a specific active challenge.
 */
export async function getChallengeProgress(
  challenge: { title: string; startedAt: Date },
  userId: string,
): Promise<{ current: number; target: number; percent: number }> {
  const template = CHALLENGE_TEMPLATES.find((t) => t.title === challenge.title);
  if (!template) {
    return { current: 0, target: 10, percent: 0 };
  }

  const startDate = new Date(challenge.startedAt);
  let current = 0;

  if (template.key === 'veggie-champ') {
    // Count FOOD activities of type veganMeal or vegetarianMeal since start date
    current = await prisma.activityLog.count({
      where: {
        userId,
        category: ActivityCategory.FOOD,
        subType: { in: ['veganMeal', 'vegetarianMeal'] },
        occurredAt: { gte: startDate },
      },
    });
  } else if (template.key === 'green-commuter') {
    // Count TRANSPORT activities of type bus, metro, train, bicycle, or walking since start date
    current = await prisma.activityLog.count({
      where: {
        userId,
        category: ActivityCategory.TRANSPORT,
        subType: { in: ['bus', 'metro', 'train', 'bicycle', 'walking'] },
        occurredAt: { gte: startDate },
      },
    });
  } else if (template.key === 'waste-watcher') {
    // Count WASTE activities of type recycledWaste or foodWaste since start date
    current = await prisma.activityLog.count({
      where: {
        userId,
        category: ActivityCategory.WASTE,
        subType: { in: ['recycledWaste', 'foodWaste'] },
        occurredAt: { gte: startDate },
      },
    });
  } else {
    // Eco Habit Builder: count ANY activity log since start date
    current = await prisma.activityLog.count({
      where: {
        userId,
        occurredAt: { gte: startDate },
      },
    });
  }

  const target = template.targetCount;
  const percent = Math.min(100, Math.round((current / target) * 100));

  return { current, target, percent };
}

/**
 * Sweeps all active challenges for a user, recalculates progress, and marks met challenges as completed.
 * Returns an array of newly completed challenge titles.
 */
export async function checkAndCompleteChallenges(userId: string): Promise<string[]> {
  const activeChallenges = await prisma.challenge.findMany({
    where: {
      userId,
      status: ChallengeStatus.ACTIVE,
    },
  });

  const newlyCompleted: string[] = [];

  for (const challenge of activeChallenges) {
    const progress = await getChallengeProgress(challenge, userId);
    if (progress.current >= progress.target) {
      // Complete the challenge
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: {
          status: ChallengeStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
      newlyCompleted.push(challenge.title);
    }
  }

  return newlyCompleted;
}
