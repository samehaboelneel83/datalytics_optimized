import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import PreviewNote from '../../components/ui/PreviewNote'
import { checkEmail, checkPassword } from './loginValidation'
import styles from './LoginForm.module.css'

/**
 * The sign-in form (reference: pages/Login.tsx).
 *
 * Works in the browser only: it validates what was typed, shows the same
 * messages as the reference, and on valid input calls `onContinue(email)`.
 * It sends nothing anywhere and stores nothing: the password lives in
 * component state until the page is left.
 *
 * PREVIEW MODE: no account is checked. The real feature replaces what
 * `onContinue` does (call the login API, handle 401/429/5xx); this form does
 * not change. Single sign-on needs a server, so that button stays disabled.
 */
export default function LoginForm({ onContinue }: { onContinue: (email: string) => void }) {
  const uid = useId()
  const emailId = `${uid}-email`, passwordId = `${uid}-password`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // A field only complains once it has been left with something in it,
  // or after a submit: never while the reader is still on their first try.
  const emailError = touched.email || submitted ? checkEmail(email) : undefined
  const passwordError = touched.password || submitted ? checkPassword(password) : undefined

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (checkEmail(email)) { emailRef.current?.focus(); return }
    if (checkPassword(password)) { passwordRef.current?.focus(); return }
    onContinue(email.trim())
  }

  const onPasswordKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'))
  }

  const passwordDescribedBy = [passwordError && `${passwordId}-err`, capsLock && `${passwordId}-caps`]
    .filter(Boolean).join(' ') || undefined

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-labelledby="login-title">
      <PreviewNote>Preview mode — no account is checked yet</PreviewNote>
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

      <button type="submit" className={`btn btn-primary ${styles.submit}`}>
        Sign In <ArrowRight size={16} aria-hidden="true" />
      </button>

      <div className={styles.or} role="separator"><span>OR</span></div>

      <button type="button" className={`btn ${styles.sso}`} disabled
        title="Single sign-on needs the backend (not available yet)">
        Sign in with SSO
      </button>

      <p className={styles.help}>Need an account or a new password? Ask your workspace admin.</p>
    </form>
  )
}
