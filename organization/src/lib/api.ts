const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";
const REQUEST_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<string> | null = null;
async function refreshAccessToken() {
  if (!refreshPromise)
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem("erp-refresh-token");
      if (!refreshToken) throw new ApiError("Session expired", 401);
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) throw new ApiError("Session expired", 401);
      const body = await response.json();
      localStorage.setItem("erp-access-token", body.data.accessToken);
      return body.data.accessToken as string;
    })().finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}
export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = localStorage.getItem("erp-access-token");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("Request timed out", 504);
    }
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0);
  }
  if (!response.ok) {
    if (response.status === 401 && retry) {
      try {
        const newToken = await refreshAccessToken();
        response = await fetch(`${API_URL}${path}`, {
          ...options,
          signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
        });
        if (response.ok) {
          const body = await response.json();
          return body as T;
        }
      } catch {
        localStorage.removeItem("erp-access-token");
        localStorage.removeItem("erp-refresh-token");
        localStorage.removeItem("erp-user");
        window.dispatchEvent(new Event("erp-session-expired"));
        throw new ApiError("Session expired", 401);
      }
    }
    const message = await response.text();
    throw new ApiError(message || `HTTP ${response.status}`, response.status);
  }
  const body = await response.json();
  return body as T;
}
