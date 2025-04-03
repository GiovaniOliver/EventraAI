/**
 * API utility for making requests to the application's backend
 * This provides a unified way to handle authentication, token refreshing,
 * and error handling across all API requests.
 */

type RequestOptions = {
  headers?: Record<string, string>
  params?: Record<string, string>
  body?: any
  skipAuth?: boolean // Allow skipping auth for specific requests
}

/**
 * Helper function to handle API responses and errors
 */
async function handleResponse<T>(response: Response, url: string, method: string, options: RequestOptions): Promise<T> {
  if (!response.ok) {
    console.log(`[API Error] ${method} ${url} failed with status ${response.status}`);
    
    // Handle 401 Unauthorized errors by attempting to refresh the token
    if (response.status === 401 && typeof window !== 'undefined' && !options.skipAuth) {
      try {
        console.log('[AUTH] Received 401 error, attempting to refresh token and retry');
        
        // Dynamic import to avoid circular dependencies
        const { createBrowserSupabaseClient } = await import('./supabase');
        const supabase = createBrowserSupabaseClient();
        
        // Check if we have a current session before attempting to refresh
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log('[AUTH] No session found, cannot refresh token');
          // Redirect to login if no session exists
          window.location.href = `/login?redirectedFrom=${encodeURIComponent(window.location.pathname)}`;
          throw new Error('Authentication required');
        }
        
        console.log('[AUTH] Attempting to refresh token');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && refreshData.session) {
          console.log('[AUTH] Token refreshed successfully, retrying request');
          
          // Update the Authorization header with the new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${refreshData.session.access_token}`
            }
          };
          
          // Add the token as a cookie as well for extra compatibility
          document.cookie = `sb-access-token=${refreshData.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
          
          // Retry the request with the new token
          const retryResponse = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...newOptions.headers,
            },
            credentials: 'include',
            body: method !== 'GET' && method !== 'HEAD' && newOptions.body ? 
              JSON.stringify(newOptions.body) : undefined
          });
          
          if (retryResponse.ok) {
            // If the retry worked, return the successful response
            return handleResponse<T>(retryResponse, url, method, newOptions);
          } else {
            console.error('[AUTH] Retry failed with status:', retryResponse.status);
          }
        } else {
          console.error('[AUTH] Token refresh failed:', refreshError);
          // Session is invalid, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = `/login?redirectedFrom=${encodeURIComponent(window.location.pathname)}`;
          }
        }
      } catch (refreshError) {
        console.error('[AUTH] Error refreshing token:', refreshError);
      }
    }
    
    // Attempt to parse the error response
    try {
      const errorData = await response.json();
      console.error('[API Error] Response data:', errorData);
      const errorMessage = errorData.error || response.statusText || 'Something went wrong';
      throw new Error(errorMessage);
    } catch (parseError) {
      // If parsing fails, use the status text
      throw new Error(response.statusText || 'Something went wrong');
    }
  }
  
  // Check if the response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json() as T;
    } catch (error) {
      console.error('[API Error] Failed to parse JSON response:', error);
      return {} as T;
    }
  }
  
  return {} as T;
}

/**
 * Get the current auth token from Supabase
 * This centralizes token retrieval logic
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null; // We're on the server
  }
  
  try {
    const { createBrowserSupabaseClient } = await import('./supabase');
    const supabase = createBrowserSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      // Also set the token as a cookie for API routes that expect it there
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
      
      return session.access_token;
    }
  } catch (error) {
    console.error('[AUTH] Error getting auth token:', error);
  }
  
  return null;
}

/**
 * Verify the API is accessible and authentication is working
 * Useful for testing connectivity at app startup
 */
export async function verifyApiConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/health/auth-check', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('[API] Health check successful');
      return true;
    } else {
      console.error('[API] Health check failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[API] Health check failed with error:', error);
    return false;
  }
}

/**
 * Generic fetch function with error handling and authentication
 */
async function fetchAPI<T>(
  url: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, params = {}, body, skipAuth = false } = options;
  
  // If we're not skipping auth and no Authorization header is provided, get the token
  if (!skipAuth && !headers['Authorization'] && typeof window !== 'undefined') {
    const token = await getAuthToken();
    if (token) {
      console.log(`[DEBUG] Adding auth token to request: ${token.substring(0, 10)}...`);
      headers['Authorization'] = `Bearer ${token}`;
      
      // Also set the token as a cookie for API routes that expect it there
      document.cookie = `sb-access-token=${token}; path=/; max-age=3600; SameSite=Lax`;
    } else {
      console.warn('[AUTH] No authentication token available for request to', url);
      
      // Try to refresh the session before giving up
      try {
        const { createBrowserSupabaseClient } = await import('./supabase');
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase.auth.refreshSession();
        
        if (!error && data.session?.access_token) {
          console.log('[DEBUG] Successfully refreshed token for request');
          headers['Authorization'] = `Bearer ${data.session.access_token}`;
          
          // Also set the token as a cookie for API routes that expect it there
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; SameSite=Lax`;
        } else {
          console.error('[DEBUG] Failed to refresh token:', error);
        }
      } catch (refreshError) {
        console.error('[DEBUG] Error during pre-request token refresh:', refreshError);
      }
    }
  }
  
  // Add search params to URL if provided
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const urlWithParams = Object.keys(params).length
    ? `${url}${url.includes('?') ? '&' : '?'}${queryParams}`
    : url;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Always include credentials
  };
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    requestOptions.body = JSON.stringify(body);
  }
  
  try {
    console.log(`[API] ${method} request to ${urlWithParams}`);
    const response = await fetch(urlWithParams, requestOptions);
    return await handleResponse<T>(response, urlWithParams, method, options);
  } catch (error) {
    console.error(`[API] ${method} request failed:`, error);
    throw error;
  }
}

/**
 * API methods
 */
export const api = {
  get: <T>(url: string, options?: RequestOptions) => 
    fetchAPI<T>(url, 'GET', options),
    
  post: <T>(url: string, body: any, options?: RequestOptions) => 
    fetchAPI<T>(url, 'POST', { ...options, body }),
    
  put: <T>(url: string, body: any, options?: RequestOptions) => 
    fetchAPI<T>(url, 'PUT', { ...options, body }),
    
  patch: <T>(url: string, body: any, options?: RequestOptions) => 
    fetchAPI<T>(url, 'PATCH', { ...options, body }),
    
  delete: <T>(url: string, options?: RequestOptions) => 
    fetchAPI<T>(url, 'DELETE', options),
};

// Initialize API connection check
if (typeof window !== 'undefined') {
  verifyApiConnection().then(isConnected => {
    if (!isConnected) {
      console.warn('[API] Initial connection check failed. API might be unavailable.');
    }
  });
}