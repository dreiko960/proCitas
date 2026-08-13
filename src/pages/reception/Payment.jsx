import React, { useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Select, Input } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, fmtDateFull, fmtPrice, fmtPayType, paidTotalOf } from '../../utils/helpers'
import { IconWallet, IconCreditCard, IconPdf, IconDownload, IconCheckCircleFilled } from '../../components/Icons'
import './Payment.css'

export default function ReceptionPayment() {
  const { appointments, payments, patients, doctors, specialties, addPayment, updateAppointment } = useApp()
  const toast = useToast()
  const [apptId, setApptId] = useState('')
  const [method, setMethod] = useState('Efectivo')
  const [amount, setAmount] = useState('')
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [lastPayment, setLastPayment] = useState(null)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const [balanceAppt, setBalanceAppt] = useState(null)
  const [balanceMethod, setBalanceMethod] = useState('Efectivo')

  const payable = useMemo(() =>
    appointments.filter((a) => a.status === 'agendada' && a.date <= '2026-08-05' && !payments.some((p) => p.appointmentId === a.id && p.status === 'pagado'))
      .sort((a, b) => (a.time < b.time ? -1 : 1))
  , [appointments, payments])

  const partial = useMemo(() =>
    appointments.filter((a) => a.status === 'pagada' && a.paidType === 'adelanto' && paidTotalOf(a.id, payments) < (findSpecialty(specialties, a.specialtyId)?.price || 0))
      .sort((a, b) => (a.time < b.time ? -1 : 1))
  , [appointments, payments, specialties])

  const appt = appointments.find((a) => a.id === apptId)
  const spec = appt && findSpecialty(specialties, appt.specialtyId)

  const selectAppt = (id) => {
    setApptId(id)
    const a = appointments.find((x) => x.id === id)
    const s = a && findSpecialty(specialties, a.specialtyId)
    setAmount(String(s?.price || ''))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!apptId) { toast('Selecciona la cita a cobrar', { type: 'warning', title: 'Falta la cita' }); return }
    if (!amount || Number(amount) <= 0) { toast('Ingresa un monto válido', { type: 'error', title: 'Monto inválido' }); return }
    const payment = {
      appointmentId: apptId, patientId: appt.patientId, amount: Number(amount), method,
      status: 'pagado', paidType: 'total', verifiedBy: 'Sofía Mendoza', receipt: `R-2026-${800 + Math.floor(Math.random() * 900)}`,
    }
    addPayment(payment)
    updateAppointment(apptId, { status: 'pagada', paidType: 'total' })
    setLastPayment(payment)
    setReceiptOpen(true)
    toast('Pago registrado. La cita pasó a “pagada” y podrá hacer check-in.', { type: 'success', title: '¡Pago exitoso!' })
  }

  const openBalance = (a) => {
    setBalanceAppt(a)
    setBalanceMethod('Efectivo')
    setBalanceOpen(true)
  }

  const submitBalance = () => {
    const bSpec = findSpecialty(specialties, balanceAppt.specialtyId)
    const remaining = bSpec.price - paidTotalOf(balanceAppt.id, payments)
    addPayment({
      appointmentId: balanceAppt.id, patientId: balanceAppt.patientId, amount: remaining,
      method: balanceMethod, status: 'pagado', paidType: 'total', verifiedBy: 'Sofía Mendoza',
    })
    updateAppointment(balanceAppt.id, { paidType: 'total' })
    setBalanceOpen(false)
    toast(`Saldo de ${fmtPrice(remaining)} cobrado. La cita ${balanceAppt.id} quedó pagada al 100%.`, { type: 'success', title: 'Saldo completado' })
  }

  const pendingPayments = payments.filter((p) => p.status === 'pendiente_verificacion')

  return (
    <div className="anim-in">
      <PageHeader title="Registrar pago" subtitle="Cobra citas y genera el comprobante al instante." />

      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start', gap: 20 }}>
        <div className="pay-left">
          <Card className="pay-form-card">
            <form onSubmit={submit} noValidate>
            <div className="field mb-2">
              <label className="field-label">Cita a cobrar</label>
              <select className="input select" value={apptId} onChange={(e) => selectAppt(e.target.value)}>
                <option value="">Selecciona la cita…</option>
                {payable.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} · {findPatient(patients, a.patientId)?.name} · {findSpecialty(specialties, a.specialtyId)?.name} · {a.time}
                  </option>
                ))}
              </select>
            </div>

            {appt && spec && (
              <div className="pay-amount-box anim-in">
                <div className="row-between">
                  <span className="small muted">Paciente</span>
                  <strong>{findPatient(patients, appt.patientId)?.name}</strong>
                </div>
                <div className="row-between">
                  <span className="small muted">Servicio</span>
                  <strong>{spec.name} · {findDoctor(doctors, appt.doctorId)?.name}</strong>
                </div>
                <div className="row-between">
                  <span className="small muted">Fecha</span>
                  <strong>{fmtDateFull(appt.date)} · {appt.time}</strong>
                </div>
                <div className="divider" />
                <Input label="Monto (S/)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} hint="Prellenado según especialidad, editable." />
              </div>
            )}

            <Select label="Método de pago" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Efectivo</option>
              <option>Yape</option>
              <option>Plin</option>
              <option>Transferencia</option>
              <option>Tarjeta (POS)</option>
            </Select>

            <Button type="submit" variant="primary" size="xl" full className="mt-3" icon={IconWallet} disabled={!apptId}>
              Registrar pago y generar comprobante
            </Button>
          </form>
          </Card>

          {partial.length > 0 && (
            <Card className="pay-form-card">
              <p className="bold mb-1">Completar abonos 50% (pasarela en línea)</p>
              <p className="small muted mb-2">Estas citas se pagaron por la pasarela con un abono del 50%. Cobra el saldo restante para dejarlas al 100%.</p>
              <div className="pay-balance-list">
                {partial.map((a) => {
                  const bSpec = findSpecialty(specialties, a.specialtyId)
                  const paid = paidTotalOf(a.id, payments)
                  const remaining = (bSpec?.price || 0) - paid
                  return (
                    <div key={a.id} className="pay-balance-row">
                      <div className="grow">
                        <p className="small bold">{findPatient(patients, a.patientId)?.name}</p>
                        <p className="tiny muted">{bSpec?.name} · {fmtDateFull(a.date)} {a.time}</p>
                        <p className="tiny">
                          Total <strong>{fmtPrice(bSpec?.price || 0)}</strong> · Abonado <strong>{fmtPrice(paid)}</strong> · Saldo <strong className="text-danger">{fmtPrice(remaining)}</strong>
                        </p>
                      </div>
                      <Button variant="accent" size="sm" icon={IconWallet} onClick={() => openBalance(a)}>
                        Cobrar {fmtPrice(remaining)}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="pay-side">
          <Card className="pay-side-card">
            <p className="bold small mb-1">Pagos pendientes de verificación</p>
            {pendingPayments.length === 0 ? (
              <p className="small muted">No hay declaraciones pendientes. ¡Al día!</p>
            ) : (
              pendingPayments.map((p) => (
                <div key={p.id} className="row-between pay-pv-row">
                  <div>
                    <p className="small bold">{findPatient(patients, p.patientId)?.name}</p>
                    <p className="tiny muted">{p.method} · S/ {p.amount}</p>
                  </div>
                  <Badge status="pendiente_verificacion" />
                </div>
              ))
            )}
          </Card>
          <Card className="pay-side-card">
            <p className="bold small mb-1">Comprobante generado</p>
            <p className="tiny muted">Cada pago emite <strong>R-2026-XXXX</strong> en PDF con valor legal. Estado <Badge status="pagado" /> reflejado al instante en el panel del paciente.</p>
          </Card>
        </div>
      </div>

      {/* ——— Comprobante ——— */}
      <Modal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        title={`Comprobante ${lastPayment?.receipt}`}
        tone="success"
        icon={IconCheckCircleFilled}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setReceiptOpen(false)}>Cerrar</Button>
            <Button variant="primary" icon={IconPdf} onClick={() => toast('Descargando comprobante PDF…', { type: 'info' })}>Descargar PDF</Button>
          </div>
        }
      >
        {lastPayment && appt && (
          <div className="receipt">
            <div className="receipt-head">
              <p className="bold">CENTRO MÉDICO CMAS</p>
              <p className="tiny muted">Jr. Dos de Mayo 245 · Ayacucho · RUC 20451238741</p>
            </div>
            <div className="divider" />
            <div className="row-between"><span className="muted">N° Comprobante</span><strong>{lastPayment.receipt}</strong></div>
            <div className="row-between"><span className="muted">Paciente</span><strong>{findPatient(patients, appt.patientId)?.name}</strong></div>
            <div className="row-between"><span className="muted">Concepto</span><strong>{spec?.name}</strong></div>
            <div className="row-between"><span className="muted">Método</span><strong>{lastPayment.method}</strong></div>
            <div className="row-between"><span className="muted">Atendió</span><strong>{lastPayment.verifiedBy}</strong></div>
            <div className="divider" />
            <div className="row-between receipt-total"><span>Total</span><strong>S/ {lastPayment.amount}</strong></div>
            <p className="tiny muted center" style={{ marginTop: 10 }}>Documento emitido por sistema SGCM-CMAS</p>
          </div>
        )}
      </Modal>
      {/* ——— Cobrar saldo de abono 50% ——— */}
      <Modal
        open={balanceOpen}
        onClose={() => setBalanceOpen(false)}
        title="Cobrar saldo restante"
        subtitle="Completa el pago de la cita al 100%."
        tone="primary"
        icon={IconWallet}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setBalanceOpen(false)}>Cancelar</Button>
            <Button variant="primary" icon={IconCheckCircleFilled} onClick={submitBalance}>Registrar saldo</Button>
          </div>
        }
      >
        {balanceAppt && (() => {
          const bSpec = findSpecialty(specialties, balanceAppt.specialtyId)
          const paid = paidTotalOf(balanceAppt.id, payments)
          const remaining = (bSpec?.price || 0) - paid
          return (
            <div className="receipt">
              <div className="row-between"><span className="muted">Paciente</span><strong>{findPatient(patients, balanceAppt.patientId)?.name}</strong></div>
              <div className="row-between"><span className="muted">Servicio</span><strong>{bSpec?.name}</strong></div>
              <div className="row-between"><span className="muted">Total</span><strong>{fmtPrice(bSpec?.price || 0)}</strong></div>
              <div className="row-between"><span className="muted">Abonado (50%)</span><strong>{fmtPrice(paid)}</strong></div>
              <div className="divider" />
              <div className="row-between receipt-total"><span>Saldo a cobrar</span><strong>{fmtPrice(remaining)}</strong></div>
              <Select label="Método de pago" value={balanceMethod} onChange={(e) => setBalanceMethod(e.target.value)}>
                <option>Efectivo</option>
                <option>Yape</option>
                <option>Plin</option>
                <option>Transferencia</option>
                <option>Tarjeta (POS)</option>
              </Select>
              <p className="tiny muted">El abono del 50% ({fmtPayType('adelanto')}) ya fue pagado en línea; este saldo cierra el pago total de la cita.</p>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
