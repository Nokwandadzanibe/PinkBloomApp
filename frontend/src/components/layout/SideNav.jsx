import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Send,
  Truck,
  Boxes,
  FileText,
  Bell,
  ShieldCheck,
  LogOut,
  Building2,
  School
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const NAV = {
  school: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/stock', label: 'Stock Levels', icon: Package },
    { to: '/request', label: 'Submit Request', icon: Send },
    { to: '/my-requests', label: 'My Requests', icon: ClipboardList }
  ],
  ngo: [
    { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/inventory', label: 'Inventory', icon: Boxes },
    { to: '/requests', label: 'Manage Requests', icon: FileText },
    { to: '/deliveries', label: 'Deliveries', icon: Truck }
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin', label: 'Verification', icon: ShieldCheck }
  ]
}

export default function SideNav({ open, onClose }) {
  const { currentUser, logout } = useApp()

  if (!currentUser) return null

  const items = NAV[currentUser.role] || NAV.school
  const roleIcon = currentUser.role === 'ngo' ? Building2 : currentUser.role === 'admin' ? ShieldCheck : School
  const RoleIcon = roleIcon

  return (
    <>
      {open && <div className="sidenav-overlay" onClick={onClose} />}
      <aside className={`sidenav ${open ? 'open' : ''}`}>
        <div className="sidenav-brand">
          <img src="/assets/logo.jpeg" alt="PinkBloom" />
          <span>PinkBloom</span>
        </div>

        <div className="sidenav-section">Main</div>
        <nav>
          {items.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidenav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon"><Icon size={20} /></span>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidenav-section">Notifications</div>
        <nav>
          <NavLink to="/notifications" className={({ isActive }) => `sidenav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span className="nav-icon"><Bell size={20} /></span>
            <span>Notifications</span>
          </NavLink>
        </nav>

        <div className="sidenav-footer">
          <div className="flex" style={{ alignItems: 'center', gap: 10 }}>
            <RoleIcon size={22} style={{ color: 'var(--primary-dark)' }} />
            <div>
              <div className="user">{currentUser.name}</div>
              <div className="email">{currentUser.email}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm logout" onClick={logout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}
