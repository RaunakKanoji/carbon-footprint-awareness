import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/lib/auth';
import { getLeaderboard } from '@/src/lib/gamification/leaderboard';

export async function GET(req: NextRequest) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get('scope') || 'friends') as 'global' | 'local' | 'friends';
    const period = (searchParams.get('period') || 'weekly') as 'weekly' | 'all_time';

    const rows = await getLeaderboard({
      scope,
      userId: dbUser.id,
      period,
    });

    return NextResponse.json({
      success: true,
      scope,
      period,
      updatedAt: new Date().toISOString(),
      rows,
    });
  } catch (error) {
    console.error('API Error: GET /api/challenges/leaderboard:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
