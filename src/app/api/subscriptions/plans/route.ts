import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/subscriptions/plans - List available subscription plans
 */
export async function GET() {
  const supabase = createServerClient()
  
  try {
    // Fetch active subscription plans
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price') // Sort by price, lowest first
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    // Format the plans for client consumption
    const formattedPlans = data.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.display_name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      billingCycle: plan.billing_cycle,
      features: plan.features,
      limits: {
        events: plan.event_limit,
        guests: plan.guest_limit,
        vendors: plan.vendor_limit,
        analytics: plan.analytics_period,
        aiCalls: plan.ai_call_limit
      }
    }))
    
    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
} 