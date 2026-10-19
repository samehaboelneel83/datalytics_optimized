import { ApiError, api } from '../api/client'

/** The signed-in person, as the backend returns it. */
export interface User {
  id: number
  email: string
  is_admin: boolean
  is_active: boolean
  created_at: string
}

export const signIn = (email: string, password: string) =>
  api<User>('/auth/login', { method: 'POST', body: { email, password } })

export const signOut = () => api<void>('/auth/logout', { method: 'POST' })

/** The current user, or null when nobody is signed in. Other errors are thrown. */
export async function currentUser(): Promise<User | null> {
  try {
    return await api<User>('/auth/me')
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }
}
