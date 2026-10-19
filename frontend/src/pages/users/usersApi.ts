import { api } from '../../api/client'
import type { User } from '../../auth/authApi'

export interface NewUser {
  email: string
  password: string
  is_admin: boolean
}

export type UserChange = Partial<{ is_active: boolean; is_admin: boolean; password: string }>

export const listUsers = () => api<User[]>('/users')
export const createUser = (user: NewUser) => api<User>('/users', { method: 'POST', body: user })
export const updateUser = (id: number, change: UserChange) =>
  api<User>(`/users/${id}`, { method: 'PATCH', body: change })
