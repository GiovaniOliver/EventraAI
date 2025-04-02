import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthUser } from '@/lib/auth-middleware';
import { createServerClient } from '@/lib/supabase';
import { getVisualization, deleteVisualization } from '@/lib/openai-service';
import { hasPermission } from '@/lib/rbac';

// Get a specific visualization with signed URLs
export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const segments = req.nextUrl.pathname.split('/');
    const eventId = segments[3];
    const visualizationId = segments[5];
    
    if (!eventId || !visualizationId) {
      return NextResponse.json({ error: 'Event ID and visualization ID are required' }, { status: 400 });
    }

    // Check permission
    const hasAccess = await hasPermission(user.id, 'read', 'events');
    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have permission to view this event' }, { status: 403 });
    }

    // Get visualization
    try {
      const visualization = await getVisualization(visualizationId);
      
      if (!visualization) {
        return NextResponse.json({ error: 'Visualization not found' }, { status: 404 });
      }
      
      // Verify this visualization belongs to the specified event
      if (visualization.event_id !== eventId) {
        return NextResponse.json({ error: 'Visualization does not belong to this event' }, { status: 400 });
      }
      
      // Get signed URLs for images
      const supabase = createServerClient();
      let originalUrl = null;
      let generatedUrl = null;
      
      if (visualization.original_image_path) {
        const { data: origData } = await supabase.storage
          .from('venue-images')
          .createSignedUrl(visualization.original_image_path, 3600); // 1 hour expiry
        
        if (origData?.signedUrl) {
          originalUrl = origData.signedUrl;
        }
      }
      
      if (visualization.generated_image_path) {
        const { data: genData } = await supabase.storage
          .from('venue-visualizations')
          .createSignedUrl(visualization.generated_image_path, 3600); // 1 hour expiry
        
        if (genData?.signedUrl) {
          generatedUrl = genData.signedUrl;
        }
      }
      
      return NextResponse.json({
        success: true,
        visualization: {
          ...visualization,
          originalUrl,
          generatedUrl,
        },
      });
    } catch (error) {
      console.error('Error fetching visualization:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch visualization' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Visualization fetch error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Delete a visualization
export const DELETE = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const segments = req.nextUrl.pathname.split('/');
    const eventId = segments[3];
    const visualizationId = segments[5];
    
    if (!eventId || !visualizationId) {
      return NextResponse.json({ error: 'Event ID and visualization ID are required' }, { status: 400 });
    }

    // Check permission
    const hasAccess = await hasPermission(user.id, 'update', 'events');
    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have permission to modify this event' }, { status: 403 });
    }

    // Get visualization to check ownership
    const supabase = createServerClient();
    const { data: visualization, error: visError } = await supabase
      .from('venue_visualizations')
      .select('id, event_id')
      .eq('id', visualizationId)
      .single();
    
    if (visError || !visualization) {
      return NextResponse.json({ error: 'Visualization not found' }, { status: 404 });
    }
    
    // Verify this visualization belongs to the specified event
    if (visualization.event_id !== eventId) {
      return NextResponse.json({ error: 'Visualization does not belong to this event' }, { status: 400 });
    }
    
    // Check if user is the event owner
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single();
    
    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    if (event.owner_id !== user.id) {
      // Check if user is a team member with sufficient permissions
      const { count } = await supabase
        .from('event_team')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .in('role', ['admin', 'editor']);
      
      if (count === 0) {
        return NextResponse.json({ error: 'You do not have permission to delete visualizations for this event' }, { status: 403 });
      }
    }
    
    // Delete the visualization
    try {
      await deleteVisualization(visualizationId);
      
      return NextResponse.json({
        success: true,
        message: 'Visualization deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting visualization:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to delete visualization' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Visualization delete error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}); 