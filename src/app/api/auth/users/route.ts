import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/auth/users - Get user profile
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// POST /api/auth/users - Create a new user
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const body = await request.json()
    
    // Required fields validation
    if (!body.id || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: body.id,
        username: body.username || body.email.split('@')[0],
        display_name: body.display_name || body.username || body.email.split('@')[0],
        email: body.email,
        is_admin: body.is_admin || false,
        subscription_tier: body.subscription_tier || 'free',
        subscription_status: body.subscription_status || 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PATCH /api/auth/users - Update user profile
export async function PATCH(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Update user by ID
    const { data, error } = await supabase
      .from('users')
      .update({
        username: body.username,
        display_name: body.display_name,
        email: body.email,
        subscription_tier: body.subscription_tier,
        subscription_status: body.subscription_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
} 