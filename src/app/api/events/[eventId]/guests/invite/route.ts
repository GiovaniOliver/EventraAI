import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

interface RouteParams {
  params: {
    eventId: string
  }
}

/**
 * POST /api/events/:id/guests/invite - Send invitations to guests
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const eventId = params.eventId
  const supabase = createServerClient()
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Check if event exists and user has access
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }
    
    // Check if user has access to the event
    if (event.user_id !== userId) {
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()
      
      if (teamError || !teamMember) {
        return NextResponse.json(
          { error: 'Unauthorized to send invitations for this event' },
          { status: 403 }
        )
      }
    }
    
    // Get invitation data from request
    const { 
      guestIds, 
      message = '', 
      template = 'default',
      sendToAll = false
    } = await request.json()
    
    if (!guestIds && !sendToAll) {
      return NextResponse.json(
        { error: 'Must provide guestIds or set sendToAll to true' },
        { status: 400 }
      )
    }
    
    // Build query to get guests
    let guestsQuery = supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
    
    if (!sendToAll && guestIds && guestIds.length > 0) {
      guestsQuery = guestsQuery.in('id', guestIds)
    }
    
    // Only include guests who haven't been sent an invitation yet
    // or if their status is 'not_sent' or 'failed'
    if (sendToAll) {
      guestsQuery = guestsQuery.or('invitation_status.is.null,invitation_status.eq.not_sent,invitation_status.eq.failed')
    }
    
    // Get guests to invite
    const { data: guests, error: guestsError } = await guestsQuery
    
    if (guestsError) {
      return NextResponse.json(
        { error: guestsError.message },
        { status: 500 }
      )
    }
    
    if (!guests || guests.length === 0) {
      return NextResponse.json(
        { error: 'No guests found to invite' },
        { status: 404 }
      )
    }
    
    // Get user information for the invitation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single()
    
    if (userError) {
      return NextResponse.json(
        { error: 'Failed to get host information' },
        { status: 500 }
      )
    }
    
    // Prepare the invitation data for each guest
    const now = new Date().toISOString()
    const results = await Promise.all(
      guests.map(async (guest) => {
        try {
          if (!guest.email) {
            // Skip guests without email
            return {
              guestId: guest.id,
              success: false,
              message: 'Guest has no email address'
            }
          }
          
          // Generate a unique invite code for tracking RSVPs
          const inviteCode = `${eventId.substring(0, 6)}-${guest.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 7)}`
          
          // Send the invitation email
          const emailResult = await sendEmail({
            to: guest.email,
            subject: `You're invited to ${event.name}!`,
            templateId: template,
            params: {
              eventName: event.name,
              eventDate: event.date,
              eventLocation: event.location,
              guestName: `${guest.first_name} ${guest.last_name}`,
              hostName: `${userData.first_name} ${userData.last_name}`,
              customMessage: message,
              inviteCode: inviteCode,
              rsvpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${inviteCode}`
            }
          })
          
          if (!emailResult.success) {
            // Update guest with failed status
            await supabase
              .from('guests')
              .update({
                invitation_status: 'failed',
                invitation_sent_at: now,
                invite_code: inviteCode,
                last_updated: now
              })
              .eq('id', guest.id)
            
            return {
              guestId: guest.id,
              success: false,
              message: emailResult.error || 'Failed to send email'
            }
          }
          
          // Update guest with sent status
          await supabase
            .from('guests')
            .update({
              invitation_status: 'sent',
              invitation_sent_at: now,
              invite_code: inviteCode,
              last_updated: now
            })
            .eq('id', guest.id)
          
          return {
            guestId: guest.id,
            success: true,
            message: 'Invitation sent successfully'
          }
        } catch (error: any) {
          console.error(`Error sending invitation to guest ${guest.id}:`, error)
          
          // Update guest with failed status
          await supabase
            .from('guests')
            .update({
              invitation_status: 'failed',
              invitation_sent_at: now,
              last_updated: now
            })
            .eq('id', guest.id)
          
          return {
            guestId: guest.id,
            success: false,
            message: error.message || 'Unknown error occurred'
          }
        }
      })
    )
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    // Log the invitation activity
    await supabase
      .from('event_activity')
      .insert({
        event_id: eventId,
        user_id: userId,
        activity_type: 'invitations_sent',
        details: {
          total: results.length,
          successful,
          failed
        },
        created_at: now
      })
    
    return NextResponse.json({
      success: true,
      total: results.length,
      successful,
      failed,
      results
    })
  } catch (error: any) {
    console.error('Error sending invitations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send invitations' },
      { status: 500 }
    )
  }
} 