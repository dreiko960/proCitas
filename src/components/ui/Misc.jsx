import React from 'react'
import './Misc.css'

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`switch ${checked ? 'switch-on' : ''}`}
      onClick={() => onChange(!checked)}
      aria-label={label}
    >
      <span className="switch-knob" />
    </button>
  )
}

export function Avatar({ name, initials, size = 40, tone = 'primary', online }) {
  return (
    <span
      className={`avatar tone-${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
      {online && <span className="avatar-online" />}
    </span>
  )
}

export function StepIndicator({ steps, current }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className={`step ${done ? 'step-done' : ''} ${active ? 'step-active' : ''}`}>
            <span className="step-num">{done ? '✓' : i + 1}</span>
            <span className="step-label">{s}</span>
            {i < steps.length - 1 && <span className="step-line" />}
          </li>
        )
      })}
    </ol>
  )
}

export function Progress({ value, tone = 'primary' }) {
  return (
    <div className="progress">
      <div className={`progress-bar bar-${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
