import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthUser } from '@/lib/auth-middleware';
import { createServerClient } from '@/lib/supabase';
import { generateVenueVisualization, getEventVisualizations, getVisualization, deleteVisualization } from '@/lib/openai-service';
import { checkLimit } from '@/lib/subscription-limiter';
import { hasPermission } from '@/lib/rbac';

// Upload original venue image and generate visualization
export const POST = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const eventId = req.nextUrl.pathname.split('/')[3];
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Check permission
    const hasAccess = await hasPermission(user.id, 'update', 'events');
    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have permission to modify this event' }, { status: 403 });
    }

    // Check if event exists and belongs to user
    const supabase = createServerClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, owner_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.owner_id !== user.id) {
      // Check if user is a team member
      const { count } = await supabase
        .from('event_team')
        .select('id', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (count === 0) {
        return NextResponse.json({ error: 'You do not have permission to modify this event' }, { status: 403 });
      }
    }

    // Check subscription limits
    try {
      await checkLimit(user.id, 'ai_images');
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Subscription limit reached' },
        { status: 402 } // Payment Required
      );
    }

    // Parse form data
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const theme = formData.get('theme') as string;
    const eventType = formData.get('eventType') as string;
    const additionalPrompt = formData.get('additionalPrompt') as string | undefined;

    if (!image || !theme || !eventType) {
      return NextResponse.json({ error: 'Image, theme, and event type are required' }, { status: 400 });
    }

    // Validate image
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ error: 'Only JPEG and PNG images are supported' }, { status: 400 });
    }

    if (image.size > 4 * 1024 * 1024) { // 4MB limit
      return NextResponse.json({ error: 'Image size must be less than 4MB' }, { status: 400 });
    }

    // Upload original image to Supabase storage
    const timestamp = Date.now();
    const filename = `${eventId}/${user.id}_${timestamp}_${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('venue-images')
      .upload(filename, image, {
        contentType: image.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Generate AI visualization
    try {
      const result = await generateVenueVisualization(
        user.id,
        eventId,
        filename,
        theme,
        eventType,
        additionalPrompt
      );

      // Return the visualization data
      return NextResponse.json({
        success: true,
        visualizationId: result.visualizationId,
        originalImage: filename,
        generatedImage: result.generatedImagePath,
        theme,
      });
    } catch (error) {
      console.error('Visualization generation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate visualization' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Venue visualization error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Get all visualizations for an event
export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const eventId = req.nextUrl.pathname.split('/')[3];
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Check permission
    const hasAccess = await hasPermission(user.id, 'read', 'events');
    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have permission to view this event' }, { status: 403 });
    }

    // Get visualizations for the event
    try {
      const visualizations = await getEventVisualizations(eventId);
      
      // Get signed URLs for images
      const supabase = createServerClient();
      const visualizationsWithUrls = await Promise.all(
        visualizations.map(async (vis) => {
          let originalUrl = null;
          let generatedUrl = null;
          
          if (vis.original_image_path) {
            const { data: origData } = await supabase.storage
              .from('venue-images')
              .createSignedUrl(vis.original_image_path, 3600); // 1 hour expiry
            
            if (origData?.signedUrl) {
              originalUrl = origData.signedUrl;
            }
          }
          
          if (vis.generated_image_path) {
            const { data: genData } = await supabase.storage
              .from('venue-visualizations')
              .createSignedUrl(vis.generated_image_path, 3600); // 1 hour expiry
            
            if (genData?.signedUrl) {
              generatedUrl = genData.signedUrl;
            }
          }
          
          return {
            ...vis,
            originalUrl,
            generatedUrl,
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        visualizations: visualizationsWithUrls,
      });
    } catch (error) {
      console.error('Error fetching visualizations:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch visualizations' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Venue visualization fetch error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}); 