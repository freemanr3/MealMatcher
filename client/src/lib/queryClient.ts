import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_CONFIG, getFullUrl, getHeaders } from "@/config/api";

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
  const fullUrl = url.startsWith('http') ? url : getFullUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers: data ? getHeaders('default') : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: API_CONFIG.CREDENTIALS,
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
    const url = (queryKey[0] as string).startsWith('http') 
      ? queryKey[0] as string
      : getFullUrl(queryKey[0] as string);

    const res = await fetch(url, {
      headers: getHeaders('default'),
      credentials: API_CONFIG.CREDENTIALS,
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
      retry: API_CONFIG.RETRY.MAX_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY.DELAY,
    },
    mutations: {
      retry: API_CONFIG.RETRY.MAX_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY.DELAY,
    },
  },
});