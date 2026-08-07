import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import { CATEGORIES, PRIORITY_LABEL, ROUTING } from '../data'

export default function CaseDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentUser, logout, reports, STATUS_FLOW } = useApp()

  const report = reports.find(r => r.id === id)

  if (!report) {
    return (
      <div className="auth">
        <div className="auth-header" style={{ paddingTop: 80 }}>
          <div style={{ fontSize: 64 }}>🔍</div>
          <h1 className="auth-title">Case Not Found</h1>
        </div>
        <div className="auth-card">
          <button className="btn" onClick={() => navigate('/cases')}>Back to Cases</button>
        </div>
      </div>
    )
  }

  const cat = CATEGORIES.find(c => c.id === report.category)
  const routedTo = ROUTING[report.category] || []
  const currentIdx = STATUS_FLOW.indexOf(report.status)

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <Logo size="sm" className="top-logo" />
          <span>Case Detail</span>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <div className="content">
        <button className="back-btn" onClick={() => navigate('/cases')}>← My Cases</button>

        <div className="detail-card">
          <div className="ref" style={{ fontSize: 16 }}>{report.id}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <span style={{ fontSize: 22 }}>{cat?.icon}</span>
            <span className="cat" style={{ margin: 0 }}>{cat?.label}</span>
          </div>
          <span className={`priority ${report.priority}`}>{PRIORITY_LABEL[report.priority]}</span>
        </div>

        <h3 className="section-title">Status</h3>
        <div className="detail-card">
          <div style={{ fontSize: 16, fontWeight: 700, color: report.status === 'Resolved' ? '#27ae60' : '#e91e63', marginBottom: 12 }}>
            {report.status}
          </div>
          <div className="timeline">
            {STATUS_FLOW.map((s, i) => {
              const cls = i < currentIdx ? 'done' : i === currentIdx ? 'current' : ''
              return (
                <div key={s} className={`tl-item ${cls}`}>
                  <div className="tl-title">{s}</div>
                  <div className="tl-date">
                    {i === 0 ? 'Submitted on ' + report.date : i === currentIdx && i > 0 ? 'Current status' : i < currentIdx ? 'Completed' : 'Pending'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <h3 className="section-title">Report Details</h3>
        <div className="detail-card">
          <div className="row"><span className="k">Province</span><span className="v">{report.province}</span></div>
          <div className="row"><span className="k">Municipality</span><span className="v">{report.municipality}</span></div>
          <div className="row"><span className="k">Community / School</span><span className="v">{report.community}</span></div>
          <div className="row"><span className="k">Clinic</span><span className="v">{report.clinic || '—'}</span></div>
          <div className="row"><span className="k">Contact</span><span className="v">{report.contact || 'Anonymous'}</span></div>
        </div>

        <div className="detail-card">
          <div className="row" style={{ borderBottom: 'none', display: 'block' }}>
            <span className="k">Description</span>
            <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>{report.description}</p>
          </div>
        </div>

        {report.photo && (
          <>
            <h3 className="section-title">Photo</h3>
            <div className="detail-card">
              <img src={report.photo} alt="report" style={{ width: '100%', borderRadius: 12 }} />
            </div>
          </>
        )}

        <h3 className="section-title">Routed To</h3>
        <div className="detail-card">
          {routedTo.map(r => (
            <div key={r} style={{ padding: '6px 0', fontSize: 14, fontWeight: 600, color: '#3d2b33' }}>• {r}</div>
          ))}
        </div>
      </div>
    </>
  )
}
