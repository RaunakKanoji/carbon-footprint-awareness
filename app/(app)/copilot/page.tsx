import React from 'react';

import { redirect } from 'next/navigation';

import CopilotClient from '@/app/(app)/copilot/CopilotClient';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export default async function AiCopilotPage() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect('/sign-in');
  }

  if (!dbUser.profile?.onboardingComplete) {
    redirect('/onboarding');
  }

  // Load all past conversations of this user
  const conversations = await prisma.conversation.findMany({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Load messages of the most recent conversation if it exists
  let initialMessages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }> = [];

  const latestConversation = conversations[0];
  if (latestConversation) {
    const messages = await prisma.conversationMessage.findMany({
      where: {
        conversationId: latestConversation.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    initialMessages = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  // Serialize models for hydration safety
  const serializedConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title || 'Discussion Thread',
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <CopilotClient
      initialConversations={serializedConversations}
      initialMessages={initialMessages}
      initialActiveId={latestConversation?.id || null}
    />
  );
}
