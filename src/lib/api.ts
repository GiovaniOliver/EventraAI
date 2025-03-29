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
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
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
  }
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    requestOptions.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(urlWithParams, requestOptions)
    return await handleResponse<T>(response)
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