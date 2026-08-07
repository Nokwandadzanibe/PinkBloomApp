import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ROLES } from '../../data'

export default function TopBar({ title, onToggleNav, navOpen }) {
  const { currentUser, logout, unreadCount } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-btn" onClick={onToggleNav} aria-label="Toggle navigation">
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="topbar-title">
          <h2>{title}</h2>
          <span className="topbar-role">{currentUser ? ROLES[currentUser.role] : ''}</span>
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" onClick={() => navigate('/notifications')} aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
        </button>
        <button className="icon-btn" onClick={handleLogout} aria-label="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
