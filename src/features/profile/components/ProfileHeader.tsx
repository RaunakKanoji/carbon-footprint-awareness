import React from 'react';

interface ProfileHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function ProfileHeader({ title, description, action }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {description}
        </p>
      </div>
      {action && <div className="flex items-center shrink-0">{action}</div>}
    </div>
  );
}
