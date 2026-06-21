import 'server-only';

import { Prisma } from '@/src/generated/prisma';
import { prisma } from '@/src/db/prisma';

export async function createImportedRoute(input: {
  userId: string;
  source: string;
  originLabel?: string | null;
  destinationLabel?: string | null;
  originAddress?: string | null;
  destinationAddress?: string | null;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  profile: string;
  distanceMeters?: number | null;
  distanceKm?: number | null;
  durationSeconds?: number | null;
  durationMinutes?: number | null;
  rawImport?: Record<string, unknown> | null;
  routePayload?: Record<string, unknown> | null;
  routeResponse?: Record<string, unknown> | null;
}) {
  return prisma.importedRoute.create({
    data: {
      userId: input.userId,
      source: input.source,
      originLabel: input.originLabel,
      destinationLabel: input.destinationLabel,
      originAddress: input.originAddress,
      destinationAddress: input.destinationAddress,
      originLat: input.originLat,
      originLng: input.originLng,
      destinationLat: input.destinationLat,
      destinationLng: input.destinationLng,
      profile: input.profile,
      distanceMeters: input.distanceMeters,
      distanceKm: input.distanceKm,
      durationSeconds: input.durationSeconds,
      durationMinutes: input.durationMinutes,
      rawImport: input.rawImport as Prisma.InputJsonValue | undefined,
      routePayload: input.routePayload as Prisma.InputJsonValue | undefined,
      routeResponse: input.routeResponse as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function listImportedRoutes(userId: string) {
  return prisma.importedRoute.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getImportedRoute(userId: string, routeId: string) {
  return prisma.importedRoute.findFirst({
    where: { id: routeId, userId },
  });
}

export async function deleteImportedRoute(userId: string, routeId: string) {
  const route = await prisma.importedRoute.findFirst({
    where: { id: routeId, userId },
  });

  if (!route) {
    throw new Error('Route not found or unauthorized');
  }

  return prisma.importedRoute.delete({
    where: { id: routeId },
  });
}

export async function markRouteAsLogged(userId: string, routeId: string, activityLogId: string) {
  const route = await prisma.importedRoute.findFirst({
    where: { id: routeId, userId },
  });

  if (!route) {
    throw new Error('Route not found or unauthorized');
  }

  return prisma.importedRoute.update({
    where: { id: routeId },
    data: {
      carbonLogged: true,
      activityLogId,
    },
  });
}
