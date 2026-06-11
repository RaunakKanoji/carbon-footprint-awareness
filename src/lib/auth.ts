import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function requireAuth(_req?: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user;
}

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return null;
  }

  // Fetch user and profile from Prisma
  let dbUser = await prisma.user.findUnique({
    where: { clerkId },
    include: { profile: true },
  });

  // If the user doesn't exist in our DB yet, we create them lazily
  if (!dbUser) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

    if (!email) {
      throw new Error('User has no email address');
    }

    dbUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });
  }

  return dbUser;
}
