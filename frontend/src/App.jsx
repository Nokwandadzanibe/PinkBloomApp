import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Splash from './pages/Splash'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Stock from './pages/Stock'
import SubmitRequest from './pages/SubmitRequest'
import MyRequests from './pages/MyRequests'
import Inventory from './pages/Inventory'
import Requests from './pages/Requests'
import Deliveries from './pages/Deliveries'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'
import TopBar from './components/layout/TopBar'
import SideNav from './components/layout/SideNav'

const LAYOUT_TITLES = {
  '/dashboard': 'School Dashboard',
  '/partner': 'NGO Dashboard',
  '/admin': 'Admin Dashboard',
  '/stock': 'Stock Levels',
  '/request': 'Submit Request',
  '/my-requests': 'My Requests',
  '/inventory': 'Inventory',
  '/requests': 'Manage Requests',
  '/deliveries': 'Deliveries',
  '/notifications': 'Notifications'
}

function AppLayout({ children }) {
  const [navOpen, setNavOpen] = useState(false)
  const { currentUser } = useApp()
  const role = currentUser?.role
  const home = role === 'ngo' ? '/partner' : role === 'admin' ? '/admin' : '/dashboard'
  const title = home

  return (
    <div className="app-shell">
      <SideNav open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="app-main">
        <TopBar title={LAYOUT_TITLES[title] || 'PinkBloom'} onToggleNav={() => setNavOpen(o => !o)} navOpen={navOpen} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}

function Protected({ roles, children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (roles && !roles.includes(currentUser.role)) {
    const home = currentUser.role === 'ngo' ? '/partner' : currentUser.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={home} replace />
  }
  return children
}

function RoutesApp() {
  const { currentUser } = useApp()
  const home = currentUser ? (currentUser.role === 'ngo' ? '/partner' : currentUser.role === 'admin' ? '/admin' : '/dashboard') : '/'

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={currentUser ? <Navigate to={home} replace /> : <Auth />} />

      <Route path="/dashboard" element={<Protected roles={['school']}><AppLayout><Dashboard /></AppLayout></Protected>} />
      <Route path="/stock" element={<Protected roles={['school']}><AppLayout><Stock /></AppLayout></Protected>} />
      <Route path="/request" element={<Protected roles={['school']}><AppLayout><SubmitRequest /></AppLayout></Protected>} />
      <Route path="/my-requests" element={<Protected roles={['school']}><AppLayout><MyRequests /></AppLayout></Protected>} />

      <Route path="/partner" element={<Protected roles={['ngo']}><AppLayout><Dashboard /></AppLayout></Protected>} />
      <Route path="/inventory" element={<Protected roles={['ngo']}><AppLayout><Inventory /></AppLayout></Protected>} />
      <Route path="/requests" element={<Protected roles={['ngo']}><AppLayout><Requests /></AppLayout></Protected>} />
      <Route path="/deliveries" element={<Protected roles={['ngo']}><AppLayout><Deliveries /></AppLayout></Protected>} />

      <Route path="/admin" element={<Protected roles={['admin']}><AppLayout><Admin /></AppLayout></Protected>} />

      <Route path="/notifications" element={<Protected><AppLayout><Notifications /></AppLayout></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <RoutesApp />
    </AppProvider>
  )
}
