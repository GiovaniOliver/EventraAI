# EventraAI Refactoring To-Do List

## Overview
This document outlines the required tasks to refactor the original Eventa AI project into the new Next.js project structure.

## Pages Refactoring

### Pages Already Started/Implemented:
- ✅ Home Page (implemented in `/src/app/page.tsx`)
- ✅ Analytics (exists in `/src/app/analytics`)
- ✅ Profile (exists in `/src/app/profile`)
- ✅ Settings (exists in `/src/app/settings`)
- ✅ Events (exists in `/src/app/events`)
- ✅ Tasks (exists in `/src/app/tasks`)
- ✅ Vendors (exists in `/src/app/vendors`)
- ✅ Authentication (exists in `/src/app/auth` and `/src/app/(auth)`)
- ✅ About Page (exists in `/src/app/about`)
- ✅ Admin Dashboard (exists in `/src/app/admin/page.tsx`)
- ✅ Blog (exists in `/src/app/blog/page.tsx`)
- ✅ Checkout (exists in `/src/app/checkout/page.tsx`)
- ✅ Discover (exists in `/src/app/discover/page.tsx`)
- ✅ Event Detail (exists in `/src/app/events/[id]/page.tsx`)
- ✅ Not Found (exists in `/src/app/not-found.tsx`)
- ✅ Pricing (exists in `/src/app/pricing/page.tsx`)
- ✅ Promotion (implemented in `/src/app/promotion/page.tsx`)
- ✅ Subscribe (implemented in `/src/app/subscribe/page.tsx`)

### Pages to Refactor:
- ✅ All pages have been refactored!

## Components Refactoring

### Components to Check and Refactor:

#### Layout Components (✅ Completed)
- ✅ Header (exists in `/src/components/layout/header.tsx`) - Updated to use the Navigation component
- ✅ Footer (exists in `/src/components/layout/footer.tsx`)
- ✅ Navigation (created in `/src/components/layout/navigation.tsx`)
- ✅ Sidebar (created in `/src/components/layout/sidebar.tsx`) - For desktop layouts
- ✅ Bottom Navigation (exists in `/src/components/layout/bottom-navigation.tsx`) - For mobile layouts
- ✅ Main Layout (exists in `/src/components/layout/main-layout.tsx`) - Updated to use Sidebar

#### Modal Components (✅ Completed)
- ✅ NewEventModal (exists in `/src/components/modals/new-event-modal.tsx`)
- ✅ OnboardingModal (exists in `/src/components/modals/onboarding-modal.tsx`)

#### Event Components (✅ Completed)
- ✅ EventForm (exists in `/src/components/events/EventForm.tsx`)
- ✅ EventList (exists in `/src/components/events/EventList.tsx`)

#### UI Components (✅ Completed)
- ✅ Button, Card, Dialog, etc. (from shadcn/ui)
- ✅ Spinner (exists in `/src/components/ui/spinner.tsx`)

#### Analytics Components (🔶 In Progress)
- 🔶 Review and migrate any missing components from `/src/components/analytics` to `/src/components/analytics`

#### Home Components (🔶 In Progress)
- 🔶 Review and migrate any missing components from `/src/components/home` to `/src/components/home`

## Hooks and Library Code (✅ Completed)

- ✅ useAuth (exists in `/src/hooks/use-auth.tsx`)
- ✅ useEvents (exists in `/src/hooks/use-events.tsx`)
- ✅ useToast (exists in `/src/hooks/use-toast.ts`)
- ✅ useMediaQuery (created in `/src/hooks/use-media-query.ts`)
- ✅ utils (exists in `/src/lib/utils.ts`)

## Authentication & Data Fetching

- ✅ Refactor authentication from Supabase Client to use Supabase Auth Helpers for Next.js
- 🔶 Convert API calls to use Next.js API routes or Server Components where appropriate
- 🔶 Update any client-side data fetching to use React Query or SWR with Next.js patterns

## Styling and Theming

- ✅ Fix the Tailwind CSS configuration (PostCSS integration fixed with @tailwindcss/postcss package)
- ✅ Ensure all components properly use the theme variables and utility classes
- ✅ Convert inline styles to Tailwind classes

## Testing

- 🔴 Create a testing strategy for the refactored components
- 🔴 Implement unit tests for critical components
- 🔴 Implement integration tests for key user flows

## Additional Considerations

- 🔶 Update metadata for SEO in appropriate layout.tsx or page.tsx files
- 🔶 Implement proper error handling with Next.js error.tsx files
- 🔶 Set up proper loading states with Next.js loading.tsx files
- 🔶 Implement environment variables for the new project structure
- 🔶 Review and update any third-party integrations
- ✅ Implement proper image optimization with Next.js Image component

## Legend
- ✅ Completed/Exists
- 🔶 Partially completed/In progress
- 🔴 Not started

## Migration Plan

### Phase 1: Core Structure and Routes ✅
1. Complete the page routing structure ✅
2. Set up proper layouts for each section ✅ 
3. Implement navigation between pages ✅

### Phase 2: Component Migration ✅
1. Migrate UI components first ✅
2. Migrate feature-specific components ✅
3. Adapt components to Next.js App Router patterns ✅

### Phase 3: Authentication and Data 🔶
1. Implement authentication flow ✅
2. Set up data fetching with server components 🔶
3. Create necessary API routes 🔶

### Phase 4: Styling and Polish ✅
1. Ensure consistent styling across all pages ✅
2. Implement responsive design ✅
3. Add animations and transitions ✅

### Phase 5: Testing and Optimization 🔴
1. Implement testing 🔴
2. Optimize performance 🔴
3. Add analytics and monitoring 🔴