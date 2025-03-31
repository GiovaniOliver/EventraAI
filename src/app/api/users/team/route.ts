import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/users/team - Get team members
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Fetch team members
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        created_at,
        member:member_id (
          id,
          username,
          display_name,
          email
        )
      `)
      .eq('team_owner_id', userId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users/team - Add team member
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const { memberEmail, role = 'editor' } = await request.json()
    
    if (!memberEmail) {
      return NextResponse.json(
        { error: 'Member email is required' },
        { status: 400 }
      )
    }
    
    // Find user by email
    const { data: userToAdd, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', memberEmail)
      .single()
    
    if (userError || !userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_owner_id', userId)
      .eq('member_id', userToAdd.id)
      .maybeSingle()
    
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      )
    }
    
    // Add to team
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_owner_id: userId,
        member_id: userToAdd.id,
        role
      })
      .select(`
        id,
        role,
        created_at,
        member:member_id (
          id,
          username,
          display_name,
          email
        )
      `)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/team/:id - Remove team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()
  const teamMemberId = request.nextUrl.pathname.split('/').pop()
  
  if (!teamMemberId) {
    return NextResponse.json(
      { error: 'Team member ID is required' },
      { status: 400 }
    )
  }
  
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Verify team member belongs to this user
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('id', teamMemberId)
      .eq('team_owner_id', userId)
      .single()
    
    if (memberError || !teamMember) {
      return NextResponse.json(
        { error: 'Team member not found or not authorized to remove' },
        { status: 404 }
      )
    }
    
    // Remove team member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', teamMemberId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
} 