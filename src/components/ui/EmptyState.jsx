import React from 'react'
import './EmptyState.css'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, message, action, actionIcon, onAction, small }) {
  return (
    <div className={`empty-state ${small ? 'empty-sm' : ''}`}>
      {Icon && (
        <span className="empty-icon">
          <Icon size={small ? 30 : 40} />
        </span>
      )}
      <h4 className="empty-title">{title}</h4>
      {message && <p className="empty-message">{message}</p>}
      {action && onAction && (
        <Button variant="accent" icon={actionIcon} onClick={onAction} className="empty-action">
          {action}
        </Button>
      )}
    </div>
  )
}
