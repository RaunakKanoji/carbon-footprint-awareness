'use client';

import React, { useState } from 'react';

import { usePathname } from 'next/navigation';

import AppSidebar from './app-sidebar';
import AppTopbar from './app-topbar';
import MobileBottomNav from './mobile-bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isCopilot = pathname === '/copilot' || pathname.startsWith('/copilot/');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar />

        <main
          className={
            isCopilot
              ? 'min-h-0 min-w-0 flex-1 overflow-hidden'
              : 'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto'
          }
        >
          <div
            className={
              isCopilot
                ? 'flex h-full w-full flex-col p-4 pb-24 sm:p-6 md:pb-6'
                : 'mx-auto w-full max-w-[1480px] p-4 pb-24 sm:p-6 lg:p-8'
            }
          >
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}