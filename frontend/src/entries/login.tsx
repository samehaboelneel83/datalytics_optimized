import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/base.css'
import LoginPage from '../pages/login/LoginPage'

/**
 * Preview mode: there is no backend, so a validly filled form just opens the
 * home page. No account is checked and nothing is stored (no token, cookie or
 * session). The authentication feature replaces this function with the real
 * sign-in call.
 */
const continueToHome = () => window.location.assign('/')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginPage onContinue={continueToHome} />
  </StrictMode>,
)
