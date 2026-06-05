// Single source for the backend base URL + a fetch wrapper that always sends
// the auth/visitor cookies (credentials: 'include') and JSON headers.
export const API_BASE =
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
        ?.VITE_API_URL ?? 'http://localhost:8080/api/v1'

export function apiFetch(path: string, init?: RequestInit) {
    return fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...init,
    })
}
