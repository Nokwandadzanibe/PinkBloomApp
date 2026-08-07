import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import { CATEGORIES } from '../data'

export default function WhatToReport() {
  const navigate = useNavigate()
  const { currentUser, logout } = useApp()

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <Logo size="sm" className="top-logo" />
          <span>What to Report</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <div className="content">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>

        <div className="greeting">
          <h1>Report Categories</h1>
          <p>Select an issue you'd like to report.</p>
        </div>

        {CATEGORIES.map(cat => (
          <div className="case-card" key={cat.id} onClick={() => navigate('/report', { state: { category: cat.id } })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>{cat.icon}</span>
              <div className="cat" style={{ margin: 0 }}>{cat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
