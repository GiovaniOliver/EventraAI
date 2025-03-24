import { apiRequest } from "./queryClient";
import { Event } from "@shared/schema";

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

export interface ImprovementSuggestion {
  area: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
  resources?: string[];
}

export interface AiSuggestions {
  events?: EventSuggestion[];
  themes?: ThemeSuggestion[];
  budget?: BudgetSuggestion[];
  tasks?: TaskSuggestion[];
  improvements?: ImprovementSuggestion[];
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

export async function getEventImprovements(
  event: Event
): Promise<ImprovementSuggestion[]> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/ai/improve-event", 
      { event }
    );
    
    const data = await response.json();
    return data.improvements || [];
  } catch (error) {
    console.error("Error fetching event improvement suggestions:", error);
    throw new Error("Failed to get event improvement suggestions");
  }
}

export interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface BudgetOptimizationRecommendation {
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'low' | 'medium' | 'high';
}

export interface BudgetOptimizationResult {
  optimizedBudget: BudgetSuggestion[];
  savings: number;
  insights: string[];
  recommendations: BudgetOptimizationRecommendation[];
}

export async function optimizeEventBudget(
  event: Event,
  currentBudgetItems?: BudgetItem[],
  similarEvents?: Event[]
): Promise<BudgetOptimizationResult> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/ai/optimize-budget",
      { event, currentBudgetItems, similarEvents }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error optimizing budget:", error);
    throw new Error("Failed to optimize budget");
  }
}
