import React, { useId } from 'react'
import './Field.css'
import { IconCheckCircle, IconXCircle } from '../Icons'

export function Field({ label, hint, error, success, required, children, id }) {
  const uid = useId()
  const fieldId = id || uid
  return (
    <div className={`field ${error ? 'field-error' : ''} ${success ? 'field-success' : ''}`}>
      {label && (
        <label className="field-label" htmlFor={fieldId}>
          {label} {required && <span className="field-req">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-msg field-msg-error">
          <IconXCircle size={15} /> {error}
        </p>
      ) : success ? (
        <p className="field-msg field-msg-success">
          <IconCheckCircle size={15} /> {success}
        </p>
      ) : hint ? (
        <p className="field-msg field-msg-hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  label,
  error,
  success,
  hint,
  required,
  icon: Icon,
  rightEl,
  state,
  className = '',
  ...rest
}) {
  return (
    <Field label={label} error={error} success={success} hint={hint} required={required}>
      <div className="input-wrap">
        {Icon && (
          <span className="input-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          className={`input ${Icon ? 'has-icon' : ''} ${rightEl ? 'has-right' : ''} ${error ? 'input-invalid' : ''} ${success ? 'input-valid' : ''} ${className}`}
          {...rest}
        />
        {rightEl && <span className="input-right">{rightEl}</span>}
      </div>
    </Field>
  )
}

export function Textarea({ label, error, success, hint, required, rows = 4, ...rest }) {
  return (
    <Field label={label} error={error} success={success} hint={hint} required={required}>
      <textarea className={`input textarea ${error ? 'input-invalid' : ''} ${success ? 'input-valid' : ''}`} rows={rows} {...rest} />
    </Field>
  )
}

export function Select({ label, error, success, hint, required, children, icon: Icon, ...rest }) {
  return (
    <Field label={label} error={error} success={success} hint={hint} required={required}>
      <div className="input-wrap">
        {Icon && (
          <span className="input-icon">
            <Icon size={18} />
          </span>
        )}
        <select className={`input select ${Icon ? 'has-icon' : ''} ${error ? 'input-invalid' : ''}`} {...rest}>
          {children}
        </select>
      </div>
    </Field>
  )
}

export function Checkbox({ label, checked, onChange, error }) {
  return (
    <label className={`checkbox ${error ? 'field-error' : ''}`}>
      <span className="checkbox-box" onClick={(e) => { e.preventDefault(); onChange(!checked) }}>
        {checked && <span className="checkbox-check">✓</span>}
      </span>
      <span className="checkbox-label">{label}</span>
    </label>
  )
}
