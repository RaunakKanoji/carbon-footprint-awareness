import { ClerkProvider, Show, SignInButton, SignUpButton } from '@clerk/nextjs';

import type { Metadata } from 'next';
import { Fira_Code, Inter } from 'next/font/google';

import '@/src/lib/icons';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Carbon Compass AI',
  description: 'Track and reduce your personal greenhouse gas emissions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${firaCode.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
          <Show when="signed-out">
            <header className="p-4 border-b border-border-default flex justify-between items-center bg-bg-surface">
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
          </Show>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
