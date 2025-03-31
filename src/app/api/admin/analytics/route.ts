import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/admin/analytics - Get platform analytics data (admin only)
 */
export async function GET(request: NextRequest) {
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
    
    // Get query parameters for time range
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30days'
    
    // Calculate start date based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      case '12months':
        startDate.setMonth(now.getMonth() - 12)
        break
      default:
        startDate.setDate(now.getDate() - 30) // Default to 30 days
    }
    
    const formattedStartDate = startDate.toISOString()
    
    // Run analytics queries in parallel
    const [
      usersResult,
      activeUsersResult,
      eventsResult,
      subscriptionsResult,
      vendorsResult,
      aiSuggestionsResult
    ] = await Promise.all([
      // Total user count and new users
      getUserAnalytics(supabase, formattedStartDate),
      // Active users
      getActiveUserAnalytics(supabase, formattedStartDate),
      // Events analytics
      getEventAnalytics(supabase, formattedStartDate),
      // Subscription analytics
      getSubscriptionAnalytics(supabase, formattedStartDate),
      // Vendor analytics
      getVendorAnalytics(supabase, formattedStartDate),
      // AI suggestions analytics
      getAISuggestionsAnalytics(supabase, formattedStartDate)
    ])
    
    return NextResponse.json({
      period,
      users: usersResult,
      activeUsers: activeUsersResult,
      events: eventsResult,
      subscriptions: subscriptionsResult,
      vendors: vendorsResult,
      aiSuggestions: aiSuggestionsResult
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get user analytics
async function getUserAnalytics(supabase: any, startDate: string) {
  // Total users count
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  // New users count in period
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
  
  // Get user growth by day
  const { data: usersByDay } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', startDate)
    .order('created_at')
  
  // Group users by day
  const userGrowth = usersByDay ? processTimeSeriesData(usersByDay, 'created_at') : []
  
  // Get users by role
  const { data: usersByRole } = await supabase
    .from('users')
    .select('role, count')
    .gte('created_at', startDate)
    .group('role')
  
  return {
    totalUsers,
    newUsers,
    userGrowth,
    usersByRole: usersByRole || []
  }
}

// Helper function to get active user analytics
async function getActiveUserAnalytics(supabase: any, startDate: string) {
  // Recently active users count (logged in during period)
  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_login', startDate)
  
  // Get login activity by day
  const { data: loginActivity } = await supabase
    .from('auth_activity_log')
    .select('created_at, activity_type')
    .eq('activity_type', 'login')
    .gte('created_at', startDate)
    .order('created_at')
  
  // Group logins by day
  const loginsByDay = loginActivity ? processTimeSeriesData(loginActivity, 'created_at') : []
  
  return {
    activeUsers,
    loginsByDay
  }
}

// Helper function to get event analytics
async function getEventAnalytics(supabase: any, startDate: string) {
  // Total events count
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
  
  // New events created in period
  const { count: newEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
  
  // Events by type
  const { data: eventsByType } = await supabase
    .from('events')
    .select('event_type, count')
    .gte('created_at', startDate)
    .group('event_type')
  
  // Events by status
  const { data: eventsByStatus } = await supabase
    .from('events')
    .select('status, count')
    .group('status')
  
  // Get event creation time series
  const { data: eventCreations } = await supabase
    .from('events')
    .select('created_at')
    .gte('created_at', startDate)
    .order('created_at')
  
  // Group events by day
  const eventGrowth = eventCreations ? processTimeSeriesData(eventCreations, 'created_at') : []
  
  return {
    totalEvents,
    newEvents,
    eventsByType: eventsByType || [],
    eventsByStatus: eventsByStatus || [],
    eventGrowth
  }
}

// Helper function to get subscription analytics
async function getSubscriptionAnalytics(supabase: any, startDate: string) {
  // Get active subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  // New subscriptions in period
  const { count: newSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
  
  // Cancelled subscriptions in period
  const { count: cancelledSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('updated_at', startDate)
  
  // Subscriptions by plan
  const { data: subscriptionsByPlan } = await supabase
    .from('subscriptions')
    .select(`
      plan_id,
      count,
      subscription_plans!inner(name)
    `)
    .eq('status', 'active')
    .group('plan_id, subscription_plans.name')
  
  // Format data for easier consumption
  const formattedSubscriptionsByPlan = subscriptionsByPlan?.map(item => ({
    plan_id: item.plan_id,
    plan_name: item.subscription_plans.name,
    count: item.count
  })) || []
  
  return {
    activeSubscriptions,
    newSubscriptions,
    cancelledSubscriptions,
    subscriptionsByPlan: formattedSubscriptionsByPlan
  }
}

// Helper function to get vendor analytics
async function getVendorAnalytics(supabase: any, startDate: string) {
  // Total vendors count
  const { count: totalVendors } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
  
  // New vendors count in period
  const { count: newVendors } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
  
  // Vendors by category
  const { data: vendorsByCategory } = await supabase
    .from('vendors')
    .select('category, count')
    .group('category')
  
  // Verified vs unverified vendors
  const { data: vendorVerification } = await supabase
    .from('vendors')
    .select('is_verified, count')
    .group('is_verified')
  
  return {
    totalVendors,
    newVendors,
    vendorsByCategory: vendorsByCategory || [],
    vendorVerification: vendorVerification || []
  }
}

// Helper function to get AI suggestions analytics
async function getAISuggestionsAnalytics(supabase: any, startDate: string) {
  // Total AI suggestions count
  const { count: totalSuggestions } = await supabase
    .from('ai_suggestions')
    .select('*', { count: 'exact', head: true })
  
  // AI suggestions in period
  const { count: recentSuggestions } = await supabase
    .from('ai_suggestions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
  
  // AI suggestions by type
  const { data: suggestionsByType } = await supabase
    .from('ai_suggestions')
    .select('suggestion_type, count')
    .gte('created_at', startDate)
    .group('suggestion_type')
  
  // Get suggestion creation time series
  const { data: suggestionCreations } = await supabase
    .from('ai_suggestions')
    .select('created_at')
    .gte('created_at', startDate)
    .order('created_at')
  
  // Group suggestions by day
  const suggestionsTimeline = suggestionCreations ? processTimeSeriesData(suggestionCreations, 'created_at') : []
  
  return {
    totalSuggestions,
    recentSuggestions,
    suggestionsByType: suggestionsByType || [],
    suggestionsTimeline
  }
}

// Helper function to process time series data by day
function processTimeSeriesData(data: any[], dateField: string) {
  const dayMap = new Map()
  
  data.forEach(item => {
    const date = new Date(item[dateField])
    const dayKey = date.toISOString().split('T')[0]
    
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, 0)
    }
    
    dayMap.set(dayKey, dayMap.get(dayKey) + 1)
  })
  
  // Convert to array of objects
  return Array.from(dayMap.entries()).map(([day, count]) => ({
    date: day,
    count
  }))
} 