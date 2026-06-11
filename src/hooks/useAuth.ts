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
      Promise.resolve().then(() => {
        if (dbUser !== null) setDbUser(null);
        if (isLoadingDb) setIsLoadingDb(false);
      });
      return;
    }

    setIsLoadingDb(true);
    fetchCurrentUser()
      .then((data) => {
        setDbUser(data as DbUser | null);
      })
      .catch((err) => {
        console.error('Failed to load db user:', err);
      })
      .finally(() => {
        setIsLoadingDb(false);
      });
  }, [isSignedIn, clerkUser, dbUser, isLoadingDb]);

  return {
    user: clerkUser,
    dbUser,
    isLoaded: clerkLoaded && !isLoadingDb,
    isSignedIn,
  };
}
