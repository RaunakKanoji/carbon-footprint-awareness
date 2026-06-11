'use client';

import React, { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/src/hooks/useAuth';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { dbUser, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const onboardingComplete = dbUser?.profile?.onboardingComplete;
      if (!onboardingComplete && pathname !== '/onboarding') {
        router.push('/onboarding');
      } else if (onboardingComplete && pathname === '/onboarding') {
        router.push('/dashboard');
      }
    }
  }, [dbUser, isLoaded, isSignedIn, pathname, router]);

  // Premium loading screen to display while fetching authentication and Postgres identity states
  if (!isLoaded && isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-text-secondary font-semibold animate-pulse">
            Loading identity context...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
