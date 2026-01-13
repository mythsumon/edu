import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/app/config/i18n' // Initialize i18n before everything else
import { AppProviders } from './app/providers/AppProviders'
import { AppRouter } from './app/routes'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>,
)

