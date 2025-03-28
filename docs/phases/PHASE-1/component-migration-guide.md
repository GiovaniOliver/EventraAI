# React to Next.js Component Migration Guide

This document provides guidance on how to migrate existing React components from the current application structure to Next.js, focusing on best practices and patterns.

## Key Differences

### 1. Server vs. Client Components

Next.js introduces the concept of Server Components (the default) and Client Components:

**Server Components:**
- Render on the server
- Reduce client-side JavaScript
- Can directly access backend resources
- Cannot use hooks or browser APIs

**Client Components:**
- Similar to traditional React components
- Can use hooks, event handlers, and browser APIs
- Must be explicitly marked with `'use client'` directive

### 2. File Structure

**Current structure:**
```
client/
└── src/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   └── modals/
    ├── pages/
    │   ├── home.tsx
    │   ├── events.tsx
    │   └── ...
    ├── hooks/
    └── lib/
```

**Next.js structure:**
```
app/
├── (routes)/        # Grouped routes
│   ├── page.tsx     # Home page
│   ├── events/
│   │   ├── page.tsx # Events page
│   │   └── [id]/    # Dynamic route
│   │       └── page.tsx
│   └── layout.tsx   # Shared layout
├── api/             # API routes
│   └── health/
│       └── route.ts
├── components/      # Shared components
│   ├── ui/
│   └── layout/
└── lib/             # Utilities
```

## Migration Guidelines

### 1. Deciding Between Server and Client Components

| If your component... | It should be... |
|------------------|-----------------|
| Fetches data | Server Component |
| Accesses backend resources directly | Server Component |
| Needs SEO optimization | Server Component |
| Uses hooks (useState, useEffect, etc.) | Client Component |
| Uses browser-only APIs | Client Component |
| Uses event listeners | Client Component |
| Needs interactivity | Client Component |

### 2. Converting wouter Routes to Next.js App Router

**Current Routes (App.tsx):**
```tsx
<Switch>
  <Route path="/" component={HomePage} />
  <Route path="/events" component={Events} />
  <Route path="/events/:id" component={EventDetail} />
  <ProtectedRoute path="/dashboard" component={Dashboard} />
</Switch>
```

**Next.js App Router:**
- Create `/app/page.tsx` for the home page
- Create `/app/events/page.tsx` for the events page
- Create `/app/events/[id]/page.tsx` for event details
- Create `/app/dashboard/page.tsx` for the dashboard with middleware protection

### 3. Step-by-Step Migration Process

#### For Server Components

1. Create appropriate file in the Next.js structure
2. Remove hooks and event handlers (move to client components if needed)
3. Convert data fetching to use native async/await
4. Keep UI rendering logic

**Example Migration:**

Current React Component:
```tsx
// events.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function Events() {
  const [filter, setFilter] = useState('all');
  const { data: events } = useQuery(['events', filter], fetchEvents);
  
  return (
    <div>
      <h1>Events</h1>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="upcoming">Upcoming</option>
      </select>
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

Next.js Server Component:
```tsx
// app/events/page.tsx
import { EventFilter } from '@/components/events/event-filter';
import { EventsList } from '@/components/events/events-list';
import { getEvents } from '@/lib/data';

// This is a Server Component that fetches data and renders static content
export default async function EventsPage({
  searchParams
}: {
  searchParams: { filter?: string }
}) {
  // Get filter from search params (URL)
  const filter = searchParams.filter || 'all';
  
  // Fetch data directly - no need for React Query in server components
  const events = await getEvents(filter);
  
  return (
    <div>
      <h1>Events</h1>
      <EventFilter initialFilter={filter} />
      <EventsList events={events} />
    </div>
  );
}
```

Client Components for Interactive Parts:
```tsx
// components/events/event-filter.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation';

export function EventFilter({ initialFilter = 'all' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  function handleFilterChange(newFilter: string) {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    router.push(`/events?${params.toString()}`);
  }
  
  return (
    <select 
      value={initialFilter} 
      onChange={(e) => handleFilterChange(e.target.value)}
    >
      <option value="all">All</option>
      <option value="upcoming">Upcoming</option>
    </select>
  );
}
```

#### For Client Components

1. Add `'use client'` directive at the top of the file
2. Update imports and hooks as needed
3. Replace navigation with Next.js navigation
4. Update data fetching if necessary

### 4. Context Provider Migration

Next.js application context providers should be placed in a client layout component.

**Current Context Provider:**
```tsx
// App.tsx
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

**Next.js Providers:**
```tsx
// app/providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { WebSocketProvider } from '@/hooks/websocket-provider';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          {children}
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

Then use it in your root layout:

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 5. Navigation Updates

Replace wouter navigation with Next.js navigation:

**Current Navigation:**
```tsx
import { useLocation } from 'wouter';

function Component() {
  const [_, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation('/events');
  };
  
  return <button onClick={handleClick}>Go to Events</button>;
}
```

**Next.js Navigation:**
```tsx
'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/events');
  };
  
  return (
    <>
      {/* For most links, use Link component */}
      <Link href="/events">Go to Events</Link>
      
      {/* For programmatic navigation */}
      <button onClick={handleClick}>Go to Events</button>
    </>
  );
}
```

## Testing the Migration

For each migrated component:

1. Check for proper rendering
2. Verify data fetching works correctly
3. Ensure all interactivity functions as expected
4. Test navigation flows
5. Verify authentication behavior

## Common Pitfalls

- Mixing client and server code in server components
- Forgetting to add 'use client' directive
- Incorrect file naming in the App Router structure
- Using client-side libraries in server components
- Not properly handling loading and error states

## Migration Checklist

- [ ] Convert page components to Next.js pages
- [ ] Split interactive components into client components
- [ ] Update data fetching to use Server Components where possible
- [ ] Migrate context providers
- [ ] Update navigation
- [ ] Test thoroughly

Following these guidelines will help ensure a smooth migration from the current React components to the Next.js architecture. 