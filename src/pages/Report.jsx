import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import BottomNav from '../components/BottomNav'
import { CATEGORIES, PROVINCES } from '../data'

export default function Report() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout, addReport } = useApp()

  const [form, setForm] = useState({
    category: location.state?.category || '',
    province: '',
    municipality: '',
    community: '',
    clinic: '',
    description: '',
    contact: ''
  })
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [saving, setSaving] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhoto(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.category) { setError('Please choose a category.'); return }
    if (!form.province) { setError('Please select a province.'); return }
    if (!form.municipality.trim()) { setError('Please enter a municipality.'); return }
    if (!form.community.trim()) { setError('Please enter a community or school.'); return }
    if (!form.description.trim()) { setError('Please describe the problem.'); return }

    setSaving(true)
    setTimeout(() => {
      const report = addReport({ ...form, photo })
      setSaving(false)
      setSubmitted(report)
      setForm({ category: '', province: '', municipality: '', community: '', clinic: '', description: '', contact: '' })
      setPhoto(null)
    }, 700)
  }

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: '🏠', end: true },
    { to: '/report', label: 'Report', icon: '📝' },
    { to: '/cases', label: 'Cases', icon: '📌' }
  ]

  // Success screen after submission
  if (submitted) {
    return (
      <div className="auth">
        <div className="auth-header" style={{ paddingTop: 80 }}>
          <div style={{ fontSize: 64 }}>✅</div>
          <h1 className="auth-title">Report Submitted!</h1>
          <p className="auth-sub">Your report has been received and is being reviewed.</p>
        </div>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#8a7280', marginBottom: 6 }}>Your reference number</p>
          <div className="ref" style={{ fontSize: 28, fontWeight: 700, color: '#e91e63', marginBottom: 20 }}>{submitted.id}</div>
          <p style={{ fontSize: 14, color: '#3d2b33', marginBottom: 16 }}>
            Keep this number to track your case. We've routed it to the relevant organization.
          </p>
          <button className="btn" onClick={() => navigate(`/case/${submitted.id}`)}>Track My Case</button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate('/dashboard')}>Back to Home</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <Logo size="sm" className="top-logo" />
          <span>Submit Report</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <div className="content">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Cancel</button>

        <h2 style={{ fontSize: 20, color: '#3d2b33', marginBottom: 8 }}>Report a Concern</h2>
        <p style={{ fontSize: 14, color: '#8a7280', marginBottom: 20 }}>
          Your report is anonymous by default. Provide details to help us route it correctly.
        </p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={onChange}>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Province *</label>
            <select name="province" value={form.province} onChange={onChange}>
              <option value="">Select your province…</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Municipality *</label>
            <input name="municipality" value={form.municipality} onChange={onChange} placeholder="e.g. City of Johannesburg" />
          </div>

          <div className="field">
            <label>Community or School *</label>
            <input name="community" value={form.community} onChange={onChange} placeholder="e.g. Soweto High School" />
          </div>

          <div className="field">
            <label>Clinic (if applicable)</label>
            <input name="clinic" value={form.clinic} onChange={onChange} placeholder="e.g. Johannesburg Clinic" />
          </div>

          <div className="field">
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Describe the problem in detail…"
            />
          </div>

          <div className="field">
            <label>Photo (optional)</label>
            <label className="photo-upload">
              📷 {photo ? 'Change photo' : 'Tap to add a photo'}
              <input type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
            </label>
            {photo && (
              <div className="photo-preview">
                <img src={photo} alt="preview" />
                <button type="button" onClick={() => setPhoto(null)}>Remove</button>
              </div>
            )}
          </div>

          <div className="field">
            <label>Contact details (optional)</label>
            <input
              name="contact"
              value={form.contact}
              onChange={onChange}
              placeholder="Phone or email if you want a response"
            />
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit Report'}
          </button>
        </form>
      </div>

      <BottomNav items={navItems} />
    </>
  )
}
