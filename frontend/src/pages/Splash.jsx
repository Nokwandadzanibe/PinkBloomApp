import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Splash() {
  const navigate = useNavigate()
  const { currentUser } = useApp()

  const home = currentUser
    ? currentUser.role === 'ngo' ? '/partner'
    : currentUser.role === 'admin' ? '/admin'
    : '/dashboard'
    : '/'

  if (currentUser) {
    navigate(home, { replace: true })
  }

  return (
    <div className="splash">
      <img src="/assets/logo.jpeg" alt="PinkBloom" className="splash-logo" />
      <h1 className="splash-title">PinkBloom</h1>
      <p className="splash-tagline">Menstrual product distribution for schools</p>
      <div className="splash-actions">
        <button className="btn" onClick={() => navigate('/login')}>Get Started</button>
      </div>
    </div>
  )
}
