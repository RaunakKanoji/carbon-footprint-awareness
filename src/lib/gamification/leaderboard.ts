import { prisma } from '@/src/db/prisma';

interface LeaderboardFilter {
  scope: 'global' | 'local' | 'friends';
  userId: string;
  period?: 'weekly' | 'all_time';
}

export async function getLeaderboard({ scope, userId, period = 'weekly' }: LeaderboardFilter) {
  const thisMonday = new Date();
  const day = thisMonday.getDay();
  const diff = thisMonday.getDate() - day + (day === 0 ? -6 : 1);
  thisMonday.setDate(diff);
  thisMonday.setHours(0, 0, 0, 0);

  // 1. Fetch current user profiles/location
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const city = dbUser?.profile?.city || '';
  const country = dbUser?.profile?.country || '';

  // 2. Determine target user list based on scope
  let userIds: string[] = [];

  if (scope === 'friends') {
    // Fetch accepted friends
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId },
          { receiverId: userId },
        ],
      },
    });

    const friendIds = friendships.map((f) =>
      f.requesterId === userId ? f.receiverId : f.requesterId
    );

    userIds = [userId, ...friendIds];
  } else if (scope === 'local') {
    // Fetch users in same city or country
    const localProfiles = await prisma.profile.findMany({
      where: {
        OR: [
          { city: city || undefined },
          { country: country || undefined },
        ],
      },
      select: { userId: true },
    });

    userIds = Array.from(new Set([userId, ...localProfiles.map((p) => p.userId)]));
  } else {
    // Global scope - fetch all users
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });
    userIds = allUsers.map((u) => u.id);
  }

  // 3. Fetch user names, locations, and gamification records
  const usersWithStats = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    include: {
      profile: true,
      gamification: true,
    },
  });

  // Calculate scores and metrics for each user
  const leaderboardRows = await Promise.all(
    usersWithStats.map(async (user) => {
      const stats = user.gamification;

      // Count completed weekly missions
      const completedMissions = await prisma.missionParticipant.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          completedAt: { gte: thisMonday },
        },
      });

      const weeklyXp = stats?.weeklyXp ?? 0;
      const weeklyCo2eSavedKg = stats?.weeklyCo2eSavedKg ?? 0;
      const streak = stats?.currentStreak ?? 0;

      // impactScore = weeklyXp + co2eSavedKg * 10 + completedMissionCount * 50 + streakBonus;
      const streakBonus = streak >= 3 ? 20 : 0;
      const score = weeklyXp + weeklyCo2eSavedKg * 10 + completedMissions * 50 + streakBonus;

      const totalXp = stats?.totalXp ?? 0;
      const totalCo2eSavedKg = stats?.totalCo2eSavedKg ?? 0;

      return {
        userId: user.id,
        displayName: user.name || user.email.split('@')[0] || 'Eco Tracker',
        city: user.profile?.city || null,
        country: user.profile?.country || null,
        weeklyXp,
        totalXp,
        co2eKg: weeklyCo2eSavedKg,
        co2eSavedKg: weeklyCo2eSavedKg,
        streak,
        completedMissions,
        isCurrentUser: user.id === userId,
        impactScore: score,
        allTimeScore: totalXp + totalCo2eSavedKg * 10,
      };
    })
  );

  // 4. Sort rows by impact score or all-time score
  const isWeekly = period === 'weekly';
  leaderboardRows.sort((a, b) => {
    if (isWeekly) {
      if (b.impactScore !== a.impactScore) {
        return b.impactScore - a.impactScore;
      }
      return b.completedMissions - a.completedMissions;
    } else {
      return b.allTimeScore - a.allTimeScore;
    }
  });

  // 5. Add rank numbers
  return leaderboardRows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}
