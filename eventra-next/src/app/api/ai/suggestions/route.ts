import { NextRequest, NextResponse } from 'next/server';
import { AiSuggestions, SuggestionPreferences } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, theme, budget, preferences } = body;
    
    // Validate required parameters
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would call an AI service here
    // For now, we'll return mock data
    const suggestions: AiSuggestions = generateMockSuggestions(eventType, theme, budget, preferences);
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}

// Mock function to generate suggestions
function generateMockSuggestions(
  eventType: string,
  theme?: string,
  budget?: number,
  preferences?: SuggestionPreferences
): AiSuggestions {
  // Determine guest count for calculations
  const guestCount = preferences?.guestCount || 50;
  
  // Mock data for different event types
  const suggestions: AiSuggestions = {
    events: [
      {
        id: 'evt-' + Math.random().toString(36).substring(2, 9),
        title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} ${theme ? `with ${theme} Theme` : ''}`,
        description: `A ${eventType} event designed to provide an excellent experience for all attendees.`,
        complexity: Math.floor(Math.random() * 5) + 1,
        estimatedCost: budget || Math.floor(guestCount * (Math.random() * 50 + 50)),
        suggestedDuration: '3 hours'
      },
      {
        id: 'evt-' + Math.random().toString(36).substring(2, 9),
        title: `Premium ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
        description: `A high-end ${eventType} experience with premium services and amenities.`,
        complexity: Math.floor(Math.random() * 5) + 1,
        estimatedCost: budget ? budget * 1.5 : Math.floor(guestCount * (Math.random() * 100 + 75)),
        suggestedDuration: '4 hours'
      }
    ],
    themes: [
      {
        id: 'thm-' + Math.random().toString(36).substring(2, 9),
        name: theme || 'Classic Elegance',
        description: 'A timeless theme that emphasizes sophistication and elegance.',
        colorScheme: ['#1A1A1A', '#FFFFFF', '#C0C0C0', '#FFD700'],
        suitable: ['formal', 'wedding', 'gala']
      },
      {
        id: 'thm-' + Math.random().toString(36).substring(2, 9),
        name: 'Modern Minimalist',
        description: 'Clean lines and minimalist design for a contemporary feel.',
        colorScheme: ['#FFFFFF', '#000000', '#E0E0E0', '#007BFF'],
        suitable: ['corporate', 'product launch', 'tech event']
      }
    ],
    tasks: [
      {
        title: 'Book venue',
        description: 'Research and book an appropriate venue for the event',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      },
      {
        title: 'Send invitations',
        description: 'Create and send invitations to all attendees',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium'
      },
      {
        title: 'Arrange catering',
        description: 'Contact catering services and finalize menu',
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      }
    ],
    budget: [
      {
        category: 'Venue',
        percentage: 30,
        estimatedAmount: budget ? budget * 0.3 : Math.floor(guestCount * 30),
        notes: 'Includes rental fee, setup, and cleanup'
      },
      {
        category: 'Catering',
        percentage: 25,
        estimatedAmount: budget ? budget * 0.25 : Math.floor(guestCount * 25),
        notes: 'Food and beverages for all attendees'
      },
      {
        category: 'Decorations',
        percentage: 15,
        estimatedAmount: budget ? budget * 0.15 : Math.floor(guestCount * 15),
        notes: 'Theme-specific decorations and floral arrangements'
      },
      {
        category: 'Entertainment',
        percentage: 10,
        estimatedAmount: budget ? budget * 0.1 : Math.floor(guestCount * 10),
        notes: 'Music, performances, or activities'
      },
      {
        category: 'Miscellaneous',
        percentage: 20,
        estimatedAmount: budget ? budget * 0.2 : Math.floor(guestCount * 20),
        notes: 'Contingency fund for unexpected expenses'
      }
    ]
  };
  
  return suggestions;
} 