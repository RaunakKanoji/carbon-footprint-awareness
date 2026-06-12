export const routes = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  onboarding: '/onboarding',
  log: '/log',
  copilot: '/copilot',
  simulator: '/simulator',
  insights: '/insights',
  challenges: '/challenges',
  profile: '/profile',
  settings: '/settings',
} as const;

export type RouteKeys = keyof typeof routes;
export type RouteValues = (typeof routes)[RouteKeys];
