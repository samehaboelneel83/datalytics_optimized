/**
 * The one way the frontend talks to the backend.
 *
 * - Same origin only (`/api/...`): Vite proxies it in development, nginx in Docker.
 * - The session is an HttpOnly cookie the browser sends by itself; no token is
 *   ever read or stored by this code.
 * - Every request carries `X-Requested-With`, which the backend requires on
 *   writes (CSRF protection).
 */
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const NETWORK_ERROR = 'Cannot reach the server. Check your connection and try again.'
const GENERIC_ERROR = 'Something went wrong. Please try again.'

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { method = 'GET', body } = options
  const headers: Record<string, string> = { 'X-Requested-With': 'datalytics' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, NETWORK_ERROR)
  }

  if (!response.ok) throw new ApiError(response.status, await errorMessage(response))
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    const detail = (data as { detail?: unknown }).detail
    if (typeof detail === 'string') return detail
  } catch {
    /* not JSON: fall through */
  }
  return GENERIC_ERROR
}
