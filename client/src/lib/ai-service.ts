import { apiRequest } from "./queryClient";

export interface EventSuggestion {
  id: string;
  title: string;
  description: string;
  complexity: number;
  estimatedCost: number;
  suggestedDuration: string;
}

export interface ThemeSuggestion {
  id: string;
  name: string;
  description: string;
  colorScheme: string[];
  suitable: string[];
}

export interface BudgetSuggestion {
  category: string;
  percentage: number;
  estimatedAmount: number;
  notes: string;
}

export interface TaskSuggestion {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AiSuggestions {
  events?: EventSuggestion[];
  themes?: ThemeSuggestion[];
  budget?: BudgetSuggestion[];
  tasks?: TaskSuggestion[];
}

export interface SuggestionPreferences {
  userId?: number;
  guestCount?: number;
  format?: 'virtual' | 'in-person' | 'hybrid';
  duration?: string;
}

export async function getAiSuggestions(
  eventType: string, 
  theme?: string, 
  budget?: number,
  preferences?: SuggestionPreferences
): Promise<AiSuggestions> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/ai/suggestions", 
      { 
        eventType, 
        theme, 
        budget,
        preferences
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    throw new Error("Failed to get AI suggestions");
  }
}
