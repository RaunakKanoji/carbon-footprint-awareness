import { createActivity } from '@/src/server/activity/activity-api.service';

export async function POST(request: Request) {
  return createActivity(request);
}
