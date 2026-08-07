import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'

export default function Auth() {
  const { login, register } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState(location.state?.mode || 'login') // login | signup
  const [role, setRole] = useState('user') // user | partner
  const [form, setForm] = useState({ name: '', email: '', pass: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup' && !form.name.trim()) {
      setError('Please enter your full name.')
      setLoading(false)
      return
    }
    if (!form.email.trim() || !form.pass) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    setTimeout(() => {
      let result
      if (mode === 'login') {
        result = login(form.email, form.pass)
      } else {
        result = register(form.name, form.email, form.pass, role)
      }
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        navigate(role === 'partner' ? '/partner' : '/dashboard')
      }
    }, 600)
  }

  return (
    <div className="auth">
      <div className="auth-header">
        <Logo />
        <h1 className="auth-title">Pinkbloom</h1>
        <p className="auth-sub">Menstrual health & support reporting</p>
      </div>

      <div className="auth-card">
        <div className="role-toggle">
          <button
            className={`role-btn ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
            type="button"
          >
            👤 User
          </button>
          <button
            className={`role-btn ${role === 'partner' ? 'active' : ''}`}
            onClick={() => setRole('partner')}
            type="button"
          >
            🏢 Partner
          </button>
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 16, color: '#3d2b33' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Thandi Nkosi"
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="pass"
              type="password"
              value={form.pass}
              onChange={onChange}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="link-row">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => { setMode('signup'); setError('') }}>Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError('') }}>Log In</button></>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7280', padding: '0 24px 30px' }}>
        Demo accounts:<br />
        👤 user@demo.com / demo123<br />
        🏢 partner@demo.com / demo123
      </p>
    </div>
  )
}
