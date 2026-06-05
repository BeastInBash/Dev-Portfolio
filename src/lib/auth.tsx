import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import { apiFetch } from '#/lib/api'

/**
 * Admin auth. The backend issues an httpOnly cookie on login, so the token is
 * NOT readable from JS — we determine "am I logged in?" by calling /auth/me
 * with credentials. Every request includes `credentials: 'include'` so the
 * browser sends/stores that cookie cross-origin (dev: :3000 → :8080).
 */

export type User = { id: string; email: string }
type Status = 'loading' | 'authed' | 'guest'

type AuthContextValue = {
    user: User | null
    status: Status
    login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const api = apiFetch

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [status, setStatus] = useState<Status>('loading')

    // On mount (client only), ask the backend who we are.
    useEffect(() => {
        let active = true
        api('/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!active) return
                if (data?.user) {
                    setUser(data.user)
                    setStatus('authed')
                } else {
                    setStatus('guest')
                }
            })
            .catch(() => active && setStatus('guest'))
        return () => {
            active = false
        }
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json().catch(() => null)
            if (!res.ok) {
                return { ok: false, error: data?.message ?? 'Login failed' }
            }
            setUser(data.user)
            setStatus('authed')
            return { ok: true }
        } catch {
            return { ok: false, error: 'Could not reach the server' }
        }
    }, [])

    const logout = useCallback(async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => {})
        setUser(null)
        setStatus('guest')
    }, [])

    return (
        <AuthContext.Provider value={{ user, status, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
    return ctx
}
