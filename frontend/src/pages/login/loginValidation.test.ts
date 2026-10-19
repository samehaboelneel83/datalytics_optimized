import { describe, expect, it } from 'vitest'
import { checkEmail, checkPassword, LOGIN_MESSAGES } from './loginValidation'

describe('checkEmail', () => {
  it('asks for an email when empty or only spaces', () => {
    expect(checkEmail('')).toBe(LOGIN_MESSAGES.emailRequired)
    expect(checkEmail('   ')).toBe(LOGIN_MESSAGES.emailRequired)
  })

  it('rejects text that is not shaped like name@host', () => {
    for (const bad of ['plain', 'no-at.com', '@host', 'name@', 'a b@c.com', 'a@b c']) {
      expect(checkEmail(bad), bad).toBe(LOGIN_MESSAGES.emailInvalid)
    }
  })

  it('accepts ordinary and on-prem style addresses (lenient, as in the reference)', () => {
    for (const ok of ['name@company.com', 'admin@datalytics.local', 'x@y', '  padded@company.com  ']) {
      expect(checkEmail(ok), ok).toBeUndefined()
    }
  })
})

describe('checkPassword', () => {
  it('requires something to be typed', () => {
    expect(checkPassword('')).toBe(LOGIN_MESSAGES.passwordRequired)
  })

  it('accepts any non-empty password, including spaces', () => {
    expect(checkPassword('x')).toBeUndefined()
    expect(checkPassword(' ')).toBeUndefined()
  })
})
