// src/config/env.ts
const isServer = typeof window === 'undefined';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

export function requireDatabaseUrl(): string {
  return getRequiredEnv('DATABASE_URL');
}

export function requireClerkSecretKey(): string {
  return getRequiredEnv('CLERK_SECRET_KEY');
}

export function requireClerkPublishableKey(): string {
  return getRequiredEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',

  appUrl:
    getOptionalEnv('NEXT_PUBLIC_APP_URL') ??
    (getOptionalEnv('NEXT_PUBLIC_VERCEL_URL')
      ? `https://${getOptionalEnv('NEXT_PUBLIC_VERCEL_URL')}`
      : 'http://localhost:3001'),

  clerk: {
    publishableKey: requireClerkPublishableKey(),
    secretKey: isServer ? requireClerkSecretKey() : '',
    signInUrl: getOptionalEnv('NEXT_PUBLIC_CLERK_SIGN_IN_URL') ?? '/sign-in',
    signUpUrl: getOptionalEnv('NEXT_PUBLIC_CLERK_SIGN_UP_URL') ?? '/sign-up',
    afterSignInUrl:
      getOptionalEnv('NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL') ?? '/dashboard',
    afterSignUpUrl:
      getOptionalEnv('NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL') ?? '/onboarding',
  },

  database: {
    url: isServer ? requireDatabaseUrl() : '',
  },

  apis: {
    carbonSutraKey: getOptionalEnv('CARBONSUTRA_API_KEY'),
    climatiqKey: getOptionalEnv('CLIMATIQ_API_KEY'),
    openRouteServiceKey: getOptionalEnv('OPENROUTESERVICE_API_KEY'),
    carbonInterfaceKey: getOptionalEnv('CARBON_INTERFACE_API_KEY'),
    geminiApiKey: getOptionalEnv('GEMINI_API_KEY'),
  },
};