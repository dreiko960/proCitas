import React, { useEffect, useRef, useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { fmtPrice } from '../utils/helpers'
import { IconCreditCard, IconShield, IconLock, IconCheckCircleFilled, IconWallet } from './Icons'
import './PaymentGateway.css'

function cardBrand(number) {
  const n = number.replace(/\D/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return 'Tarjeta'
}

function formatNumber(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExp(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export default function PaymentGateway({ open, onClose, amount = 0, label, rows = [], onSuccess }) {
  const [stage, setStage] = useState('form')
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvv: '' })
  const [errors, setErrors] = useState({})
  const [opRef, setOpRef] = useState('')
  const timer = useRef(null)

  useEffect(() => {
    if (open) {
      setStage('form')
      setCard({ name: '', number: '', exp: '', cvv: '' })
      setErrors({})
      setOpRef('')
    }
    return () => timer.current && clearTimeout(timer.current)
  }, [open])

  const brand = cardBrand(card.number)

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (card.name.trim().length < 5) err.name = 'Ingresa el nombre del titular'
    if (card.number.replace(/\s/g, '').length !== 16) err.number = 'Se requieren 16 dígitos'
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) err.exp = 'Formato MM/AA'
    if (!/^\d{3,4}$/.test(card.cvv)) err.cvv = 'Código de seguridad'
    setErrors(err)
    if (Object.keys(err).length) return
    setStage('processing')
    timer.current = setTimeout(() => {
      setOpRef(`OP-2026-${400 + Math.floor(Math.random() * 600)}`)
      setStage('success')
    }, 1600)
  }

  const setField = (k) => (e) => {
    let v = e.target.value
    if (k === 'number') v = formatNumber(v)
    if (k === 'exp') v = formatExp(v)
    if (k === 'cvv') v = v.replace(/\D/g, '').slice(0, 4)
    setCard((c) => ({ ...c, [k]: v }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: null }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={stage === 'success' ? 'Pago aprobado' : 'Pagar con tarjeta'}
      subtitle={stage === 'success' ? 'Tu cita quedó asegurada.' : 'Pasarela de pago segura (simulación).'}
      size="md"
      icon={stage === 'success' ? IconCheckCircleFilled : IconCreditCard}
      tone={stage === 'success' ? 'success' : 'primary'}
      footer={
        stage === 'success' ? (
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="primary" icon={IconCheckCircleFilled} onClick={() => onSuccess?.({ amount, label, opRef })}>
              Continuar
            </Button>
          </div>
        ) : (
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={onClose} disabled={stage === 'processing'}>Cancelar</Button>
            {stage === 'form' && (
              <Button type="submit" variant="primary" icon={IconWallet} onClick={submit}>
                Pagar {fmtPrice(amount)}
              </Button>
            )}
          </div>
        )
      }
    >
      {stage === 'processing' && (
        <div className="gw-processing">
          <span className="gw-spinner" />
          <p className="bold">Comunicando con tu banco…</p>
          <p className="small muted">No cierres esta ventana. El cobro se está procesando de forma segura.</p>
        </div>
      )}

      {stage === 'success' && (
        <div className="gw-success anim-in">
          <span className="gw-success-icon"><IconCheckCircleFilled size={34} /></span>
          <p className="gw-success-amount">{fmtPrice(amount)}</p>
          <p className="small muted">Pago {label?.toLowerCase()} aprobado</p>
          <div className="gw-success-rows">
            {rows.map((r) => (
              <div key={r.label} className="row-between">
                <span className="small muted">{r.label}</span>
                <strong className="small">{r.value}</strong>
              </div>
            ))}
            <div className="row-between">
              <span className="small muted">Operación</span>
              <strong className="small">{opRef}</strong>
            </div>
          </div>
          <p className="tiny muted">El comprobante aparecerá en “Mis pagos”.</p>
        </div>
      )}

      {stage === 'form' && (
        <form onSubmit={submit} noValidate>
          <div className="gw-summary">
            {label && (
              <div className="row-between">
                <span className="small muted">Concepto</span>
                <strong>{label} · {fmtPrice(amount)}</strong>
              </div>
            )}
            {rows.map((r) => (
              <div key={r.label} className="row-between">
                <span className="small muted">{r.label}</span>
                <strong className="small">{r.value}</strong>
              </div>
            ))}
          </div>

          <div className="gw-card">
            <div className="gw-card-brand">
              <IconCreditCard size={20} />
              <span className="bold">{brand}</span>
              <span className="gw-card-chip" />
            </div>
            <div className="gw-card-row">
              <div className="field grow">
                <label className="field-label">Titular de la tarjeta</label>
                <input
                  className="input"
                  placeholder="NOMBRE Y APELLIDOS"
                  value={card.name}
                  onChange={setField('name')}
                  autoComplete="off"
                />
                {errors.name && <p className="field-msg field-msg-error">{errors.name}</p>}
              </div>
            </div>
            <div className="gw-card-row">
              <div className="field grow">
                <label className="field-label">Número de tarjeta</label>
                <input
                  className={`input ${card.number ? 'gw-num-valid' : ''}`}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  value={card.number}
                  onChange={setField('number')}
                  autoComplete="off"
                />
                {errors.number && <p className="field-msg field-msg-error">{errors.number}</p>}
              </div>
            </div>
            <div className="gw-card-row gw-card-cols">
              <div className="field">
                <label className="field-label">Vencimiento</label>
                <input className="input" placeholder="MM/AA" inputMode="numeric" value={card.exp} onChange={setField('exp')} autoComplete="off" />
                {errors.exp && <p className="field-msg field-msg-error">{errors.exp}</p>}
              </div>
              <div className="field">
                <label className="field-label">CVV</label>
                <input className="input" placeholder="•••" inputMode="numeric" type="password" value={card.cvv} onChange={setField('cvv')} autoComplete="off" />
                {errors.cvv && <p className="field-msg field-msg-error">{errors.cvv}</p>}
              </div>
            </div>
          </div>

          <div className="gw-secure">
            <IconLock size={14} />
            <span className="tiny muted">Simulación: tus datos no se envían a ningún banco.</span>
            <IconShield size={14} />
          </div>
        </form>
      )}
    </Modal>
  )
}
