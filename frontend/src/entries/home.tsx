import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/base.css'
import AppShell from '../components/layout/AppShell'
import HomePage from '../pages/home/HomePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell activeItem="home" pageTitle="Home">
      <HomePage />
    </AppShell>
  </StrictMode>,
)
