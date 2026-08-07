import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import BottomNav from '../components/BottomNav'
import { CATEGORIES, PRIORITY_LABEL } from '../data'

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const { currentUser, logout, reports, updateReportStatus, resetDemo, STATUS_FLOW } = useApp()
  const [filter, setFilter] = useState('All')

  const catLabel = (id) => {
    const c = CATEGORIES.find(x => x.id === id)
    return c ? c.label : id
  }

  const statuses = STATUS_FLOW
  const filters = ['All', ...statuses]

  const filteredReports = filter === 'All' ? reports : reports.filter(r => r.status === filter)

  const stats = {
    total: reports.length,
    [statuses[1]]: reports.filter(r => r.status === statuses[1]).length,
    [statuses[3]]: reports.filter(r => r.status === statuses[3]).length,
    [statuses[4]]: reports.filter(r => r.status === statuses[4]).length
  }

  const navItems = [
    { to: '/partner', label: 'Home', icon: '🏠', end: true },
    { to: '/partner', label: 'Reports', icon: '📋' }
  ]

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <Logo size="sm" className="top-logo" />
          <span>Partner Dashboard</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <div className="content">
        <div className="greeting">
          <h1>Hello, {currentUser.name.split(' ')[0]} 👋</h1>
          <p>Manage and respond to community reports.</p>
          <span className="role-badge" style={{ backgroundColor: '#ede7f6', color: '#512da8' }}>Partner</span>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card" style={{ backgroundColor: '#e3f2fd' }}>
            <div className="icon">📬</div>
            <h3>{stats.total}</h3>
            <p>Total reports</p>
          </div>
          <div className="dash-card" style={{ backgroundColor: '#fff3e0' }}>
            <div className="icon">⏳</div>
            <h3>{stats[statuses[1]]}</h3>
            <p>Under review</p>
          </div>
          <div className="dash-card" style={{ backgroundColor: '#fce4ec' }}>
            <div className="icon">🔧</div>
            <h3>{stats[statuses[3]]}</h3>
            <p>In progress</p>
          </div>
          <div className="dash-card" style={{ backgroundColor: '#e8f5e9' }}>
            <div className="icon">✅</div>
            <h3>{stats[statuses[4]]}</h3>
            <p>Resolved</p>
          </div>
        </div>

        <h3 className="section-title">All Reports</h3>

        <div className="category-chips" style={{ marginBottom: 16 }}>
          {filters.map(f => (
            <span
              key={f}
              className={`chip ${filter === f ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div className="empty">
            <div className="icon">📭</div>
            <p>No reports in this category yet.</p>
          </div>
        ) : (
          filteredReports.map(r => {
            const idx = STATUS_FLOW.indexOf(r.status)
            const isLast = idx === STATUS_FLOW.length - 1
            return (
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
                {!isLast && (
                  <button
                    className="btn btn-small"
                    style={{ marginTop: 12, width: '100%' }}
                    onClick={(e) => { e.stopPropagation(); updateReportStatus(r.id) }}
                  >
                    Advance to "{STATUS_FLOW[idx + 1]}" →
                  </button>
                )}
              </div>
            )
          })
        )}

        <button
          className="btn btn-ghost"
          style={{ marginTop: 24, width: '100%' }}
          onClick={resetDemo}
        >
          ↺ Reset demo data
        </button>
      </div>

      <BottomNav items={navItems} />
    </>
  )
}
