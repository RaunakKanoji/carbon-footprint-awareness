'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { sidebarNavigation } from '@/lib/navigation';
import { UserButton } from '@clerk/nextjs';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-bg-surface border-r border-border-default flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-border-default flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary text-white">
          <Icons.Leaf className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-text-primary tracking-tight">Carbon Compass</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarNavigation.map((item) => {
          // Resolve the Lucide icon dynamically
          const LucideIcon = (Icons[item.iconName as keyof typeof Icons] || Icons.HelpCircle) as React.ComponentType<{ className?: string }>;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent-primary-dim text-accent-primary font-semibold border-l-4 border-accent-primary border-l-solid'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`}
            >
              <LucideIcon className="w-5 h-5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-border-default flex items-center gap-3">
        <UserButton />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-text-primary truncate">My Profile</span>
          <span className="text-[10px] text-text-secondary truncate">Manage settings</span>
        </div>
      </div>
    </aside>
  );
}