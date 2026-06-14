/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useUser } from '@clerk/nextjs';

import { useEffect, useState } from 'react';

import { fetchCurrentUser } from '@/src/lib/auth-actions';

function sendClientLog(msg: string) {
  if (typeof window === 'undefined') return;
  fetch('/api/client-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg }),
  }).catch(() => {});
}

interface DbUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  profile: {
    id: string;
    userId: string;
    city: string | null;
    state: string | null;
    country: string | null;
    householdSize: number | null;
    dietType: string | null;
    commuteMode: string | null;
    commuteDistanceKm: number | null;
    electricityUsageKwh: number | null;
    onboardingComplete: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [hasFetchedDb, setHasFetchedDb] = useState(false);

  useEffect(() => {
    sendClientLog(`useAuth useEffect triggered: isSignedIn=${isSignedIn}, clerkUser.id=${clerkUser?.id}`);
    if (!isSignedIn) {
      setDbUser(null);
      setHasFetchedDb(false);
      return;
    }

    let isMounted = true;
    setHasFetchedDb(false);

    sendClientLog('useAuth calling fetchCurrentUser()');
    fetchCurrentUser()
      .then((data) => {
        sendClientLog(`fetchCurrentUser resolved with data: ${data ? `User(id=${data.id}, onboardingComplete=${data.profile?.onboardingComplete})` : 'null'}`);
        if (isMounted) {
          setDbUser(data as DbUser | null);
          setHasFetchedDb(true);
        }
      })
      .catch((err) => {
        sendClientLog(`fetchCurrentUser rejected: ${(err as Error).message}`);
        console.error('Failed to load db user:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, clerkUser?.id]);

  return {
    user: clerkUser,
    dbUser,
    isLoaded: clerkLoaded && (!isSignedIn || hasFetchedDb),
    isSignedIn,
  };
}

