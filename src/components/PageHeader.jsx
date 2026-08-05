import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft } from './Icons'
import './PageHeader.css'

export default function PageHeader({ title, subtitle, action, back, className = '' }) {
  const navigate = useNavigate()
  return (
    <div className={`page-head ${className}`}>
      <div className="page-head-left">
        {back && (
          <button className="page-back" onClick={() => navigate(back === true ? -1 : back)} aria-label="Volver">
            <IconArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="page-head-action">{action}</div>}
    </div>
  )
}
