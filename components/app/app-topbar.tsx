'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell, Search } from 'lucide-react';

import { usePathname } from 'next/navigation';

import { sidebarNavigation } from '@/lib/navigation';

export default function AppTopbar() {
  const pathname = usePathname();

  // Find the active nav item title
  const currentItem = sidebarNavigation.find((item) => item.href === pathname);
  const pageTitle = currentItem ? currentItem.title : 'Carbon Compass';

  return (
    <header className="h-16 bg-bg-surface border-b border-border-default flex items-center justify-between px-6 shrink-0">
      {/* Page Title */}
      <h2 className="text-lg font-bold text-text-primary">{pageTitle}</h2>

      {/* Global Actions Bar */}
      <div className="flex items-center gap-4">
        {/* Search Mock */}
        <div className="relative hidden sm:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-faint">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search footprints, tips..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-bg-base border border-border-default rounded-lg text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
            disabled
          />
        </div>

        {/* Notifications Mock */}
        <button
          className="p-2 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary relative transition-all"
          title="Notifications (Coming Soon)"
          disabled
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full"></span>
        </button>

        {/* User Button - Mobile only */}
        <div className="md:hidden flex items-center shrink-0">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
