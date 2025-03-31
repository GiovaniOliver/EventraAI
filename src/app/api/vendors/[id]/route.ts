import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/vendors/:id - Get vendor details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const vendorId = params.id
  const supabase = createServerClient()
  
  try {
    // Get vendor details
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // Check if vendor is not approved and user isn't the owner or admin
    if (!data.is_approved) {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        )
      }
      
      const userId = session.user.id
      
      // If user isn't the owner, check if they're an admin
      if (data.owner_id !== userId) {
        const { data: userInfo, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .single()
        
        if (userError || !userInfo || !userInfo.is_admin) {
          return NextResponse.json(
            { error: 'Vendor not found' },
            { status: 404 }
          )
        }
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor details' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/vendors/:id - Update vendor
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const vendorId = params.id
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
    
    // Check if vendor exists and user has access
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()
    
    if (vendorError) {
      if (vendorError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: vendorError.message },
        { status: 500 }
      )
    }
    
    // Check if user is owner or admin
    let isAdmin = false
    
    if (vendor.owner_id !== userId) {
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single()
      
      if (userError || !userInfo || !userInfo.is_admin) {
        return NextResponse.json(
          { error: 'Unauthorized to update this vendor' },
          { status: 403 }
        )
      }
      
      isAdmin = userInfo.is_admin
    }
    
    // Get update data
    const updates = await request.json()
    
    // Remove fields that shouldn't be updated directly
    const { id, created_at, owner_id, ...updateData } = updates
    
    // Only admins can update approval status
    if (!isAdmin) {
      delete updateData.is_approved
      delete updateData.is_partner
    }
    
    updateData.updated_at = new Date().toISOString()
    
    // Update the vendor
    const { data, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', vendorId)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vendors/:id - Delete vendor
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const vendorId = params.id
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
    
    // Check if vendor exists and user has access
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()
    
    if (vendorError) {
      if (vendorError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: vendorError.message },
        { status: 500 }
      )
    }
    
    // Check if user is owner or admin
    if (vendor.owner_id !== userId) {
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single()
      
      if (userError || !userInfo || !userInfo.is_admin) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this vendor' },
          { status: 403 }
        )
      }
    }
    
    // Check if vendor is used in any events
    const { count, error: countError } = await supabase
      .from('event_vendors')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
    
    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      )
    }
    
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor as it is used in events' },
        { status: 409 }
      )
    }
    
    // Delete the vendor
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
} 