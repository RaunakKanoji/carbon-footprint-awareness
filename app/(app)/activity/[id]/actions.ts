'use server';

import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/src/lib/auth';
import { prisma } from '@/src/db/prisma';

export async function deleteActivity(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  await prisma.activityLog.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  redirect('/log');
}