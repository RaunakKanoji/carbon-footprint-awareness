import * as Icons from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  iconName: string;
}

export default function FeatureCard({ title, description, iconName }: FeatureCardProps) {
  // Resolve Lucide Icon dynamically
  const LucideIcon = (Icons[iconName as keyof typeof Icons] ||
    Icons.HelpCircle) as React.ComponentType<{ className?: string }>;

  return (
    <div className="bg-bg-surface border border-border-default hover:border-accent-primary/30 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 text-left group">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary-dim text-accent-primary group-hover:scale-105 transition-transform duration-300">
        <LucideIcon className="w-6 h-6 shrink-0" />
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
