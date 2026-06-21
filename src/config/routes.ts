export const routes = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  log: '/log',
  products: '/products',
  coach: '/coach',
  insights: '/insights',
  simulator: '/simulator',
  challenges: '/challenges',
  profile: '/profile',
  settings: '/settings',
} as const;

export type RouteKeys = keyof typeof routes;
export type RouteValues = (typeof routes)[RouteKeys];
