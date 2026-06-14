'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import AppSidebar from './app-sidebar';
import AppTopbar from './app-topbar';
import MobileBottomNav from './mobile-bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isViewportBound = ['/copilot', '/onboarding', '/log'].includes(pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:flex h-full shrink-0">
        <AppSidebar />
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
        <AppTopbar />

        {/* Page Content */}
        <main
          className={`flex-1 flex flex-col min-h-0 min-w-0 ${
            isViewportBound
              ? 'overflow-hidden p-6 pb-6 max-md:pb-20'
              : 'overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]'
          }`}
        >
          <div
            className={`w-full max-w-5xl mx-auto flex-1 flex flex-col min-h-0 ${
              isViewportBound ? '' : 'p-6 pb-6 max-md:pb-20'
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
