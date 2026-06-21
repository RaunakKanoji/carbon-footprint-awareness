import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/src/lib/auth';
import { DashboardPeriod, getDashboardData } from '@/src/server/dashboard/dashboard.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const periods = new Set<DashboardPeriod>(['day', 'week', 'month']);

export async function GET(request: NextRequest) {
  try {
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
          },
        },
        { status: 401 },
      );
    }

    const requestedPeriod = request.nextUrl.searchParams.get('period') as DashboardPeriod | null;
    const period = requestedPeriod && periods.has(requestedPeriod) ? requestedPeriod : 'week';

    const data = await getDashboardData(dbUser.id, period);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('API Error: GET /api/dashboard:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 },
    );
  }
}