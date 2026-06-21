import {
  abandonChallenge,
  createChallenge,
  listChallenges,
} from '@/src/server/challenges/challenge-api.service';

export async function GET() {
  return listChallenges();
}

export async function POST(request: Request) {
  return createChallenge(request);
}

export async function PATCH(request: Request) {
  return abandonChallenge(request);
}
