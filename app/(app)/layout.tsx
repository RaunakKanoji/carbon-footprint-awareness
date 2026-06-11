import React from 'react';
import { auth } from '@clerk/nextjs/server';
import AppShell from '@/components/app/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Protect all routes under (app) route group by redirecting signed-out visitors
  await auth.protect();

  return <AppShell>{children}</AppShell>;
}
