import { prisma } from '@/src/db/prisma';
import { XpSource } from '@/src/generated/prisma';

export const DAILY_ACTIVITY_XP_CAP = 150;

export const LEVEL_TABLE = [
  { level: 1, requiredXp: 0 },
  { level: 2, requiredXp: 250 },
  { level: 3, requiredXp: 600 },
  { level: 4, requiredXp: 1000 },
  { level: 5, requiredXp: 1600 },
  { level: 6, requiredXp: 2400 },
  { level: 7, requiredXp: 3400 },
  { level: 8, requiredXp: 4800 },
  { level: 9, requiredXp: 6500 },
  { level: 10, requiredXp: 8500 },
];

export function getLevelForXp(xp: number): number {
  let userLevel = 1;
  for (const entry of LEVEL_TABLE) {
    if (xp >= entry.requiredXp) {
      userLevel = entry.level;
    } else {
      break;
    }
  }
  return userLevel;
}

export function getLevelProgress(xp: number) {
  const currentLevel = getLevelForXp(xp);
  const currentEntry = LEVEL_TABLE.find(e => e.level === currentLevel) || LEVEL_TABLE[0]!;
  const nextEntry = LEVEL_TABLE.find(e => e.level === currentLevel + 1);

  if (!nextEntry) {
    return {
      currentLevel,
      currentXp: xp,
      nextLevelXp: currentEntry.requiredXp,
      progressPercent: 100,
      pointsToNextLevel: 0,
    };
  }

  const range = nextEntry.requiredXp - currentEntry.requiredXp;
  const progress = xp - currentEntry.requiredXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));

  return {
    currentLevel,
    currentXp: xp,
    nextLevelXp: nextEntry.requiredXp,
    progressPercent,
    pointsToNextLevel: nextEntry.requiredXp - xp,
  };
}

interface AwardXpInput {
  userId: string;
  source: XpSource;
  sourceId?: string;
  xpAmount: number;
  reason: string;
}

export async function awardXp({ userId, source, sourceId, xpAmount, reason }: AwardXpInput) {
  // 1. Ensure user has a UserGamification record
  let gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  if (!gamification) {
    gamification = await prisma.userGamification.create({
      data: {
        userId,
        totalXp: 0,
        weeklyXp: 0,
        level: 1,
      },
    });
  }

  // 2. Prevent duplicate award for same sourceId (e.g. unique goal or milestone id)
  if (sourceId) {
    const existingEvent = await prisma.xpEvent.findFirst({
      where: {
        userId,
        source,
        sourceId,
      },
    });
    if (existingEvent) {
      return { success: false, reason: 'Already awarded for this source ID', awardedAmount: 0 };
    }
  }

  let finalXpAmount = xpAmount;

  // 3. Apply daily activity cap
  if (source === XpSource.ACTIVITY_LOG) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayXpEvents = await prisma.xpEvent.findMany({
      where: {
        userId,
        source: XpSource.ACTIVITY_LOG,
        createdAt: { gte: startOfToday },
      },
      select: { xpAmount: true },
    });

    const todayXpTotal = todayXpEvents.reduce((sum, e) => sum + e.xpAmount, 0);

    if (todayXpTotal >= DAILY_ACTIVITY_XP_CAP) {
      return { success: false, reason: 'Daily activity XP cap reached', awardedAmount: 0 };
    }

    if (todayXpTotal + xpAmount > DAILY_ACTIVITY_XP_CAP) {
      finalXpAmount = DAILY_ACTIVITY_XP_CAP - todayXpTotal;
    }
  }

  // 4. Create the XpEvent log
  await prisma.xpEvent.create({
    data: {
      userId,
      source,
      sourceId: sourceId || null,
      xpAmount: finalXpAmount,
      reason,
    },
  });

  // 5. Update user gamification total/weekly XP and check for level-up
  const newTotalXp = gamification.totalXp + finalXpAmount;
  const newWeeklyXp = gamification.weeklyXp + finalXpAmount;
  const newLevel = getLevelForXp(newTotalXp);

  await prisma.userGamification.update({
    where: { userId },
    data: {
      totalXp: newTotalXp,
      weeklyXp: newWeeklyXp,
      level: newLevel,
    },
  });

  return {
    success: true,
    awardedAmount: finalXpAmount,
    newTotalXp,
    newLevel,
    leveledUp: newLevel > gamification.level,
  };
}
