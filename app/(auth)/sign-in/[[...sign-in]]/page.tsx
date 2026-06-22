import { SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { Leaf } from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen w-full bg-bg-surface grid md:grid-cols-2 animate-fade-in overflow-x-hidden">
      {/* Left Column: Form Panel */}
      <div className="col-span-2 md:col-span-1 flex flex-col justify-between w-full min-h-screen p-8 sm:p-12 md:p-16 lg:p-20 bg-bg-surface">
        <div>
          {/* Top Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-bg-elevated p-1 border border-border-default">
              <Link
                href="/sign-up"
                className="rounded-full px-5 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className="rounded-full px-5 py-1.5 text-xs font-bold bg-[#10b981] text-white transition-all"
              >
                Log In
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[400px] mx-auto mt-4">
            <h2 className="text-3xl font-extrabold text-text-primary text-center mb-1 font-display">
              Welcome Back!
            </h2>
            <p className="text-sm text-text-secondary text-center mb-6">
              Sign in with your Email and Password.
            </p>

            <div className="auth-clerk-container w-full">
              <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  options: {
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'blockButton',
                  },
                  variables: {
                    colorPrimary: '#10b981',
                    colorBackground: '#ffffff',
                    colorForeground: '#111827',
                    colorMutedForeground: '#4b5563',
                    colorInput: '#ffffff',
                    colorInputForeground: '#111827',
                    fontFamily: 'inherit',
                    borderRadius: '0.5rem',
                  },
                  elements: {
                    rootBox: 'w-full shadow-none border-0 !overflow-visible',
                    cardBox: 'w-full shadow-none border-0 bg-transparent !overflow-visible',
                    card: 'w-full shadow-none border-0 bg-transparent p-0 !overflow-visible',
                    main: 'w-full shadow-none border-0 bg-transparent !overflow-visible',
                    socialButtons: '!overflow-visible',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    header: 'hidden',
                    formButtonPrimary: 'w-full bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] text-white rounded-xl py-3 px-4 text-sm font-semibold shadow-sm transition-all border-0 cursor-pointer',
                    socialButtonsBlockButton: 'border border-border-default bg-bg-surface hover:bg-bg-elevated text-text-primary transition-all font-semibold rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer',
                    formFieldInput: 'border border-border-default bg-bg-surface rounded-xl text-text-primary focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 focus:outline-none transition-all py-3 px-4 text-sm w-full',
                    footerActionLink: 'text-[#10b981] hover:text-emerald-400 hover:underline font-semibold',
                    dividerText: 'text-text-muted text-xs uppercase tracking-wider font-semibold',
                    dividerLine: 'bg-border-default',
                    formFieldLabel: '!hidden',
                    formFieldAction: 'text-xs text-text-secondary hover:text-[#10b981] transition-colors font-semibold hover:underline cursor-pointer float-right mb-1',
                    formFieldInputShowPasswordButton: 'text-text-secondary hover:text-text-primary right-4',
                    footer: '!hidden',
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-text-secondary">
            Did not have any account?{' '}
            <Link href="/sign-up" className="text-[#10b981] hover:underline font-bold">
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Image showcase with overlay */}
      <div className="hidden md:block relative w-full h-full min-h-screen">
        <Image
          src="/auth_showcase.png"
          alt="Carbon Compass Showcase"
          fill
          className="object-cover"
          priority
        />
        
        {/* Logo overlay on image */}
        <div className="absolute top-8 left-8 flex items-center gap-2 text-white bg-black/30 backdrop-blur-xs py-1.5 px-3 rounded-xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#10b981] text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Carbon Compass</span>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          <span className="w-6 h-1.5 rounded-full bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}
