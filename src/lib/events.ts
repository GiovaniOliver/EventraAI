import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasPermission } from './permissions';

/**
 * Get event by ID with permission check
 */
export async function getEventById(eventId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting user session', sessionError);
      redirect('/login');
    }
    
    // Check if user can read events
    const canReadEvents = await hasPermission(session.user.id, 'read', 'events');
    
    if (!canReadEvents) {
      console.error('User does not have permission to read events');
      redirect('/dashboard');
    }
    
    // Get event data
    const { data: event, error } = await supabase
      .from('events')
      .select('*, users(id, display_name, email), tasks(*), guests(*), files(*)')
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error('Error fetching event', error);
      return null;
    }
    
    // If the user is not the owner, check if they have team access
    if (event.user_id !== session.user.id) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team_members')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', session.user.id)
        .single();
      
      if (teamError || !teamMember) {
        console.error('User does not have access to this event');
        redirect('/dashboard');
      }
    }
    
    return event;
  } catch (error) {
    console.error('Error in getEventById:', error);
    return null;
  }
}

/**
 * Get upcoming events for a user
 */
export async function getUpcomingEvents(limit = 5) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  try {
    // Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting user session', sessionError);
      return [];
    }
    
    // Check if user can read events
    const canReadEvents = await hasPermission(session.user.id, 'read', 'events');
    
    if (!canReadEvents) {
      console.error('User does not have permission to read events');
      return [];
    }
    
    const now = new Date().toISOString();
    
    // Get events the user owns
    const { data: ownedEvents, error: ownedEventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', now)
      .order('date', { ascending: true })
      .limit(limit);
    
    if (ownedEventsError) {
      console.error('Error fetching owned events', ownedEventsError);
      return [];
    }
    
    // Get events the user is a team member for
    // First, get the event IDs where the user is a team member
    const { data: teamEventIds, error: teamIdsError } = await supabase
      .from('event_team_members')
      .select('event_id')
      .eq('user_id', session.user.id);
    
    if (teamIdsError) {
      console.error('Error fetching team event IDs', teamIdsError);
      return ownedEvents || [];
    }
    
    // If user is a team member for any events, fetch those events
    if (teamEventIds && teamEventIds.length > 0) {
      const eventIds = teamEventIds.map(item => item.event_id);
      
      const { data: teamEvents, error: teamEventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .neq('user_id', session.user.id)
        .gte('date', now)
        .order('date', { ascending: true })
        .limit(limit);
      
      if (teamEventsError) {
        console.error('Error fetching team events', teamEventsError);
        return ownedEvents || [];
      }
      
      // Combine and sort events
      const allEvents = [...(ownedEvents || []), ...(teamEvents || [])];
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return allEvents.slice(0, limit);
    }
    
    return ownedEvents || [];
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error);
    return [];
  }
} 