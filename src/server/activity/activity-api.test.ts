import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createActivity } from './activity-api.service';
import { getCurrentUser } from '@/src/lib/auth';
import { estimateActivityCarbon } from '@/src/server/carbon/activity-estimation.service';
import { prisma } from '@/src/db/prisma';

vi.mock('@/src/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/src/server/carbon/activity-estimation.service', () => ({
  estimateActivityCarbon: vi.fn(),
  activityEstimatePersistenceData: vi.fn().mockReturnValue({
    provider: 'INTERNAL',
    confidence: 'HIGH',
    fallbackUsed: false,
    sourceLabel: 'Test Source',
    explanation: 'Test explanation',
  }),
}));

vi.mock('@/src/db/prisma', () => ({
  prisma: {
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/src/lib/gamification/progress', () => ({
  handleNewActivityLog: vi.fn(),
}));

vi.mock('@/src/server/challenges/challenges.service', () => ({
  checkAndCompleteChallenges: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

function mockRequest(body: Record<string, unknown>) {
  return {
    json: async () => body,
  } as unknown as Request;
}

describe('Activity API Route Service (createActivity)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await createActivity(mockRequest({}));
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 if validation fails due to missing fields', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-123' } as unknown as Awaited<ReturnType<typeof getCurrentUser>>);

    const response = await createActivity(mockRequest({ category: '', subType: '' }));
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
  });

  it('returns 400 if validation fails due to negative quantity', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-123' } as unknown as Awaited<ReturnType<typeof getCurrentUser>>);

    const response = await createActivity(
      mockRequest({ category: 'TRANSPORT', subType: 'petrolcar', quantity: -5 }),
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it('returns 400 if category is invalid', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-123' } as unknown as Awaited<ReturnType<typeof getCurrentUser>>);

    const response = await createActivity(
      mockRequest({ category: 'INVALID_CAT', subType: 'petrolcar', quantity: 10 }),
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid activity category');
  });

  it('returns 201 and successfully creates activity log', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-123' } as unknown as Awaited<ReturnType<typeof getCurrentUser>>);
    vi.mocked(estimateActivityCarbon).mockResolvedValue({
      unit: 'km',
      co2eKg: 1.92,
      quantity: 10,
      category: 'TRANSPORT',
      subType: 'petrolcar',
      provider: 'INTERNAL',
      confidence: 'HIGH',
      fallbackUsed: false,
      method: 'transport_internal_factor',
      sourceLabel: 'Test Source',
      explanation: 'Test explanation',
      rawInput: {},
    });
    vi.mocked(prisma.activityLog.create).mockResolvedValue({
      id: 'log-789',
      co2eKg: 1.92,
      category: 'TRANSPORT',
      subType: 'petrolcar',
      occurredAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof prisma.activityLog.create>>);

    const response = await createActivity(
      mockRequest({ category: 'TRANSPORT', subType: 'petrolcar', quantity: 10 }),
    );
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.logId).toBe('log-789');
    expect(data.co2eKg).toBe(1.92);
  });
});
