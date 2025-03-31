import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * PUT /api/admin/vendors/[vendorId]/verify - Verify or unverify a vendor (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  const vendorId = params.vendorId
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
    
    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get request data
    const { verified, notes } = await request.json()
    
    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Verified status is required (boolean)' },
        { status: 400 }
      )
    }
    
    // Check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()
    
    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    // Update vendor verification status
    const { data: updatedVendor, error: updateError } = await supabase
      .from('vendors')
      .update({
        is_verified: verified,
        verification_notes: notes || null,
        verified_at: verified ? new Date().toISOString() : null,
        verified_by: verified ? userId : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating vendor:', updateError)
      return NextResponse.json(
        { error: 'Failed to update vendor verification status' },
        { status: 500 }
      )
    }
    
    // Log admin action
    await supabase
      .from('admin_activity_log')
      .insert({
        user_id: userId,
        action_type: verified ? 'vendor_verified' : 'vendor_unverified',
        entity_type: 'vendor',
        entity_id: vendorId,
        details: {
          vendor_name: vendor.name,
          notes: notes || null
        },
        created_at: new Date().toISOString()
      })
    
    // Send notification to the vendor contact if email is available
    if (vendor.contact_email) {
      // In a real implementation, you would integrate with an email service here
      console.log(`Email notification would be sent to ${vendor.contact_email} about verification status change`)
    }
    
    return NextResponse.json({
      success: true,
      vendor: updatedVendor,
      message: verified ? 'Vendor successfully verified' : 'Vendor verification removed'
    })
  } catch (error: any) {
    console.error('Error in vendor verification endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 