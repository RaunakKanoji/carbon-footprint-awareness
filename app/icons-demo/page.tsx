'use client';

import { ComponentProps } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/src/components/Icon';

const ICONS_LIST = [
  { name: 'car', icon: 'car', category: 'Transport', desc: 'Personal vehicle emissions' },
  { name: 'bus', icon: 'bus', category: 'Transport', desc: 'Public transit/bus commutes' },
  { name: 'bicycle', icon: 'bicycle', category: 'Transport', desc: 'Active travel & cycling' },
  { name: 'utensils', icon: 'utensils', category: 'Food & Diet', desc: 'Meals and food choices' },
  { name: 'bolt', icon: 'bolt', category: 'Energy', desc: 'Electricity and power usage' },
  {
    name: 'shopping-bag',
    icon: 'shopping-bag',
    category: 'Consumption',
    desc: 'Purchased goods and shopping',
  },
  { name: 'trash', icon: 'trash', category: 'Waste', desc: 'Waste production and recycling' },
  {
    name: 'chart-pie',
    icon: 'chart-pie',
    category: 'Analytics',
    desc: 'Emissions breakdown charts',
  },
  { name: 'leaf', icon: 'leaf', category: 'Eco', desc: 'Environmental awareness & green actions' },
  {
    name: 'person-running',
    icon: 'person-running',
    category: 'Eco',
    desc: 'Low-carbon activities',
  },
  { name: 'tree', icon: 'tree', category: 'Eco', desc: 'Offsetting & carbon sequestration' },
  { name: 'user', icon: 'user', category: 'Profile', desc: 'User accounts and personal stats' },
  { name: 'couch', icon: 'couch', category: 'Energy', desc: 'Home appliances & comfort footprint' },
];

export default function IconsDemoPage() {
  return (
    <div className="p-8 space-y-8 bg-bg-base min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-text-primary">Icon System Demo</h1>
        <p className="text-text-secondary text-sm">
          A showcase of registered Font Awesome icons in the Carbon Compass design system.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ICONS_LIST.map((item) => (
          <Card key={item.name} className="border border-border-default bg-bg-surface">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Icon icon={item.icon as ComponentProps<typeof Icon>['icon']} className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-text-primary capitalize">
                  {item.name}
                </CardTitle>
                <CardDescription className="text-xs text-text-secondary">
                  {item.category}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-text-secondary">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
