const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// Access token lives ONLY in memory (a module-level variable) - never
// localStorage/sessionStorage, so an XSS bug can't read it. See Stage 02.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // Refresh token is an httpOnly cookie the frontend never touches directly -
  // credentials:'include' sends it automatically. See Stage 02.
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !_retried) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
