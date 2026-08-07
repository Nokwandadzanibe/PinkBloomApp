// Seed data for PinkBloom - clearly labeled demo/sample data
import { genRequestNumber, PRODUCTS } from '../data'

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const DEMO_SCHOOLS = [
  {
    id: 'sch-1',
    name: 'Mdantsane High School',
    code: 'SCH-1001',
    province: 'Eastern Cape',
    municipality: 'Buffalo City',
    community: 'Mdantsane',
    address: '21 Main Road, Mdantsane',
    learners: 1200,
    learnersAffected: 420,
    contactPerson: 'Nomvula Dlamini',
    email: 'school1@demo.com',
    phone: '071 111 1111',
    verified: true,
    registeredAt: daysAgo(90)
  },
  {
    id: 'sch-2',
    name: 'Umlazi Secondary School',
    code: 'SCH-1002',
    province: 'KwaZulu-Natal',
    municipality: 'eThekwini',
    community: 'Umlazi',
    address: '88 Z Section, Umlazi',
    learners: 950,
    learnersAffected: 310,
    contactPerson: 'Sipho Mthembu',
    email: 'school2@demo.com',
    phone: '072 222 2222',
    verified: true,
    registeredAt: daysAgo(75)
  },
  {
    id: 'sch-3',
    name: 'Kagiso Senior Secondary',
    code: 'SCH-1003',
    province: 'Gauteng',
    municipality: 'West Rand',
    community: 'Kagiso',
    address: '5 Kerk Street, Kagiso',
    learners: 800,
    learnersAffected: 260,
    contactPerson: 'Thandi Khumalo',
    email: 'school3@demo.com',
    phone: '073 333 3333',
    verified: true,
    registeredAt: daysAgo(60)
  },
  {
    id: 'sch-4',
    name: 'Botshabelo High School',
    code: 'SCH-1004',
    province: 'Free State',
    municipality: 'Mangaung',
    community: 'Botshabelo',
    address: '12 Qwaqwa Street, Botshabelo',
    learners: 1100,
    learnersAffected: 380,
    contactPerson: 'Palesa Molefe',
    email: 'school4@demo.com',
    phone: '074 444 4444',
    verified: true,
    registeredAt: daysAgo(45)
  },
  {
    id: 'sch-5',
    name: 'Polokwane Girls High',
    code: 'SCH-1005',
    province: 'Limpopo',
    municipality: 'Polokwane',
    community: 'Polokwane',
    address: '3 Dorp Street, Polokwane',
    learners: 700,
    learnersAffected: 220,
    contactPerson: 'Refilwe Nkosi',
    email: 'school5@demo.com',
    phone: '075 555 5555',
    verified: false,
    registeredAt: daysAgo(10)
  }
]

export const DEMO_NGOS = [
  {
    id: 'ngo-1',
    name: 'Blossom Foundation',
    regNumber: 'NGO-2019-001',
    address: '14 Hope Street, Johannesburg',
    province: 'Gauteng',
    municipality: 'City of Johannesburg',
    contactPerson: 'Lerato Mokoena',
    email: 'ngo1@demo.com',
    phone: '081 111 1111',
    verified: true,
    registeredAt: daysAgo(120)
  },
  {
    id: 'ngo-2',
    name: 'Dignity in Action',
    regNumber: 'NGO-2020-002',
    address: '6 Church Road, Durban',
    province: 'KwaZulu-Natal',
    municipality: 'eThekwini',
    contactPerson: 'Ayanda Zulu',
    email: 'ngo2@demo.com',
    phone: '082 222 2222',
    verified: true,
    registeredAt: daysAgo(100)
  },
  {
    id: 'ngo-3',
    name: 'Every Girl Counts',
    regNumber: 'NGO-2021-003',
    address: '22 Main Avenue, Cape Town',
    province: 'Western Cape',
    municipality: 'Cape Town',
    contactPerson: 'Zanele Adams',
    email: 'ngo3@demo.com',
    phone: '083 333 3333',
    verified: false,
    registeredAt: daysAgo(8)
  }
]

export const DEMO_USERS = [
  { name: 'System Admin', email: 'admin@pinkbloom.org', pass: 'admin123', role: 'admin' },
  { name: 'Lerato Mokoena', email: 'ngo1@demo.com', pass: 'demo123', role: 'ngo', orgId: 'ngo-1' },
  { name: 'Ayanda Zulu', email: 'ngo2@demo.com', pass: 'demo123', role: 'ngo', orgId: 'ngo-2' },
  { name: 'Nomvula Dlamini', email: 'school1@demo.com', pass: 'demo123', role: 'school', orgId: 'sch-1' },
  { name: 'Sipho Mthembu', email: 'school2@demo.com', pass: 'demo123', role: 'school', orgId: 'sch-2' },
  { name: 'Thandi Khumalo', email: 'school3@demo.com', pass: 'demo123', role: 'school', orgId: 'sch-3' },
  { name: 'Palesa Molefe', email: 'school4@demo.com', pass: 'demo123', role: 'school', orgId: 'sch-4' },
  { name: 'Refilwe Nkosi', email: 'school5@demo.com', pass: 'demo123', role: 'school', orgId: 'sch-5' }
]

// School stock records
export const DEMO_STOCK = [
  { schoolId: 'sch-1', productId: 'pads', current: 80, minimum: 300, monthlyUsage: 160, lastUpdated: daysAgo(6) },
  { schoolId: 'sch-1', productId: 'tampons', current: 120, minimum: 200, monthlyUsage: 60, lastUpdated: daysAgo(6) },
  { schoolId: 'sch-2', productId: 'pads', current: 200, minimum: 400, monthlyUsage: 180, lastUpdated: daysAgo(4) },
  { schoolId: 'sch-2', productId: 'reusable', current: 40, minimum: 100, monthlyUsage: 30, lastUpdated: daysAgo(4) },
  { schoolId: 'sch-3', productId: 'pads', current: 350, minimum: 250, monthlyUsage: 90, lastUpdated: daysAgo(3) },
  { schoolId: 'sch-3', productId: 'tampons', current: 90, minimum: 150, monthlyUsage: 45, lastUpdated: daysAgo(3) },
  { schoolId: 'sch-4', productId: 'pads', current: 140, minimum: 350, monthlyUsage: 150, lastUpdated: daysAgo(2) },
  { schoolId: 'sch-5', productId: 'pads', current: 500, minimum: 200, monthlyUsage: 70, lastUpdated: daysAgo(1) }
]

// NGO inventory records: { ngoId, productId, available, reserved, distributed, minimum }
export const DEMO_INVENTORY = [
  { ngoId: 'ngo-1', productId: 'pads', available: 1000, reserved: 0, distributed: 0, minimum: 200, lastUpdated: daysAgo(1) },
  { ngoId: 'ngo-1', productId: 'tampons', available: 500, reserved: 0, distributed: 0, minimum: 100, lastUpdated: daysAgo(1) },
  { ngoId: 'ngo-1', productId: 'reusable', available: 300, reserved: 0, distributed: 0, minimum: 80, lastUpdated: daysAgo(1) },
  { ngoId: 'ngo-2', productId: 'pads', available: 700, reserved: 0, distributed: 0, minimum: 150, lastUpdated: daysAgo(2) },
  { ngoId: 'ngo-2', productId: 'tampons', available: 400, reserved: 0, distributed: 0, minimum: 80, lastUpdated: daysAgo(2) }
]

// Demo requests across different statuses and priorities
export const DEMO_REQUESTS = [
  {
    id: genRequestNumber(1),
    schoolId: 'sch-1',
    ngoId: 'ngo-1',
    productId: 'pads',
    quantity: 800,
    currentStock: 80,
    learnersAffected: 420,
    urgency: 'critical',
    reason: 'Stock has dropped far below the minimum and learners are missing school.',
    notes: 'Need before end of term.',
    status: 'Under Review',
    createdAt: daysAgo(2)
  },
  {
    id: genRequestNumber(2),
    schoolId: 'sch-2',
    ngoId: 'ngo-1',
    productId: 'pads',
    quantity: 500,
    currentStock: 200,
    learnersAffected: 310,
    urgency: 'high',
    reason: 'Monthly usage is high and current stock will not last the month.',
    notes: '',
    status: 'Submitted',
    createdAt: daysAgo(1)
  },
  {
    id: genRequestNumber(3),
    schoolId: 'sch-3',
    ngoId: 'ngo-2',
    productId: 'tampons',
    quantity: 300,
    currentStock: 90,
    learnersAffected: 260,
    urgency: 'medium',
    reason: 'Running low on tampons ahead of peak demand.',
    notes: '',
    status: 'Approved',
    createdAt: daysAgo(4)
  },
  {
    id: genRequestNumber(4),
    schoolId: 'sch-4',
    ngoId: 'ngo-1',
    productId: 'pads',
    quantity: 600,
    currentStock: 140,
    learnersAffected: 380,
    urgency: 'critical',
    reason: 'Critical shortage, many learners affected.',
    notes: 'Urgent',
    status: 'Products Allocated',
    createdAt: daysAgo(5)
  },
  {
    id: genRequestNumber(5),
    schoolId: 'sch-1',
    ngoId: 'ngo-1',
    productId: 'tampons',
    quantity: 200,
    currentStock: 120,
    learnersAffected: 420,
    urgency: 'medium',
    reason: 'Boosting tampon supply.',
    notes: '',
    status: 'Delivered',
    createdAt: daysAgo(12)
  },
  {
    id: genRequestNumber(6),
    schoolId: 'sch-2',
    ngoId: 'ngo-2',
    productId: 'reusable',
    quantity: 150,
    currentStock: 40,
    learnersAffected: 310,
    urgency: 'high',
    reason: 'Reusable kits needed as a sustainable option.',
    notes: '',
    status: 'Confirmed',
    createdAt: daysAgo(15)
  },
  {
    id: genRequestNumber(7),
    schoolId: 'sch-3',
    ngoId: 'ngo-1',
    productId: 'pads',
    quantity: 400,
    currentStock: 350,
    learnersAffected: 260,
    urgency: 'low',
    reason: 'Restocking to maintain buffer.',
    notes: '',
    status: 'Resolved',
    createdAt: daysAgo(20)
  },
  {
    id: genRequestNumber(8),
    schoolId: 'sch-4',
    ngoId: 'ngo-2',
    productId: 'pads',
    quantity: 350,
    currentStock: 140,
    learnersAffected: 380,
    urgency: 'high',
    reason: 'Supply running out.',
    notes: '',
    status: 'Rejected',
    createdAt: daysAgo(18)
  },
  {
    id: genRequestNumber(9),
    schoolId: 'sch-1',
    ngoId: 'ngo-1',
    productId: 'pads',
    quantity: 500,
    currentStock: 80,
    learnersAffected: 420,
    urgency: 'high',
    reason: 'Recurring shortage, need consistent supply.',
    notes: '',
    status: 'Resolved',
    createdAt: daysAgo(30)
  },
  {
    id: genRequestNumber(10),
    schoolId: 'sch-2',
    ngoId: 'ngo-1',
    productId: 'tampons',
    quantity: 250,
    currentStock: 160,
    learnersAffected: 310,
    urgency: 'medium',
    reason: 'Routine top-up.',
    notes: '',
    status: 'Dispatched',
    createdAt: daysAgo(3)
  }
]

// Demo notifications
export const DEMO_NOTIFICATIONS = [
  { id: 'notif-1', userId: 'ngo1@demo.com', message: 'New critical request from Mdantsane High School', read: false, createdAt: daysAgo(2) },
  { id: 'notif-2', userId: 'ngo1@demo.com', message: 'Low inventory warning: Sanitary Pads below minimum', read: false, createdAt: daysAgo(1) },
  { id: 'notif-3', userId: 'ngo1@demo.com', message: 'Delivery confirmed by Umlazi Secondary School', read: true, createdAt: daysAgo(1) },
  { id: 'notif-4', userId: 'school1@demo.com', message: 'Your request PB-REQ-00001 is under review', read: false, createdAt: daysAgo(2) },
  { id: 'notif-5', userId: 'school2@demo.com', message: 'Your request PB-REQ-00006 has been confirmed', read: true, createdAt: daysAgo(1) }
]

export function buildSeed() {
  return {
    users: DEMO_USERS,
    schools: DEMO_SCHOOLS,
    ngos: DEMO_NGOS,
    stock: DEMO_STOCK,
    inventory: DEMO_INVENTORY,
    requests: DEMO_REQUESTS,
    notifications: DEMO_NOTIFICATIONS,
    allocations: [],
    deliveries: []
  }
}

export { PRODUCTS }
