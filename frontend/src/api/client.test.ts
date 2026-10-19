import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, NETWORK_ERROR, api } from './client'

afterEach(() => vi.restoreAllMocks())

const reply = (status: number, body?: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }))

describe('api client', () => {
  it('calls the same-origin /api path with the CSRF header and JSON body', async () => {
    const spy = reply(200, { ok: true })
    await expect(api('/things', { method: 'POST', body: { a: 1 } })).resolves.toEqual({ ok: true })
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('/api/things')
    expect(init).toMatchObject({
      method: 'POST', credentials: 'same-origin', body: '{"a":1}',
      headers: { 'X-Requested-With': 'datalytics', 'Content-Type': 'application/json' },
    })
  })

  it('returns undefined for 204 No Content', async () => {
    reply(204)
    await expect(api('/x', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws ApiError with the server detail on failure', async () => {
    reply(409, { detail: 'A user with this email already exists.' })
    await expect(api('/x')).rejects.toEqual(new ApiError(409, 'A user with this email already exists.'))
  })

  it('throws a generic message when the error body is not usable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(api('/x')).rejects.toMatchObject({ status: 502, message: expect.stringMatching(/went wrong/) })
  })

  it('reports an unreachable server as status 0', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(api('/x')).rejects.toMatchObject({ status: 0, message: NETWORK_ERROR })
  })
})
