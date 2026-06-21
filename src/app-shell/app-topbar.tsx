'use client';

import { UserButton } from '@clerk/nextjs';

import { usePathname } from 'next/navigation';

import { sidebarNavigation } from '@/src/config/navigation';

export default function AppTopbar() {
  const pathname = usePathname();

  // Find the active nav item title
  const currentItem = sidebarNavigation.find((item) =>
    (item.activePaths ?? [item.href]).some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ),
  );
  const pageTitle = currentItem ? currentItem.title : 'Carbon Compass';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-default bg-bg-surface px-4 sm:px-6">
      {/* Page Title */}
      <h2 className="text-lg font-semibold tracking-tight text-text-primary">{pageTitle}</h2>

      {/* User Button - Mobile only */}
      <div className="flex shrink-0 items-center md:hidden">
        <UserButton />
      </div>
    </header>
  );
}
