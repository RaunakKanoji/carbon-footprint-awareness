'use client';

import * as Icons from 'lucide-react';

import type { ComponentType } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mobileNavigation, type NavItem } from '@/src/config/navigation';
import { routes } from '@/src/config/routes';

function getIcon(iconName: string) {
  return (Icons[iconName as keyof typeof Icons] || Icons.HelpCircle) as ComponentType<{
    className?: string;
    'aria-hidden'?: boolean;
  }>;
}

function isNavItemActive(pathname: string, item: NavItem) {
  const activePaths = item.activePaths ?? [item.href];

  return activePaths.some((activePath) => {
    if (activePath === routes.dashboard) {
      return pathname === routes.dashboard;
    }

    return pathname === activePath || pathname.startsWith(`${activePath}/`);
  });
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-default flex justify-around py-2 px-4 z-50">
      {mobileNavigation.map((item) => {
        const LucideIcon = getIcon(item.iconName);
        const isActive = isNavItemActive(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 ${
              isActive
                ? 'text-accent-primary font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LucideIcon className="h-5 w-5 shrink-0" aria-hidden />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}