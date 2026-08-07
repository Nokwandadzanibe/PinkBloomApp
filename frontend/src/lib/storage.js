// Lightweight persistence wrapper around localStorage
const PREFIX = 'pinkbloom_'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // ignore parse errors
  }
  return fallback
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    // storage may be full or unavailable; fail silently in demo
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    // ignore
  }
}
