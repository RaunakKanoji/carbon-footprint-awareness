import { ClerkProvider } from '@clerk/nextjs';

import type { Metadata } from 'next';

import { ToastProvider } from '@/src/components/ui/toast-provider';
import { QueryProvider } from '@/src/app-shell';
import '@/src/lib/icons';

import './globals.css';

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
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

