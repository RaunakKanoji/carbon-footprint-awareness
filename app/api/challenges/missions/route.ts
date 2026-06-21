import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';
import { ActivityCategory } from '@/src/generated/prisma';

export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = dbUser.id;
    const now = new Date();

    // 1. Fetch active templates running this week
    const templates = await prisma.mission.findMany({
      where: {
        isTemplate: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    });

    // 2. Fetch friend missions this user is in
    const participantEntries = await prisma.missionParticipant.findMany({
      where: {
        userId,
        mission: {
          endsAt: { gte: now },
        },
      },
      include: {
        mission: {
          include: {
            participants: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const missionsList = [];

    // Map template progress
    for (const template of templates) {
      const p = await prisma.missionParticipant.findUnique({
        where: {
          missionId_userId: {
            missionId: template.id,
            userId,
          },
        },
      });

      missionsList.push({
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        missionType: template.missionType,
        targetValue: template.targetValue,
        xpReward: template.xpReward,
        estimatedCo2eImpactKg: template.estimatedCo2eImpactKg,
        endsAt: template.endsAt,
        progress: p?.progress ?? 0,
        status: p?.status ?? 'NOT_STARTED',
        completedAt: p?.completedAt ?? null,
      });
    }

    // Map friend missions progress
    for (const p of participantEntries) {
      const m = p.mission;
      if (m.isTemplate) continue; // already covered in templates

      missionsList.push({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        missionType: m.missionType,
        targetValue: m.targetValue,
        xpReward: m.xpReward,
        estimatedCo2eImpactKg: m.estimatedCo2eImpactKg,
        endsAt: m.endsAt,
        progress: p.progress,
        status: p.status,
        completedAt: p.completedAt,
        participants: m.participants.map((part) => ({
          userId: part.user.id,
          name: part.user.name || part.user.email.split('@')[0],
          progress: part.progress,
          status: part.status,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      missions: missionsList,
    });
  } catch (error) {
    console.error('API Error: GET /api/challenges/missions:', error);
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

    // Action 1: Join a weekly mission template
    if (action === 'join_template') {
      const { templateId } = body;
      if (!templateId) {
        return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
      }

      // Check if template exists
      const template = await prisma.mission.findUnique({
        where: { id: templateId },
      });

      if (!template || !template.isTemplate) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }

      // Join user to mission
      const participant = await prisma.missionParticipant.upsert({
        where: {
          missionId_userId: {
            missionId: templateId,
            userId,
          },
        },
        update: {
          status: 'ACTIVE',
        },
        create: {
          missionId: templateId,
          userId,
          progress: 0,
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({ success: true, participant });
    }

    // Action 2: Create a multiplayer Friend Mission and send invites
    if (action === 'create_friend_mission') {
      const { title, description, category, targetValue, xpReward, inviteeIds } = body;

      if (!title || !category || !targetValue) {
        return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
      }

      const thisMonday = new Date();
      const day = thisMonday.getDay();
      const diff = thisMonday.getDate() - day + (day === 0 ? -6 : 1);
      thisMonday.setDate(diff);
      thisMonday.setHours(0, 0, 0, 0);

      const nextSunday = new Date(thisMonday);
      nextSunday.setDate(nextSunday.getDate() + 7);
      nextSunday.setHours(23, 59, 59, 999);

      // Create new Friend Mission
      const mission = await prisma.mission.create({
        data: {
          title,
          description: description || `Track ${title} as a group!`,
          category: category as ActivityCategory,
          missionType: 'FRIEND',
          targetMetric: 'ACTIVITY_COUNT',
          targetValue: Number(targetValue),
          xpReward: Number(xpReward) || 200,
          startsAt: thisMonday,
          endsAt: nextSunday,
          isTemplate: false,
        },
      });

      // Add creator as active participant
      await prisma.missionParticipant.create({
        data: {
          missionId: mission.id,
          userId,
          progress: 0,
          status: 'ACTIVE',
        },
      });

      // Send invites to friends
      if (Array.isArray(inviteeIds)) {
        for (const friendId of inviteeIds) {
          await prisma.missionInvite.create({
            data: {
              missionId: mission.id,
              senderId: userId,
              receiverId: friendId,
              status: 'PENDING',
              expiresAt: nextSunday,
            },
          });
        }
      }

      return NextResponse.json({ success: true, missionId: mission.id });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Error: POST /api/challenges/missions:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
