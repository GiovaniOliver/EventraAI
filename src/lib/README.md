# Authentication System

## Overview

This application uses Supabase Authentication for user management. The authentication system has been standardized to use only Supabase Auth, with removal of all NextAuth references for consistency.

## Structure

- **API Routes**: Located at `/api/auth/route.ts`, these endpoints handle auth operations including signin, signup, signout, and session management
- **Auth Utility**: `lib/auth.ts` provides utility functions for auth operations
- **Auth Hook**: `hooks/use-auth.tsx` is the primary React hook for all authentication operations in components

## Usage

### In React Components

```tsx
import { useAuth } from '@/hooks';

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Successful login will redirect automatically
    } catch (error) {
      // Error handling is done inside the hook
    }
  };
  
  return (
    // Login form
  );
}
```

### In API Routes

```ts
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Create a Supabase server client
  const supabase = createServerClient();
  
  // Get session
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Proceed with authenticated operations
}
```

## Utility Functions

The following auth utility functions are available:

- `signIn(email, password)`: Sign in a user
- `signUp(email, password, fullName)`: Register a new user
- `signOut()`: Sign out the current user
- `resetPassword(email)`: Send a password reset email
- `updatePassword(newPassword)`: Update a user's password
- `getSession()`: Get the current session
- `getUser()`: Get the current user

## Authentication Flow

1. Users authenticate through Supabase Auth
2. Upon successful authentication, a user profile is created in the `users` table
3. Auth state is managed through the `AuthContext` provider
4. The `useAuth` hook provides a unified interface to auth operations

## Security Considerations

- Row Level Security (RLS) policies are implemented at the database level
- API routes check authentication state before processing requests
- Auth tokens are stored securely and automatically refreshed
- Password reset functionality uses secure links with expiration 