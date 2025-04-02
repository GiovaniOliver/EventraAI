# AI Venue Theme Visualization

## Feature Overview

The AI Venue Theme Visualization feature allows users to upload photos of event venues and generate AI-enhanced themed versions based on their event details. This feature helps event planners visualize how their venue will look with different themes and decorations without requiring professional design services.

## Implementation Plan

### Database Changes

1. **Update Events Table**
   - Add `theme` field to store the selected event theme

2. **Create Venue Visualization Table**
   ```sql
   CREATE TABLE IF NOT EXISTS public.venue_visualizations (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
       original_image_path TEXT NOT NULL,
       generated_image_path TEXT,
       theme TEXT NOT NULL,
       prompt TEXT NOT NULL,
       status TEXT DEFAULT 'pending',
       generation_params JSONB DEFAULT '{}',
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Add indexes
   CREATE INDEX idx_venue_vis_event_id ON public.venue_visualizations(event_id);
   CREATE INDEX idx_venue_vis_status ON public.venue_visualizations(status);

   -- Enable RLS
   ALTER TABLE public.venue_visualizations ENABLE ROW LEVEL SECURITY;

   -- RLS policies
   CREATE POLICY "Users can view their own venue visualizations"
       ON public.venue_visualizations
       FOR SELECT
       USING (
           EXISTS (
               SELECT 1 FROM public.events 
               WHERE id = venue_visualizations.event_id 
               AND owner_id = auth.uid()
           ) OR
           EXISTS (
               SELECT 1 FROM public.event_team 
               WHERE event_id = venue_visualizations.event_id 
               AND user_id = auth.uid()
           )
       );

   CREATE POLICY "Users can create venue visualizations for their events"
       ON public.venue_visualizations
       FOR INSERT
       WITH CHECK (
           EXISTS (
               SELECT 1 FROM public.events 
               WHERE id = event_id 
               AND owner_id = auth.uid()
           )
       );

   CREATE POLICY "Users can update their own venue visualizations"
       ON public.venue_visualizations
       FOR UPDATE
       USING (
           EXISTS (
               SELECT 1 FROM public.events 
               WHERE id = event_id 
               AND owner_id = auth.uid()
           )
       );
   ```

3. **Update Subscription Limits**
   - Add `ai_image_limit` to subscription plans
   - Update `subscription-limiter.ts` to track and enforce these limits

### Storage Configuration

1. **Create Supabase Storage Buckets**
   - `venue-images`: For original venue images
   - `venue-visualizations`: For AI-generated visualizations

2. **Set Storage RLS Policies**
   - Allow authenticated users to upload to their own folders
   - Allow public read access for visualizations

### API Integration

1. **OpenAI GPT-4o Integration**
   - Create wrapper service for OpenAI API
   - Implement image generation with prompt construction
   - Handle error cases and retries

2. **API Endpoints**
   - `POST /api/events/:eventId/venue-visualization`: Upload original image and generate visualization
   - `GET /api/events/:eventId/venue-visualizations`: List all visualizations for an event
   - `DELETE /api/events/:eventId/venue-visualizations/:id`: Delete a visualization

### UI Components

1. **Event Creation Wizard Updates**
   - Add theme selection to wizard
   - Add venue image upload component
   - Show visualization preview and regeneration option

2. **Dashboard Quick Action**
   - Add "Visualize Venue" to quick actions
   - Create modal for venue visualization from dashboard

3. **Visualization Gallery**
   - Create comparison view of original vs. themed
   - Allow switching between different generated themes
   - Add sharing options

### Subscription Tiers

| Tier | Monthly Price | AI Image Generations |
|------|---------------|---------------------|
| Free | $0 | 2 |
| Starter | $14.99 | 10 |
| Pro | $29.99 | 25 |
| Business | $59.99 | 50 |
| Enterprise | Custom | Unlimited |

### Implementation Phases

1. **Phase 1: Database and Storage Setup**
   - Create database migration
   - Set up storage buckets
   - Update subscription limiter

2. **Phase 2: API Integration**
   - Implement OpenAI service wrapper
   - Create API endpoints
   - Add image processing utilities

3. **Phase 3: UI Integration**
   - Update event wizard
   - Add dashboard quick action
   - Create visualization gallery

4. **Phase 4: Testing and Refinement**
   - User testing
   - Performance optimization
   - Error handling improvements

## Technical Considerations

### Image Processing

- Input images should be resized to optimize for API usage
- Accepted formats: JPG, PNG
- Max file size: 4MB
- Recommended resolution: 1024x1024px or 1792x1024px (landscape)

### Prompt Engineering

Use a structured prompt template for consistent results:

```
Transform this [venue type] into a [theme] setting for a [event type]. 
Apply [style details] decoration style with [color scheme] colors.
Maintain the original structure and dimensions while enhancing with [specific decorative elements].
```

### Security and Privacy

- All uploaded images are private by default
- Generated images can be made public with user permission
- Apply content moderation to prevent misuse

### Rate Limiting

- Implement tier-based rate limiting
- Add purchase option for additional generations
- Track monthly usage with reset on billing cycle

## User Flow

1. User selects or creates an event
2. User uploads venue photo
3. System suggests themes based on event type or user selects theme
4. AI generates themed visualization
5. User can regenerate with adjustments or save
6. Visualization is stored and associated with the event

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/guides/images)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js File Upload Best Practices](https://nextjs.org/docs/api-routes/introduction) 