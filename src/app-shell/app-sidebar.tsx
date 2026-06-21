'use client';

import { UserButton } from '@clerk/nextjs';
import * as Icons from 'lucide-react';

import type { ComponentType } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type NavItem, sidebarNavigationSections } from '@/src/config/navigation';
import { routes } from '@/src/config/routes';
import { cn } from '@/src/lib/utils';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

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

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'relative hidden h-full shrink-0 flex-col border-r border-border-default bg-bg-surface transition-all duration-300 ease-out md:flex',
        collapsed ? 'w-[84px]' : 'w-72',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-border-default transition-all duration-300',
          collapsed ? 'justify-center px-3' : 'justify-between px-5',
        )}
      >
        <Link
          href={routes.dashboard}
          className={cn('flex min-w-0 items-center', collapsed ? 'justify-center' : 'gap-3')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-primary text-white">
            <Icons.Leaf className="h-5 w-5" />
          </div>

          {!collapsed && (
            <p className="truncate text-base font-bold tracking-tight text-text-primary">
              Carbon Compass
            </p>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none"
            aria-label="Collapse sidebar"
          >
            <Icons.PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary shadow-sm transition-colors hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none"
          aria-label="Expand sidebar"
        >
          <Icons.PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div>


          <div className="space-y-1">
            {sidebarNavigationSections
              .flatMap((section) => section.items)
              .map((item) => {
                const LucideIcon = getIcon(item.iconName);
                const isActive = isNavItemActive(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      'group flex h-11 items-center rounded-xl text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 border-l-4',
                      collapsed ? 'justify-center px-0' : 'gap-3 px-4',
                      isActive
                        ? 'bg-accent-primary-dim text-accent-primary font-semibold border-accent-primary'
                        : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                    )}
                  >
                    <LucideIcon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-accent-primary'
                          : 'text-text-secondary group-hover:text-text-primary',
                      )}
                      aria-hidden
                    />

                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
          </div>
        </div>
      </nav>

      <div
        className={cn(
          'p-4 border-t border-border-default flex items-center gap-3 shrink-0',
          collapsed && 'justify-center',
        )}
      >
        <UserButton />
        {!collapsed && (
          <Link href="/profile?tab=account" className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25">
            <p className="truncate text-xs font-semibold text-text-primary">My Settings</p>
            <p className="truncate text-[10px] text-text-muted">Manage your Account</p>
          </Link>
        )}
      </div>
    </aside>
  );
}
