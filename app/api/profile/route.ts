import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { CommuteMode, DietType } from '@/src/generated/prisma';
import { updateStreakAndSavings } from '@/src/lib/gamification/progress';
import { getLevelForXp } from '@/src/lib/gamification/xp';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // 1. Fetch User Gamification Stats
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
          currentStreak: 0,
          longestStreak: 0,
          totalCo2eSavedKg: 0,
          weeklyCo2eSavedKg: 0,
        },
      });
    }

    await updateStreakAndSavings(userId);
    gamification = await prisma.userGamification.findUniqueOrThrow({
      where: { userId },
    });
    gamification = await prisma.userGamification.update({
      where: { userId },
      data: { level: getLevelForXp(gamification.totalXp) },
    });

    // 2. Fetch User Preference
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
        },
      });
    }

    // 3. Compute Carbon Summary
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        occurredAt: { gte: startOfMonth },
      },
    });

    const weeklyCo2eKg = logs
      .filter((l) => l.occurredAt >= startOfWeek)
      .reduce((sum, l) => sum + l.co2eKg, 0);

    const monthlyCo2eKg = logs.reduce((sum, l) => sum + l.co2eKg, 0);

    const categories = ['FOOD', 'TRANSPORT', 'ENERGY', 'SHOPPING', 'WASTE'];
    const categoryBreakdown = categories.map((cat) => ({
      category: cat,
      co2eKg: logs.filter((l) => l.category === cat).reduce((sum, l) => sum + l.co2eKg, 0),
    }));

    // Find best category (the one with the lowest emissions, or if they have logged others, showing lowest relative or simply lowest non-zero)
    let bestCategory = 'None';
    const nonZeroBreakdown = categoryBreakdown.filter((c) => c.co2eKg > 0);
    if (nonZeroBreakdown.length > 0) {
      // Pick the category with the absolute lowest emissions this month
      const sorted = [...nonZeroBreakdown].sort((a, b) => a.co2eKg - b.co2eKg);
      bestCategory = sorted[0]?.category || 'None';
    }

    // 4. Fetch Friend list and requests
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          include: { profile: true, gamification: true },
        },
        receiver: {
          include: { profile: true, gamification: true },
        },
      },
    });

    const friends = friendships.map((f) => {
      const friend = f.requesterId === userId ? f.receiver : f.requester;
      return {
        id: friend.id,
        displayName: friend.name || friend.email.split('@')[0],
        email: friend.email,
        city: friend.profile?.city || null,
        country: friend.profile?.country || null,
        weeklyXp: friend.gamification?.weeklyXp ?? 0,
        weeklyCo2eSavedKg: friend.gamification?.weeklyCo2eSavedKg ?? 0,
        currentStreak: friend.gamification?.currentStreak ?? 0,
        level: friend.gamification?.level ?? 1,
      };
    });

    const incomingRequests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          include: { profile: true },
        },
      },
    });

    const incoming = incomingRequests.map((req) => ({
      friendshipId: req.id,
      senderId: req.requester.id,
      name: req.requester.name || req.requester.email.split('@')[0],
      email: req.requester.email,
      city: req.requester.profile?.city || null,
    }));

    const outgoingRequests = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          include: { profile: true },
        },
      },
    });

    const outgoing = outgoingRequests.map((req) => ({
      friendshipId: req.id,
      receiverId: req.receiver.id,
      name: req.receiver.name || req.receiver.email.split('@')[0],
      email: req.receiver.email,
    }));

    // 5. Fetch Goals
    const goals = await prisma.goal.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { endsAt: 'asc' },
      take: 3,
    });

    // 6. Fetch Milestones
    const milestones = await prisma.milestone.findMany({
      orderBy: { targetValue: 'asc' },
    });

    const userMilestones = await prisma.userMilestone.findMany({
      where: { userId },
    });

    const milestoneList = milestones.map((m) => {
      const um = userMilestones.find((u) => u.milestoneId === m.id);
      return {
        id: m.id,
        key: m.key,
        title: m.title,
        description: m.description,
        category: m.category,
        targetMetric: m.targetMetric,
        targetValue: m.targetValue,
        xpReward: m.xpReward,
        progress: um?.progress ?? 0,
        unlockedAt: um?.unlockedAt ?? null,
      };
    });

    // 7. Recent Activities
    const recentActivities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 5,
    });

    // 8. Fetch Current Month's Budget
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month: startOfCurrentMonth,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        displayName: dbUser.name || '',
        email: dbUser.email,
        city: dbUser.profile?.city || '',
        state: dbUser.profile?.state || '',
        country: dbUser.profile?.country || 'India',
        householdSize: dbUser.profile?.householdSize || 1,
        dietType: dbUser.profile?.dietType || 'OMNIVORE',
        commuteMode: dbUser.profile?.commuteMode || 'CAR',
        commuteDistanceKm: dbUser.profile?.commuteDistanceKm || 0,
        electricityUsageKwh: dbUser.profile?.electricityUsageKwh || 0,
        monthlyBudgetKg: budget?.targetKg || 500,
      },
      preferences: {
        carbonUnit: preferences.carbonUnit,
        distanceUnit: preferences.distanceUnit,
        leaderboardVisibility: preferences.leaderboardVisibility,
        showCityOnLeaderboard: preferences.showCityOnLeaderboard,
        showCo2eSavedPublicly: preferences.showCo2eSavedPublicly,
        showStreakPublicly: preferences.showStreakPublicly,
      },
      summary: {
        weeklyCo2eKg,
        monthlyCo2eKg,
        totalCo2eSavedKg: gamification.totalCo2eSavedKg,
        bestCategory,
        categoryBreakdown,
      },
      gamification: {
        level: gamification.level,
        totalXp: gamification.totalXp,
        weeklyXp: gamification.weeklyXp,
        currentStreak: gamification.currentStreak,
        longestStreak: gamification.longestStreak,
      },
      friends: {
        list: friends,
        incoming,
        outgoing,
      },
      goals,
      milestones: milestoneList,
      recentActivities,
    });
  } catch (error) {
    console.error('API Error: GET /api/profile:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;
    const body = await req.json();

    const {
      name,
      city,
      state,
      country,
      householdSize,
      dietType,
      commuteMode,
      commuteDistanceKm,
      electricityUsageKwh,
      monthlyBudgetKg,
    } = body;

    // Update user display name in User table
    if (typeof name === 'string') {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    // Map string values to Prisma Enums
    const dietEnum = dietType ? (dietType.toUpperCase() as DietType) : undefined;
    const commuteEnum = commuteMode ? (commuteMode.toUpperCase() as CommuteMode) : undefined;

    // Update profile
    await prisma.profile.update({
      where: { userId },
      data: {
        city: typeof city === 'string' ? city : undefined,
        state: typeof state === 'string' ? state : undefined,
        country: typeof country === 'string' ? country : undefined,
        householdSize: typeof householdSize === 'number' ? householdSize : undefined,
        dietType: dietEnum,
        commuteMode: commuteEnum,
        commuteDistanceKm: typeof commuteDistanceKm === 'number' ? commuteDistanceKm : undefined,
        electricityUsageKwh: typeof electricityUsageKwh === 'number' ? electricityUsageKwh : undefined,
        onboardingComplete: true,
      },
    });

    // Update monthly carbon target
    if (typeof monthlyBudgetKg === 'number') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      await prisma.budget.upsert({
        where: {
          userId_month: {
            userId,
            month: startOfMonth,
          },
        },
        update: {
          targetKg: monthlyBudgetKg,
        },
        create: {
          userId,
          month: startOfMonth,
          targetKg: monthlyBudgetKg,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Account details updated successfully' });
  } catch (error) {
    console.error('API Error: PATCH /api/profile:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
