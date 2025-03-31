import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/subscriptions/current - Get current subscription
 */
export async function GET() {
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
    
    // Fetch the user with subscription details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .eq('id', userId)
      .single()
    
    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }
    
    // Fetch the subscription plan details
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', userData.subscription_tier)
      .single()
    
    if (planError && planError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json(
        { error: planError.message },
        { status: 500 }
      )
    }
    
    // Get usage statistics
    const { data: aiUsage, error: aiError } = await supabase
      .from('ai_usage')
      .select('count', { count: 'exact' })
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    
    const { data: eventCount, error: eventError } = await supabase
      .from('events')
      .select('count', { count: 'exact' })
      .eq('owner_id', userId)
    
    // Format the response
    const subscriptionData = {
      tier: userData.subscription_tier,
      status: userData.subscription_status,
      customer_id: userData.stripe_customer_id,
      plan: planData || null,
      usage: {
        aiCalls: aiError ? 0 : (aiUsage || 0),
        events: eventError ? 0 : (eventCount || 0)
      },
      limits: planData ? {
        events: planData.event_limit,
        guests: planData.guest_limit,
        vendors: planData.vendor_limit,
        analytics: planData.analytics_period,
        aiCalls: planData.ai_call_limit
      } : null
    }
    
    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error('Error fetching current subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current subscription' },
      { status: 500 }
    )
  }
} 