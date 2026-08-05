import React from 'react'
import './Card.css'

export function Card({ children, className = '', hover, onClick, selected, ...rest }) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${selected ? 'card-selected' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      <div className="card-header-left">
        {Icon && (
          <span className="card-header-icon">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'primary', trend }) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon tone-${tone}`}>
        <Icon size={22} />
      </div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
        {trend && (
          <p className={`stat-trend ${trend.dir === 'up' && trend.good !== false ? 't-up' : trend.dir === 'down' ? 't-down' : 't-up'}`}>
            {trend.dir === 'up' ? '▲' : '▼'} {trend.text}
          </p>
        )}
      </div>
    </Card>
  )
}
