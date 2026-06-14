import { auth, clerkClient } from '@clerk/nextjs/server';

import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

/**
 * Lightweight auth check — only verifies the JWT via auth().
 * Does NOT call clerkClient (avoids an expensive external API round-trip).
 * Use this in API routes that just need to confirm the user is signed in.
 */
export async function requireAuth(_req?: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return { userId };
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

  // If the user doesn't exist in our DB yet, check email fallback or create them lazily
  if (!dbUser) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

    if (!email) {
      throw new Error('User has no email address');
    }

    // Check if the user exists by email (e.g. if the clerkId changed)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      // Link the existing user record to the new clerkId
      dbUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          clerkId,
          name: name || existingUser.name,
        },
        include: { profile: true },
      });
    } else {
      // Create new user and profile
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
  }

  // Ensure a Profile record exists for the user
  if (dbUser && !dbUser.profile) {
    const profile = await prisma.profile.create({
      data: {
        userId: dbUser.id,
      },
    });
    dbUser.profile = profile;
  }

  return dbUser;
}
