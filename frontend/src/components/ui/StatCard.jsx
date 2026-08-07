import React from 'react'

export default function StatCard({ icon, label, value, sub, tone = 'pink' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  )
}
