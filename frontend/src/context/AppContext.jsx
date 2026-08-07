import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { buildSeed } from '../lib/seed'
import { load, save, remove } from '../lib/storage'
import { computeNeedScore, genRequestNumber, REQUEST_STATUSES, stockStatus, PRODUCTS } from '../data'

const AppContext = createContext()

// ---------- seed helpers ----------
function seedData() {
  const seed = buildSeed()
  // compute needScore / priority for each seeded request
  seed.requests = seed.requests.map(req => enrichRequest(req, seed))
  return seed
}

function getStockFor(schoolId, productId, seed) {
  return seed.stock.find(s => s.schoolId === schoolId && s.productId === productId)
}

function shortageCount(schoolId, seed) {
  return seed.requests.filter(r => r.schoolId === schoolId && r.status === 'Resolved').length
}

function enrichRequest(req, seed) {
  const school = seed.schools.find(s => s.id === req.schoolId) || {}
  const stock = getStockFor(req.schoolId, req.productId, seed)
  const res = computeNeedScore({
    stock: req.currentStock ?? stock?.current ?? 0,
    minimum: stock?.minimum ?? 100,
    monthlyUsage: stock?.monthlyUsage ?? 60,
    learnersAffected: req.learnersAffected ?? school.learnersAffected ?? 0,
    shortageHistory: shortageCount(req.schoolId, seed)
  })
  return {
    ...req,
    schoolName: school.name || 'Unknown School',
    needScore: res.score,
    needFactors: res.factors,
    level: res.score >= 80 ? 'critical' : res.score >= 50 ? 'high' : res.score >= 20 ? 'moderate' : 'low'
  }
}

// ---------- storage loaders ----------
function loadDB() {
  const raw = load('db', null)
  if (raw) {
    // re-enrich on load to keep derived fields fresh
    const enriched = {
      ...raw,
      requests: raw.requests.map(req => enrichRequest(req, raw))
    }
    return enriched
  }
  return seedData()
}

export function AppProvider({ children }) {
  const [db, setDb] = useState(loadDB)
  const [currentUser, setCurrentUser] = useState(() => load('session', null))

  useEffect(() => { save('db', db) }, [db])
  useEffect(() => {
    if (currentUser) save('session', currentUser)
    else remove('session')
  }, [currentUser])

  // ---------- helper accessors ----------
  const myOrg = useMemo(() => {
    if (!currentUser) return null
    if (currentUser.role === 'school') return db.schools.find(s => s.id === currentUser.orgId) || null
    if (currentUser.role === 'ngo') return db.ngos.find(n => n.id === currentUser.orgId) || null
    return null
  }, [currentUser, db])

  const isVerified = myOrg ? myOrg.verified : currentUser?.role === 'admin'

  // ---------- notifications ----------
  const myNotifications = useMemo(() => {
    if (!currentUser) return []
    return db.notifications.filter(n => n.userId === currentUser.email)
  }, [db.notifications, currentUser])

  const unreadCount = myNotifications.filter(n => !n.read).length

  const pushNotification = (userId, message) => {
    setDb(prev => ({
      ...prev,
      notifications: [
        { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), userId, message, read: false, createdAt: new Date().toISOString() },
        ...prev.notifications
      ]
    }))
  }

  const markAllRead = () => {
    setDb(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.userId === currentUser.email ? { ...n, read: true } : n
      )
    }))
  }

  // ---------- auth ----------
  const registerOrg = (role, data) => {
    // data contains org fields + email/pass
    const email = (data.email || '').toLowerCase().trim()
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      return { error: 'An account with this email already exists. Please sign in.' }
    }

    if (role === 'school') {
      const id = 'sch-' + Date.now()
      const school = {
        id,
        name: data.name,
        code: data.code,
        province: data.province,
        municipality: data.municipality,
        community: data.community,
        address: data.address,
        learners: Number(data.learners) || 0,
        learnersAffected: Number(data.learnersAffected) || 0,
        contactPerson: data.contactPerson,
        email,
        phone: data.phone,
        verified: false,
        registeredAt: new Date().toISOString()
      }
      const user = { name: data.contactPerson, email, pass: data.pass, role: 'school', orgId: id }
      setDb(prev => ({
        ...prev,
        schools: [...prev.schools, school],
        users: [...prev.users, user]
      }))
      return { ok: true, message: 'School registered. Awaiting admin verification.' }
    }

    if (role === 'ngo') {
      const id = 'ngo-' + Date.now()
      const ngo = {
        id,
        name: data.name,
        regNumber: data.regNumber,
        address: data.address,
        province: data.province,
        municipality: data.municipality,
        contactPerson: data.contactPerson,
        email,
        phone: data.phone,
        verified: false,
        registeredAt: new Date().toISOString()
      }
      const user = { name: data.contactPerson, email, pass: data.pass, role: 'ngo', orgId: id }
      setDb(prev => ({
        ...prev,
        ngos: [...prev.ngos, ngo],
        users: [...prev.users, user]
      }))
      return { ok: true, message: 'NGO registered. Awaiting admin verification.' }
    }

    return { error: 'Unknown role.' }
  }

  const login = (email, pass) => {
    const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found || found.pass !== pass) {
      return { error: 'Invalid email or password.' }
    }
    setCurrentUser({ name: found.name, email: found.email, role: found.role, orgId: found.orgId })
    return { ok: true }
  }

  const logout = () => setCurrentUser(null)

  // ---------- verification gating ----------
  const requireVerified = (action) => {
    if (currentUser?.role === 'admin') return null
    if (!myOrg) return 'You do not have permission to perform this action.'
    if (!myOrg.verified) return 'Your organisation is still awaiting verification.'
    return null
  }

  // ---------- school: stock ----------
  const updateSchoolStock = (productId, current, minimum, monthlyUsage) => {
    const gated = requireVerified('update stock')
    if (gated) return { error: gated }

    setDb(prev => {
      const existing = prev.stock.find(s => s.schoolId === currentUser.orgId && s.productId === productId)
      const stock = existing
        ? prev.stock.map(s =>
            s.schoolId === currentUser.orgId && s.productId === productId
              ? { ...s, current, minimum, monthlyUsage, lastUpdated: new Date().toISOString() }
              : s
          )
        : [...prev.stock, { schoolId: currentUser.orgId, productId, current, minimum, monthlyUsage, lastUpdated: new Date().toISOString() }]
      return { ...prev, stock }
    })
    return { ok: true }
  }

  // ---------- school: submit request ----------
  const submitRequest = (data) => {
    const gated = requireVerified('submit request')
    if (gated) return { error: gated }

    const school = db.schools.find(s => s.id === currentUser.orgId)
    const count = db.requests.length + 1
    const req = {
      id: genRequestNumber(count),
      schoolId: currentUser.orgId,
      ngoId: data.ngoId,
      productId: data.productId,
      quantity: Number(data.quantity),
      currentStock: Number(data.currentStock),
      learnersAffected: Number(data.learnersAffected),
      urgency: data.urgency,
      reason: data.reason,
      notes: data.notes || '',
      status: 'Submitted',
      createdAt: new Date().toISOString()
    }
    setDb(prev => {
      const enriched = enrichRequest(req, prev)
      const next = { ...prev, requests: [enriched, ...prev.requests] }
      return next
    })
    // notify NGO
    const ngo = db.ngos.find(n => n.id === data.ngoId)
    if (ngo) {
      pushNotification(ngo.email, `New request from ${school?.name || 'a school'}`)
    }
    return { ok: true, requestId: req.id }
  }

  // ---------- NGO: request actions ----------
  const setRequestStatus = (requestId, status) => {
    setDb(prev => ({
      ...prev,
      requests: prev.requests.map(r => {
        if (r.id !== requestId) return r
        return { ...r, status }
      })
    }))
    const req = db.requests.find(r => r.id === requestId)
    if (req) {
      const school = db.schools.find(s => s.id === req.schoolId)
      if (school) pushNotification(school.email, `Your request ${req.id} is now: ${status}`)
    }
    return { ok: true }
  }

  const rejectRequest = (requestId, reason) => {
    setRequestStatus(requestId, 'Rejected')
    return { ok: true }
  }

  // ---------- NGO: inventory ----------
  const addStock = (productId, quantity) => {
    const gated = requireVerified('add stock')
    if (gated) return { error: gated }
    const qty = Number(quantity)
    if (!qty || qty <= 0) return { error: 'Please enter a valid quantity.' }
    setDb(prev => {
      const existing = prev.inventory.find(i => i.ngoId === currentUser.orgId && i.productId === productId)
      const inventory = existing
        ? prev.inventory.map(i =>
            i.ngoId === currentUser.orgId && i.productId === productId
              ? { ...i, available: i.available + qty, lastUpdated: new Date().toISOString() }
              : i
          )
        : [...prev.inventory, { ngoId: currentUser.orgId, productId, available: qty, reserved: 0, distributed: 0, minimum: 0, lastUpdated: new Date().toISOString() }]
      return { ...prev, inventory }
    })
    return { ok: true }
  }

  const setMinimumStock = (productId, minimum) => {
    setDb(prev => ({
      ...prev,
      inventory: prev.inventory.map(i =>
        i.ngoId === currentUser.orgId && i.productId === productId
          ? { ...i, minimum: Number(minimum) || 0, lastUpdated: new Date().toISOString() }
          : i
      )
    }))
    return { ok: true }
  }

  // ---------- NGO: allocate ----------
  const allocateProducts = (requestId, quantity) => {
    const gated = requireVerified('allocate products')
    if (gated) return { error: gated }
    const qty = Number(quantity)
    if (!qty || qty <= 0) return { error: 'Please enter a valid quantity.' }

    const req = db.requests.find(r => r.id === requestId)
    if (!req) return { error: 'Request not found.' }

    const invItem = db.inventory.find(i => i.ngoId === currentUser.orgId && i.productId === req.productId)
    if (!invItem || invItem.available < qty) {
      return { error: 'Insufficient inventory to allocate this quantity.' }
    }

    setDb(prev => ({
      ...prev,
      inventory: prev.inventory.map(i =>
        i.ngoId === currentUser.orgId && i.productId === req.productId
          ? { ...i, available: i.available - qty, reserved: i.reserved + qty, lastUpdated: new Date().toISOString() }
          : i
      ),
      requests: prev.requests.map(r => (r.id === requestId ? { ...r, status: 'Products Allocated', allocatedQuantity: qty } : r)),
      allocations: [...prev.allocations, { id: 'al-' + Date.now(), requestId, productId: req.productId, quantity: qty, ngoId: currentUser.orgId, createdAt: new Date().toISOString() }]
    }))
    const school = db.schools.find(s => s.id === req.schoolId)
    if (school) pushNotification(school.email, `Your request ${req.id} has been allocated ${qty} ${PRODUCTS.find(p => p.id === req.productId)?.unit || 'units'}.`)
    return { ok: true }
  }

  // ---------- NGO: delivery ----------
  const createDelivery = (requestId, deliveryDate, notes) => {
    const gated = requireVerified('create delivery')
    if (gated) return { error: gated }
    const req = db.requests.find(r => r.id === requestId)
    if (!req) return { error: 'Request not found.' }

    setDb(prev => ({
      ...prev,
      requests: prev.requests.map(r => (r.id === requestId ? { ...r, status: 'Delivered', deliveryDate, deliveryNotes: notes } : r)),
      deliveries: [...prev.deliveries, { id: 'del-' + Date.now(), requestId, schoolId: req.schoolId, productId: req.productId, quantity: req.allocatedQuantity || req.quantity, deliveryDate, notes, ngoId: currentUser.orgId, createdAt: new Date().toISOString() }]
    }))
    const school = db.schools.find(s => s.id === req.schoolId)
    if (school) pushNotification(school.email, `Your request ${req.id} has been delivered. Please confirm receipt.`)
    return { ok: true }
  }

  // ---------- school: confirm delivery ----------
  const confirmDelivery = (requestId) => {
    setDb(prev => {
      // move confirmed -> resolved
      const requests = prev.requests.map(r => {
        if (r.id !== requestId) return r
        return { ...r, status: r.status === 'Confirmed' ? 'Resolved' : 'Confirmed' }
      })
      return { ...prev, requests }
    })
    const req = db.requests.find(r => r.id === requestId)
    const ngo = req ? db.ngos.find(n => n.id === req.ngoId) : null
    if (ngo) pushNotification(ngo.email, `Delivery confirmed for request ${req.id}`)
    return { ok: true }
  }

  const reportIncorrectQuantity = (requestId, note) => {
    const req = db.requests.find(r => r.id === requestId)
    const ngo = req ? db.ngos.find(n => n.id === req.ngoId) : null
    if (ngo) pushNotification(ngo.email, `Incorrect quantity reported for request ${req.id}: ${note}`)
    return { ok: true }
  }

  // ---------- admin ----------
  const verifyOrg = (kind, id) => {
    setDb(prev => {
      if (kind === 'school') {
        return { ...prev, schools: prev.schools.map(s => (s.id === id ? { ...s, verified: true } : s)) }
      }
      if (kind === 'ngo') {
        return { ...prev, ngos: prev.ngos.map(n => (n.id === id ? { ...n, verified: true } : n)) }
      }
      return prev
    })
    return { ok: true }
  }

  const suspendOrg = (kind, id) => {
    setDb(prev => {
      if (kind === 'school') {
        return { ...prev, schools: prev.schools.map(s => (s.id === id ? { ...s, verified: false, suspended: true } : s)) }
      }
      if (kind === 'ngo') {
        return { ...prev, ngos: prev.ngos.map(n => (n.id === id ? { ...n, verified: false, suspended: true } : n)) }
      }
      return prev
    })
    return { ok: true }
  }

  const resetDemo = () => {
    setDb(seedData())
    setCurrentUser(null)
    return { ok: true }
  }

  // ---------- derived stats ----------
  const stats = useMemo(() => {
    const verifiedSchools = db.schools.filter(s => s.verified)
    const requests = db.requests
    const activeRequests = requests.filter(r => !['Resolved', 'Rejected'].includes(r.status))
    const criticalRequests = requests.filter(r => r.needScore >= 80 && !['Resolved', 'Rejected'].includes(r.status))
    const resolved = requests.filter(r => r.status === 'Resolved')
    const distributed = db.allocations.reduce((s, a) => s + a.quantity, 0)
    const inventoryTotal = db.inventory.reduce((s, i) => s + i.available, 0)
    const learnersReached = resolved.reduce((s, r) => s + (r.learnersAffected || 0), 0)

    return {
      schools: db.schools.length,
      verifiedSchools: verifiedSchools.length,
      pendingSchools: db.schools.filter(s => !s.verified).length,
      ngos: db.ngos.length,
      pendingNgos: db.ngos.filter(n => !n.verified).length,
      activeRequests: activeRequests.length,
      criticalRequests: criticalRequests.length,
      resolvedRequests: resolved.length,
      requests: requests.length,
      distributed,
      inventoryTotal,
      learnersReached
    }
  }, [db])

  const value = {
    db,
    currentUser,
    myOrg,
    isVerified,
    login,
    logout,
    registerOrg,
    stats,
    myNotifications,
    unreadCount,
    markAllRead,
    updateSchoolStock,
    submitRequest,
    setRequestStatus,
    rejectRequest,
    addStock,
    setMinimumStock,
    allocateProducts,
    createDelivery,
    confirmDelivery,
    reportIncorrectQuantity,
    verifyOrg,
    suspendOrg,
    resetDemo,
    requireVerified
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
