'use client';

import * as Icons from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mobileNavigation } from '@/lib/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-default flex justify-around py-2 px-4 z-50">
      {mobileNavigation.map((item) => {
        const LucideIcon = (Icons[item.iconName as keyof typeof Icons] ||
          Icons.HelpCircle) as React.ComponentType<{ className?: string }>;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xs font-medium transition-all ${
              isActive
                ? 'text-accent-primary font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LucideIcon className="w-5 h-5 shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
