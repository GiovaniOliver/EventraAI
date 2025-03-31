# Event Sharing Features

This document outlines the event sharing functionality in EventraAI, which allows users to share their events with others through customizable links and QR codes, along with analytics tracking.

## Implemented Features

### 1. Event Share Button

- **Component**: `EventShareButton`
- **Path**: `src/components/sharing/EventShareButton.tsx`
- **Description**: A reusable button component that opens a popover with different sharing options.

#### Sharing Options:

- **Link Sharing**: Generate a customizable link that can be copied to the clipboard
  - Options to show/hide event image and details
- **QR Code**: Generate a QR code that links to the event
  - Direct link to a dedicated QR code page
- **Social Sharing**: Share the event link on various platforms
  - Twitter
  - Facebook
  - WhatsApp
  - Email

### 2. Event Preview Component

- **Component**: `EventPreview`
- **Path**: `src/components/sharing/EventPreview.tsx`
- **Description**: Displays a preview of the event with customizable display options.

### 3. QR Code Preview Component

- **Component**: `QRCodePreview`
- **Path**: `src/components/sharing/QRCodePreview.tsx`
- **Description**: Displays a QR code for a given URL with download functionality.

### 4. Shared Event Page

- **Path**: `src/app/events/share/[eventId]/page.tsx`
- **Description**: A public page that displays shared event details without requiring authentication.

#### Features:

- **SEO Metadata**: Generates dynamic metadata for better SEO and social sharing
- **Event Details**: Displays event information in a user-friendly format
- **QR Code Tab**: Dedicated tab for viewing and downloading the event QR code
- **Responsive Design**: Adapts to different screen sizes for optimal viewing

### 5. API for Shared Events

- **Path**: `src/app/api/events/shared/[eventId]/route.ts`
- **Description**: API endpoint for fetching publicly shareable event details.

### 6. Sharing Analytics

- **Share Tracking API**: Tracks when and how events are shared
  - **Path**: `src/app/api/events/[eventId]/share/route.ts`
  - **Features**: Records sharing platform, type, and user information

- **View Tracking API**: Tracks views of shared event pages
  - **Path**: `src/app/api/events/shared/views/route.ts`
  - **Features**: Records view counts, referrers, and anonymous visitor information

- **Database Schema**: Tables and functions for storing and analyzing share data
  - **Path**: `supabase/migrations/20250501_sharing_tables.sql`
  - **Tables**:
    - `event_shares`: Records each sharing action
    - `event_views`: Aggregates view counts for shared events
    - `event_view_logs`: Detailed logs of event page views (anonymized)

## Usage

### Basic Usage

To add the share button to an event component:

```tsx
import EventShareButton from '@/components/sharing/EventShareButton'

function EventComponent({ event }) {
  return (
    <div>
      <h1>{event.title}</h1>
      <EventShareButton event={event} />
    </div>
  )
}
```

### Customizing the Share Button

The share button can be customized with different variants and sizes:

```tsx
<EventShareButton 
  event={event} 
  variant="outline" // 'default', 'outline', or 'ghost'
  size="sm" // 'default', 'sm', 'lg', or 'icon'
  iconOnly={true} // Show only the icon without text
/>
```

### Using the QR Code Component

The QR code component can be used independently:

```tsx
import QRCodePreview from '@/components/sharing/QRCodePreview'

function QRCodeComponent() {
  return (
    <QRCodePreview 
      url="https://example.com/events/123" 
      title="Event QR Code"
      size={250} // Size in pixels (optional)
    />
  )
}
```

### Accessing Share Analytics

Share analytics are available through the API:

```tsx
// Get sharing statistics for an event
const response = await fetch(`/api/events/${eventId}/share`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const stats = await response.json();
// stats contains:
// - totalShares: Total number of times the event was shared
// - stats: Breakdown by platform
// - views: Number of views of the shared event page
```

## Security Considerations

- Shared event pages are publicly accessible without authentication
- Only non-sensitive event details are exposed in the shared view
- Draft events or cancelled events are not accessible through the sharing API
- Middleware allows access to the share pages while protecting other routes
- View tracking anonymizes visitor information for privacy

## Analytics Data Collected

The sharing system collects the following analytics data:

1. **Share Actions**:
   - User ID of the person sharing
   - Event ID
   - Platform used (Twitter, Facebook, email, etc.)
   - Share type (link, QR code, social)
   - Timestamp

2. **View Counts**:
   - Aggregate count of views per event
   - First view timestamp
   - Last view timestamp

3. **View Details** (anonymized):
   - Referrer information
   - Hashed IP address (for privacy)
   - User agent
   - Timestamp

## Future Enhancements

Potential improvements to the sharing functionality:

1. **Enhanced Analytics Dashboard**: Visualize sharing statistics for event organizers
2. **Password Protection**: Allow organizers to set passwords for viewing shared events
3. **Expiry Dates**: Set expiration dates for shared links
4. **Custom Branding**: Allow users to customize the appearance of shared event pages
5. **Enhanced Social Integration**: Add more social sharing options and preview cards
6. **Visual QR Codes**: Add branding and visual styling to QR codes

## Technical Implementation

The sharing system is built on Next.js App Router architecture with the following components:

- **Client Components**: All UI components are client components for interactivity
- **Server Components**: The main page component is a server component for SEO benefits
- **API Routes**: Server-side API endpoints for fetching shared event data
- **Middleware**: Updated to allow public access to shared event pages
- **Database Access**: Limited to only expose public information for shared events
- **Analytics Tracking**: Non-blocking tracking of shares and views for performance 