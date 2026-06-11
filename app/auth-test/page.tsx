'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { SignInButton, SignOutButton } from '@clerk/nextjs';

export default function AuthTestPage() {
  const { user, dbUser, isLoaded, isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-3xl w-full bg-bg-surface border border-border-default rounded-2xl shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Authentication & Profile Integration</h1>
          <p className="text-emerald-100 font-medium">Verify Clerk credentials & Prisma PostgreSQL profile synchronization.</p>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-8">
          {/* Load State Indicator */}
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-text-secondary font-semibold animate-pulse">Loading identity contexts...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Clerk Auth Section */}
              <div className="bg-bg-base border border-border-default rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-border-default">
                  <h3 className="font-bold text-lg text-text-primary">Clerk Authentication</h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${isSignedIn ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                  >
                    {isSignedIn ? 'SIGNED_IN' : 'SIGNED_OUT'}
                  </span>
                </div>

                {isSignedIn && user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {user.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={user.imageUrl}
                          alt="User avatar"
                          className="w-14 h-14 rounded-full border border-border-default"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-text-primary">{user.fullName || 'No Name'}</h4>
                        <p className="text-xs text-text-secondary">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                    <div className="pt-2 text-xs space-y-2 font-mono bg-bg-surface p-3 border border-border-default rounded-lg text-text-secondary break-all">
                      <div><span className="font-bold text-text-primary">Clerk ID:</span> {user.id}</div>
                    </div>
                    <div className="pt-4">
                      <SignOutButton>
                        <button className="w-full text-center px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-950 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-semibold transition-colors">
                          Sign Out Session
                        </button>
                      </SignOutButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center py-6">
                    <p className="text-sm text-text-secondary">No active Clerk session detected.</p>
                    <div className="pt-2">
                      <SignInButton mode="modal">
                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all">
                          Authenticate Account
                        </button>
                      </SignInButton>
                    </div>
                  </div>
                )}
              </div>

              {/* Prisma PostgreSQL DB Profile Section */}
              <div className="bg-bg-base border border-border-default rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-border-default">
                  <h3 className="font-bold text-lg text-text-primary">PostgreSQL Database</h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${dbUser ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                  >
                    {dbUser ? 'SYNCED' : 'UNSYNCED'}
                  </span>
                </div>

                {dbUser ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary font-medium">DB Name:</span>
                        <span className="font-semibold text-text-primary">{dbUser.name || 'Null'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary font-medium">DB Email:</span>
                        <span className="font-semibold text-text-primary">{dbUser.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary font-medium">Onboarded:</span>
                        <span
                          className={`font-semibold ${dbUser.profile?.onboardingComplete ? 'text-green-600' : 'text-amber-600'
                            }`}
                        >
                          {dbUser.profile?.onboardingComplete ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 text-xs space-y-2 font-mono bg-bg-surface p-3 border border-border-default rounded-lg text-text-secondary break-all">
                      <div><span className="font-bold text-text-primary">DB User ID:</span> {dbUser.id}</div>
                      <div><span className="font-bold text-text-primary">Profile ID:</span> {dbUser.profile?.id || 'Null'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center py-6">
                    <p className="text-sm text-text-secondary">
                      {isSignedIn
                        ? 'Authenticating profile database record...'
                        : 'Database record unavailable (signed out).'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-base border-t border-border-default text-center text-xs text-text-secondary">
          Design System Primitives and UI Guidelines applied.
        </div>
      </div>
    </div>
  );
}