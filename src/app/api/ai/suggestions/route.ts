import { NextRequest, NextResponse } from 'next/server';
import { AiSuggestions, SuggestionPreferences } from '@/lib/ai-service';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    const body = await request.json();
    const { eventType, theme, budget, preferences = {} } = body;
    
    // Validate required parameters
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }
    
    // Check user's subscription for AI usage limits
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single();
      
    if (!userProfile || userProfile.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required for AI suggestions' },
        { status: 403 }
      );
    }
    
    // Get user's AI usage count for rate limiting
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { count } = await supabase
      .from('ai_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth);
      
    // Apply rate limits based on subscription tier
    const tierLimits = {
      'free': 5,
      'starter': 20,
      'pro': 100,
      'business': 500,
      'enterprise': 9999 // Essentially unlimited
    };
    
    const limit = tierLimits[userProfile.subscription_tier as keyof typeof tierLimits] || 5;
    
    if ((count || 0) >= limit) {
      return NextResponse.json(
        { error: 'Monthly AI request limit reached. Please upgrade your plan for more requests.' },
        { status: 429 }
      );
    }
    
    // Prepare the input for AI service
    const promptData = {
      eventType,
      theme: theme || '',
      budget: budget || 0,
      guestCount: preferences.guestCount || 50,
      format: preferences.format || 'in-person',
      userId: userId,
    };
    
    // In production, replace this with a real AI service integration
    // For example: OpenAI API, Azure OpenAI, or another service
    // const aiService = new AIService();
    // const suggestions = await aiService.generateSuggestions(promptData);
    
    // Temporary while integrating real AI service: use enhanced mock data
    const suggestions: AiSuggestions = await generateEnhancedSuggestions(promptData);
    
    // Log AI usage
    await supabase.from('ai_usage').insert({
      user_id: userId,
      request_type: 'event_suggestions',
      input_data: promptData,
      created_at: new Date().toISOString()
    });
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Enhanced suggestion generator that simulates AI responses
 * This function will be replaced with a real AI service in production
 */
async function generateEnhancedSuggestions(params: {
  eventType: string;
  theme?: string;
  budget?: number;
  guestCount?: number;
  format?: string;
  userId?: string;
}): Promise<AiSuggestions> {
  const { eventType, theme, budget = 0, guestCount = 50, format = 'in-person' } = params;
  
  // Get current date for realistic due dates
  const now = new Date();
  const eventDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // Default 60 days in future
  
  // Calculate per-person costs based on event type and format
  const costMultipliers: Record<string, number> = {
    'wedding': 150,
    'corporate': 120,
    'conference': 200,
    'birthday': 50,
    'holiday': 75,
    'retreat': 250,
    'fundraiser': 100,
    'social': 60,
    'educational': 80,
    'festival': 40,
    'other': 75
  };
  
  // Format multipliers
  const formatMultipliers: Record<string, number> = {
    'in-person': 1.0,
    'virtual': 0.4,
    'hybrid': 1.3
  };
  
  // Get the appropriate cost multiplier
  const baseMultiplier = costMultipliers[eventType.toLowerCase()] || 75;
  const formatMultiplier = formatMultipliers[format] || 1.0;
  
  // Calculate total estimated cost if budget not provided
  const estimatedTotalCost = budget || Math.round(guestCount * baseMultiplier * formatMultiplier);
  
  // Generate realistic event suggestions based on type
  const eventSuggestions = generateEventSuggestions(eventType, theme, estimatedTotalCost, format, guestCount);
  
  // Generate themes appropriate for the event type
  const themeSuggestions = generateThemeSuggestions(eventType, theme);
  
  // Generate tasks with realistic timelines based on event date
  const taskSuggestions = generateTaskSuggestions(eventType, eventDate);
  
  // Generate budget breakdown appropriate for this event type
  const budgetBreakdown = generateBudgetBreakdown(eventType, estimatedTotalCost, format);
  
  // Combine all suggestions
  const suggestions: AiSuggestions = {
    events: eventSuggestions,
    themes: themeSuggestions,
    tasks: taskSuggestions,
    budget: budgetBreakdown,
  };
  
  return suggestions;
}

/**
 * Generate event suggestions based on type
 */
function generateEventSuggestions(
  eventType: string, 
  theme?: string, 
  budget: number = 0, 
  format: string = 'in-person',
  guestCount: number = 50
) {
  // Capitalize event type
  const capitalizedType = eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
  
  // Create event options based on type
  const events = [];
  
  // Basic event suggestion
  events.push({
    id: 'evt-' + Math.random().toString(36).substring(2, 9),
    title: theme ? 
      `${capitalizedType} with ${theme} Theme` : 
      `${capitalizedType} Event`,
    description: generateEventDescription(eventType, 'standard', format, guestCount),
    complexity: calculateComplexity(eventType, format, guestCount, 'standard'),
    estimatedCost: Math.round(budget * 0.95),  // Slightly under budget
    suggestedDuration: getSuggestedDuration(eventType, 'standard')
  });
  
  // Premium/enhanced event suggestion
  events.push({
    id: 'evt-' + Math.random().toString(36).substring(2, 9),
    title: `Premium ${capitalizedType} Experience`,
    description: generateEventDescription(eventType, 'premium', format, guestCount),
    complexity: calculateComplexity(eventType, format, guestCount, 'premium'),
    estimatedCost: Math.round(budget * 1.2),  // 20% over budget for premium
    suggestedDuration: getSuggestedDuration(eventType, 'premium')
  });
  
  // Add a third option for certain event types
  if (['wedding', 'corporate', 'conference', 'fundraiser'].includes(eventType.toLowerCase())) {
    events.push({
      id: 'evt-' + Math.random().toString(36).substring(2, 9),
      title: `Deluxe ${capitalizedType} Package`,
      description: generateEventDescription(eventType, 'deluxe', format, guestCount),
      complexity: calculateComplexity(eventType, format, guestCount, 'deluxe'),
      estimatedCost: Math.round(budget * 1.5),  // 50% over budget for deluxe
      suggestedDuration: getSuggestedDuration(eventType, 'deluxe')
    });
  }
  
  return events;
}

/**
 * Generate appropriate themes based on event type
 */
function generateThemeSuggestions(eventType: string, currentTheme?: string) {
  // Base themes
  const baseThemes: Record<string, Array<{
    name: string;
    description: string;
    colorScheme: string[];
    suitable: string[];
  }>> = {
    'wedding': [
      {
        name: 'Classic Elegance',
        description: 'A timeless theme with sophisticated decor, neutral colors, and elegant flourishes.',
        colorScheme: ['#F5F5F5', '#D0D0D0', '#707070', '#303030'],
        suitable: ['formal', 'traditional', 'upscale']
      },
      {
        name: 'Rustic Romance',
        description: 'Warm wooden elements, natural textures, and soft lighting for a cozy atmosphere.',
        colorScheme: ['#5E3023', '#81685D', '#C8AD93', '#F1DDC1'],
        suitable: ['barn', 'outdoor', 'countryside']
      },
      {
        name: 'Garden Enchantment',
        description: 'Lush florals, vibrant greenery, and delicate accents for a natural oasis.',
        colorScheme: ['#7FB069', '#FFFBBD', '#E6AA68', '#CA3C25'],
        suitable: ['outdoor', 'spring', 'summer']
      }
    ],
    'corporate': [
      {
        name: 'Professional Modern',
        description: 'Clean lines, minimal design, and corporate colors for a polished business atmosphere.',
        colorScheme: ['#FFFFFF', '#2C3E50', '#3498DB', '#ECF0F1'],
        suitable: ['conference', 'meeting', 'seminar']
      },
      {
        name: 'Tech Innovation',
        description: 'Futuristic designs, digital elements, and cutting-edge aesthetics.',
        colorScheme: ['#222222', '#0984E3', '#00D2D3', '#FFFFFF'],
        suitable: ['product launch', 'hackathon', 'tech conference']
      },
      {
        name: 'Sustainable Business',
        description: 'Eco-friendly elements, natural materials, and green messaging.',
        colorScheme: ['#2ECC71', '#F1F1F1', '#333333', '#7DCEA0'],
        suitable: ['green companies', 'CSR event', 'sustainability conference']
      }
    ],
    'birthday': [
      {
        name: 'Festive Celebration',
        description: 'Vibrant colors, balloons, and joyful decorations for a fun atmosphere.',
        colorScheme: ['#FF3855', '#FFFD37', '#0066FF', '#66FF66'],
        suitable: ['kids', 'teens', 'casual']
      },
      {
        name: 'Elegant Milestone',
        description: 'Sophisticated decor with gold accents and celebratory elements.',
        colorScheme: ['#D4AF37', '#000000', '#FFFFFF', '#C0C0C0'],
        suitable: ['adult', 'milestone', 'formal']
      },
      {
        name: 'Nostalgic Throwback',
        description: 'Retro elements, photos from the past, and era-specific decor.',
        colorScheme: ['#7B68EE', '#FF69B4', '#4169E1', '#20B2AA'],
        suitable: ['adult', 'retro', 'personalized']
      }
    ],
    'conference': [
      {
        name: 'Professional Symposium',
        description: 'Structured layout, industry colors, and focused learning spaces.',
        colorScheme: ['#1F2937', '#374151', '#047857', '#FFFFFF'],
        suitable: ['academic', 'industry', 'professional']
      },
      {
        name: 'Interactive Connection',
        description: 'Collaborative spaces, engaging displays, and networking-focused design.',
        colorScheme: ['#3B82F6', '#93C5FD', '#1E3A8A', '#FFFFFF'],
        suitable: ['networking', 'workshops', 'collaborative']
      },
      {
        name: 'Tech Showcase',
        description: 'Digital displays, modern aesthetic, and innovation-focused elements.',
        colorScheme: ['#0F172A', '#6366F1', '#0EA5E9', '#F0F9FF'],
        suitable: ['tech industry', 'innovation', 'digital']
      }
    ]
  };
  
  // Default themes for any event type
  const defaultThemes = [
    {
      name: 'Modern Minimalist',
      description: 'Clean lines, simple color palette, and uncluttered design for a contemporary feel.',
      colorScheme: ['#FFFFFF', '#000000', '#E0E0E0', '#007BFF'],
      suitable: ['contemporary', 'simple', 'professional']
    },
    {
      name: 'Vibrant Celebration',
      description: 'Bold colors, dynamic elements, and energetic atmosphere for a lively event.',
      colorScheme: ['#FF5252', '#FFD740', '#40C4FF', '#FFFFFF'],
      suitable: ['energetic', 'fun', 'social']
    },
    {
      name: 'Seasonal Inspiration',
      description: 'Decor inspired by the season with appropriate colors, textures, and elements.',
      colorScheme: ['#8BC34A', '#FFC107', '#4CAF50', '#F5F5F5'],
      suitable: ['seasonal', 'outdoor', 'themed']
    }
  ];
  
  // Get themes appropriate for this event type
  let themes = baseThemes[eventType.toLowerCase()] || defaultThemes;
  
  // Add IDs to themes
  const themedSuggestions = themes.map(theme => ({
    id: 'thm-' + Math.random().toString(36).substring(2, 9),
    ...theme
  }));
  
  // If there's a current theme, add it to the list if not already present
  if (currentTheme && !themedSuggestions.some(t => t.name.toLowerCase() === currentTheme.toLowerCase())) {
    themedSuggestions.unshift({
      id: 'thm-' + Math.random().toString(36).substring(2, 9),
      name: currentTheme,
      description: `Your selected ${currentTheme} theme, personalized for your ${eventType} event.`,
      colorScheme: ['#3490DC', '#F6993F', '#38C172', '#FFFFFF'],
      suitable: [eventType.toLowerCase(), 'custom', 'personalized']
    });
  }
  
  return themedSuggestions;
}

/**
 * Generate appropriate tasks with due dates
 */
function generateTaskSuggestions(eventType: string, eventDate: Date) {
  // Base tasks for all events
  const baseTasks = [
    {
      title: 'Set event date and time',
      description: 'Finalize the date and time for your event',
      dueDate: getDueDate(eventDate, -60), // 60 days before
      priority: 'high' as const
    },
    {
      title: 'Book venue',
      description: 'Research and book an appropriate venue for the event',
      dueDate: getDueDate(eventDate, -50), // 50 days before
      priority: 'high' as const
    },
    {
      title: 'Create guest list',
      description: 'Compile names and contact information for all guests',
      dueDate: getDueDate(eventDate, -45), // 45 days before
      priority: 'high' as const
    },
    {
      title: 'Send invitations',
      description: 'Create and send invitations to all attendees',
      dueDate: getDueDate(eventDate, -40), // 40 days before
      priority: 'medium' as const
    },
    {
      title: 'Arrange catering',
      description: 'Research and book catering services',
      dueDate: getDueDate(eventDate, -30), // 30 days before
      priority: 'high' as const
    },
    {
      title: 'Confirm with vendors',
      description: 'Follow up with all vendors to confirm arrangements',
      dueDate: getDueDate(eventDate, -14), // 14 days before
      priority: 'high' as const
    },
    {
      title: 'Create event timeline',
      description: 'Develop a detailed schedule for the event day',
      dueDate: getDueDate(eventDate, -7), // 7 days before
      priority: 'medium' as const
    },
    {
      title: 'Final guest count',
      description: 'Confirm final number of attendees',
      dueDate: getDueDate(eventDate, -5), // 5 days before
      priority: 'high' as const
    },
    {
      title: 'Send thank you notes',
      description: 'Send appreciation messages to guests after the event',
      dueDate: getDueDate(eventDate, 7), // 7 days after
      priority: 'medium' as const
    }
  ];
  
  // Specific tasks by event type
  const typeSpecificTasks: Record<string, Array<{
    title: string;
    description: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }>> = {
    'wedding': [
      {
        title: 'Book photography/videography',
        description: 'Secure professionals to document your special day',
        dueDate: getDueDate(eventDate, -90),
        priority: 'high'
      },
      {
        title: 'Order wedding attire',
        description: 'Purchase or rent wedding dress, suits, and accessories',
        dueDate: getDueDate(eventDate, -120),
        priority: 'high'
      },
      {
        title: 'Plan ceremony details',
        description: 'Work with officiant on ceremony structure and vows',
        dueDate: getDueDate(eventDate, -60),
        priority: 'high'
      },
      {
        title: 'Book hair and makeup',
        description: 'Arrange for wedding party styling services',
        dueDate: getDueDate(eventDate, -90),
        priority: 'medium'
      }
    ],
    'corporate': [
      {
        title: 'Develop event agenda',
        description: 'Create detailed program for all sessions and activities',
        dueDate: getDueDate(eventDate, -45),
        priority: 'high'
      },
      {
        title: 'Secure speakers/presenters',
        description: 'Book keynote and session speakers',
        dueDate: getDueDate(eventDate, -60),
        priority: 'high'
      },
      {
        title: 'Arrange for AV equipment',
        description: 'Secure necessary audio-visual technology and support',
        dueDate: getDueDate(eventDate, -30),
        priority: 'high'
      },
      {
        title: 'Prepare name badges',
        description: 'Create professional badges for all attendees',
        dueDate: getDueDate(eventDate, -7),
        priority: 'medium'
      }
    ],
    'conference': [
      {
        title: 'Call for presentations',
        description: 'Open submission process for speakers',
        dueDate: getDueDate(eventDate, -120),
        priority: 'high'
      },
      {
        title: 'Create conference schedule',
        description: 'Develop timetable of all sessions and activities',
        dueDate: getDueDate(eventDate, -60),
        priority: 'high'
      },
      {
        title: 'Set up registration system',
        description: 'Implement online platform for attendee registration',
        dueDate: getDueDate(eventDate, -90),
        priority: 'high'
      },
      {
        title: 'Prepare conference materials',
        description: 'Create program booklets, badges, and information packets',
        dueDate: getDueDate(eventDate, -21),
        priority: 'medium'
      }
    ],
    'birthday': [
      {
        title: 'Plan party activities',
        description: 'Organize games, entertainment, and other activities',
        dueDate: getDueDate(eventDate, -21),
        priority: 'medium'
      },
      {
        title: 'Order cake/desserts',
        description: 'Arrange for birthday cake or alternative desserts',
        dueDate: getDueDate(eventDate, -14),
        priority: 'high'
      },
      {
        title: 'Purchase decorations',
        description: 'Buy all party decor items',
        dueDate: getDueDate(eventDate, -14),
        priority: 'medium'
      },
      {
        title: 'Arrange for gifts',
        description: 'Prepare gifts for the birthday person',
        dueDate: getDueDate(eventDate, -7),
        priority: 'medium'
      }
    ]
  };
  
  // Combine base tasks with type-specific tasks
  let allTasks = [...baseTasks];
  
  if (typeSpecificTasks[eventType.toLowerCase()]) {
    allTasks = [...allTasks, ...typeSpecificTasks[eventType.toLowerCase()]];
  }
  
  // Sort by due date
  return allTasks.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

/**
 * Generate appropriate budget breakdown based on event type
 */
function generateBudgetBreakdown(eventType: string, totalBudget: number, format: string = 'in-person') {
  // Budget allocations by event type (percentages)
  const budgetAllocations: Record<string, Record<string, { percentage: number, notes: string }>> = {
    'wedding': {
      'Venue': { percentage: 25, notes: 'Ceremony and reception venue rental fees' },
      'Catering': { percentage: 30, notes: 'Food, beverages, and service staff' },
      'Photography/Videography': { percentage: 12, notes: 'Professional photo and video services' },
      'Attire': { percentage: 8, notes: 'Wedding dress, suits, and accessories' },
      'Decor & Flowers': { percentage: 10, notes: 'Decorations, centerpieces, and bouquets' },
      'Entertainment': { percentage: 7, notes: 'DJ, band, or other entertainment' },
      'Miscellaneous': { percentage: 8, notes: 'Contingency fund and unexpected expenses' }
    },
    'corporate': {
      'Venue': { percentage: 30, notes: 'Meeting space rental and setup' },
      'Catering': { percentage: 25, notes: 'Meals, coffee breaks, and beverages' },
      'Technology': { percentage: 15, notes: 'AV equipment, WiFi, and tech support' },
      'Speakers/Talent': { percentage: 10, notes: 'Speaker fees and accommodations' },
      'Materials': { percentage: 5, notes: 'Printed materials, name badges, and signage' },
      'Staffing': { percentage: 5, notes: 'Event staff and on-site coordination' },
      'Miscellaneous': { percentage: 10, notes: 'Contingency and unexpected expenses' }
    },
    'conference': {
      'Venue': { percentage: 30, notes: 'Conference center and meeting rooms' },
      'Catering': { percentage: 20, notes: 'Meals, refreshments, and banquet' },
      'Technology': { percentage: 15, notes: 'AV equipment, livestreaming, and app' },
      'Speakers': { percentage: 15, notes: 'Keynote and session speaker fees' },
      'Marketing': { percentage: 5, notes: 'Promotion and attendee acquisition' },
      'Materials': { percentage: 5, notes: 'Conference materials and signage' },
      'Staffing': { percentage: 5, notes: 'Event staff and coordination' },
      'Miscellaneous': { percentage: 5, notes: 'Contingency and unexpected expenses' }
    },
    'birthday': {
      'Venue': { percentage: 25, notes: 'Party venue or location rental' },
      'Food & Drink': { percentage: 30, notes: 'Catering, cake, and beverages' },
      'Decorations': { percentage: 15, notes: 'Theme decorations and setup' },
      'Entertainment': { percentage: 15, notes: 'Activities, DJ, or hired entertainment' },
      'Invitations': { percentage: 5, notes: 'Printed or digital invitations' },
      'Favors & Gifts': { percentage: 5, notes: 'Party favors and gifts' },
      'Miscellaneous': { percentage: 5, notes: 'Contingency and unexpected expenses' }
    }
  };
  
  // Default budget allocation
  const defaultBudget = {
    'Venue': { percentage: 30, notes: 'Event space rental and setup' },
    'Catering': { percentage: 25, notes: 'Food and beverages for attendees' },
    'Decor': { percentage: 15, notes: 'Decorations and event aesthetics' },
    'Entertainment': { percentage: 10, notes: 'Activities and entertainment options' },
    'Marketing': { percentage: 5, notes: 'Promotion and communications' },
    'Staffing': { percentage: 5, notes: 'Event personnel and coordination' },
    'Miscellaneous': { percentage: 10, notes: 'Contingency fund for unexpected expenses' }
  };
  
  // Get budget categories for this event type
  const budgetTemplate = budgetAllocations[eventType.toLowerCase()] || defaultBudget;
  
  // Adjust for virtual events
  if (format === 'virtual') {
    // Override with virtual-specific budget
    return [
      {
        category: 'Technology Platform',
        percentage: 30,
        estimatedAmount: Math.round(totalBudget * 0.3),
        notes: 'Virtual event platform and streaming services'
      },
      {
        category: 'Production',
        percentage: 25,
        estimatedAmount: Math.round(totalBudget * 0.25),
        notes: 'Video production, graphics, and technical support'
      },
      {
        category: 'Speakers/Content',
        percentage: 20,
        estimatedAmount: Math.round(totalBudget * 0.2),
        notes: 'Speaker fees and content development'
      },
      {
        category: 'Marketing',
        percentage: 15,
        estimatedAmount: Math.round(totalBudget * 0.15),
        notes: 'Promotion and attendee acquisition'
      },
      {
        category: 'Virtual Materials',
        percentage: 5,
        estimatedAmount: Math.round(totalBudget * 0.05),
        notes: 'Digital resources and downloadable content'
      },
      {
        category: 'Miscellaneous',
        percentage: 5,
        estimatedAmount: Math.round(totalBudget * 0.05),
        notes: 'Contingency fund for unexpected expenses'
      }
    ];
  }
  
  // Create budget items from the template
  const budgetItems = Object.entries(budgetTemplate).map(([category, details]) => ({
    category,
    percentage: details.percentage,
    estimatedAmount: Math.round((details.percentage / 100) * totalBudget),
    notes: details.notes
  }));
  
  // For hybrid events, adjust the allocations
  if (format === 'hybrid') {
    budgetItems.push({
      category: 'Hybrid Technology',
      percentage: 15,
      estimatedAmount: Math.round(totalBudget * 0.15),
      notes: 'Streaming equipment and virtual participation platform'
    });
    
    // Adjust other categories proportionally
    budgetItems.forEach(item => {
      if (item.category !== 'Hybrid Technology') {
        item.percentage = Math.round(item.percentage * 0.85);
        item.estimatedAmount = Math.round(item.estimatedAmount * 0.85);
      }
    });
  }
  
  return budgetItems;
}

/**
 * Helper function to calculate event complexity
 */
function calculateComplexity(
  eventType: string, 
  format: string,
  guestCount: number,
  tier: 'standard' | 'premium' | 'deluxe'
): number {
  // Base complexity by event type (1-5 scale)
  const typeComplexity: Record<string, number> = {
    'wedding': 4,
    'corporate': 3,
    'conference': 5,
    'birthday': 2,
    'social': 2,
    'fundraiser': 3,
    'retreat': 3,
    'festival': 4,
    'holiday': 3,
    'educational': 3,
    'other': 3
  };
  
  // Format modifiers
  const formatModifier: Record<string, number> = {
    'in-person': 0,
    'virtual': -0.5,
    'hybrid': 1
  };
  
  // Tier modifiers
  const tierModifier: Record<string, number> = {
    'standard': 0,
    'premium': 0.5,
    'deluxe': 1
  };
  
  // Guest count modifier
  let guestModifier = 0;
  if (guestCount > 200) guestModifier = 1;
  else if (guestCount > 100) guestModifier = 0.5;
  else if (guestCount < 20) guestModifier = -0.5;
  
  // Calculate total complexity
  let complexity = (
    (typeComplexity[eventType.toLowerCase()] || 3) + 
    (formatModifier[format] || 0) + 
    (tierModifier[tier] || 0) + 
    guestModifier
  );
  
  // Ensure complexity is between 1-5
  return Math.max(1, Math.min(5, Math.round(complexity)));
}

/**
 * Get suggested event duration based on type and tier
 */
function getSuggestedDuration(eventType: string, tier: 'standard' | 'premium' | 'deluxe'): string {
  // Base durations by event type
  const baseDurations: Record<string, string> = {
    'wedding': '6 hours',
    'corporate': '4 hours',
    'conference': '8 hours',
    'birthday': '3 hours',
    'social': '3 hours',
    'fundraiser': '4 hours',
    'retreat': '2 days',
    'festival': '1 day',
    'holiday': '4 hours',
    'educational': '3 hours',
    'other': '4 hours'
  };
  
  // Tier adjustments
  if (tier === 'premium') {
    // For premium events, add some time
    if (eventType === 'wedding') return '8 hours';
    if (eventType === 'corporate') return '6 hours';
    if (eventType === 'birthday') return '4 hours';
    if (eventType === 'conference') return '2 days';
    if (eventType === 'retreat') return '3 days';
  } else if (tier === 'deluxe') {
    // For deluxe events, add even more time
    if (eventType === 'wedding') return '10 hours';
    if (eventType === 'corporate') return '8 hours';
    if (eventType === 'birthday') return '5 hours';
    if (eventType === 'conference') return '3 days';
    if (eventType === 'retreat') return '5 days';
  }
  
  return baseDurations[eventType.toLowerCase()] || '4 hours';
}

/**
 * Generate appropriate event descriptions
 */
function generateEventDescription(
  eventType: string, 
  tier: 'standard' | 'premium' | 'deluxe',
  format: string,
  guestCount: number
): string {
  const typeDescriptions: Record<string, Record<string, string>> = {
    'wedding': {
      'standard': 'A beautiful wedding celebration with all the essential elements for your special day.',
      'premium': 'An elevated wedding experience with premium services, enhanced decor, and special touches.',
      'deluxe': 'A luxurious, all-inclusive wedding package with the finest details and VIP treatment.'
    },
    'corporate': {
      'standard': 'A professional corporate event with essential business amenities and services.',
      'premium': 'An upgraded corporate experience with enhanced presentations, catering, and networking opportunities.',
      'deluxe': 'A premium corporate package with executive services, luxury amenities, and white-glove treatment.'
    },
    'conference': {
      'standard': 'A well-organized conference with standard facilities for presentations and networking.',
      'premium': 'An enhanced conference experience with premium technical facilities and attendee services.',
      'deluxe': 'A comprehensive conference package with VIP speakers, premium content, and executive accommodations.'
    },
    'birthday': {
      'standard': 'A fun birthday celebration with decorations, cake, and activities for all guests.',
      'premium': 'An enhanced birthday experience with upgraded catering, entertainment, and premium venue.',
      'deluxe': 'A luxury birthday package with VIP treatment, exclusive venue, and premium services.'
    },
  };
  
  // Get the appropriate description or use a default
  let description = '';
  if (typeDescriptions[eventType.toLowerCase()]?.[tier]) {
    description = typeDescriptions[eventType.toLowerCase()][tier];
  } else {
    // Default descriptions if specific ones aren't available
    const defaultDescriptions: Record<string, string> = {
      'standard': `A well-organized ${eventType} event with all the essential elements for a successful gathering.`,
      'premium': `An enhanced ${eventType} experience with premium services, upgraded amenities, and special touches.`,
      'deluxe': `A luxury ${eventType} package with VIP treatment, exclusive options, and the finest attention to detail.`
    };
    description = defaultDescriptions[tier];
  }
  
  // Add format-specific details
  if (format === 'virtual') {
    description += ` This virtual event provides a seamless digital experience for up to ${guestCount} online attendees.`;
  } else if (format === 'hybrid') {
    description += ` This hybrid format accommodates both in-person and virtual participants, providing flexibility for all ${guestCount} attendees.`;
  } else {
    description += ` This in-person event is designed for ${guestCount} guests to enjoy a memorable experience.`;
  }
  
  return description;
}

/**
 * Helper function to get a due date relative to the event date
 */
function getDueDate(eventDate: Date, dayOffset: number): string {
  const date = new Date(eventDate);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
} 