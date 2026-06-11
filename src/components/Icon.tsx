import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { iconMap } from '@/src/lib/icons';
import { cn } from '@/lib/utils';

interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {
  icon: keyof typeof iconMap | FontAwesomeIconProps['icon'];
  className?: string;
}

export default function Icon({ className, icon, ...props }: IconProps) {
  const resolvedIcon = typeof icon === 'string' ? iconMap[icon as keyof typeof iconMap] || icon : icon;
  return (
    <FontAwesomeIcon
      className={cn('text-text-primary', className)}
      icon={resolvedIcon as IconProp}
      {...props}
    />
  );
}
