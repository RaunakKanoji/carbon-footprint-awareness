import { getBudgetSummary, saveBudget } from '@/src/server/goals/budget.service';

export async function GET() {
  return getBudgetSummary();
}

export async function POST(request: Request) {
  return saveBudget(request);
}
