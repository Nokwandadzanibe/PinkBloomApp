import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Splash from './pages/Splash'
import Auth from './pages/Auth'
import UserDashboard from './pages/UserDashboard'
import Report from './pages/Report'
import MyCases from './pages/MyCases'
import CaseDetail from './pages/CaseDetail'
import PartnerDashboard from './pages/PartnerDashboard'
import WhatToReport from './pages/WhatToReport'

function Protected({ children, roles }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (roles && !roles.includes(currentUser.role)) return <Navigate to={currentUser.role === 'partner' ? '/partner' : '/dashboard'} replace />
  return children
}

function RoutesApp() {
  const { currentUser } = useApp()

  return (
    <div className="phone-frame">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={currentUser ? <Navigate to={currentUser.role === 'partner' ? '/partner' : '/dashboard'} replace /> : <Auth />} />
        <Route path="/dashboard" element={<Protected roles={['user']}><UserDashboard /></Protected>} />
        <Route path="/parent" element={<Protected roles={['user']}><UserDashboard /></Protected>} />
        <Route path="/report" element={<Protected roles={['user']}><Report /></Protected>} />
        <Route path="/what-to-report" element={<Protected roles={['user']}><WhatToReport /></Protected>} />
        <Route path="/cases" element={<Protected roles={['user']}><MyCases /></Protected>} />
        <Route path="/case/:id" element={<Protected roles={['user']}><CaseDetail /></Protected>} />
        <Route path="/partner" element={<Protected roles={['partner']}><PartnerDashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <RoutesApp />
    </AppProvider>
  )
}
