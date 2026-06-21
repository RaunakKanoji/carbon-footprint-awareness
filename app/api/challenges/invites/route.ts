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

    // Incoming invites (sent to current user)
    const incoming = await prisma.missionInvite.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
        expiresAt: { gte: new Date() },
      },
      include: {
        mission: true,
        sender: true,
      },
    });

    // Outgoing invites (sent by current user)
    const outgoing = await prisma.missionInvite.findMany({
      where: {
        senderId: userId,
        status: 'PENDING',
        expiresAt: { gte: new Date() },
      },
      include: {
        mission: true,
        receiver: true,
      },
    });

    return NextResponse.json({
      success: true,
      incoming: incoming.map((inv) => ({
        id: inv.id,
        missionId: inv.missionId,
        title: inv.mission.title,
        description: inv.mission.description,
        category: inv.mission.category,
        xpReward: inv.mission.xpReward,
        senderName: inv.sender.name || inv.sender.email.split('@')[0],
        senderEmail: inv.sender.email,
        createdAt: inv.createdAt,
      })),
      outgoing: outgoing.map((inv) => ({
        id: inv.id,
        missionId: inv.missionId,
        title: inv.mission.title,
        receiverName: inv.receiver?.name || inv.receiver?.email.split('@')[0] || inv.receiverEmail || 'Pending invitee',
        receiverEmail: inv.receiver?.email || inv.receiverEmail,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error('API Error: GET /api/challenges/invites:', error);
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
    const { inviteId, action } = body;

    if (!inviteId || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid invite ID or action' }, { status: 400 });
    }

    const invite = await prisma.missionInvite.findUnique({
      where: { id: inviteId },
      include: { mission: true },
    });

    if (!invite || invite.receiverId !== userId) {
      return NextResponse.json({ success: false, error: 'Invite not found or access denied' }, { status: 404 });
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Invite is no longer pending' }, { status: 400 });
    }

    if (action === 'accept') {
      // Update invite status
      await prisma.missionInvite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED' },
      });

      // Join the user to the mission
      await prisma.missionParticipant.upsert({
        where: {
          missionId_userId: {
            missionId: invite.missionId,
            userId,
          },
        },
        update: {
          status: 'ACTIVE',
        },
        create: {
          missionId: invite.missionId,
          userId,
          progress: 0,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({ success: true, message: 'Invite accepted successfully' });
    } else {
      // Decline invite
      await prisma.missionInvite.update({
        where: { id: inviteId },
        data: { status: 'DECLINED' },
      });

      return NextResponse.json({ success: true, message: 'Invite declined successfully' });
    }
  } catch (error) {
    console.error('API Error: POST /api/challenges/invites:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
