import { NextResponse } from 'next/server';

import { getDashboardData } from '@/lib/dashboard';
import { getCurrentUser } from '@/src/lib/auth';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const data = await getDashboardData(dbUser.id);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error: GET /api/dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      },
      { status: 500 },
    );
  }
}
