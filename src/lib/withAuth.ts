import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/lib/auth';

export function withAuth<TArgs, TResult>(
  handler: (user: Awaited<ReturnType<typeof requireAuth>>, args: TArgs) => Promise<TResult>
) {
  return async (args: TArgs, context?: { req?: NextRequest }) => {
    const user = await requireAuth(context?.req);
    return handler(user, args);
  };
}
