# Implement Error Handling and Notifications

## Goal

Ensure robust user experience by gracefully handling errors across client and server operations, while providing clear and actionable feedback through notification toasts or alerts. Centralize error handling to reduce redundancy and maintain consistency.

## Implementation

1. **Global Error Boundary:** Use React Error Boundaries (or the new `error.tsx` convention in Next.js App Router) to catch unexpected client‑side errors. For pages and components, create a top‑level `app/error.tsx` that renders a friendly error message and a “Retry” button.

2. **API Error Responses:** Standardize error responses in API routes and server actions:
   - Return JSON objects like `{ error: { code: 'BAD_REQUEST', message: 'Invalid input' } }`.
   - Use appropriate HTTP status codes (400, 401, 403, 404, 500).
   - Log server errors to a logging service or console for debugging.

3. **Client Error Handling:** In fetch calls or tRPC queries, catch errors and display them via a toast notification component. Use shadcn/ui’s `useToast` hook or create a custom `ToastProvider`:

   ```tsx
   import { useToast } from '@/components/ui/use-toast';

   const { toast } = useToast();
   try {
     const res = await fetch('/api/activity', { method: 'POST', body: JSON.stringify(data) });
     if (!res.ok) {
       const { error } = await res.json();
       throw new Error(error.message);
     }
     toast({ title: 'Activity logged!', description: 'Your carbon footprint has been updated.' });
   } catch (err) {
     toast({
       title: 'Error',
       description: err instanceof Error ? err.message : 'Something went wrong',
       variant: 'destructive',
     });
   }
   ```

4. **Form Error Feedback:** Use the error messages returned by Zod schemas (Tasks 12 and 16) to display inline validation errors. Provide accessible feedback via `aria-invalid` and `aria-describedby` attributes.

5. **Offline/Network State:** Detect offline status using the browser’s `navigator.onLine` and show warnings when the user is offline. Defer server requests until connectivity returns.

6. **Logging:** Optionally integrate a logging service (e.g., Sentry or LogRocket) to capture uncaught exceptions and API errors. Configure environment-specific logging in production vs. development.

## Check When Done

- Errors in React components trigger the global error page without crashing the entire app.
- API routes and server actions return structured error responses with meaningful messages.
- Users see toast notifications for both success and error states when interacting with forms or API calls.
- Validation errors are displayed inline with form fields and adhere to accessibility standards.
- Offline states are detected and communicated to the user, preventing data loss.
