import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PROVINCES } from '../data'

export default function Auth() {
  const navigate = useNavigate()
  const { login, registerOrg } = useApp()

  const [mode, setMode] = useState('login') // login | register
  const [role, setRole] = useState('school') // school | ngo
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const resetError = () => {
    setError('')
    setSuccess('')
  }

  const submitLogin = (e) => {
    e.preventDefault()
    resetError()
    if (!form.email || !form.pass) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    const res = login(form.email, form.pass)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    // Protected route wrappers redirect to the correct home per role.
    navigate('/dashboard')
  }

  const submitRegister = (e) => {
    e.preventDefault()
    resetError()
    setLoading(true)
    const res = registerOrg(role, form)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setSuccess(res.message || 'Registration submitted. Awaiting verification.')
    setForm({})
  }

  const commonFields = (
    <>
      <div className="field">
        <label>Email</label>
        <input type="email" value={form.email || ''} onChange={set('email')} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>Contact person name</label>
        <input value={form.contactPerson || ''} onChange={set('contactPerson')} placeholder="Full name" />
      </div>
      <div className="field">
        <label>Phone</label>
        <input value={form.phone || ''} onChange={set('phone')} placeholder="e.g. 071 000 0000" />
      </div>
      <div className="field">
        <label>Province</label>
        <select value={form.province || ''} onChange={set('province')}>
          <option value="">Select province</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Municipality</label>
        <input value={form.municipality || ''} onChange={set('municipality')} placeholder="Municipality" />
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={form.pass || ''} onChange={set('pass')} placeholder="Password" />
      </div>
    </>
  )

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-brand">
          <img src="/assets/logo.jpeg" alt="PinkBloom" />
          <h1>PinkBloom</h1>
          <p>Menstrual product distribution platform</p>
        </div>

        {mode === 'login' ? (
          <>
            <form onSubmit={submitLogin}>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email || ''} onChange={set('email')} placeholder="you@example.com" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.pass || ''} onChange={set('pass')} placeholder="Password" />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-block" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <div className="link-row">
              Don't have an account? <button onClick={() => { setMode('register'); resetError() }}>Register</button>
            </div>
          </>
        ) : (
          <>
            <div className="role-toggle">
              <button className={`role-btn ${role === 'school' ? 'active' : ''}`} onClick={() => setRole('school')} type="button">School</button>
              <button className={`role-btn ${role === 'ngo' ? 'active' : ''}`} onClick={() => setRole('ngo')} type="button">NGO</button>
            </div>

            <form onSubmit={submitRegister}>
              {role === 'school' ? (
                <>
                  <div className="field">
                    <label>School name</label>
                    <input value={form.name || ''} onChange={set('name')} placeholder="School name" />
                  </div>
                  <div className="field">
                    <label>School code</label>
                    <input value={form.code || ''} onChange={set('code')} placeholder="e.g. SCH-1001" />
                  </div>
                  <div className="field">
                    <label>Community</label>
                    <input value={form.community || ''} onChange={set('community')} placeholder="Community / area" />
                  </div>
                  <div className="field">
                    <label>Address</label>
                    <input value={form.address || ''} onChange={set('address')} placeholder="Street address" />
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label>Total learners</label>
                      <input type="number" value={form.learners || ''} onChange={set('learners')} placeholder="0" />
                    </div>
                    <div className="field">
                      <label>Learners affected</label>
                      <input type="number" value={form.learnersAffected || ''} onChange={set('learnersAffected')} placeholder="0" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Organisation name</label>
                    <input value={form.name || ''} onChange={set('name')} placeholder="NGO name" />
                  </div>
                  <div className="field">
                    <label>Registration number</label>
                    <input value={form.regNumber || ''} onChange={set('regNumber')} placeholder="NGO registration" />
                  </div>
                  <div className="field">
                    <label>Address</label>
                    <input value={form.address || ''} onChange={set('address')} placeholder="Street address" />
                  </div>
                </>
              )}

              {commonFields}

              {error && <p className="form-error">{error}</p>}
              {success && <p className="form-success">{success}</p>}
              <button className="btn btn-block" type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Register'}
              </button>
            </form>
            <div className="link-row">
              Already have an account? <button onClick={() => { setMode('login'); resetError() }}>Sign In</button>
            </div>
          </>
        )}

        <div className="link-row" style={{ marginTop: 20, fontSize: 12 }}>
          Demo: school1@demo.com / demo123 · ngo1@demo.com / demo123 · admin@pinkbloom.org / admin123
        </div>
      </div>
    </div>
  )
}
