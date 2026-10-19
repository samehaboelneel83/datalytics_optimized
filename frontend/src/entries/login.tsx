import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/base.css'
import LoginPage from '../pages/login/LoginPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginPage />
  </StrictMode>,
)
