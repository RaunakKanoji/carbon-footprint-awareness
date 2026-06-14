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
            name="global-search"
            aria-label="Search"
            placeholder="Search footprints, tips…"
            autoComplete="off"
            className="w-full rounded-xl border border-border-default bg-bg-base py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
            disabled
          />
        </div>

        {/* Notifications Mock */}
        <button
          className="relative rounded-xl p-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Notifications"
          title="Notifications (Coming Soon)"
          disabled
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full" />
        </button>

        {/* User Button - Mobile only */}
        <div className="md:hidden flex items-center shrink-0">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
