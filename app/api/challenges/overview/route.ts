import { NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { getLevelProgress } from '@/src/lib/gamification/xp';
import { checkAndUnlockMilestones } from '@/src/lib/gamification/progress';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // Trigger milestone check to ensure status is fresh
    await checkAndUnlockMilestones(userId);

    // Get User Gamification Stats
    let stats = await prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.userGamification.create({
        data: {
          userId,
          totalXp: 0,
          weeklyXp: 0,
          level: 1,
          currentStreak: 0,
        },
      });
    }

    // Get active mission count
    const activeMissions = await prisma.missionParticipant.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        mission: {
          endsAt: { gte: new Date() },
        },
      },
      include: { mission: true },
    });

    const activeMissionCount = activeMissions.length;
    const friendMissionCount = activeMissions.filter(
      (m) => m.mission.missionType === 'FRIEND'
    ).length;

    // Get active goals count
    const activeGoalCount = await prisma.goal.count({
      where: {
        userId,
        status: 'ACTIVE',
        endsAt: { gte: new Date() },
      },
    });

    // Get unlocked milestones
    const unlockedMilestones = await prisma.userMilestone.findMany({
      where: {
        userId,
        unlockedAt: { not: null },
      },
      include: { milestone: true },
      orderBy: { unlockedAt: 'desc' },
      take: 3,
    });

    // Get level progress details
    const levelInfo = getLevelProgress(stats.totalXp);

    // Find featured mission (either one of user's active, or an active template they haven't joined yet)
    let featuredMission = null;
    if (activeMissions.length > 0) {
      featuredMission = activeMissions[0]?.mission;
    } else {
      featuredMission = await prisma.mission.findFirst({
        where: {
          isTemplate: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
        orderBy: { xpReward: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      weeklyXp: stats.weeklyXp,
      totalXp: stats.totalXp,
      level: stats.level,
      levelInfo,
      weeklyCo2eSavedKg: stats.weeklyCo2eSavedKg,
      totalCo2eSavedKg: stats.totalCo2eSavedKg,
      activeMissionCount,
      friendMissionCount,
      activeGoalCount,
      currentStreak: stats.currentStreak,
      recentMilestones: unlockedMilestones.map((um) => ({
        key: um.milestone.key,
        title: um.milestone.title,
        description: um.milestone.description,
        xpReward: um.milestone.xpReward,
        unlockedAt: um.unlockedAt,
      })),
      featuredMission,
    });
  } catch (error) {
    console.error('API Error: GET /api/challenges/overview:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
