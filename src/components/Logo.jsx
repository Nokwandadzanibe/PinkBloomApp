import React from 'react'

export default function Logo({ className = '', size = 'md' }) {
  const sizes = {
    sm: 38,
    md: 90,
    lg: 160
  }
  const px = sizes[size] || sizes.md
  return (
    <img
      src="/assets/logo.jpeg"
      alt="Pinkbloom logo"
      className={className || 'auth-logo'}
      style={{ width: px, height: px }}
    />
  )
}
