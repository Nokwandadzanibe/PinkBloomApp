import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import BottomNav from '../components/BottomNav'
import { CATEGORIES, PRIORITY_LABEL } from '../data'

export default function MyCases() {
  const navigate = useNavigate()
  const { currentUser, logout, reports } = useApp()

  const myReports = reports.filter(r => r.user === currentUser.email)

  const catLabel = (id) => {
    const c = CATEGORIES.find(x => x.id === id)
    return c ? c.label : id
  }

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: '🏠', end: true },
    { to: '/report', label: 'Report', icon: '📝' },
    { to: '/cases', label: 'Cases', icon: '📌' }
  ]

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <Logo size="sm" className="top-logo" />
          <span>My Cases</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <div className="content">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>

        <div className="greeting">
          <h1>Track Your Cases</h1>
          <p>Follow the progress of your reports.</p>
        </div>

        {myReports.length === 0 ? (
          <div className="empty">
            <div className="icon">📭</div>
            <p>No cases yet. Submit a report to start tracking.</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/report')}>Submit a Report</button>
          </div>
        ) : (
          myReports.map(r => (
            <div className="case-card" key={r.id} onClick={() => navigate(`/case/${r.id}`)}>
              <div className="ref">{r.id}</div>
              <div className="cat">{catLabel(r.category)}</div>
              <div className="date">{r.community} • {r.date}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span className={`priority ${r.priority}`}>{PRIORITY_LABEL[r.priority]}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.status === 'Resolved' ? '#27ae60' : '#e91e63' }}>
                  {r.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav items={navItems} />
    </>
  )
}
