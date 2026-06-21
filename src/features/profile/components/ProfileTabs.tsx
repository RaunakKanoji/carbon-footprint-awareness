import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type ProfileTab = 'account' | 'friends' | 'summary';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChangeTab: (tab: ProfileTab) => void;
  friendRequestsCount?: number;
}

export default function ProfileTabs({ activeTab, onChangeTab, friendRequestsCount = 0 }: ProfileTabsProps) {
  const tabs = [
    {
      id: 'account' as ProfileTab,
      label: 'Account',
      icon: Icons.User,
      description: 'Profile parameters, preferences, & privacy',
    },
    {
      id: 'friends' as ProfileTab,
      label: 'Friends',
      icon: Icons.Users,
      description: 'Climate circle and social missions',
      badge: friendRequestsCount > 0 ? friendRequestsCount : undefined,
    },
    {
      id: 'summary' as ProfileTab,
      label: 'Summary',
      icon: Icons.BarChart3,
      description: 'Impact categories and habits review',
    },
  ];

  return (
    <div className="flex rounded-2xl border border-border-default bg-bg-elevated p-1 shadow-sm">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 sm:flex-row sm:text-sm',
              isActive
                ? 'border border-border-subtle bg-bg-surface text-accent-primary shadow-sm'
                : 'border border-transparent text-text-secondary hover:bg-bg-surface/70 hover:text-text-primary'
            )}
          >
            <div className="flex items-center gap-2">
              <IconComponent className={cn('w-4 h-4', isActive ? 'text-accent-primary' : 'text-text-secondary')} />
              <span>{tab.label}</span>
            </div>
            {tab.badge !== undefined && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
