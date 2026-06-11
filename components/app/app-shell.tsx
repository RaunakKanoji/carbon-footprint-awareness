import React from 'react';
import AppSidebar from './app-sidebar';
import AppTopbar from './app-topbar';
import MobileBottomNav from './mobile-bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base font-sans text-text-primary antialiased">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:flex h-full shrink-0">
        <AppSidebar />
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden min-w-0">
        <AppTopbar />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
