import React, { useState } from 'react'
import './Tabs.css'

export function Tabs({ tabs, active, onChange, children }) {
  return (
    <div>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`tab ${active === t.value ? 'tab-active' : ''}`}
            role="tab"
            aria-selected={active === t.value}
            onClick={() => onChange(t.value)}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="tab-count">{t.count}</span>
            )}
          </button>
        ))}
      </div>
      <div className="tab-panel">{children}</div>
    </div>
  )
}

export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div className={`segmented ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          className={`segmented-item ${value === o.value ? 'segmented-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <o.icon size={16} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function useTabs(initial) {
  const [active, setActive] = useState(initial)
  return [active, setActive]
}
