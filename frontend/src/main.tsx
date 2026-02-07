import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { WalletProvider } from './context/WalletContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <Toaster position="top-right" />
        <App />
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
)
