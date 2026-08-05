import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconCheckCircleFilled, IconAlertFilled, IconInfoFilled, IconX } from '../Icons'
import './Toast.css'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

let toastSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
    clearTimeout(timers.current[id])
  }, [])

  const toast = useCallback((message, { type = 'success', title, duration = 4000 } = {}) => {
    const id = ++toastSeq
    setToasts((t) => [...t, { id, message, type, title }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="toast-region" role="region" aria-live="polite">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    success: <IconCheckCircleFilled size={22} />,
    error: <IconAlertFilled size={22} />,
    info: <IconInfoFilled size={22} />,
    warning: <IconAlertFilled size={22} />,
  }
  return (
    <div className={`toast toast-${toast.type} anim-slide`}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <div className="toast-body">
        {toast.title && <p className="toast-title">{toast.title}</p>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={onDismiss} aria-label="Cerrar">
        <IconX size={16} />
      </button>
    </div>
  )
}
