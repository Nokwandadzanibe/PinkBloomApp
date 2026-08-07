import React from 'react'

// Generic status/priority badge. Not colour-dependent alone (includes icon + text).
export default function Badge({ tone = 'neutral', icon, children, style }) {
  return (
    <span className={`badge badge-${tone}`} style={style}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  )
}
