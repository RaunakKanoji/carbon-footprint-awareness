import { routes } from './routes';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  description?: string;
  activePaths?: string[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const sidebarNavigationSections: NavSection[] = [
  {
    label: 'Home',
    items: [
      {
        title: 'Dashboard',
        href: routes.dashboard,
        iconName: 'LayoutDashboard',
        description: 'Carbon snapshot, quick actions, progress, and insight messages.',
      },
    ],
  },
  {
    label: 'Track',
    items: [
      {
        title: 'Activity',
        href: routes.log,
        iconName: 'PlusCircle',
        description: 'Track food, transport, energy, shopping, and waste.',
        activePaths: ['/log'],
      },
      {
        title: 'Products',
        href: routes.products,
        iconName: 'PackageSearch',
        description: 'Scan products, compare alternatives, and track owned products.',
        activePaths: ['/products', '/products/owned'],
      },
    ],
  },
  {
    label: 'Understand',
    items: [
      {
        title: 'Coach',
        href: routes.coach,
        iconName: 'Bot',
        description: 'Ask questions, explain estimates, simulate changes, and log with AI.',
        activePaths: ['/coach', '/copilot'],
      },
      {
        title: 'Insights',
        href: routes.insights,
        iconName: 'LineChart',
        description: 'Understand what happened, why it happened, and what to do next.',
        activePaths: ['/insights'],
      },
    ],
  },
  {
    label: 'Improve',
    items: [
      {
        title: 'Simulation',
        href: routes.simulator,
        iconName: 'SlidersHorizontal',
        description: 'Test what-if changes before committing to them.',
        activePaths: ['/simulator'],
      },
      {
        title: 'Challenges',
        href: routes.challenges,
        iconName: 'Trophy',
        description: 'Personalized missions, streaks, tasks, and behavior challenges.',
        activePaths: ['/challenges', '/goals'],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Profile',
        href: routes.profile,
        iconName: 'User',
        description: 'Personal profile, carbon profile, community profile, and achievements.',
        activePaths: ['/profile', '/carbon-profile', '/settings'],
      },
    ],
  },
];

export const sidebarNavigation: NavItem[] = sidebarNavigationSections.flatMap(
  (section) => section.items,
);

export const mobileNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: routes.dashboard,
    iconName: 'LayoutDashboard',
  },
  {
    title: 'Activity',
    href: routes.log,
    iconName: 'PlusCircle',
    activePaths: ['/log'],
  },
  {
    title: 'Products',
    href: routes.products,
    iconName: 'PackageSearch',
    activePaths: ['/products', '/products/owned'],
  },
  {
    title: 'Coach',
    href: routes.coach,
    iconName: 'Bot',
    activePaths: ['/coach', '/copilot'],
  },
  {
    title: 'Challenges',
    href: routes.challenges,
    iconName: 'Trophy',
    activePaths: ['/challenges', '/goals'],
  },
];

export const marketingNavigation: Omit<NavItem, 'iconName'>[] = [
  {
    title: 'Features',
    href: '#features',
  },
];