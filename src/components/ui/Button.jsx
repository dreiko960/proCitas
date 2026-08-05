import React from 'react'
import './Button.css'

const VARIANTS = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  secondary: 'btn-secondary',
  text: 'btn-text',
  destructive: 'btn-destructive',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  full,
  className = '',
  ...rest
}) {
  return (
    <button
      className={`btn ${VARIANTS[variant]} btn-${size} ${full ? 'btn-full' : ''} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
    </button>
  )
}
