/**
 * API Client
 * 
 * A centralized utility for making API requests to our application endpoints
 * with consistent error handling, authentication, and request formatting.
 */

import { api, getAuthToken } from './api';

// Type for API response with pagination
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// Common API error type
export type ApiError = {
  status: number;
  message: string;
  error: string;
};

// Services for various API resources

export const EventsApi = {
  // Get all events with optional filtering and pagination
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }) => {
    return api.get<PaginatedResponse<any>>('/api/events', { params });
  },
  
  // Get a single event by ID
  getById: async (eventId: string) => {
    return api.get<any>(`/api/events/${eventId}`);
  },
  
  // Create a new event
  create: async (eventData: any) => {
    return api.post<any>('/api/events', eventData);
  },
  
  // Update an existing event
  update: async (eventId: string, eventData: any) => {
    return api.patch<any>(`/api/events/${eventId}`, eventData);
  },
  
  // Delete an event
  delete: async (eventId: string) => {
    return api.delete<void>(`/api/events/${eventId}`);
  },
  
  // Generate AI suggestions for an event
  generateSuggestions: async (eventId: string, prompt: string) => {
    return api.post<any>(`/api/events/${eventId}/generate`, { prompt });
  },
  
  // Share an event with others
  share: async (eventId: string, shareData: { email: string; role: string }) => {
    return api.post<any>(`/api/events/${eventId}/share`, shareData);
  }
};

export const TasksApi = {
  // Get tasks for an event
  getByEventId: async (eventId: string, params?: { status?: string }) => {
    return api.get<any[]>(`/api/events/${eventId}/tasks`, { params });
  },
  
  // Create a new task
  create: async (eventId: string, taskData: any) => {
    return api.post<any>(`/api/events/${eventId}/tasks`, taskData);
  },
  
  // Update an existing task
  update: async (taskId: string, taskData: any) => {
    return api.patch<any>(`/api/tasks/${taskId}`, taskData);
  },
  
  // Delete a task
  delete: async (taskId: string) => {
    return api.delete<void>(`/api/tasks/${taskId}`);
  }
};

export const UserApi = {
  // Get current user profile
  getProfile: async () => {
    return api.get<any>('/api/auth/users/me');
  },
  
  // Update user profile
  updateProfile: async (userData: any) => {
    return api.patch<any>('/api/auth/users/me', userData);
  },
  
  // Get user subscription info
  getSubscription: async () => {
    return api.get<any>('/api/auth/users/subscription');
  }
};

export const VendorsApi = {
  // Get all vendors
  getAll: async (params?: { 
    page?: number; 
    pageSize?: number; 
    category?: string;
    search?: string;
  }) => {
    return api.get<PaginatedResponse<any>>('/api/vendors', { params });
  },
  
  // Get a single vendor
  getById: async (vendorId: string) => {
    return api.get<any>(`/api/vendors/${vendorId}`);
  },
  
  // Create a new vendor
  create: async (vendorData: any) => {
    return api.post<any>('/api/vendors', vendorData);
  },
  
  // Update an existing vendor
  update: async (vendorId: string, vendorData: any) => {
    return api.patch<any>(`/api/vendors/${vendorId}`, vendorData);
  },
  
  // Delete a vendor
  delete: async (vendorId: string) => {
    return api.delete<void>(`/api/vendors/${vendorId}`);
  }
};

export const GuestsApi = {
  // Get guests for an event
  getByEventId: async (eventId: string, params?: { 
    page?: number; 
    pageSize?: number;
    status?: string;
    search?: string;
  }) => {
    return api.get<PaginatedResponse<any>>(`/api/events/${eventId}/guests`, { params });
  },
  
  // Create a new guest
  create: async (eventId: string, guestData: any) => {
    return api.post<any>(`/api/events/${eventId}/guests`, guestData);
  },
  
  // Update an existing guest
  update: async (guestId: string, guestData: any) => {
    return api.patch<any>(`/api/guests/${guestId}`, guestData);
  },
  
  // Delete a guest
  delete: async (guestId: string) => {
    return api.delete<void>(`/api/guests/${guestId}`);
  },
  
  // Import guests in bulk
  import: async (eventId: string, guestData: any[]) => {
    return api.post<any>(`/api/events/${eventId}/guests/import`, { guests: guestData });
  }
};

export const AnalyticsApi = {
  // Get event analytics
  getEventAnalytics: async (eventId: string) => {
    return api.get<any>(`/api/analytics/events/${eventId}`);
  },
  
  // Get user dashboard analytics
  getDashboardAnalytics: async () => {
    return api.get<any>('/api/analytics/dashboard');
  }
};

export const AuthApi = {
  // Check auth status
  getSession: async () => {
    return api.get<any>('/api/auth/session');
  },
  
  // Login
  login: async (credentials: { email: string; password: string }) => {
    return api.post<any>('/api/auth/signin', credentials);
  },
  
  // Register new user
  register: async (userData: { email: string; password: string; name?: string }) => {
    return api.post<any>('/api/auth/signup', userData);
  },
  
  // Logout
  logout: async () => {
    return api.post<void>('/api/auth/signout', {});
  },
  
  // Reset password request
  forgotPassword: async (email: string) => {
    return api.post<any>('/api/auth/forgot-password', { email });
  },
  
  // Reset password with token
  resetPassword: async (data: { token: string; password: string }) => {
    return api.post<any>('/api/auth/reset-password', data);
  }
};

/**
 * Helper function to check if auth token exists
 * This can be used to verify if a user is authenticated client-side
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

// Expose the API services in a single object
export const apiClient = {
  events: EventsApi,
  tasks: TasksApi,
  users: UserApi,
  vendors: VendorsApi,
  guests: GuestsApi,
  analytics: AnalyticsApi,
  auth: AuthApi,
  isAuthenticated
}; 