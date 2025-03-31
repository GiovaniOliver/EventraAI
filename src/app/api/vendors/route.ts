import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/vendors - List all vendors
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const searchParams = request.nextUrl.searchParams;
  
  // Get filter parameters
  const category = searchParams.get('category');
  const isPartner = searchParams.get('isPartner');
  const userId = searchParams.get('userId');
  
  try {
    // Start building the query
    let query = supabase.from('vendors').select('*');
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (isPartner !== null) {
      const isPartnerBool = isPartner === 'true';
      query = query.eq('is_partner', isPartnerBool);
    }
    
    // If userId is provided, only fetch vendors created by that user
    if (userId) {
      query = query.eq('owner_id', userId);
    } else {
      // Otherwise, fetch all approved vendors plus any user-created vendors
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        query = query.or(`is_approved.eq.true,owner_id.eq.${session.user.id}`);
      } else {
        // If not authenticated, only show approved vendors
        query = query.eq('is_approved', true);
      }
    }
    
    // Order by partner status first, then name
    query = query.order('is_partner', { ascending: false }).order('name');
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendors - Create a new vendor
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  
  try {
    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get vendor data from body
    const vendorData = await request.json();
    
    // Validate required fields
    if (!vendorData.name || !vendorData.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }
    
    // Set additional fields
    const now = new Date().toISOString();
    const newVendor = {
      ...vendorData,
      owner_id: userId,
      is_approved: false, // New vendors need approval by default
      created_at: now
    };
    
    // Check if admin user - auto-approve if admin
    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (!userError && userInfo && userInfo.is_admin) {
      newVendor.is_approved = true;
    }
    
    // Insert the new vendor
    const { data, error } = await supabase
      .from('vendors')
      .insert(newVendor)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
} 