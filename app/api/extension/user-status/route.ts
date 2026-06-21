import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';

function addCorsHeaders(res: NextResponse, req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && (origin.startsWith('chrome-extension://') || origin.includes('localhost:') || origin.includes('127.0.0.1:'))) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return addCorsHeaders(res, req);
}

export async function GET(req: NextRequest) {
  try {
    let dbUser = await getCurrentUser();

    // If no active Clerk session in same-origin cookies, check for custom header
    if (!dbUser) {
      const headerUserId = req.headers.get('x-user-id');
      if (headerUserId) {
        dbUser = await prisma.user.findUnique({
          where: { id: headerUserId },
          include: { 
            profile: true,
            preferences: true,
            carbonProfile: true,
          },
        });
      }
    }

    if (!dbUser) {
      const res = NextResponse.json({ success: false, error: 'Unauthorized', clerkId: null }, { status: 401 });
      return addCorsHeaders(res, req);
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        name: dbUser.name || dbUser.email.split('@')[0],
      },
    });
    return addCorsHeaders(res, req);
  } catch (error) {
    console.error('Error in GET /api/extension/user-status:', error);
    const res = NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    return addCorsHeaders(res, req);
  }
}
