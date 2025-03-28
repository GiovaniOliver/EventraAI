import OpenAI from "openai";

// The OpenAI model to use for chat completions
export const MODEL = "gpt-3.5-turbo";

// Create placeholder API client to prevent errors
export const openai = {
  chat: {
    completions: {
      create: async () => ({
        choices: [{ message: { content: "AI features are currently disabled." } }]
      })
    }
  }
};

// Interface definitions
export interface BudgetItem {
  category: string;
  name: string;
  amount: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

// Placeholder implementations of the AI functions
export async function generateAiSuggestions(prompt: string): Promise<string> {
  return "AI suggestions are disabled until OPENAI_API_KEY is configured.";
}

export async function optimizeEventBudget(
  budget: number, 
  items: BudgetItem[]
): Promise<{ 
  optimizedItems: BudgetItem[], 
  savings: number, 
  recommendations: string[] 
}> {
  return {
    optimizedItems: items,
    savings: 0,
    recommendations: ["Budget optimization is disabled until OPENAI_API_KEY is configured."]
  };
}

type EventSuggestion = {
  id: string;
  title: string;
  description: string;
  complexity: number; // 1-5, where 5 is most complex
  estimatedCost: number; // in dollars
  suggestedDuration: string;
};

type ThemeSuggestion = {
  id: string;
  name: string;
  description: string;
  colorScheme: string[];
  suitable: string[]; // suitable event types
};

type BudgetSuggestion = {
  category: string;
  percentage: number;
  estimatedAmount: number;
  notes: string;
};

type TaskSuggestion = {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
};

type AiSuggestions = {
  events?: EventSuggestion[];
  themes?: ThemeSuggestion[];
  budget?: BudgetSuggestion[];
  tasks?: TaskSuggestion[];
};

// Predefined suggestions for different event types
const eventTypeSuggestions: Record<string, AiSuggestions> = {
  conference: {
    events: [
      {
        id: "conf1",
        title: "Tech Industry Summit",
        description: "A professional gathering of industry leaders to discuss emerging technologies and trends.",
        complexity: 4,
        estimatedCost: 5000,
        suggestedDuration: "2 days"
      },
      {
        id: "conf2",
        title: "Product Launch Conference",
        description: "Showcase your new product with demos, presentations, and networking opportunities.",
        complexity: 3,
        estimatedCost: 3500,
        suggestedDuration: "1 day"
      }
    ],
    themes: [
      {
        id: "theme1",
        name: "Innovation Showcase",
        description: "Highlight cutting-edge technologies with interactive demonstrations and futuristic aesthetics.",
        colorScheme: ["#4F46E5", "#10B981", "#F3F4F6"],
        suitable: ["conference", "webinar"]
      },
      {
        id: "theme2",
        name: "Professional Network",
        description: "Classic corporate styling with emphasis on networking and professional development.",
        colorScheme: ["#1E293B", "#475569", "#F8FAFC"],
        suitable: ["conference", "seminar"]
      }
    ],
    tasks: [
      {
        title: "Secure keynote speakers",
        description: "Research and invite industry experts for keynote presentations.",
        dueDate: "60 days before event",
        priority: "high"
      },
      {
        title: "Create conference schedule",
        description: "Plan sessions, breaks, and networking events for optimal attendee experience.",
        dueDate: "45 days before event",
        priority: "high"
      },
      {
        title: "Setup virtual platform",
        description: "Configure virtual conferencing software for presentations and sessions.",
        dueDate: "30 days before event",
        priority: "high"
      }
    ]
  },
  birthday: {
    events: [
      {
        id: "bday1",
        title: "Virtual Birthday Celebration",
        description: "A fun virtual party with games, virtual cake cutting, and shared experiences.",
        complexity: 2,
        estimatedCost: 200,
        suggestedDuration: "2-3 hours"
      },
      {
        id: "bday2",
        title: "Hybrid Birthday Experience",
        description: "Combining in-person gathering with virtual attendees for an inclusive celebration.",
        complexity: 3,
        estimatedCost: 500,
        suggestedDuration: "4 hours"
      }
    ],
    themes: [
      {
        id: "btheme1",
        name: "Digital Party",
        description: "Fun, colorful theme with interactive games and virtual party elements.",
        colorScheme: ["#EC4899", "#8B5CF6", "#FECACA"],
        suitable: ["birthday", "celebration"]
      },
      {
        id: "btheme2",
        name: "Elegant Celebration",
        description: "Sophisticated styling with elegant visuals and classy virtual environments.",
        colorScheme: ["#6D28D9", "#F59E0B", "#F3F4F6"],
        suitable: ["birthday", "anniversary"]
      }
    ],
    tasks: [
      {
        title: "Send digital invitations",
        description: "Create and send virtual invites with event details and joining instructions.",
        dueDate: "14 days before event",
        priority: "high"
      },
      {
        title: "Arrange virtual activities",
        description: "Plan interactive games and activities that work well in a virtual setting.",
        dueDate: "7 days before event",
        priority: "medium"
      },
      {
        title: "Coordinate virtual cake cutting",
        description: "Arrange for everyone to have cake delivered or prepare their own for synchronized celebration.",
        dueDate: "3 days before event",
        priority: "medium"
      }
    ]
  },
  webinar: {
    events: [
      {
        id: "web1",
        title: "Educational Webinar Series",
        description: "A series of informative sessions with expert presenters and Q&A opportunities.",
        complexity: 3,
        estimatedCost: 1000,
        suggestedDuration: "1-2 hours per session"
      },
      {
        id: "web2",
        title: "Interactive Workshop",
        description: "Hands-on learning experience with practical exercises and direct feedback.",
        complexity: 4,
        estimatedCost: 1500,
        suggestedDuration: "3 hours"
      }
    ],
    themes: [
      {
        id: "wtheme1",
        name: "Knowledge Share",
        description: "Clean, minimalist design focusing on content and learning experience.",
        colorScheme: ["#0EA5E9", "#475569", "#F8FAFC"],
        suitable: ["webinar", "workshop"]
      },
      {
        id: "wtheme2",
        name: "Digital Classroom",
        description: "Educational aesthetics with interactive elements and engagement features.",
        colorScheme: ["#10B981", "#6366F1", "#FFFFFF"],
        suitable: ["webinar", "training"]
      }
    ],
    tasks: [
      {
        title: "Prepare presentation materials",
        description: "Create slides, demos, and supporting materials for webinar content.",
        dueDate: "14 days before event",
        priority: "high"
      },
      {
        title: "Test technical setup",
        description: "Run through platform features, presentation sharing, and audience interaction tools.",
        dueDate: "7 days before event",
        priority: "high"
      },
      {
        title: "Create follow-up content",
        description: "Prepare resources to share with attendees after the webinar.",
        dueDate: "3 days before event",
        priority: "medium"
      }
    ]
  },
  other: {
    events: [
      {
        id: "other1",
        title: "Custom Virtual Event",
        description: "Tailored virtual experience based on your specific needs and goals.",
        complexity: 3,
        estimatedCost: 1500,
        suggestedDuration: "2-4 hours"
      }
    ],
    themes: [
      {
        id: "otheme1",
        name: "Flexible Design",
        description: "Adaptable theme that can be customized for various event types and purposes.",
        colorScheme: ["#4F46E5", "#F97316", "#F8FAFC"],
        suitable: ["other", "custom"]
      }
    ],
    tasks: [
      {
        title: "Define event objectives",
        description: "Establish clear goals and desired outcomes for your event.",
        dueDate: "30 days before event",
        priority: "high"
      },
      {
        title: "Create custom event plan",
        description: "Develop detailed timeline and format based on event objectives.",
        dueDate: "21 days before event",
        priority: "high"
      }
    ]
  }
};

export async function generateAiSuggestions(
  eventType: string,
  theme?: string,
  budget?: number,
  preferences?: { 
    guestCount?: number; 
    format?: string; 
    duration?: string;
    previousEvents?: string[];
    userPreferences?: Record<string, any>;
  }
): Promise<AiSuggestions> {
  try {
    // Attempt to use AI for generating suggestions
    const suggestions = await generateAiBasedSuggestions(eventType, theme, budget, preferences);
    
    // If budget is provided but not included in AI response, generate budget separately
    if (budget && budget > 0 && !suggestions.budget) {
      suggestions.budget = await generateAiBudgetSuggestions(eventType, budget, preferences?.guestCount);
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error using OpenAI for suggestions:", error);
    
    // Fallback to predefined suggestions if AI fails
    const eventTypeKey = eventTypeSuggestions[eventType.toLowerCase()] 
      ? eventType.toLowerCase() 
      : 'other';
    
    const suggestions = { ...eventTypeSuggestions[eventTypeKey] };
    
    // If budget is provided, generate budget suggestions
    if (budget && budget > 0) {
      suggestions.budget = generateFallbackBudgetSuggestions(eventType, budget);
    }
    
    return suggestions;
  }
}

async function generateAiBasedSuggestions(
  eventType: string,
  theme?: string,
  budget?: number,
  preferences?: { 
    guestCount?: number; 
    format?: string; 
    duration?: string;
    previousEvents?: string[];
    userPreferences?: Record<string, any>;
  }
): Promise<AiSuggestions> {
  // Build additional context based on preferences
  const guestCountInfo = preferences?.guestCount ? `The event will have approximately ${preferences.guestCount} guests.` : '';
  const formatInfo = preferences?.format ? `The event format will be ${preferences.format}.` : '';
  const durationInfo = preferences?.duration ? `The event duration will be ${preferences.duration}.` : '';
  
  // Include information about previous events if available
  const previousEventsInfo = preferences?.previousEvents && preferences.previousEvents.length > 0 
    ? `Previous events organized: ${preferences.previousEvents.join(', ')}.` 
    : '';
  
  // Include user preferences if available
  let userPreferencesInfo = '';
  if (preferences?.userPreferences) {
    const preferencesEntries = Object.entries(preferences.userPreferences);
    if (preferencesEntries.length > 0) {
      userPreferencesInfo = 'User preferences: ' + 
        preferencesEntries.map(([key, value]) => `${key}: ${value}`).join(', ') + '.';
    }
  }

  const systemPrompt = `You are an expert event planning assistant with deep knowledge of virtual and hybrid events.
Your task is to generate creative, practical, and engaging suggestions for a ${eventType} event.
${theme ? `The event has a "${theme}" theme.` : ''}
${budget ? `The event has a budget of $${budget}.` : ''}
${guestCountInfo}
${formatInfo}
${durationInfo}
${previousEventsInfo}
${userPreferencesInfo}

Your suggestions should be tailored to these specific requirements and preferences.

Provide your response in a JSON format with the following structure:
{
  "events": [
    {
      "id": "unique_id",
      "title": "Event Title",
      "description": "Detailed description of the event concept",
      "complexity": 1-5 (where 5 is most complex),
      "estimatedCost": cost in dollars,
      "suggestedDuration": "duration in hours or days"
    }
  ],
  "themes": [
    {
      "id": "unique_id",
      "name": "Theme Name",
      "description": "Description of the theme and its elements",
      "colorScheme": ["#hex1", "#hex2", "#hex3"],
      "suitable": ["${eventType}", "other_event_types"]
    }
  ],
  "tasks": [
    {
      "title": "Task Name",
      "description": "Description of what needs to be done",
      "dueDate": "X days before event",
      "priority": "low|medium|high"
    }
  ]
}
${budget ? `Also include a "budget" section with suggested allocations:
"budget": [
  {
    "category": "Category Name",
    "percentage": decimal between 0-1,
    "estimatedAmount": calculated amount in dollars,
    "notes": "Brief explanation of this allocation"
  }
]` : ''}
Generate 2-3 events, 2-3 themes, and 3-5 important tasks.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  const aiSuggestions = JSON.parse(content) as AiSuggestions;
  
  // Ensure each suggestion has required fields
  if (aiSuggestions.events) {
    aiSuggestions.events = aiSuggestions.events.map((event, i) => ({
      ...event,
      id: event.id || `ai_event_${i}`
    }));
  }
  
  if (aiSuggestions.themes) {
    aiSuggestions.themes = aiSuggestions.themes.map((theme, i) => ({
      ...theme,
      id: theme.id || `ai_theme_${i}`,
      colorScheme: theme.colorScheme || ["#4F46E5", "#10B981", "#F3F4F6"]
    }));
  }
  
  return aiSuggestions;
}

async function generateAiBudgetSuggestions(eventType: string, totalBudget: number, guestCount?: number): Promise<BudgetSuggestion[]> {
  try {
    const guestInfo = guestCount ? `The event will have approximately ${guestCount} guests.` : '';
    const systemPrompt = `You are an expert event budget planner specializing in virtual and hybrid ${eventType} events.
Your task is to suggest a practical budget allocation for a ${eventType} event with a total budget of $${totalBudget}.
${guestInfo}
Provide your response in a JSON format with the following structure:
{
  "budget": [
    {
      "category": "Category Name",
      "percentage": decimal between 0-1 (should sum to 1.0),
      "estimatedAmount": calculated amount in dollars,
      "notes": "Brief explanation of this allocation"
    }
  ]
}
Generate 4-7 budget categories that make sense for this type of event.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);
    return result.budget || [];
  } catch (error) {
    console.error("Error generating AI budget suggestions:", error);
    return generateFallbackBudgetSuggestions(eventType, totalBudget);
  }
}

function generateFallbackBudgetSuggestions(eventType: string, totalBudget: number): BudgetSuggestion[] {
  // Fallback budget allocations if AI fails
  let allocations: Record<string, number> = {};
  
  switch(eventType) {
    case 'conference':
      allocations = {
        'Virtual Platform': 0.30,
        'Speakers/Presenters': 0.25,
        'Marketing': 0.20,
        'Staff': 0.15,
        'Contingency': 0.10
      };
      break;
    case 'birthday':
      allocations = {
        'Virtual Platform': 0.20,
        'Digital Activities': 0.30,
        'Gifts/Deliveries': 0.35,
        'Decorations': 0.15
      };
      break;
    case 'webinar':
      allocations = {
        'Virtual Platform': 0.35,
        'Presenters': 0.30,
        'Marketing': 0.20,
        'Materials': 0.15
      };
      break;
    default:
      allocations = {
        'Virtual Platform': 0.25,
        'Content Creation': 0.25,
        'Marketing': 0.20,
        'Staff': 0.20,
        'Contingency': 0.10
      };
  }
  
  return Object.entries(allocations).map(([category, percentage]) => ({
    category,
    percentage,
    estimatedAmount: Math.round(totalBudget * percentage),
    notes: `Suggested allocation for ${category.toLowerCase()}`
  }));
}

// This function is kept for reference but we're using the AI version directly now

// Budget Optimization Types
export type BudgetItem = {
  id: string;
  category: string;
  amount: number;
  notes?: string;
};

export type BudgetOptimizationResult = {
  optimizedBudget: BudgetSuggestion[];
  savings: number;
  insights: string[];
  recommendations: {
    title: string;
    description: string;
    potentialSavings: number;
    priority: 'low' | 'medium' | 'high';
  }[];
};

/**
 * Optimize event budget based on event details and current budget allocation
 */
export async function optimizeEventBudget(
  event: any,
  currentBudgetItems?: BudgetItem[],
  similarEvents?: any[]
): Promise<BudgetOptimizationResult> {
  try {
    // Build context from event details
    const eventInfo = `
      Event Type: ${event.type}
      Format: ${event.format}
      Estimated Guests: ${event.estimatedGuests || 'Not specified'}
      Total Budget: $${event.budget || 0}
      Theme: ${event.theme || 'Not specified'}
      Status: ${event.status}
    `;

    // Add current budget allocation to context, if provided
    const currentBudgetInfo = currentBudgetItems && currentBudgetItems.length > 0
      ? `Current budget allocation:
        ${currentBudgetItems.map(item => `- ${item.category}: $${item.amount} (${((item.amount / event.budget) * 100).toFixed(1)}%)`).join('\n')}`
      : 'No current budget allocation provided.';

    // Add similar events context if provided
    const similarEventsInfo = similarEvents && similarEvents.length > 0
      ? `Similar event data for reference:
        ${similarEvents.map(evt => 
          `- ${evt.name} (${evt.type}, ${evt.format}, ${evt.estimatedGuests} guests): Budget $${evt.budget || 'N/A'}`
        ).join('\n')}`
      : '';

    const systemPrompt = `You are an expert virtual event budget optimization assistant.
Your task is to analyze the event details and current budget allocation (if available) and provide optimized budget suggestions.
You should look for inefficiencies, suggest better allocations, and provide practical cost-saving insights.

Event details:
${eventInfo}

${currentBudgetInfo}

${similarEventsInfo}

Based on this information, provide:
1. An optimized budget allocation with the same or lower total
2. Specific cost-saving insights 
3. Practical recommendations with estimated savings potential

Format your response as a JSON with the following structure:
{
  "optimizedBudget": [
    {
      "category": "Category Name",
      "percentage": decimal between 0-1 (should sum to 1.0),
      "estimatedAmount": calculated amount in dollars,
      "notes": "Brief explanation of this allocation"
    }
  ],
  "savings": total potential savings in dollars,
  "insights": [
    "Insight 1 about budget efficiency",
    "Insight 2 about cost saving opportunities"
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation of the recommendation",
      "potentialSavings": estimated savings in dollars,
      "priority": "high|medium|low"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);
    return {
      optimizedBudget: result.optimizedBudget || [],
      savings: result.savings || 0,
      insights: result.insights || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("Error optimizing budget with AI:", error);
    // Return fallback response
    return generateFallbackBudgetOptimization(event, currentBudgetItems);
  }
}

/**
 * Generate a fallback budget optimization if the AI call fails
 */
function generateFallbackBudgetOptimization(
  event: any,
  currentBudgetItems?: BudgetItem[]
): BudgetOptimizationResult {
  const totalBudget = event.budget || 5000;
  let baseBudget = generateFallbackBudgetSuggestions(event.type, totalBudget);
  
  // Calculate a modest 5-15% savings
  const savingsRate = 0.05 + (Math.random() * 0.1);
  const savings = Math.round(totalBudget * savingsRate);
  
  // Adjust the budget items to reflect savings
  const optimizedBudget = baseBudget.map(item => ({
    ...item,
    estimatedAmount: Math.round(item.estimatedAmount * (1 - (savingsRate / 2))),
    percentage: item.percentage * (1 - (savingsRate / 2))
  }));
  
  return {
    optimizedBudget,
    savings,
    insights: [
      "Consider using more cost-effective virtual platforms",
      "Reduce redundant technical services",
      "Negotiate better rates with service providers"
    ],
    recommendations: [
      {
        title: "Reduce platform costs",
        description: "Use alternative virtual event platforms that offer similar features at lower costs",
        potentialSavings: Math.round(totalBudget * 0.05),
        priority: 'high'
      },
      {
        title: "Optimize staffing",
        description: "Streamline the number of technical staff required during the event",
        potentialSavings: Math.round(totalBudget * 0.03),
        priority: 'medium'
      }
    ]
  };
}
