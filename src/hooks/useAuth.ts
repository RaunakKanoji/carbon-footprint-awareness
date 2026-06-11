/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useUser } from '@clerk/nextjs';

import { useEffect, useState } from 'react';

import { fetchCurrentUser } from '@/src/lib/auth-actions';

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
    createdAt: Date;
    updatedAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setDbUser(null);
      setIsLoadingDb(false);
      return;
    }

    let isMounted = true;
    setIsLoadingDb(true);

    fetchCurrentUser()
      .then((data) => {
        if (isMounted) {
          setDbUser(data as DbUser | null);
        }
      })
      .catch((err) => {
        console.error('Failed to load db user:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDb(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, clerkUser?.id]);

  return {
    user: clerkUser,
    dbUser,
    isLoaded: clerkLoaded && !isLoadingDb,
    isSignedIn,
  };
}
