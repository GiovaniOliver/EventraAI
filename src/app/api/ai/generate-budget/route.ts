import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/ai/generate-budget - Generate event budget based on event details
 */
export async function POST(request: NextRequest) {
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
    
    // Get request data
    const {
      eventId,
      eventType,
      guestCount,
      totalBudget,
      location,
      preferences = [],
      mustHaves = []
    } = await request.json()
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }
    
    if (!totalBudget || isNaN(parseFloat(totalBudget))) {
      return NextResponse.json(
        { error: 'Valid total budget is required' },
        { status: 400 }
      )
    }
    
    // If eventId is provided, check if user has access to it
    if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .eq('owner_id', userId)
        .maybeSingle()
      
      const { data: teamMember, error: teamError } = await supabase
        .from('event_team')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle()
      
      if ((eventError || !event) && (teamError || !teamMember)) {
        return NextResponse.json(
          { error: 'Event not found or unauthorized access' },
          { status: 404 }
        )
      }
    }
    
    const budget = parseBudget(totalBudget)
    
    // Generate budget based on event type
    const budgetItems = generateBudgetItems(eventType, budget, guestCount, location, preferences, mustHaves)
    
    // Calculate totals
    const allocatedTotal = budgetItems.reduce((sum, item) => sum + item.amount, 0)
    const remainingBudget = budget - allocatedTotal
    
    // Log this suggestion for analytics
    await supabase
      .from('ai_suggestions')
      .insert({
        user_id: userId,
        event_id: eventId || null,
        suggestion_type: 'budget',
        input_data: {
          eventType,
          guestCount,
          totalBudget: budget,
          location,
          preferences,
          mustHaves
        },
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      totalBudget: budget,
      allocatedBudget: allocatedTotal,
      remainingBudget,
      categories: categorizeBudgetItems(budgetItems),
      items: budgetItems
    })
  } catch (error: any) {
    console.error('Error generating budget:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate budget' },
      { status: 500 }
    )
  }
}

interface BudgetItem {
  id: string
  name: string
  category: string
  amount: number
  percentage: number
  description?: string
  essential: boolean
}

/**
 * Generate budget items based on event type and parameters
 */
function generateBudgetItems(
  eventType: string,
  totalBudget: number,
  guestCount: number = 50,
  location: string = '',
  preferences: string[] = [],
  mustHaves: string[] = []
): BudgetItem[] {
  const budgetItems: BudgetItem[] = []
  const budgetId = Date.now().toString()
  
  // Default budget distribution by category for different event types
  let categoryPercentages: Record<string, number> = {}
  
  switch (eventType.toLowerCase()) {
    case 'wedding':
      categoryPercentages = {
        'venue': 30,
        'catering': 25,
        'photography': 10,
        'decor': 8,
        'entertainment': 8,
        'attire': 5,
        'stationery': 3,
        'transportation': 3,
        'misc': 8
      }
      break
    case 'corporate':
      categoryPercentages = {
        'venue': 20,
        'catering': 30,
        'av-equipment': 15,
        'speaker-fees': 10,
        'marketing': 10,
        'staffing': 5,
        'transportation': 5,
        'misc': 5
      }
      break
    case 'birthday':
      categoryPercentages = {
        'venue': 25,
        'catering': 30,
        'entertainment': 15,
        'decor': 15,
        'cake': 5,
        'favors': 5,
        'misc': 5
      }
      break
    case 'conference':
      categoryPercentages = {
        'venue': 25,
        'catering': 20,
        'av-equipment': 15,
        'speaker-fees': 15,
        'marketing': 10,
        'staffing': 5,
        'accommodations': 5,
        'misc': 5
      }
      break
    default:
      categoryPercentages = {
        'venue': 25,
        'catering': 25,
        'entertainment': 15,
        'decor': 10,
        'marketing': 10,
        'staffing': 5,
        'misc': 10
      }
  }
  
  // Adjust based on location (simple adjustment - would be more complex in real system)
  if (location) {
    const highCostLocations = ['new york', 'nyc', 'san francisco', 'sf', 'los angeles', 'la', 'london', 'tokyo', 'sydney']
    const isHighCost = highCostLocations.some(loc => location.toLowerCase().includes(loc))
    
    if (isHighCost) {
      // In high-cost locations, venue and catering take more of the budget
      categoryPercentages.venue = Math.min(categoryPercentages.venue * 1.2, 40)
      categoryPercentages.catering = Math.min(categoryPercentages.catering * 1.15, 35)
      
      // Normalize percentages to 100%
      const total = Object.values(categoryPercentages).reduce((sum, val) => sum + val, 0)
      
      if (total > 100) {
        const factor = 100 / total
        Object.keys(categoryPercentages).forEach(key => {
          categoryPercentages[key] *= factor
        })
      }
    }
  }
  
  // Adjust for guest count
  const perGuestBudget = Math.round(totalBudget / (guestCount || 50))
  const isLargeEvent = guestCount > 100
  
  if (isLargeEvent) {
    // For larger events, catering gets more allocation
    categoryPercentages.catering = Math.min(categoryPercentages.catering * 1.1, 35)
    categoryPercentages.venue = Math.min(categoryPercentages.venue * 1.1, 35)
    
    // Scale down entertainment and decor slightly
    if (categoryPercentages.entertainment) {
      categoryPercentages.entertainment *= 0.9
    }
    
    if (categoryPercentages.decor) {
      categoryPercentages.decor *= 0.9
    }
    
    // Normalize again
    const total = Object.values(categoryPercentages).reduce((sum, val) => sum + val, 0)
    
    if (total > 100) {
      const factor = 100 / total
      Object.keys(categoryPercentages).forEach(key => {
        categoryPercentages[key] *= factor
      })
    }
  }
  
  // Create budget items based on category percentages
  const sortedCategories = Object.entries(categoryPercentages)
    .sort((a, b) => b[1] - a[1]) // Sort by percentage descending
  
  for (const [category, percentage] of sortedCategories) {
    const amount = Math.round((percentage / 100) * totalBudget)
    
    if (amount <= 0) continue
    
    // Map categories to specific items based on event type
    let itemName = category.charAt(0).toUpperCase() + category.slice(1)
    let description = `Budget for ${category}`
    let essential = mustHaves.includes(category)
    
    // Category-specific items based on event type
    if (category === 'venue') {
      itemName = 'Venue Rental'
      description = 'Venue rental fees including basic utilities'
      essential = true
    } else if (category === 'catering') {
      const perPersonCost = Math.round(amount / (guestCount || 50))
      itemName = 'Catering Service'
      description = `Food and beverage service (approx. $${perPersonCost} per person)`
      essential = true
    } else if (category === 'photography') {
      itemName = 'Photography Services'
      description = 'Professional photographer including editing and digital files'
    } else if (category === 'entertainment') {
      if (eventType.toLowerCase() === 'wedding') {
        itemName = 'DJ/Band'
        description = 'Music and entertainment for ceremony and reception'
      } else if (eventType.toLowerCase() === 'corporate') {
        itemName = 'Entertainment'
        description = 'Entertainment activities and performers'
      } else {
        itemName = 'Entertainment'
        description = 'Entertainment services for the event'
      }
    }
    
    budgetItems.push({
      id: `${budgetId}-${category}`,
      name: itemName,
      category,
      amount,
      percentage,
      description,
      essential: essential || category === 'venue' || category === 'catering'
    })
    
    // Add sub-items for some major categories
    if (category === 'venue' && amount > 1000) {
      const securityAmount = Math.round(amount * 0.1)
      budgetItems.push({
        id: `${budgetId}-security`,
        name: 'Security Services',
        category: 'venue',
        amount: securityAmount,
        percentage: Math.round((securityAmount / totalBudget) * 100),
        description: 'Security staff for event',
        essential: false
      })
    }
    
    if (category === 'catering' && amount > 1000) {
      const beverageAmount = Math.round(amount * 0.3)
      const foodAmount = amount - beverageAmount
      
      // Replace the main catering item with more specific ones
      budgetItems.pop() // Remove the general catering item
      
      budgetItems.push({
        id: `${budgetId}-food`,
        name: 'Food Service',
        category: 'catering',
        amount: foodAmount,
        percentage: Math.round((foodAmount / totalBudget) * 100),
        description: 'Food service including appetizers, main course, and desserts',
        essential: true
      })
      
      budgetItems.push({
        id: `${budgetId}-beverages`,
        name: 'Beverages',
        category: 'catering',
        amount: beverageAmount,
        percentage: Math.round((beverageAmount / totalBudget) * 100),
        description: 'Alcoholic and non-alcoholic beverages',
        essential: eventType.toLowerCase() === 'wedding'
      })
    }
    
    if (category === 'decor' && amount > 500) {
      const flowersAmount = Math.round(amount * 0.6)
      const lightingAmount = Math.round(amount * 0.4)
      
      // Replace the main decor item with more specific ones
      budgetItems.pop() // Remove the general decor item
      
      budgetItems.push({
        id: `${budgetId}-flowers`,
        name: 'Flowers & Centerpieces',
        category: 'decor',
        amount: flowersAmount,
        percentage: Math.round((flowersAmount / totalBudget) * 100),
        description: 'Floral arrangements and table centerpieces',
        essential: false
      })
      
      budgetItems.push({
        id: `${budgetId}-lighting`,
        name: 'Lighting & Ambiance',
        category: 'decor',
        amount: lightingAmount,
        percentage: Math.round((lightingAmount / totalBudget) * 100),
        description: 'Decorative lighting and ambiance elements',
        essential: false
      })
    }
  }
  
  // Ensure must-haves are included
  for (const item of mustHaves) {
    if (!budgetItems.some(bi => bi.category === item.toLowerCase())) {
      // Allocate a reasonable amount from misc or smallest category
      let amount = Math.round(totalBudget * 0.05) // 5% default
      
      // Take from misc if possible
      const miscItem = budgetItems.find(bi => bi.category === 'misc')
      if (miscItem && miscItem.amount > amount) {
        miscItem.amount -= amount
        miscItem.percentage = Math.round((miscItem.amount / totalBudget) * 100)
      } else {
        // Take from smallest non-essential category
        const nonEssentials = budgetItems
          .filter(bi => !bi.essential)
          .sort((a, b) => a.amount - b.amount)
        
        if (nonEssentials.length > 0) {
          const smallest = nonEssentials[0]
          amount = Math.min(amount, Math.floor(smallest.amount / 2))
          smallest.amount -= amount
          smallest.percentage = Math.round((smallest.amount / totalBudget) * 100)
        } else {
          // If everything is essential, just make the budget a bit bigger
          amount = Math.round(totalBudget * 0.03)
        }
      }
      
      budgetItems.push({
        id: `${budgetId}-${item.toLowerCase()}`,
        name: item.charAt(0).toUpperCase() + item.slice(1),
        category: item.toLowerCase(),
        amount,
        percentage: Math.round((amount / totalBudget) * 100),
        description: `Budget for ${item}`,
        essential: true
      })
    }
  }
  
  // Add contingency
  const allocatedTotal = budgetItems.reduce((sum, item) => sum + item.amount, 0)
  
  if (allocatedTotal < totalBudget) {
    const contingencyAmount = totalBudget - allocatedTotal
    
    budgetItems.push({
      id: `${budgetId}-contingency`,
      name: 'Contingency Fund',
      category: 'misc',
      amount: contingencyAmount,
      percentage: Math.round((contingencyAmount / totalBudget) * 100),
      description: 'Emergency fund for unexpected costs',
      essential: true
    })
  }
  
  return budgetItems
}

/**
 * Parse and standardize budget amount
 */
function parseBudget(budget: string | number): number {
  let amount: number
  
  if (typeof budget === 'number') {
    amount = budget
  } else {
    // Remove any non-numeric characters except decimal point
    const numericString = budget.replace(/[^0-9.]/g, '')
    amount = parseFloat(numericString)
  }
  
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid budget amount')
  }
  
  return Math.round(amount)
}

/**
 * Group budget items by category for the response
 */
function categorizeBudgetItems(items: BudgetItem[]): Record<string, any> {
  const categories: Record<string, any> = {}
  
  // Group by category
  for (const item of items) {
    if (!categories[item.category]) {
      categories[item.category] = {
        total: 0,
        percentage: 0,
        items: []
      }
    }
    
    categories[item.category].items.push(item)
    categories[item.category].total += item.amount
  }
  
  // Calculate category totals and percentages
  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0)
  
  for (const category in categories) {
    categories[category].percentage = Math.round((categories[category].total / totalBudget) * 100)
  }
  
  return categories
} 