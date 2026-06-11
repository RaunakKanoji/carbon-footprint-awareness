import { ClerkProvider } from '@clerk/nextjs';

import type { Metadata } from 'next';
import { Fira_Code, Inter } from 'next/font/google';

import HeaderAuthButtons from '@/components/app/HeaderAuthButtons';
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
          <HeaderAuthButtons />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
