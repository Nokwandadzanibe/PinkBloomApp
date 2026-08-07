import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import BottomNav from '../components/BottomNav'
import { PRIORITY_LABEL } from '../data'

export default function UserDashboard() {
  const { currentUser, logout, reports } = useApp()
  const navigate = useNavigate()

  const myReports = reports.filter(r => r.user === currentUser.email)
  const active = myReports.filter(r => r.status !== 'Resolved').length

  const cards = [
    { to: '/what-to-report', icon: '📋', title: 'What to Report', desc: 'See report categories & guidance', color: '#fce4ec' },
    { to: '/report', icon: '📝', title: 'Submit Report', desc: 'Report a problem in your community', color: '#f8bbd0' },
    { to: '/cases', icon: '📌', title: 'Check My Case', desc: 'Track your report status', color: '#f3e5f5' }
  ]

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
          <span>Pinkbloom</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <div className="content">
        <div className="greeting">
          <h1>Hello, {currentUser.name.split(' ')[0]} 👋</h1>
          <p>How can we help you bloom today?</p>
          <span className="role-badge">User</span>
        </div>

        <div className="dashboard-grid">
          {cards.map(card => (
            <button key={card.to} className="dash-card" style={{ backgroundColor: card.color }} onClick={() => navigate(card.to)}>
              <div className="icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </button>
          ))}

          <div className="dash-card" style={{ backgroundColor: '#fff3e0' }} onClick={() => navigate('/cases')}>
            <div className="icon">✅</div>
            <h3>{active} Active Case{active !== 1 ? 's' : ''}</h3>
            <p>{myReports.length} total report{myReports.length !== 1 ? 's' : ''} submitted</p>
          </div>
        </div>

        <h3 className="section-title">Recent Reports</h3>
        {myReports.length === 0 ? (
          <div className="empty">
            <div className="icon">🌱</div>
            <p>No reports yet. Submit your first report to get started.</p>
          </div>
        ) : (
          myReports.slice(0, 3).map(r => (
            <div className="case-card" key={r.id} onClick={() => navigate(`/case/${r.id}`)}>
              <div className="ref">{r.id}</div>
              <div className="cat">{r.description}</div>
              <div className="date">{r.date} • Status: {r.status}</div>
              <div style={{ marginTop: 8 }}>
                <span className={`priority ${r.priority}`}>{PRIORITY_LABEL[r.priority]}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav items={navItems} />
    </>
  )
}
