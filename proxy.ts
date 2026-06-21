import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/insights(.*)',
  '/coach(.*)',
  '/log(.*)',
  '/simulator(.*)',
  '/challenges(.*)',
  '/goals(.*)',
  '/products(.*)',
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (!userId && isProtectedRoute(req)) {
    return Response.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
