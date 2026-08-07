// PinkBloom - shared constants and business-logic helpers
// This module is the "pure logic" core used across the app.

export const PRODUCTS = [
  { id: 'pads', label: 'Sanitary Pads', icon: '🩸', unit: 'packs' },
  { id: 'tampons', label: 'Tampons', icon: '🌿', unit: 'packs' },
  { id: 'reusable', label: 'Reusable Menstrual Products', icon: '♻️', unit: 'kits' }
]

export const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
]

// Request lifecycle statuses (in order)
export const REQUEST_STATUSES = [
  'Submitted',
  'Under Review',
  'Approved',
  'Products Allocated',
  'Preparing',
  'Dispatched',
  'Delivered',
  'Confirmed',
  'Resolved',
  'Rejected'
]

export const ACTIVE_STATUSES = REQUEST_STATUSES.filter(
  s => s !== 'Resolved' && s !== 'Rejected'
)

export const NEED_LEVELS = [
  { min: 80, label: 'Critical Need', icon: '🔴', key: 'critical' },
  { min: 50, label: 'High Need', icon: '🟠', key: 'high' },
  { min: 20, label: 'Moderate Need', icon: '🟡', key: 'moderate' },
  { min: 0, label: 'Low Need', icon: '🟢', key: 'low' }
]

export const STOCK_STATUS = {
  critical: { label: 'Critical', icon: '🔴', key: 'critical' },
  low: { label: 'Low', icon: '🟡', key: 'low' },
  sufficient: { label: 'Sufficient', icon: '🟢', key: 'sufficient' }
}

// Need Score engine (transparent, rules-based, max 100)
export function computeNeedScore({ stock, minimum, monthlyUsage, learnersAffected, shortageHistory }) {
  let score = 0
  const factors = []

  // 1. Current stock below minimum (+30)
  if (stock < minimum) {
    const ratio = minimum > 0 ? stock / minimum : 0
    const pts = ratio <= 0.25 ? 30 : ratio <= 0.5 ? 22 : 14
    score += pts
    factors.push({ label: 'Current stock below minimum', points: pts })
  } else {
    factors.push({ label: 'Current stock at/above minimum', points: 0 })
  }

  // 2. High monthly usage (+25)
  if (monthlyUsage >= 100) {
    score += 25
    factors.push({ label: 'High monthly usage (≥100)', points: 25 })
  } else if (monthlyUsage >= 50) {
    score += 15
    factors.push({ label: 'Moderate monthly usage', points: 15 })
  } else {
    factors.push({ label: 'Low monthly usage', points: 0 })
  }

  // 3. Large number of learners affected (+25)
  if (learnersAffected >= 300) {
    score += 25
    factors.push({ label: 'Large learner impact (≥300)', points: 25 })
  } else if (learnersAffected >= 150) {
    score += 15
    factors.push({ label: 'Moderate learner impact', points: 15 })
  } else {
    factors.push({ label: 'Limited learner impact', points: 0 })
  }

  // 4. Previous shortage history (+20)
  if (shortageHistory >= 3) {
    score += 20
    factors.push({ label: 'Frequent shortage history (≥3)', points: 20 })
  } else if (shortageHistory >= 1) {
    score += 10
    factors.push({ label: 'Some shortage history', points: 10 })
  } else {
    factors.push({ label: 'No shortage history', points: 0 })
  }

  score = Math.min(100, Math.max(0, score))
  return { score, factors }
}

export function needLevel(score) {
  const level = NEED_LEVELS.find(l => score >= l.min) || NEED_LEVELS[NEED_LEVELS.length - 1]
  return level
}

// Stock status rule
export function stockStatus(current, minimum) {
  if (current <= minimum * 0.25) return STOCK_STATUS.critical
  if (current <= minimum * 0.5) return STOCK_STATUS.low
  return STOCK_STATUS.sufficient
}

// Generate a unique request number: PB-REQ-00001
export function genRequestNumber(index) {
  return 'PB-REQ-' + String(index).padStart(5, '0')
}

export const ROLES = {
  ngo: 'NGO',
  school: 'School',
  admin: 'System Admin'
}
