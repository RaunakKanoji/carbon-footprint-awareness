export interface ActivityLogLite {
  id: string;
  category: string;
  subType: string;
  occurredAt: string;
  co2eKg: number;
}

export interface MissionProgress {
  id: string;
  title: string;
  category: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  xpReward: number;
  completed: boolean;
}

export interface BadgeProgress {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockCondition: string;
  unlocked: boolean;
}

export const XP_RULES = {
  logActivity: 10,
  completeMission: 50,
  maintainDailyStreak: 15,
  reduceWeeklyFootprint: 75,
  completeWeeklyReview: 30
} as const;

export const LEVELS = [
  {
    level: 1,
    title: "New Explorer",
    minXp: 0,
    maxXp: 99,
    description: "Started tracking daily impact."
  },
  {
    level: 2,
    title: "Habit Builder",
    minXp: 100,
    maxXp: 249,
    description: "Building consistency with everyday logging."
  },
  {
    level: 3,
    title: "Impact Reducer",
    minXp: 250,
    maxXp: 499,
    description: "Making visible improvements across lifestyle categories."
  },
  {
    level: 4,
    title: "Carbon Strategist",
    minXp: 500,
    maxXp: 899,
    description: "Using insights and missions to make smarter choices."
  },
  {
    level: 5,
    title: "Climate Leader",
    minXp: 900,
    maxXp: Infinity,
    description: "Consistently reducing impact and leading by example."
  }
] as const;

export function getStreakStats(logs: ActivityLogLite[]) {
  if (logs.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      loggedToday: false,
      loggedYesterday: false,
      weekCalendar: [false, false, false, false, false, false, false]
    };
  }

  // Get unique local dates (YYYY-MM-DD) where user logged at least one activity
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
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending (newest first)

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
  let bestStreak = 0;

  if (loggedToday || loggedYesterday) {
    const checkDate = loggedToday ? new Date(today) : new Date(yesterday);
    let checkStr = getFormattedDate(checkDate);

    while (loggedDates.includes(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getFormattedDate(checkDate);
    }
  }

  let tempStreak = 0;
  let lastDate: Date | null = null;
  const ascendingDates = [...loggedDates].reverse();

  for (const dateStr of ascendingDates) {
    const currentDate = new Date(dateStr);
    currentDate.setHours(0,0,0,0);
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    lastDate = currentDate;
  }
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }

  // Week calendar statuses (Mon-Sun)
  const startOfWeek = new Date();
  const day = startOfWeek.getDay(); // 0 is Sun, 1 is Mon...
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekCalendar = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return loggedDates.includes(getFormattedDate(d));
  });

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, bestStreak),
    loggedToday,
    loggedYesterday,
    weekCalendar
  };
}

export function getWeeklyFootprintStats(logs: ActivityLogLite[]) {
  const thisMonday = new Date();
  const day = thisMonday.getDay();
  const diff = thisMonday.getDate() - day + (day === 0 ? -6 : 1);
  thisMonday.setDate(diff);
  thisMonday.setHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  let thisWeekCo2 = 0;
  let lastWeekCo2 = 0;

  for (const log of logs) {
    const logDate = new Date(log.occurredAt);
    if (logDate >= thisMonday) {
      thisWeekCo2 += log.co2eKg;
    } else if (logDate >= lastMonday && logDate < thisMonday) {
      lastWeekCo2 += log.co2eKg;
    }
  }

  let reductionPercent = 12; // default fallback if no last week logs
  if (lastWeekCo2 > 0) {
    const diffCo2 = lastWeekCo2 - thisWeekCo2;
    reductionPercent = Math.max(0, Math.round((diffCo2 / lastWeekCo2) * 100));
  } else if (thisWeekCo2 > 0) {
    reductionPercent = 8;
  }

  return { thisWeekCo2, lastWeekCo2, reductionPercent };
}

export function getWeeklyMissions(logs: ActivityLogLite[]): MissionProgress[] {
  const thisMonday = new Date();
  const day = thisMonday.getDay();
  const diff = thisMonday.getDate() - day + (day === 0 ? -6 : 1);
  thisMonday.setDate(diff);
  thisMonday.setHours(0, 0, 0, 0);

  const weeklyLogs = logs.filter((log) => new Date(log.occurredAt) >= thisMonday);

  const foodLogs = weeklyLogs.filter((log) => log.category.toUpperCase() === 'FOOD');
  const foodCount = foodLogs.length;

  const cleanTransportLogs = weeklyLogs.filter((log) => 
    log.category.toUpperCase() === 'TRANSPORT' &&
    ['walking', 'bicycle', 'bus', 'metro', 'train', 'ship', 'ferry', 'electriccar', 'hybridcar', 'cngcar'].includes(log.subType.toLowerCase())
  );
  const transportCount = cleanTransportLogs.length;

  const energyLogs = weeklyLogs.filter((log) => 
    ['ENERGY', 'ELECTRICITY'].includes(log.category.toUpperCase())
  );
  const energyCount = energyLogs.length;

  const shoppingLogs = weeklyLogs.filter((log) => 
    ['SHOPPING', 'PRODUCT', 'MATERIAL'].includes(log.category.toUpperCase())
  );
  const shoppingCount = shoppingLogs.length;

  const wasteLogs = weeklyLogs.filter((log) => 
    ['WASTE', 'RECYCLING'].includes(log.category.toUpperCase())
  );
  const wasteCount = wasteLogs.length;

  return [
    {
      id: "mission_food_low_impact",
      title: "Low-impact meal day",
      category: "Food",
      description: "Log one vegetarian, vegan, or low-impact meal today.",
      current: Math.min(1, foodCount),
      target: 1,
      unit: "meal",
      xpReward: 50,
      completed: foodCount >= 1
    },
    {
      id: "mission_transport_short_trip",
      title: "Choose a cleaner short trip",
      category: "Transport",
      description: "Walk, cycle, or use public transport for one short trip.",
      current: Math.min(1, transportCount),
      target: 1,
      unit: "trip",
      xpReward: 50,
      completed: transportCount >= 1
    },
    {
      id: "mission_energy_check",
      title: "Energy awareness check",
      category: "Energy",
      description: "Log your electricity or household energy usage once this week.",
      current: Math.min(1, energyCount),
      target: 1,
      unit: "log",
      xpReward: 50,
      completed: energyCount >= 1
    },
    {
      id: "mission_shopping_mindful",
      title: "Mindful purchase",
      category: "Shopping",
      description: "Log one product and check its estimated footprint before buying again.",
      current: Math.min(1, shoppingCount),
      target: 1,
      unit: "product",
      xpReward: 50,
      completed: shoppingCount >= 1
    },
    {
      id: "mission_waste_better_disposal",
      title: "Better waste choice",
      category: "Waste",
      description: "Log one recycled, reused, composted, or properly separated waste item.",
      current: Math.min(1, wasteCount),
      target: 1,
      unit: "action",
      xpReward: 50,
      completed: wasteCount >= 1
    }
  ];
}

export function getBadges(
  logs: ActivityLogLite[],
  currentStreak: number,
  bestStreak: number,
  weeklyReductionPercent: number
): BadgeProgress[] {
  const totalLogs = logs.length;
  const foodLogsCount = logs.filter((log) => log.category.toUpperCase() === 'FOOD').length;
  
  const lowCarbonTransportCount = logs.filter((log) => 
    log.category.toUpperCase() === 'TRANSPORT' &&
    ['walking', 'bicycle', 'bus', 'metro', 'train', 'ship', 'ferry', 'electriccar', 'hybridcar', 'cngcar'].includes(log.subType.toLowerCase())
  ).length;

  return [
    {
      id: "badge_first_log",
      title: "First Log",
      description: "Logged your first carbon activity.",
      icon: "Sparkles",
      unlockCondition: "Complete one activity log.",
      unlocked: totalLogs >= 1
    },
    {
      id: "badge_three_day_streak",
      title: "3-Day Streak",
      description: "Logged activities for 3 days in a row.",
      icon: "Flame",
      unlockCondition: "Maintain a 3-day logging streak.",
      unlocked: Math.max(currentStreak, bestStreak) >= 3
    },
    {
      id: "badge_food_awareness",
      title: "Food Aware",
      description: "Logged 5 food activities.",
      icon: "Leaf",
      unlockCondition: "Log 5 food activities.",
      unlocked: foodLogsCount >= 5
    },
    {
      id: "badge_clean_commuter",
      title: "Clean Commuter",
      description: "Logged 3 low-carbon transport choices.",
      icon: "Bike",
      unlockCondition: "Log 3 walking, cycling, public transport, or electric trips.",
      unlocked: lowCarbonTransportCount >= 3
    },
    {
      id: "badge_weekly_reducer",
      title: "Weekly Reducer",
      description: "Reduced your weekly footprint compared to the previous week.",
      icon: "TrendingDown",
      unlockCondition: "Weekly footprint is lower than last week.",
      unlocked: weeklyReductionPercent > 0 && totalLogs >= 1
    }
  ];
}

export function getLevelInfo(totalXp: number) {
  const level = LEVELS.find((l) => totalXp >= l.minXp && totalXp <= l.maxXp) || LEVELS[LEVELS.length - 1]!;
  const currentLevelProgress = totalXp - level.minXp;
  const levelRange = level.maxXp === Infinity ? 1000 : (level.maxXp - level.minXp + 1);
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / levelRange) * 100));
  const pointsToNextLevel = level.maxXp === Infinity ? 0 : (level.maxXp + 1 - totalXp);

  return {
    currentLevel: level.level,
    currentTitle: level.title,
    currentXp: totalXp,
    levelRange,
    progressPercent,
    pointsToNextLevel
  };
}

export function calculateUserXp(
  activityLogs: ActivityLogLite[],
  completedMissionsCount: number,
  completedChallengesPoints: number,
  currentStreak: number,
  weeklyReductionPercent: number
): number {
  const logsXp = activityLogs.length * XP_RULES.logActivity;
  const missionsXp = completedMissionsCount * XP_RULES.completeMission;
  const streakBonus = currentStreak >= 3 ? XP_RULES.maintainDailyStreak : 0;
  const reductionBonus = weeklyReductionPercent >= 10 ? XP_RULES.reduceWeeklyFootprint : 0;
  return 100 + logsXp + missionsXp + streakBonus + reductionBonus + completedChallengesPoints;
}

