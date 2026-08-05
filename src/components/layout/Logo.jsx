import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', light }) {
  return (
    <span className={`logo logo-${size} ${light ? 'logo-light' : ''}`}>
      <span className="logo-mark">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 5 6v5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6Z" />
          <path d="m9 12 2 2 4-4.5" />
        </svg>
      </span>
      <span className="logo-text">
        <span className="logo-name">SGCM-CMAS</span>
        <span className="logo-tag">Citas médicas de Ayacucho</span>
      </span>
    </span>
  )
}
