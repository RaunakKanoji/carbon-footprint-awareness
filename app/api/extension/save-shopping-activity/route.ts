import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import { Prisma } from '@/src/generated/prisma';

function addCorsHeaders(res: NextResponse, req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && (origin.startsWith('chrome-extension://') || origin.includes('localhost:') || origin.includes('127.0.0.1:'))) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return addCorsHeaders(res, req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, estimate, selectedAlternative } = body;

    if (!cart || !estimate) {
      const res = NextResponse.json({ success: false, error: 'Invalid cart or estimate data' }, { status: 400 });
      return addCorsHeaders(res, req);
    }

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
      const res = NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(res, req);
    }

    const productCount = cart.products ? cart.products.length : 1;
    const totalCo2e = Number(estimate.totalCo2eKg) || 0;

    const activity = await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        category: 'SHOPPING',
        subType: 'ecommerce_cart',
        activityType: 'ecommerce_cart',
        quantity: productCount,
        unit: 'items',
        co2eKg: totalCo2e,
        provider: 'INTERNAL',
        confidence: estimate.confidence || 'MEDIUM',
        fallbackUsed: true,
        calculationMethod: 'extension_cart_estimation',
        note: `Saved from Chrome extension: ${cart.storeDomain || 'online store'}`,
        sourcePayload: {
          cart,
          estimate,
          selectedAlternative,
        } as Prisma.InputJsonValue,
        sourceResponse: { success: true } as Prisma.InputJsonValue,
      },
    });

    // Handle gamification progress (streaks, xp, milestones)
    await handleNewActivityLog(activity);

    const res = NextResponse.json({
      success: true,
      activityId: activity.id,
      message: 'Shopping activity logged successfully',
    });
    return addCorsHeaders(res, req);
  } catch (error) {
    console.error('Error in POST /api/extension/save-shopping-activity:', error);
    const res = NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    return addCorsHeaders(res, req);
  }
}
