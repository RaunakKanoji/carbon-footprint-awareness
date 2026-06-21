import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;

    // 1. Fetch accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId },
          { receiverId: userId },
        ],
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

    const friendsList = friendships.map((f) => {
      const friend = f.requesterId === userId ? f.receiver : f.requester;
      return {
        id: friend.id,
        name: friend.name || friend.email.split('@')[0],
        email: friend.email,
        city: friend.profile?.city || null,
        level: friend.gamification?.level ?? 1,
        weeklyXp: friend.gamification?.weeklyXp ?? 0,
        streak: friend.gamification?.currentStreak ?? 0,
      };
    });

    // 2. Fetch pending incoming requests
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

    // 3. Fetch pending outgoing requests
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

    return NextResponse.json({
      success: true,
      friends: friendsList,
      incoming,
      outgoing,
    });
  } catch (error) {
    console.error('API Error: GET /api/friends:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;
    const body = await req.json();
    const { action } = body;

    // Search users in the app
    if (action === 'search') {
      const { query } = body;
      if (!query || query.trim() === '') {
        return NextResponse.json({ success: true, users: [] });
      }

      const users = await prisma.user.findMany({
        where: {
          id: { not: userId },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: { city: true, country: true },
          },
        },
        take: 10,
      });

      return NextResponse.json({
        success: true,
        users: users.map((u) => ({
          id: u.id,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          city: u.profile?.city || null,
        })),
      });
    }

    // Send a friend request
    if (action === 'send_request') {
      const { friendId, friendEmail } = body;
      let targetFriendId = friendId;

      if (!targetFriendId && friendEmail) {
        // Look up by email
        const targetUser = await prisma.user.findUnique({
          where: { email: friendEmail },
        });

        if (!targetUser) {
          return NextResponse.json({ success: false, error: 'User with this email not found' }, { status: 404 });
        }

        targetFriendId = targetUser.id;
      }

      if (!targetFriendId) {
        return NextResponse.json({ success: false, error: 'Friend ID or email required' }, { status: 400 });
      }

      if (targetFriendId === userId) {
        return NextResponse.json({ success: false, error: 'Cannot add yourself as a friend' }, { status: 400 });
      }

      // Check if friendship already exists
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: userId, receiverId: targetFriendId },
            { requesterId: targetFriendId, receiverId: userId },
          ],
        },
      });

      if (existing) {
        return NextResponse.json({
          success: false,
          error: `Friendship or request already exists (Status: ${existing.status})`,
        }, { status: 400 });
      }

      const request = await prisma.friendship.create({
        data: {
          requesterId: userId,
          receiverId: targetFriendId,
          status: 'PENDING',
        },
      });

      return NextResponse.json({ success: true, request });
    }

    // Accept or decline friend request
    if (action === 'respond') {
      const { friendshipId, accept } = body;

      if (!friendshipId) {
        return NextResponse.json({ success: false, error: 'Friendship ID is required' }, { status: 400 });
      }

      const friendship = await prisma.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship || friendship.receiverId !== userId) {
        return NextResponse.json({ success: false, error: 'Friend request not found or access denied' }, { status: 404 });
      }

      if (accept) {
        await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'ACCEPTED' },
        });

        // Initialize UserGamification stats for the new friend if missing
        const reqGamification = await prisma.userGamification.findUnique({
          where: { userId: friendship.requesterId },
        });

        if (!reqGamification) {
          await prisma.userGamification.create({
            data: {
              userId: friendship.requesterId,
              totalXp: 100,
              level: 1,
            },
          });
        }

        return NextResponse.json({ success: true, message: 'Friend request accepted' });
      } else {
        await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'DECLINED' },
        });

        return NextResponse.json({ success: true, message: 'Friend request declined' });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Error: POST /api/friends:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
