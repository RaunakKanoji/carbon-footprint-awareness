import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { LeaderboardVisibility } from '@/src/generated/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;
    const body = await req.json();

    const {
      carbonUnit,
      distanceUnit,
      leaderboardVisibility,
      showCityOnLeaderboard,
      showCo2eSavedPublicly,
      showStreakPublicly,
    } = body;

    const updateData: {
      carbonUnit?: string;
      distanceUnit?: string;
      leaderboardVisibility?: LeaderboardVisibility;
      showCityOnLeaderboard?: boolean;
      showCo2eSavedPublicly?: boolean;
      showStreakPublicly?: boolean;
    } = {};

    if (typeof carbonUnit === 'string') updateData.carbonUnit = carbonUnit;
    if (typeof distanceUnit === 'string') updateData.distanceUnit = distanceUnit;
    if (typeof leaderboardVisibility === 'string') {
      updateData.leaderboardVisibility = leaderboardVisibility.toUpperCase() as LeaderboardVisibility;
    }
    if (typeof showCityOnLeaderboard === 'boolean') updateData.showCityOnLeaderboard = showCityOnLeaderboard;
    if (typeof showCo2eSavedPublicly === 'boolean') updateData.showCo2eSavedPublicly = showCo2eSavedPublicly;
    if (typeof showStreakPublicly === 'boolean') updateData.showStreakPublicly = showStreakPublicly;

    await prisma.userPreference.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('API Error: PATCH /api/profile/preferences:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
