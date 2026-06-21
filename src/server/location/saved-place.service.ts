import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';

export async function createSavedPlace(input: {
  userId: string;
  label: string;
  name?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  source: string;
  metadata?: Record<string, unknown> | null;
}) {
  return prisma.savedPlace.create({
    data: {
      userId: input.userId,
      label: input.label,
      name: input.name,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      source: input.source,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listSavedPlaces(userId: string) {
  return prisma.savedPlace.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function updateSavedPlace(
  userId: string,
  placeId: string,
  input: Partial<{
    label: string;
    name: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    source: string;
    metadata: Record<string, unknown> | null;
  }>,
) {
  const place = await prisma.savedPlace.findFirst({
    where: { id: placeId, userId },
  });

  if (!place) {
    throw new Error('Place not found or unauthorized');
  }

  return prisma.savedPlace.update({
    where: { id: placeId },
    data: {
      label: input.label,
      name: input.name,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      source: input.source,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function deleteSavedPlace(userId: string, placeId: string) {
  // Enforce user ownership
  const place = await prisma.savedPlace.findFirst({
    where: { id: placeId, userId },
  });

  if (!place) {
    throw new Error('Place not found or unauthorized');
  }

  return prisma.savedPlace.delete({
    where: { id: placeId },
  });
}
