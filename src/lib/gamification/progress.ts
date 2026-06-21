import { prisma } from '@/src/db/prisma';
import {
  ActivityCategory,
  ActivityLog,
  XpSource,
  MissionParticipantStatus,
  GoalStatus,
} from '@/src/generated/prisma';
import { awardXp } from './xp';

/**
 * Calculates current streak and calendar stats for a user based on activity log history
 */
export async function updateStreakAndSavings(userId: string) {
  const logs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    select: { occurredAt: true, co2eKg: true },
  });

  const gamification = await prisma.userGamification.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  // Calculate streak days
  const loggedDates = Array.from(
    new Set(
      logs.map((log) => {
        const date = new Date(log.occurredAt);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      })
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date();
  const getFormattedDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getFormattedDate(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getFormattedDate(yesterday);

  const loggedToday = loggedDates.includes(todayStr);
  const loggedYesterday = loggedDates.includes(yesterdayStr);

  let currentStreak = 0;

  if (loggedToday || loggedYesterday) {
    const checkDate = loggedToday ? new Date(today) : new Date(yesterday);
    let checkStr = getFormattedDate(checkDate);

    while (loggedDates.includes(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getFormattedDate(checkDate);
    }
  }

  const newLongestStreak = Math.max(gamification.longestStreak, currentStreak);

  // If user hits streak milestones, award bonus XP!
  if (currentStreak >= 3 && gamification.currentStreak < 3) {
    await awardXp({
      userId,
      source: XpSource.STREAK,
      sourceId: `streak_3_day_${todayStr}`,
      xpAmount: 50,
      reason: '3-day logging streak!',
    });
  }

  if (currentStreak >= 7 && gamification.currentStreak < 7) {
    await awardXp({
      userId,
      source: XpSource.STREAK,
      sourceId: `streak_7_day_${todayStr}`,
      xpAmount: 150,
      reason: '7-day logging streak!',
    });
  }

  if (currentStreak >= 30 && gamification.currentStreak < 30) {
    await awardXp({
      userId,
      source: XpSource.STREAK,
      sourceId: `streak_30_day_${todayStr}`,
      xpAmount: 750,
      reason: '30-day logging streak!',
    });
  }

  // Recalculate estimated CO2e saved from persisted activity data. A 25 kg
  // weekly baseline is used consistently so repeated updates remain idempotent.
  const weeklyBaselineKg = 25;
  const thisMonday = new Date();
  const day = thisMonday.getDay();
  const diff = thisMonday.getDate() - day + (day === 0 ? -6 : 1);
  thisMonday.setDate(diff);
  thisMonday.setHours(0, 0, 0, 0);

  let thisWeekCo2 = 0;
  const emissionsByWeek = new Map<string, number>();

  for (const log of logs) {
    const logDate = new Date(log.occurredAt);
    if (logDate >= thisMonday) {
      thisWeekCo2 += log.co2eKg;
    }

    const weekStart = new Date(logDate);
    const weekDay = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - weekDay + (weekDay === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString();
    emissionsByWeek.set(weekKey, (emissionsByWeek.get(weekKey) ?? 0) + log.co2eKg);
  }

  const weeklyCo2eSavedKg =
    logs.some((log) => new Date(log.occurredAt) >= thisMonday)
      ? Math.max(0, weeklyBaselineKg - thisWeekCo2)
      : 0;
  const totalCo2eSavedKg = Array.from(emissionsByWeek.values()).reduce(
    (total, emissions) => total + Math.max(0, weeklyBaselineKg - emissions),
    0,
  );

  await prisma.userGamification.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak: newLongestStreak,
      weeklyCo2eSavedKg,
      totalCo2eSavedKg,
    },
  });
}

/**
 * Checks and auto-enrolls user in currently active WEEKLY missions templates
 */
async function autoEnrollWeeklyMissions(userId: string) {
  const now = new Date();
  const activeWeeklyTemplates = await prisma.mission.findMany({
    where: {
      isTemplate: true,
      missionType: 'WEEKLY',
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
  });

  for (const template of activeWeeklyTemplates) {
    const participant = await prisma.missionParticipant.findUnique({
      where: {
        missionId_userId: {
          missionId: template.id,
          userId,
        },
      },
    });

    if (!participant) {
      await prisma.missionParticipant.create({
        data: {
          missionId: template.id,
          userId,
          progress: 0,
          status: 'ACTIVE',
        },
      });
    }
  }
}

/**
 * Handles evaluation of missions, goals, milestones and streaks when a new activity log is generated
 */
export async function handleNewActivityLog(log: ActivityLog) {
  const userId = log.userId;

  // 1. Ensure user has UserGamification record and award base XP
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

  // Award base log XP (+10 XP)
  await awardXp({
    userId,
    source: XpSource.ACTIVITY_LOG,
    sourceId: log.id,
    xpAmount: 10,
    reason: `Logged activity: ${log.subType}`,
  });

  // Auto enroll user in active weekly missions so they track immediately
  await autoEnrollWeeklyMissions(userId);

  // 2. Evaluate weekly & friend missions
  const now = new Date();
  const activeParticipants = await prisma.missionParticipant.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      mission: {
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    },
    include: { mission: true },
  });

  for (const participant of activeParticipants) {
    const mission = participant.mission;
    let qualifies = false;

    // Evaluate heuristics for contribution
    if (mission.category === log.category) {
      if (mission.category === ActivityCategory.FOOD) {
        // Plant-based meal check
        const subTypeLower = log.subType.toLowerCase();
        if (subTypeLower.includes('vegan') || subTypeLower.includes('vegetarian')) {
          qualifies = true;
        }
      } else if (mission.category === ActivityCategory.TRANSPORT) {
        // Low-carbon transport check
        const subTypeLower = log.subType.toLowerCase();
        if (['bus', 'metro', 'train', 'bicycle', 'walking'].includes(subTypeLower)) {
          qualifies = true;
        }
      } else {
        qualifies = true;
      }
    }

    if (qualifies) {
      const newProgress = Math.min(mission.targetValue, participant.progress + 1);
      const isCompleted = newProgress >= mission.targetValue;

      await prisma.missionParticipant.update({
        where: { id: participant.id },
        data: {
          progress: newProgress,
          status: isCompleted ? MissionParticipantStatus.COMPLETED : MissionParticipantStatus.ACTIVE,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted && participant.status !== 'COMPLETED') {
        await awardXp({
          userId,
          source: XpSource.MISSION,
          sourceId: mission.id,
          xpAmount: mission.xpReward,
          reason: `Completed mission: ${mission.title}`,
        });
      }
    }
  }

  // 3. Evaluate personal goals
  const activeGoals = await prisma.goal.findMany({
    where: {
      userId,
      status: GoalStatus.ACTIVE,
      endsAt: { gte: now },
    },
  });

  for (const goal of activeGoals) {
    let qualifies = false;

    if (goal.category === log.category || goal.category === ActivityCategory.OTHER) {
      qualifies = true;
    }

    if (qualifies) {
      const increment = goal.metric === 'CO2E_REDUCTION' ? Math.max(0.1, 10 - log.co2eKg) : 1;
      const newProgress = Math.min(goal.targetValue, goal.currentValue + increment);
      const isCompleted = newProgress >= goal.targetValue;

      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          currentValue: newProgress,
          status: isCompleted ? GoalStatus.COMPLETED : GoalStatus.ACTIVE,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted) {
        await awardXp({
          userId,
          source: XpSource.GOAL,
          sourceId: goal.id,
          xpAmount: goal.xpReward,
          reason: `Completed goal: ${goal.title}`,
        });
      }
    }
  }

  // 4. Update logging streaks and carbon savings
  await updateStreakAndSavings(userId);

  // 5. Evaluate Milestones
  await checkAndUnlockMilestones(userId);
}

/**
 * Scans user statistics to unlock long-term milestone achievements
 */
export async function checkAndUnlockMilestones(userId: string) {
  const milestones = await prisma.milestone.findMany();

  const totalLogs = await prisma.activityLog.count({
    where: { userId },
  });

  const gamification = await prisma.userGamification.findUnique({
    where: { userId },
  });

  const bestStreak = gamification?.longestStreak ?? 0;
  const totalCo2Saved = gamification?.totalCo2eSavedKg ?? 0;

  const completedFriendMissions = await prisma.missionParticipant.count({
    where: {
      userId,
      status: MissionParticipantStatus.COMPLETED,
      mission: {
        missionType: 'FRIEND',
      },
    },
  });

  for (const milestone of milestones) {
    const userMilestone = await prisma.userMilestone.findUnique({
      where: {
        userId_milestoneId: {
          userId,
          milestoneId: milestone.id,
        },
      },
    });

    if (userMilestone?.unlockedAt) {
      continue; // already unlocked
    }

    let progressValue = 0;

    switch (milestone.targetMetric) {
      case 'TOTAL_LOGS':
        progressValue = totalLogs;
        break;
      case 'STREAK_DAYS':
        progressValue = bestStreak;
        break;
      case 'CO2E_SAVED':
        progressValue = totalCo2Saved;
        break;
      case 'FRIEND_MISSIONS':
        progressValue = completedFriendMissions;
        break;
      default:
        progressValue = 0;
    }

    const isUnlocked = progressValue >= milestone.targetValue;

    await prisma.userMilestone.upsert({
      where: {
        userId_milestoneId: {
          userId,
          milestoneId: milestone.id,
        },
      },
      update: {
        progress: Math.min(milestone.targetValue, progressValue),
        unlockedAt: isUnlocked ? new Date() : null,
      },
      create: {
        userId,
        milestoneId: milestone.id,
        progress: Math.min(milestone.targetValue, progressValue),
        unlockedAt: isUnlocked ? new Date() : null,
      },
    });

    if (isUnlocked) {
      await awardXp({
        userId,
        source: XpSource.MILESTONE,
        sourceId: milestone.id,
        xpAmount: milestone.xpReward,
        reason: `Unlocked milestone: ${milestone.title}`,
      });
    }
  }
}
