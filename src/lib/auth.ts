// src/lib/auth.ts
import { auth, clerkClient } from '@clerk/nextjs/server';

import { NextRequest } from 'next/server';

import { prisma } from '@/src/db/prisma';

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

  let dbUser = await prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      profile: true,
      carbonProfile: true,
      preferences: true,
    },
  });

  if (!dbUser) {
    let clerkUser: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>;

    try {
      const client = await clerkClient();
      clerkUser = await client.users.getUser(clerkId);
    } catch (error) {
      console.error('[auth] Clerk user lookup failed:', {
        clerkId,
        error,
      });

      throw new Error('Could not load Clerk user. Check CLERK_SECRET_KEY and Clerk environment.');
    }

    const email =
      clerkUser.emailAddresses.find(
        (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null;

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      email ||
      'Carbon Compass User';

    if (!email) {
      throw new Error('User has no email address in Clerk.');
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
        carbonProfile: true,
        preferences: true,
      },
    });

    if (existingUser) {
      dbUser = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          clerkId,
          name: existingUser.name ?? name,
        },
        include: {
          profile: true,
          carbonProfile: true,
          preferences: true,
        },
      });
    } else {
      dbUser = await prisma.user.create({
        data: {
          clerkId,
          email,
          name,
          profile: {
            create: {},
          },
          preferences: {
            create: {},
          },
        },
        include: {
          profile: true,
          carbonProfile: true,
          preferences: true,
        },
      });
    }
  }

  if (!dbUser.profile) {
    const profile = await prisma.profile.create({
      data: {
        userId: dbUser.id,
      },
    });

    dbUser.profile = profile;
  }

  if (!dbUser.preferences) {
    const preferences = await prisma.userPreference.create({
      data: {
        userId: dbUser.id,
      },
    });

    dbUser.preferences = preferences;
  }

  return dbUser;
}