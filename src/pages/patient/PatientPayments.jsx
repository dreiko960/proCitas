import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Select, Input } from '../../components/ui/Field'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, fmtPrice, fmtPayType } from '../../utils/helpers'
import { IconWallet, IconPdf, IconDownload, IconUpload, IconClock, IconCheckCircleFilled } from '../../components/Icons'
import './Payments.css'

export default function PatientPayments() {
  const { payments, appointments, doctors, specialties, auth, addPayment, updateAppointment } = useApp()
  const toast = useToast()
  const mine = payments.filter((p) => p.patientId === auth.user.id)
  const [declareOpen, setDeclareOpen] = useState(false)
  const [method, setMethod] = useState('Yape')
  const [amount, setAmount] = useState('')
  const [ref, setRef] = useState('')
  const [payType, setPayType] = useState('total')
  const [errors, setErrors] = useState({})

  const unpaidAppointments = appointments.filter((a) =>
    a.patientId === auth.user.id &&
    ['confirmada', 'reprogramada', 'agendada'].includes(a.status) &&
    !payments.some((p) => p.appointmentId === a.id && p.status === 'pagado')
  )

  const [targetAppt, setTargetAppt] = useState('')

  const openDeclare = () => {
    const first = unpaidAppointments[0]
    setTargetAppt(first?.id || '')
    const firstPrice = findSpecialty(specialties, first?.specialtyId)?.price || 0
    setAmount(first ? String(firstPrice) : '')
    setPayType('total')
    setMethod('Yape')
    setRef('')
    setErrors({})
    setDeclareOpen(true)
  }

  const pickDeclareType = (t) => {
    setPayType(t)
    const appt = appointments.find((a) => a.id === targetAppt)
    const price = findSpecialty(specialties, appt?.specialtyId)?.price || 0
    setAmount(String(t === 'adelanto' ? Math.round(price / 2) : price))
  }

  const submitDeclare = (e) => {
    e.preventDefault()
    const err = {}
    if (!targetAppt) err.target = 'Selecciona la cita que pagas'
    if (!amount || Number(amount) <= 0) err.amount = 'Ingresa un monto válido'
    if (!ref.trim()) err.ref = 'Ingresa el código de operación'
    setErrors(err)
    if (Object.keys(err).length) {
      toast('Revisa los campos en rojo', { type: 'error', title: 'Declaración incompleta' })
      return
    }
    const appt = appointments.find((a) => a.id === targetAppt)
    const spec = findSpecialty(specialties, appt.specialtyId)
    addPayment({ appointmentId: targetAppt, patientId: auth.user.id, amount: Number(amount), method, status: 'pendiente_verificacion', opRef: ref, paidType: payType })
    updateAppointment(targetAppt, {}, null)
    setDeclareOpen(false)
    toast('Declaración enviada a recepción. Verificaremos en menos de 15 minutos.', { type: 'success', title: 'Pago en verificación' })
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Mis pagos"
        subtitle="Comprobantes, declaraciones y estados de verificación."
        action={
          unpaidAppointments.length > 0 && (
            <Button variant="accent" icon={IconUpload} onClick={openDeclare}>Declarar pago</Button>
          )
        }
      />

      {mine.length === 0 ? (
        <EmptyState icon={IconWallet} title="Aún no tienes pagos" message="Cuando reserves citas, aquí aparecerán tus comprobantes y podrás declarar tus pagos." />
      ) : (
        <div className="pay-list">
          {mine.map((p) => {
            const appt = appointments.find((a) => a.id === p.appointmentId)
            const spec = findSpecialty(specialties, appt?.specialtyId)
            return (
              <Card key={p.id} className="pay-card">
                <div className="pay-head">
                  <span className="pay-icon"><IconWallet size={20} /></span>
                  <div className="grow">
                    <p className="bold">
                      {spec?.name} · {fmtPrice(p.amount)}
                      {p.paidType && <span className="pay-type-chip">{fmtPayType(p.paidType)}</span>}
                    </p>
                    <p className="small muted">{appt ? `${findDoctor(doctors, appt.doctorId)?.name} · ${appt.date} ${appt.time}` : p.id} · {p.date}</p>
                    {p.opRef && <p className="tiny muted">Operación {p.method}: {p.opRef}</p>}
                  </div>
                  <Badge status={p.status} />
                </div>
                <div className="pay-foot">
                  <span className="small muted">{p.id} · {p.method}</span>
                  {p.status === 'pagado' ? (
                    <Button variant="outline" size="sm" icon={IconPdf} onClick={() => toast(`Descargando comprobante ${p.receipt}.pdf…`, { type: 'info' })}>
                      {p.receipt}
                    </Button>
                  ) : (
                    <span className="pay-pending-note">
                      <IconClock size={14} /> Recepción verifica tu pago…
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ——— Modal declarar pago ——— */}
      <Modal
        open={declareOpen}
        onClose={() => setDeclareOpen(false)}
        title="Declarar pago"
        subtitle="Registra tu pago y recepción lo verificará."
        tone="primary"
        icon={IconUpload}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDeclareOpen(false)}>Cancelar</Button>
            <Button variant="primary" icon={IconCheckCircleFilled} onClick={submitDeclare}>Enviar declaración</Button>
          </div>
        }
      >
        <form onSubmit={submitDeclare} noValidate>
          <div className="grid" style={{ gap: 14 }}>
            <div className="field">
              <label className="field-label">Cita a pagar</label>
              <select className="input select" value={targetAppt} onChange={(e) => { setTargetAppt(e.target.value); const a = appointments.find((x) => x.id === e.target.value); if (a) setAmount(String(findSpecialty(specialties, a.specialtyId)?.price || '')) }}>
                <option value="">Selecciona…</option>
                {unpaidAppointments.map((a) => (
                  <option key={a.id} value={a.id}>{a.id} · {findSpecialty(specialties, a.specialtyId)?.name} · {a.date} {a.time}</option>
                ))}
              </select>
              {errors.target && <p className="field-msg field-msg-error">{errors.target}</p>}
            </div>
            <div className="field">
              <label className="field-label">¿Cuánto pagas?</label>
              <div className="pay-declare-type">
                <button
                  type="button"
                  className={`pay-declare-opt ${payType === 'adelanto' ? 'pay-declare-opt-selected' : ''}`}
                  onClick={() => pickDeclareType('adelanto')}
                >
                  <strong>Abono 50%</strong>
                  <small className="muted">La mitad ahora; el resto en caja.</small>
                </button>
                <button
                  type="button"
                  className={`pay-declare-opt ${payType === 'total' ? 'pay-declare-opt-selected' : ''}`}
                  onClick={() => pickDeclareType('total')}
                >
                  <strong>Pago total 100%</strong>
                  <small className="muted">Todo el costo de la cita.</small>
                </button>
              </div>
            </div>
            <Input label="Monto (S/)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} hint="Prellenado según especialidad y tipo de pago, editable." />
            <Select label="Método de pago" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Yape</option>
              <option>Plin</option>
              <option>Transferencia</option>
              <option>Efectivo (recepción)</option>
            </Select>
            <Input label="Código de operación" placeholder="Ej. YPE-482913" value={ref} onChange={(e) => setRef(e.target.value)} error={errors.ref} hint="Aparece en tu app de pago." />
          </div>
          <div className="pay-declare-note">
            <IconClock size={16} />
            <p className="small">Tu pago quedará como <strong>pendiente de verificación</strong> (ámbar) hasta que recepción lo confirme. Luego pasa a <strong>pagado</strong> y podrás descargar el comprobante PDF.</p>
          </div>
        </form>
      </Modal>
    </div>
  )
}
