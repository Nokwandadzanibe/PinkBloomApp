import React from 'react'
import { NavLink } from 'react-router-dom'

export default function BottomNav({ items }) {
  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
