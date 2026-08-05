import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '../Icons'
import Button from './Button'
import './Modal.css'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  icon: Icon,
  tone = 'primary',
  closeOnOverlay = true,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && closeOnOverlay && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, closeOnOverlay])

  if (!open) return null
  return createPortal(
    <div className="modal-overlay" onMouseDown={closeOnOverlay ? onClose : undefined}>
      <div
        className={`modal anim-modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          {Icon && (
            <span className={`modal-head-icon tone-${tone}`}>
              <Icon size={22} />
            </span>
          )}
          <div className="grow">
            <h3 className="modal-title">{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <IconX size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  icon: Icon,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      icon={Icon}
      tone={tone}
      footer={
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'destructive' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      }
    >
      <div className="confirm-message">{message}</div>
    </Modal>
  )
}
