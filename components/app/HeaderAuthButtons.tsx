'use client';

import { useAuth } from '@clerk/nextjs';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

import React, { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function HeaderAuthButtons() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const { isSignedIn, isLoaded } = useAuth();

  if (!isMounted || !isLoaded || isSignedIn) {
    return null;
  }

  return (
    <header className="p-4 border-b border-border-default flex justify-between items-center bg-bg-surface w-full">
      <div className="font-bold text-text-primary">Carbon Compass AI</div>
      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="px-4 py-2 text-sm font-semibold rounded-lg border border-border-default hover:bg-bg-elevated text-text-primary transition-all cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </header>
  );
}
