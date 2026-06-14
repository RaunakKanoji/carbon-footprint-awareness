import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;

    // Delete the conversation only if it belongs to the user (messages will cascade delete)
    const deleteResult = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userId: dbUser.id,
      },
    });

    if (deleteResult.count === 0) {
      // Check if conversation exists at all to return precise client error
      const exists = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (exists) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized deletion request' },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error: DELETE /api/copilot/conversations/[conversationId]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
