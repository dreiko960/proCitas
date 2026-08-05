import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StepIndicator } from '../../components/ui/Misc'
import { Input, Select, Checkbox } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Misc'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, fmtDate, fmtDateFull, fmtPrice } from '../../utils/helpers'
import { IconSearch, IconUserPlus, IconChevronLeft, IconChevronRight, IconCalendarCheck, IconCheck, IconPhone, IconUser, IconMail } from '../../components/Icons'
import './NewAppointment.css'

const WEEK = [
  { date: '2026-08-05', label: 'Hoy' },
  { date: '2026-08-06', label: 'Mañana' },
  { date: '2026-08-07', label: 'Vie' },
  { date: '2026-08-08', label: 'Sáb' },
]

export default function ReceptionNewAppointment() {
  const { patients, doctors, specialties, appointments, bookAppointment, addPayment } = useApp()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [q, setQ] = useState('')
  const [patientId, setPatientId] = useState('')
  const [quickCreate, setQuickCreate] = useState(false)
  const [np, setNp] = useState({ name: '', dni: '', phone: '' })
  const [npErr, setNpErr] = useState({})
  const [specialtyId, setSpecialtyId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [day, setDay] = useState('2026-08-06')
  const [slot, setSlot] = useState(null)
  const [payNow, setPayNow] = useState(false)
  const [done, setDone] = useState(null)

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return patients.filter((p) => p.name.toLowerCase().includes(t) || p.dni.includes(t)).slice(0, 4)
  }, [q, patients])

  const specDoctors = useMemo(() => doctors.filter((d) => d.specialtyId === specialtyId), [doctors, specialtyId])
  const doctor = findDoctor(doctors, doctorId)
  const spec = findSpecialty(specialties, specialtyId)

  const takenKeys = useMemo(() => {
    const s = new Set()
    appointments.filter((a) => a.status !== 'cancelada').forEach((a) => s.add(`${a.doctorId}|${a.date}|${a.time}`))
    return s
  }, [appointments])

  const daySlots = useMemo(() => {
    const doc = findDoctor(doctors, doctorId)
    if (!doc) return []
    return doc.slots.filter((s) => s.day === day && !takenKeys.has(`${doctorId}|${day}|${s.start}`))
  }, [doctorId, day, doctors, appointments, takenKeys])

  const createPatient = () => {
    const err = {}
    if (np.name.trim().length < 5) err.name = 'Nombre incompleto'
    if (!/^\d{8}$/.test(np.dni)) err.dni = '8 dígitos'
    if (!/^\d{9}$/.test(np.phone)) err.phone = '9 dígitos'
    setNpErr(err)
    if (Object.keys(err).length) return false
    toast(`Paciente ${np.name} registrado de forma rápida`, { type: 'success', title: 'Alta rápida' })
    return true
  }

  const submit = () => {
    const pid = patientId || 'new-' + np.dni
    const id = bookAppointment({
      patientId: pid, doctorId, specialtyId,
      date: slot.date, time: slot.time, duration: 30, status: 'confirmada',
      reason: 'Cita registrada por recepción (telefónica o presencial)',
    })
    if (payNow) {
      addPayment({ appointmentId: id, patientId: pid, amount: spec.price, method: 'Efectivo', status: 'pagado', verifiedBy: 'Sofía Mendoza' })
    }
    setDone(id)
    toast(payNow ? 'Cita creada y pago registrado al instante.' : 'Cita creada. Recuerda cobrar en recepción.', { type: 'success', title: 'Cita registrada' })
  }

  if (done) {
    return (
      <div className="anim-in">
        <PageHeader title="Cita registrada" />
        <Card className="done-card">
          <span className="done-icon"><IconCheck size={34} /></span>
          <h2>Cita creada a nombre del paciente</h2>
          <div className="done-summary">
            <div><span>Paciente</span><strong>{patientId.startsWith('new') ? np.name : findPatientName(patientId)}</strong></div>
            <div><span>Médico</span><strong>{doctor.name}</strong></div>
            <div><span>Fecha y hora</span><strong>{fmtDateFull(slot.date)} · {slot.time}</strong></div>
            <div><span>Pago</span><strong>{payNow ? `Pagado en línea (${fmtPrice(spec.price)})` : 'Pendiente en recepción'}</strong></div>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => navigate('/recepcion')}>Ver agenda del día</Button>
            <Button variant="ghost" onClick={() => navigate('/recepcion/pago')}>Registrar pago</Button>
          </div>
        </Card>
      </div>
    )
  }

  const findPatientName = (pid) => patients.find((p) => p.id === pid)?.name || ''

  return (
    <div className="anim-in">
      <PageHeader title="Registrar cita" subtitle="Para pacientes que llaman o llegan presencialmente." back="/recepcion" />
      <StepIndicator steps={['Paciente', 'Especialidad y médico', 'Horario y confirmar']} current={step - 1} />

      <div className="book-stage mt-3">
        {/* ——— Paso 1: paciente ——— */}
        {step === 1 && (
          <div className="anim-in">
            {!quickCreate ? (
              <Card className="pat-search-card">
                <Input
                  label="Buscar paciente (nombre o DNI)"
                  icon={IconSearch}
                  placeholder="Ej. Julia Mamani o 45123876"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {q && results.length === 0 && <p className="small muted mt-2">Sin coincidencias. Puedes dar de alta a un paciente nuevo.</p>}
                {results.length > 0 && (
                  <div className="pat-results">
                    {results.map((p) => (
                      <button key={p.id} className={`pat-result ${patientId === p.id ? 'pat-result-selected' : ''}`} onClick={() => setPatientId(p.id)}>
                        <Avatar name={p.name} initials={p.initials} size={40} />
                        <div className="grow">
                          <p className="bold">{p.name}</p>
                          <p className="tiny muted">DNI {p.dni} · {p.phone}</p>
                        </div>
                        {patientId === p.id && <span className="pat-check"><IconCheck size={15} /></span>}
                      </button>
                    ))}
                  </div>
                )}
                <button className="quick-create-link" onClick={() => setQuickCreate(true)}>
                  <IconUserPlus size={18} /> ¿El paciente no existe? Crea una cuenta rápida
                </button>
              </Card>
            ) : (
              <Card className="pat-quick-card anim-in">
                <div className="row-between mb-2">
                  <h3 className="bold">Alta rápida de paciente</h3>
                  <Button variant="text" size="sm" onClick={() => { setQuickCreate(false); setNp({ name: '', dni: '', phone: '' }) }}>Cancelar alta</Button>
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Input label="Nombre completo" required icon={IconUser} value={np.name} onChange={(e) => setNp((f) => ({ ...f, name: e.target.value }))} error={npErr.name} />
                  <Input label="DNI" required icon={IconUser} maxLength={8} value={np.dni} onChange={(e) => setNp((f) => ({ ...f, dni: e.target.value }))} error={npErr.dni} />
                  <Input label="Celular" required icon={IconPhone} maxLength={9} value={np.phone} onChange={(e) => setNp((f) => ({ ...f, phone: e.target.value }))} error={npErr.phone} />
                  <Input label="Correo (opcional)" type="email" icon={IconMail} value={np.email || ''} onChange={(e) => setNp((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </Card>
            )}
            <div className="book-nav">
              <Button variant="ghost" onClick={() => navigate('/recepcion')}>Cancelar</Button>
              <Button variant="primary" size="lg" icon={IconChevronRight} disabled={!quickCreate && !patientId} onClick={() => {
                if (quickCreate && !createPatient()) return
                setStep(2)
              }}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ——— Paso 2: especialidad + médico ——— */}
        {step === 2 && (
          <div className="anim-in">
            <div className="spec-pick-grid">
              {specialties.map((s) => (
                <button key={s.id} className={`spec-opt ${specialtyId === s.id ? 'spec-opt-selected' : ''}`} onClick={() => setSpecialtyId(s.id)}>
                  <span className="spec-opt-icon"><IconCalendarCheck size={24} /></span>
                  <span className="bold">{s.name}</span>
                  <small className="muted">{s.desc}</small>
                  <span className="spec-opt-price">{fmtPrice(s.price)}</span>
                </button>
              ))}
            </div>
            {specialtyId && (
              <div className="doctor-pick-list mt-3">
                {specDoctors.map((d) => (
                  <button key={d.id} className={`doc-row ${doctorId === d.id ? 'doc-row-selected' : ''}`} onClick={() => setDoctorId(d.id)}>
                    <Avatar name={d.name} initials={d.initials} size={48} />
                    <div className="grow"><p className="bold">{d.name}</p><p className="small muted">★ {d.rating} · {d.bio}</p></div>
                    {doctorId === d.id && <span className="doc-selected-badge"><IconCheck size={15} /> Elegido</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="book-nav">
              <Button variant="ghost" onClick={() => setStep(1)} icon={IconChevronLeft}>Paciente</Button>
              <Button variant="primary" size="lg" icon={IconChevronRight} disabled={!doctorId} onClick={() => setStep(3)}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ——— Paso 3: horario + confirmar ——— */}
        {step === 3 && (
          <div className="anim-in">
            <Card className="calendar-card">
              <div className="week-tabs">
                {WEEK.map((w) => (
                  <button key={w.date} className={`week-tab ${day === w.date ? 'week-tab-active' : ''}`} onClick={() => setDay(w.date)}>
                    <span className="week-tab-label">{w.label}</span>
                    <span className="week-tab-date">{new Date(w.date + 'T00:00:00').getDate()}</span>
                  </button>
                ))}
              </div>
              <div className="day-slots">
                {daySlots.map((s) => (
                  <button key={s.start} className={`slot-btn ${slot?.date === day && slot?.time === s.start ? 'slot-btn-selected' : ''}`} onClick={() => setSlot({ date: day, time: s.start })}>
                    <span className="slot-btn-time">{s.start}</span>
                    <span className="slot-btn-free">Libre</span>
                  </button>
                ))}
                {daySlots.length === 0 && <p className="day-empty">Sin horarios libres este día.</p>}
              </div>
            </Card>

            {slot && doctor && spec && (
              <Card className="confirm-card mt-2 anim-in">
                <div className="row-between mb-1">
                  <h3 className="bold">Confirmar cita</h3>
                  <span className="small muted">Paciente: <strong>{quickCreate ? np.name : findPatientName(patientId)}</strong></span>
                </div>
                <div className="confirm-rows">
                  <div className="confirm-row"><span className="muted">Especialidad</span><strong>{spec.name}</strong></div>
                  <div className="confirm-row"><span className="muted">Médico</span><strong>{doctor.name}</strong></div>
                  <div className="confirm-row"><span className="muted">Horario</span><strong>{fmtDateFull(slot.date)} · {slot.time}</strong></div>
                  <div className="confirm-row"><span className="muted">Costo</span><strong>{fmtPrice(spec.price)}</strong></div>
                </div>
                <Checkbox
                  label="Registrar el pago ahora (efectivo / yape) y generar comprobante al instante"
                  checked={payNow}
                  onChange={setPayNow}
                />
                <div className="row mt-2" style={{ justifyContent: 'space-between' }}>
                  <Button variant="ghost" onClick={() => setStep(2)} icon={IconChevronLeft}>Atrás</Button>
                  <Button variant="primary" size="lg" icon={IconCalendarCheck} onClick={submit}>Confirmar y crear cita</Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
