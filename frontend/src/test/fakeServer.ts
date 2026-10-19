import { vi } from 'vitest'
import type { User } from '../auth/authApi'

/**
 * A tiny stand-in for the backend, for component tests. It answers the same
 * routes with the same shapes and status codes as the real API, keeps a
 * session flag instead of a cookie, and records every request.
 */
export interface FakeServer {
  users: User[]
  signedInAs: User | null
  requests: { method: string; path: string; body?: unknown; headers: Record<string, string> }[]
  /** Make the next matching request fail with this status and message. */
  failNext: (method: string, path: string, status: number, detail: string) => void
}

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  })

export function makeUser(id: number, email: string, is_admin = false, is_active = true): User {
  return { id, email, is_admin, is_active, created_at: '2026-10-19T09:00:00Z' }
}

export function installFakeServer(
  users: User[], passwords: Record<string, string>, signedInAs: User | null = null,
): FakeServer {
  const failures: { method: string; path: string; status: number; detail: string }[] = []
  const server: FakeServer = {
    users, signedInAs, requests: [],
    failNext: (method, path, status, detail) => failures.push({ method, path, status, detail }),
  }

  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const url = String(input)
    const method = init.method ?? 'GET'
    const path = url.replace(/^\/api/, '')
    const body = init.body ? JSON.parse(String(init.body)) : undefined
    server.requests.push({ method, path, body, headers: { ...(init.headers as Record<string, string>) } })

    const f = failures.findIndex(x => x.method === method && x.path === path)
    if (f >= 0) { const [x] = failures.splice(f, 1); return json(x.status, { detail: x.detail }) }

    const me = server.signedInAs
    if (path === '/auth/login' && method === 'POST') {
      const u = server.users.find(x => x.email === body.email.toLowerCase())
      if (!u || !u.is_active || passwords[u.email] !== body.password) {
        return json(401, { detail: 'Invalid email or password.' })
      }
      server.signedInAs = u
      return json(200, u)
    }
    if (path === '/auth/logout' && method === 'POST') { server.signedInAs = null; return json(204) }
    if (!me) return json(401, { detail: 'Not signed in.' })
    if (path === '/auth/me') return json(200, me)
    if (path.startsWith('/users') && !me.is_admin) return json(403, { detail: 'Administrators only.' })
    if (path === '/users' && method === 'GET') return json(200, server.users)
    if (path === '/users' && method === 'POST') {
      if (server.users.some(x => x.email === body.email)) {
        return json(409, { detail: 'A user with this email already exists.' })
      }
      const u = makeUser(server.users.length + 1, body.email, body.is_admin)
      server.users.push(u)
      return json(201, u)
    }
    const m = path.match(/^\/users\/(\d+)$/)
    if (m && method === 'PATCH') {
      const u = server.users.find(x => x.id === Number(m[1]))
      if (!u) return json(404, { detail: 'User not found.' })
      const change = { ...body }
      delete change.password // the real API never returns or stores it in clear
      Object.assign(u, change)
      return json(200, { ...u })
    }
    return json(404, { detail: 'Not Found' })
  })
  return server
}
