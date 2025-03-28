import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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
      query = query.eq('is_partner', isPartner === 'true');
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
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

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  
  try {
    const vendorData = await request.json();
    
    // Validate required fields
    if (!vendorData.name || !vendorData.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }
    
    // Set default values for new vendors
    const newVendor = {
      ...vendorData,
      is_approved: vendorData.is_approved ?? false,
      is_partner: vendorData.is_partner ?? false,
      created_at: new Date().toISOString()
    };
    
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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
} 