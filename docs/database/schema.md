# EventraAI Database Schema Documentation

## Overview

The EventraAI application uses a PostgreSQL database with Supabase for authentication and data storage. The database schema is designed to support event management, user authentication, task tracking, and resource management.

## Core Tables

### Users

Stores user profiles beyond the default Supabase auth.users table.

```sql
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    stripe_customer_id TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free',
    subscription_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Events

Primary table for storing event information.

```sql
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'in-person',
    description TEXT,
    location TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    estimated_guests INTEGER,
    budget DECIMAL(12,2),
    status TEXT NOT NULL DEFAULT 'draft',
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tasks

Stores tasks associated with events.

```sql
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Vendors

Stores vendor/service provider information.

```sql
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    logo TEXT,
    is_partner BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    rating DECIMAL(3,1),
    price_range TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Event_Vendors

Junction table connecting events and vendors.

```sql
CREATE TABLE IF NOT EXISTS public.event_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    budget DECIMAL(12,2),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, vendor_id)
);
```

### Guests

Stores information about event attendees.

```sql
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'invited',
    rsvp_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Files

Stores event-related files and attachments.

```sql
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Event_Team

Stores event collaborators and their roles.

```sql
CREATE TABLE IF NOT EXISTS public.event_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
```

## Support Tables

### User_Preferences

Stores user-specific settings and preferences.

```sql
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_themes JSONB,
    preferred_event_types JSONB,
    dark_mode BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Event_Analytics

Tracks event performance metrics.

```sql
CREATE TABLE IF NOT EXISTS public.event_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    rsvp_count INTEGER DEFAULT 0,
    attendee_count INTEGER DEFAULT 0,
    feedback_score DECIMAL(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### AI_Usage

Tracks AI service usage for billing and limits.

```sql
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    tokens_used INTEGER,
    input_data JSONB,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Subscription_Plans

Defines available subscription tiers and their features.

```sql
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    interval TEXT NOT NULL,
    features JSONB NOT NULL,
    event_limit INTEGER,
    ai_call_limit INTEGER,
    guest_limit INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Notifications

Stores user notifications.

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'unread',
    link VARCHAR(255),
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
```

### User_Profiles

Extended user profile information.

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(50),
    timezone VARCHAR(50),
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Analytics & Sharing Tables

### Event_Shares

Tracks when and how events are shared.

```sql
CREATE TABLE IF NOT EXISTS event_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL DEFAULT 'direct',
    share_type VARCHAR(20) NOT NULL DEFAULT 'link',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Event_Views

Aggregates view counts for shared events.

```sql
CREATE TABLE IF NOT EXISTS event_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0,
    first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Event_View_Logs

Detailed logs of event page views with anonymized visitor data.

```sql
CREATE TABLE IF NOT EXISTS event_view_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    referrer VARCHAR(255),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Row Level Security (RLS)

The database implements Row Level Security policies to ensure users can only access their own data or data they have been explicitly granted access to. Key RLS policies include:

- Users can only see and modify their own user data
- Events can only be accessed by their owner or team members
- Tasks can only be accessed by the creator, event owner, or team members
- Files can only be accessed by the uploader, event owner, or team members

## Functions and Triggers

Several functions and triggers maintain data integrity:

- `update_updated_at()`: Updates timestamps on record changes
- `handle_new_user()`: Creates a user profile when a new auth user is created
- `mark_notifications_as_read()`: Updates notification status
- `get_event_share_stats()`: Aggregates event sharing statistics

## Database Extensions

The database uses the following extensions:

- `uuid-ossp`: For UUID generation
- `pgcrypto`: For cryptographic functions

## Security Considerations

- JWT authentication is used for API access
- Row Level Security (RLS) policies restrict data access
- Database roles separate privileges
- Passwords are never stored in plain text
- All access is logged and monitored 