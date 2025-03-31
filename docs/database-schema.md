# EventraAI Database Schema

This document outlines the database schema for the EventraAI application, providing a reference for all tables and their relationships.

## Users and Authentication

### users

Primary user account table (managed by Supabase Auth)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | TEXT | Unique username |
| display_name | TEXT | User's display name |
| email | TEXT | Unique email address |
| is_admin | BOOLEAN | Administrator status |
| password | TEXT | Hashed password (managed by Auth) |
| stripe_customer_id | TEXT | Stripe customer reference |
| subscription_tier | TEXT | Current subscription level |
| subscription_status | TEXT | Subscription status |
| created_at | TIMESTAMP | Creation timestamp |

### user_preferences

User customization settings

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to users table |
| preferred_themes | JSONB | Array of preferred themes |
| preferred_event_types | JSONB | Array of preferred event types |
| notifications_enabled | BOOLEAN | Whether notifications are enabled |
| onboarding_completed | BOOLEAN | Whether onboarding is complete |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### team_members

Associates team members with a team owner

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| team_owner_id | UUID | Reference to users table (owner) |
| member_id | UUID | Reference to users table (team member) |
| role | TEXT | Team member role (default: 'editor') |
| created_at | TIMESTAMP | Creation timestamp |

## Events and Planning

### events

Core event information

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Event name |
| type | TEXT | Event type |
| format | TEXT | Event format |
| date | TIMESTAMP | Event date |
| owner_id | UUID | Reference to users table |
| estimated_guests | INTEGER | Estimated guest count |
| description | TEXT | Event description |
| status | TEXT | Event status (default: 'draft') |
| theme | TEXT | Event theme |
| budget | INTEGER | Event budget |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### event_team

Associates users with events for collaboration

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| user_id | UUID | Reference to users table |
| role | TEXT | User role for this event |
| created_at | TIMESTAMP | Creation timestamp |

### tasks

Tasks associated with events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | Task status (default: 'pending') |
| due_date | TIMESTAMP | Due date |
| assigned_to | UUID | Reference to users table |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### planning_tips

Generic planning tips for events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Tip title |
| description | TEXT | Tip description |
| category | TEXT | Tip category |
| icon | TEXT | Icon identifier |
| created_at | TIMESTAMP | Creation timestamp |

## Guests and Attendees

### guests

Event guest list

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| name | TEXT | Guest name |
| email | TEXT | Guest email |
| status | TEXT | Attendance status (default: 'invited') |
| created_at | TIMESTAMP | Creation timestamp |

### attendee_feedback

Feedback from event attendees

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| attendee_email | TEXT | Attendee email |
| overall_rating | INTEGER | Overall event rating |
| content_rating | INTEGER | Content quality rating |
| technical_rating | INTEGER | Technical quality rating |
| engagement_rating | INTEGER | Engagement rating |
| comments | TEXT | Written feedback |
| would_recommend | BOOLEAN | Whether attendee would recommend |
| created_at | TIMESTAMP | Creation timestamp |

## Vendors and Services

### vendors

Vendor information

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Vendor name |
| category | TEXT | Vendor category |
| description | TEXT | Vendor description |
| contact_email | TEXT | Contact email |
| contact_phone | TEXT | Contact phone |
| website | TEXT | Website URL |
| is_partner | BOOLEAN | Official partner status |
| logo | TEXT | Logo URL |
| services | JSONB | Services offered |
| rating | INTEGER | Vendor rating |
| owner_id | UUID | Reference to users table |
| created_at | TIMESTAMP | Creation timestamp |
| is_approved | BOOLEAN | Admin approval status |
| affiliate_links | JSONB | Affiliate link information |
| featured | BOOLEAN | Featured vendor status |

### event_vendors

Associates vendors with events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| vendor_id | UUID | Reference to vendors table |
| status | TEXT | Booking status (default: 'pending') |
| budget | INTEGER | Allocated budget |
| notes | TEXT | Notes |
| created_at | TIMESTAMP | Creation timestamp |

## Analytics and Insights

### event_analytics

Analytics data for events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| attendee_count | INTEGER | Number of attendees |
| engagement_score | INTEGER | Overall engagement score |
| average_attendance_time | INTEGER | Average attendance time |
| max_concurrent_users | INTEGER | Maximum concurrent users |
| total_interactions | INTEGER | Total interactions |
| feedback_score | INTEGER | Aggregated feedback score |
| analytics_date | TIMESTAMP | Date of analytics |
| detailed_metrics | JSONB | Detailed metrics data |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Subscription and Billing

### subscription_plans

Available subscription plans

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Plan identifier |
| display_name | TEXT | Human-readable name |
| description | TEXT | Plan description |
| price | INTEGER | Price in cents |
| currency | TEXT | Currency code |
| interval | TEXT | Billing interval |
| billing_cycle | TEXT | Billing cycle description |
| features | JSONB | Features included |
| event_limit | INTEGER | Maximum events allowed |
| guest_limit | INTEGER | Maximum guests allowed |
| vendor_limit | INTEGER | Maximum vendors allowed |
| analytics_period | INTEGER | Analytics retention period |
| ai_call_limit | INTEGER | AI API call limit |
| stripe_product_id | TEXT | Stripe product ID |
| stripe_price_id | TEXT | Stripe price ID |
| is_active | BOOLEAN | Whether plan is active |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### transactions

Payment transactions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to users table |
| amount | INTEGER | Amount in cents |
| currency | TEXT | Currency code |
| status | TEXT | Transaction status |
| type | TEXT | Transaction type |
| description | TEXT | Transaction description |
| stripe_payment_intent_id | TEXT | Stripe payment intent ID |
| stripe_invoice_id | TEXT | Stripe invoice ID |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP | Creation timestamp |

## AI Integration

### ai_usage

Tracks AI API usage

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to users table |
| call_type | TEXT | Type of AI API call |
| timestamp | TIMESTAMP | When call was made |
| tokens_used | INTEGER | Number of tokens used |
| prompt | TEXT | User prompt |
| response | TEXT | AI response |
| event_id | UUID | Associated event (optional) |

### ai_suggestions

AI-generated suggestions for events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| suggestion_type | TEXT | Type of suggestion |
| content | TEXT | Suggestion content |
| is_implemented | BOOLEAN | Implementation status |
| created_at | TIMESTAMP | Creation timestamp |

## File Management

### event_files

Files associated with events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Reference to events table |
| filename | TEXT | Original filename |
| file_path | TEXT | Storage path |
| file_type | TEXT | MIME type |
| size_bytes | INTEGER | File size |
| uploaded_by | UUID | Reference to users table |
| created_at | TIMESTAMP | Upload timestamp | 