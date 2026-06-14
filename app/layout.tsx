import { ClerkProvider, Show } from '@clerk/nextjs';

import type { Metadata } from 'next';
import { Fira_Code, Inter } from 'next/font/google';
import Link from 'next/link';

import { ToastProvider } from '@/components/ui/toast-provider';
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
                <Link
                  href="/sign-in"
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border-default px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                >
                  Sign Up
                </Link>
              </div>
            </header>
          </Show>
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
