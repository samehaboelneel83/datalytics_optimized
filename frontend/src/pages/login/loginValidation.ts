/**
 * Client-side checks for the sign-in form, copied from the reference
 * (pages/Login.tsx) with its exact wording.
 *
 * These only catch obvious typing mistakes before anything is sent anywhere.
 * They are NOT security: whether an account exists and the password is right
 * is for the server to decide (authentication feature).
 */

export const LOGIN_MESSAGES = {
  emailRequired: 'Enter your email address.',
  emailInvalid: 'Enter a full email address, like name@company.com.',
  passwordRequired: 'Enter your password.',
} as const

// Deliberately lenient, as in the reference: on-prem logins use hosts like
// admin@datalytics.local, so anything shaped name@host is accepted.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+$/

/** Returns an error message, or undefined when the email looks fine. */
export function checkEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return LOGIN_MESSAGES.emailRequired
  if (!EMAIL_SHAPE.test(email)) return LOGIN_MESSAGES.emailInvalid
  return undefined
}

/** Returns an error message, or undefined when a password was typed. */
export function checkPassword(value: string): string | undefined {
  return value ? undefined : LOGIN_MESSAGES.passwordRequired
}
