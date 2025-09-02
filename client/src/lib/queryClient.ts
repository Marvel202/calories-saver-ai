import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the backend URL from environment variable or default
const getBackendUrl = () => {
  // In production, use the Render backend URL
  // In development, use the local backend
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 
    (import.meta.env.PROD ? 'https://calorie-snap-backend.onrender.com' : 'http://localhost:5000');
  
  console.log(`🔗 Using backend URL: ${backendUrl}`);
  return backendUrl;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Build the full URL with backend base URL
  const fullUrl = url.startsWith('http') ? url : `${getBackendUrl()}${url}`;
  console.log(`📡 API Request: ${method} ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
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
