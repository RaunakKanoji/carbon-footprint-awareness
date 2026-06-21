import {
  createCoachResponse,
  getCoachConversationResponse,
} from '@/src/server/coach/coach.service';

export async function POST(request: Request) {
  return createCoachResponse(request);
}

export async function GET(request: Request) {
  return getCoachConversationResponse(request);
}
