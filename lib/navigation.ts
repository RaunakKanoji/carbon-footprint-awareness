import { routes } from './routes';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  description?: string;
}

export const sidebarNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: routes.dashboard,
    iconName: 'LayoutDashboard',
    description: 'Overview of carbon footprint and progress.',
  },
  {
    title: 'Log Activity',
    href: routes.log,
    iconName: 'PlusCircle',
    description: 'Log daily transit, meals, and utility usage.',
  },
  {
    title: 'AI Copilot',
    href: routes.copilot,
    iconName: 'Bot',
    description: 'Get tailored recommendations from your AI coach.',
  },
  {
    title: 'Simulator',
    href: routes.simulator,
    iconName: 'Sliders',
    description: 'Simulate lifestyle changes and see their impact.',
  },
  {
    title: 'Insights',
    href: routes.insights,
    iconName: 'LineChart',
    description: 'Deep analytics on historical trends.',
  },
  {
    title: 'Challenges',
    href: routes.challenges,
    iconName: 'Trophy',
    description: 'Participate in carbon reduction challenges.',
  },
  {
    title: 'Profile',
    href: routes.profile,
    iconName: 'User',
    description: 'Manage your user information.',
  },
  {
    title: 'Settings',
    href: routes.settings,
    iconName: 'Settings',
    description: 'App preferences and credentials.',
  },
];

export const mobileNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: routes.dashboard,
    iconName: 'LayoutDashboard',
  },
  {
    title: 'Log',
    href: routes.log,
    iconName: 'PlusCircle',
  },
  {
    title: 'Copilot',
    href: routes.copilot,
    iconName: 'Bot',
  },
  {
    title: 'Simulator',
    href: routes.simulator,
    iconName: 'Sliders',
  },
  {
    title: 'Profile',
    href: routes.profile,
    iconName: 'User',
  },
];

export const marketingNavigation: Omit<NavItem, 'iconName'>[] = [
  {
    title: 'Features',
    href: '#features',
  },
];
