import * as Icons from 'lucide-react';

import type React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  iconName: string;
}

export default function FeatureCard({ title, description, iconName }: FeatureCardProps) {
  // Resolve Lucide Icon dynamically
  const LucideIcon = (Icons[iconName as keyof typeof Icons] ||
    Icons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-border-default bg-bg-surface p-6 text-left shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-accent-primary/30 hover:shadow-md">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary-dim text-accent-primary group-hover:scale-105 transition-transform duration-300">
        <LucideIcon className="w-6 h-6 shrink-0" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-text-primary group-hover:text-accent-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed font-normal">{description}</p>
      </div>
    </div>
  );
}
