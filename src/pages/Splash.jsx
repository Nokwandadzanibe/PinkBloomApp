import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'

export default function Splash() {
  const navigate = useNavigate()
  const { currentUser } = useApp()

  // If already logged in, go straight home
  if (currentUser) {
    navigate(currentUser.role === 'partner' ? '/partner' : '/dashboard', { replace: true })
  }

  return (
    <div className="splash">
      <div className="splash-hero">
        <Logo size="lg" className="splash-logo" />
        <h1 className="splash-title">Pinkbloom</h1>
        <p className="splash-tagline">Report. Support. Bloom.</p>
      </div>

      <div className="splash-actions">
        <button className="btn" onClick={() => navigate('/login', { state: { mode: 'login' } })}>
          Get Started
        </button>
      </div>
    </div>
  )
}
