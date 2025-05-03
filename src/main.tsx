
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSupabase } from '@/services/supabase'

// Initialize Supabase when app starts
initSupabase().then(success => {
  console.log("Supabase initialization:", success ? "successful" : "failed");
}).catch(error => {
  console.error("Failed to initialize Supabase:", error);
});

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
