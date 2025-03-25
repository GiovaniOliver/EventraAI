import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  methodOrConfig: string | { 
    url: string; 
    method: string; 
    data?: unknown 
  },
  urlOrData?: string | unknown,
  data?: unknown | undefined,
): Promise<T | Response> {
  let method: string;
  let url: string;
  let body: unknown | undefined;

  // Handle both formats of calling the function
  if (typeof methodOrConfig === 'string') {
    // Old format: apiRequest('GET', '/api/users', data)
    method = methodOrConfig;
    url = urlOrData as string;
    body = data;
  } else {
    // New format: apiRequest({ url: '/api/users', method: 'GET', data })
    method = methodOrConfig.method;
    url = methodOrConfig.url;
    body = methodOrConfig.data;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    
    // For GET requests, always try to return JSON
    if (method === 'GET') {
      return await res.json() as T;
    }
    
    return res;
  } catch (error) {
    console.error(`API Request failed for ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
