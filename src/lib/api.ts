/**
 * API utility for making requests to the application's backend
 */

type RequestOptions = {
  headers?: Record<string, string>
  params?: Record<string, string>
  body?: any
}

/**
 * Helper function to handle API responses and errors
 */
async function handleResponse<T>(response: Response, url: string, method: string, options: RequestOptions): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized errors by attempting to refresh the token
    if (response.status === 401 && typeof window !== 'undefined') {
      try {
        console.log('Received 401 error, attempting to refresh token and retry');
        
        // Dynamic import to avoid circular dependencies
        const { createBrowserSupabaseClient } = await import('./supabase');
        const supabase = createBrowserSupabaseClient();
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && refreshData.session) {
          console.log('Token refreshed successfully, retrying request');
          
          // Update the Authorization header with the new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${refreshData.session.access_token}`
            }
          };
          
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
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }
    
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || response.statusText || 'Something went wrong'
    throw new Error(errorMessage)
  }
  
  // Check if the response has content
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json() as T
  }
  
  return {} as T
}

/**
 * Generic fetch function with error handling
 */
async function fetchAPI<T>(
  url: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, params = {}, body } = options
  
  // If no Authorization header is provided, try to get the token
  if (!headers['Authorization'] && typeof window !== 'undefined') {
    try {
      // Dynamic import to avoid circular dependencies
      const { createBrowserSupabaseClient } = await import('./supabase');
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting auth token for API request:', error);
    }
  }
  
  // Add search params to URL if provided
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })
  
  const urlWithParams = Object.keys(params).length
    ? `${url}${url.includes('?') ? '&' : '?'}${queryParams}`
    : url
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  }
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    requestOptions.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(urlWithParams, requestOptions)
    return await handleResponse<T>(response, urlWithParams, method, options)
  } catch (error) {
    console.error(`API ${method} request failed:`, error)
    throw error
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
} 