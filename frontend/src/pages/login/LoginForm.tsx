import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { checkEmail, checkPassword } from './loginValidation'
import styles from './LoginForm.module.css'

/**
 * The sign-in form (reference: pages/Login.tsx).
 *
 * Checks the input in the browser first (same messages as the reference),
 * then calls `onSignIn(email, password)`, which asks the server. That returns
 * null on success or the message to show (e.g. "Invalid email or password.").
 * The form never stores the password; it lives in component state only.
 * Single sign-on is not built, so that button stays disabled.
 */
export type SignIn = (email: string, password: string) => Promise<string | null>

export default function LoginForm({ onSignIn }: { onSignIn: SignIn }) {
  const uid = useId()
  const emailId = `${uid}-email`, passwordId = `${uid}-password`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // A field only complains once it has been left with something in it,
  // or after a submit: never while the reader is still on their first try.
  const emailError = touched.email || submitted ? checkEmail(email) : undefined
  const passwordError = touched.password || submitted ? checkPassword(password) : undefined

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setSubmitted(true)
    setServerError(null)
    if (checkEmail(email)) { emailRef.current?.focus(); return }
    if (checkPassword(password)) { passwordRef.current?.focus(); return }
    setBusy(true)
    const problem = await onSignIn(email.trim(), password)
    // On success the app replaces this page, so only a failure comes back here.
    if (problem) {
      setBusy(false)
      setServerError(problem)
      setPassword('')
      passwordRef.current?.focus()
    }
  }

  const onPasswordKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'))
  }

  const passwordDescribedBy = [passwordError && `${passwordId}-err`, capsLock && `${passwordId}-caps`]
    .filter(Boolean).join(' ') || undefined

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-labelledby="login-title">
      <h1 id="login-title" className={styles.title}>Welcome back</h1>
      <p className={styles.sub}>Explore your data, build dashboards and ask questions in plain language.</p>

      <div className={styles.field}>
        <label htmlFor={emailId} className={styles.label}>Email</label>
        <input ref={emailRef} id={emailId} type="email" className={styles.input}
          value={email} onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: t.email || email !== '' }))}
          placeholder="name@company.com" autoComplete="username" inputMode="email"
          spellCheck={false} autoFocus
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `${emailId}-err` : undefined} />
        {emailError && <p id={`${emailId}-err`} className={styles.error}>{emailError}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor={passwordId} className={styles.label}>Password</label>
        <div className={styles.pw}>
          <input ref={passwordRef} id={passwordId} type={showPassword ? 'text' : 'password'}
            className={styles.input}
            value={password} onChange={e => setPassword(e.target.value)}
            onBlur={() => { setTouched(t => ({ ...t, password: t.password || password !== '' })); setCapsLock(false) }}
            onKeyDown={onPasswordKey} onKeyUp={onPasswordKey}
            placeholder="Enter your password" autoComplete="current-password"
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordDescribedBy} />
          <button type="button" className={styles.reveal} onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword} aria-controls={passwordId}>
            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
        {passwordError && <p id={`${passwordId}-err`} className={styles.error}>{passwordError}</p>}
        {capsLock && <p id={`${passwordId}-caps`} className={styles.hint}>Caps Lock is on.</p>}
      </div>

      {serverError && <p role="alert" className={styles.alert}>{serverError}</p>}

      <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={busy}
        aria-busy={busy || undefined}>
        {busy ? 'Signing in…' : <>Sign In <ArrowRight size={16} aria-hidden="true" /></>}
      </button>

      <div className={styles.or} role="separator"><span>OR</span></div>

      <button type="button" className={`btn ${styles.sso}`} disabled
        title="Single sign-on is not available yet">
        Sign in with SSO
      </button>

      <p className={styles.help}>Need an account or a new password? Ask your workspace admin.</p>
    </form>
  )
}
