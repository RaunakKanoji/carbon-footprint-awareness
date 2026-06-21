'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/src/db/prisma';
import { getCurrentUser } from '@/src/lib/auth';

export async function saveCarbonBudget(input: {
  reductionPercentage: number;
  budgetType: string;
  customMonthlyKg?: number;
}) {
  const user = await getCurrentUser();
  if (!user?.carbonProfile) throw new Error('Carbon profile is required.');

  const reduction = Math.min(90, Math.max(0, input.reductionPercentage));
  const monthlyTarget =
    input.customMonthlyKg && input.customMonthlyKg > 0
      ? input.customMonthlyKg
      : user.carbonProfile.monthlyFootprintKg * (1 - reduction / 100);
  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);
  const targetDate = new Date(month.getFullYear(), month.getMonth() + 3, 1);

  await prisma.budget.upsert({
    where: { userId_month: { userId: user.id, month } },
    update: {
      targetKg: monthlyTarget,
      weeklyTargetKg: monthlyTarget / 4.33,
      reductionPercentage: reduction,
      targetDate,
      budgetType: input.budgetType,
    },
    create: {
      userId: user.id,
      month,
      targetKg: monthlyTarget,
      weeklyTargetKg: monthlyTarget / 4.33,
      reductionPercentage: reduction,
      targetDate,
      budgetType: input.budgetType,
    },
  });
  revalidatePath('/dashboard');
  return { success: true };
}
