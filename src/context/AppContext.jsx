import React, { createContext, useContext, useState, useEffect } from 'react'
import { getPriority, genReference } from '../data'

const AppContext = createContext()

const STATUS_FLOW = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved']

// Seed sample reports so the partner dashboard looks populated on first run
const seedReports = () => {
  const today = new Date()
  const d = (days) => {
    const x = new Date(today)
    x.setDate(x.getDate() - days)
    return x.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return [
    {
      id: 'PB-100001-11',
      user: 'sam@user.co.za',
      category: 'pads',
      province: 'Eastern Cape',
      municipality: 'Buffalo City',
      community: 'Mdantsane High School',
      clinic: 'Mdantsane Clinic',
      description: 'Learners frequently miss school during menstruation because pads are not available.',
      photo: null,
      contact: '',
      status: 'In Progress',
      priority: getPriority('pads'),
      date: d(2),
      location: 'Elevation City'
    },
    {
      id: 'PB-100002-22',
      user: 'sam@user.co.za',
      category: 'toilets',
      province: 'KwaZulu-Natal',
      municipality: 'eThekwini',
      community: 'Umlazi Community',
      clinic: 'Prince Mshiyeni Hospital',
      description: 'School toilets are locked and some are broken, making it unsafe for girls.',
      photo: null,
      contact: '071 234 5678',
      status: 'Under Review',
      priority: getPriority('toilets'),
      date: d(4),
      location: 'Elevation City'
    },
    {
      id: 'PB-100003-33',
      user: 'sam@user.co.za',
      category: 'education',
      province: 'Gauteng',
      municipality: 'City of Johannesburg',
      community: 'Soweto Youth Centre',
      clinic: 'Johannesburg Clinic',
      description: 'Young people need accurate information about menstrual health.',
      photo: null,
      contact: '',
      status: 'Resolved',
      priority: getPriority('education'),
      date: d(7),
      location: 'Joburg Hub'
    }
  ]
}

function loadReports() {
  try {
    const raw = localStorage.getItem('pinkbloom_reports')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return seedReports()
}

function loadUsers() {
  try {
    const raw = localStorage.getItem('pinkbloom_users')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return [
    { name: 'Demo User', email: 'user@demo.com', role: 'user', pass: 'demo123' },
    { name: 'Demo Partner', email: 'partner@demo.com', role: 'partner', pass: 'demo123' }
  ]
}

export const AppProvider = ({ children }) => {
  const [reports, setReports] = useState(loadReports)
  const [users, setUsers] = useState(loadUsers)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('pinkbloom_session')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    localStorage.setItem('pinkbloom_reports', JSON.stringify(reports))
  }, [reports])

  useEffect(() => {
    localStorage.setItem('pinkbloom_users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) localStorage.setItem('pinkbloom_session', JSON.stringify(currentUser))
    else localStorage.removeItem('pinkbloom_session')
  }, [currentUser])

  const register = (name, email, pass, role) => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists. Please sign in.' }
    }
    const newUser = { name, email, role, pass }
    setUsers(prev => [...prev, newUser])
    setCurrentUser({ name, email, role })
    return { ok: true }
  }

  const login = (email, pass) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.pass === pass)
    if (!found) {
      return { error: 'Invalid email or password.' }
    }
    setCurrentUser({ name: found.name, email: found.email, role: found.role })
    return { ok: true }
  }

  const logout = () => setCurrentUser(null)

  const addReport = (data) => {
    const report = {
      id: genReference(),
      user: currentUser ? currentUser.email : 'anon@user.co.za',
      ...data,
      status: 'Submitted',
      priority: getPriority(data.category),
      date: new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    setReports(prev => [report, ...prev])
    return report
  }

  const updateReportStatus = (id) => {
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r
      const idx = STATUS_FLOW.indexOf(r.status)
      const nextStatus = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : r.status
      return { ...r, status: nextStatus }
    }))
  }

  const resetDemo = () => {
    localStorage.removeItem('pinkbloom_reports')
    setReports(seedReports())
  }

  const value = {
    reports,
    users,
    currentUser,
    register,
    login,
    logout,
    addReport,
    updateReportStatus,
    resetDemo,
    STATUS_FLOW
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

