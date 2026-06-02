import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function TestApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test - React is working!</h1>
      <p>If you see this, React is fine. The issue is with react-router-dom.</p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TestApp />
  </StrictMode>,
)
