// Pinkbloom data constants and helper logic

export const CATEGORIES = [
  { id: 'pads', label: 'No sanitary pads available', icon: '🩸' },
  { id: 'toilets', label: 'Unsafe or broken toilets', icon: '🚻' },
  { id: 'wsoap', label: 'No water or soap', icon: '💧' },
  { id: 'discrimination', label: 'Menstrual discrimination', icon: '✋' },
  { id: 'emergency', label: 'Health emergency', icon: '🆘' },
  { id: 'medicine', label: 'Medicine shortage', icon: '💊' },
  { id: 'food', label: 'Need food assistance', icon: '🍲' },
  { id: 'education', label: 'Need health education', icon: '📚' }
]

export const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

export const PRIORITY_RULES = {
  high: ['emergency', 'discrimination'],
  medium: ['pads', 'toilets', 'medicine', 'food'],
  low: ['wsoap', 'education']
}

export const ROUTING = {
  pads: ['NGO Partners', 'Donation partners'],
  toilets: ['Local Municipality', 'Department of Human Settlements'],
  wsoap: ['Local Municipality', 'Water & Sanitation Dept.'],
  discrimination: ['Support Organizations', 'Relevant Authorities'],
  emergency: ['Emergency Services', 'Department of Health'],
  medicine: ['Department of Health', 'Clinic Manager'],
  food: ['Community Support Organizations', 'Food Banks'],
  education: ['Department of Health', 'Health Education NGO']
}

// Priority icons matching the system spec
export const PRIORITY_LABEL = {
  high: '🔴 High Priority',
  medium: '🟡 Medium Priority',
  low: '🟢 Low Priority'
}

export function getPriority(categoryId) {
  if (PRIORITY_RULES.high.includes(categoryId)) return 'high'
  if (PRIORITY_RULES.medium.includes(categoryId)) return 'medium'
  return 'low'
}

export function nextStatus(current) {
  const order = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved']
  const idx = order.indexOf(current)
  if (idx >= 0 && idx < order.length - 1) return order[idx + 1]
  return null
}

export function genReference() {
  return 'PB-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 90 + 10)
}

