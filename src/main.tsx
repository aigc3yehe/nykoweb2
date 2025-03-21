import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PrivyAuthProvider from './providers/PrivyAuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyAuthProvider>
      <App />
    </PrivyAuthProvider>
  </StrictMode>,
)
