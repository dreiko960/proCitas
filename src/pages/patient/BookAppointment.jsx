import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { StepIndicator } from '../../components/ui/Misc'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Textarea, Input } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { SpecialtyIcon, findDoctor, findSpecialty, findConsultorio, consultorioOf, fmtDate, fmtDateFull, fmtPrice } from '../../utils/helpers'
import {
  IconChevronLeft, IconChevronRight, IconCalendar, IconClock, IconCheck, IconAlertTriangle,
  IconRefresh, IconUser, IconCalendarCheck, IconStar,
} from '../../components/Icons'
import './BookAppointment.css'

const WEEK = [
  { date: '2026-08-05', label: 'Hoy' },
  { date: '2026-08-06', label: 'Mañana' },
  { date: '2026-08-07', label: 'Vie' },
  { date: '2026-08-08', label: 'Sáb' },
  { date: '2026-08-09', label: 'Dom' },
  { date: '2026-08-10', label: 'Lun' },
  { date: '2026-08-11', label: 'Mar' },
]

export default function PatientBook() {
  const { doctors, specialties, appointments, consultorios, bookAppointment, auth } = useApp()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [specialtyId, setSpecialtyId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [activeDay, setActiveDay] = useState('2026-08-06')
  const [slot, setSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [simulateConflict, setSimulateConflict] = useState(false)
  const [conflict, setConflict] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(null)

  const specDoctors = useMemo(() => doctors.filter((d) => d.specialtyId === specialtyId), [doctors, specialtyId])
  const doctor = findDoctor(doctors, doctorId)
  const spec = findSpecialty(specialties, specialtyId)

  const takenKeys = useMemo(() => {
    const s = new Set()
    appointments.filter((a) => a.status !== 'cancelada').forEach((a) => s.add(`${a.doctorId}|${a.date}|${a.time}`))
    return s
  }, [appointments])

  const slotsOfDay = (docId, day) => {
    const doc = findDoctor(doctors, docId)
    if (!doc) return []
    return doc.slots.filter((s) => s.day === day && !takenKeys.has(`${docId}|${day}|${s.start}`))
  }

  const doctorSlotCount = (docId) => WEEK.reduce((n, w) => n + slotsOfDay(docId, w.date).length, 0)

  const book = () => {
    if (simulateConflict) {
      setConflict({ slot })
      setConfirmOpen(false)
      return
    }
    const id = bookAppointment({
      patientId: auth.user.id, doctorId, specialtyId,
      date: slot.date, time: slot.time, duration: 30, status: 'agendada',
      reason: reason || 'Consulta general',
    })
    setConfirmOpen(false)
    setDone(id)
    toast('Cita agendada. Realiza el pago en caja para activar tu check-in.', { type: 'success', title: '¡Cita reservada!' })
  }

  const alternativeSlots = useMemo(() => {
    if (!conflict) return []
    const alts = []
    for (const w of WEEK) {
      for (const s of slotsOfDay(doctorId, w.date)) {
        if (alts.length < 3) alts.push(s)
      }
    }
    return alts
  }, [conflict, doctorId, doctors, appointments])

  const pickAlt = (s) => {
    setSlot(s)
    setConflict(null)
    setSimulateConflict(false)
    setActiveDay(s.date)
    toast('Horario alternativo seleccionado', { type: 'info', title: 'Nuevo horario' })
  }

  if (done) {
    const room = consultorioOf(consultorios, doctors, doctorId)
    return (
      <div className="anim-in">
        <PageHeader title="Reserva confirmada" />
        <Card className="done-card">
          <span className="done-icon"><IconCheck size={34} /></span>
          <h2>Tu cita quedó agendada</h2>
          <p className="muted">El horario quedó bloqueado para ti. Paga en caja el mismo día para activar tu check-in.</p>
          <div className="done-summary">
            <div><span>Médico</span><strong>{doctor.name}</strong></div>
            <div><span>Especialidad</span><strong>{spec.name}</strong></div>
            <div><span>Consultorio</span><strong>{room?.nombre || '—'} · {room?.piso || ''}</strong></div>
            <div><span>Fecha</span><strong>{fmtDateFull(slot.date)}</strong></div>
            <div><span>Hora</span><strong>{slot.time} ({spec?.price && `Pago: ${fmtPrice(spec.price)}`})</strong></div>
            <div><span>Cita N°</span><strong>{done}</strong></div>
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
            <Link to="/paciente/citas"><Button variant="secondary" icon={IconCalendar}>Ver mis citas</Button></Link>
            <Link to="/paciente"><Button variant="primary" icon={IconUser}>Ir al inicio</Button></Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Reservar cita"
        subtitle="Tres pasos y tu consulta queda asegurada."
        back="/paciente"
      />
      <StepIndicator steps={['Especialidad', 'Médico y horario', 'Confirmar']} current={step - 1} />

      <div className="book-stage mt-3">
        {/* ——— Paso 1: Especialidad ——— */}
        {step === 1 && (
          <div className="spec-pick anim-in">
            <div className="spec-pick-grid">
              {specialties.map((s) => (
                <button
                  key={s.id}
                  className={`spec-opt ${specialtyId === s.id ? 'spec-opt-selected' : ''}`}
                  onClick={() => setSpecialtyId(s.id)}
                >
                  <span className="spec-opt-icon"><SpecialtyIcon id={s.id} size={26} /></span>
                  <span className="bold">{s.name}</span>
                  <small className="muted">{s.desc}</small>
                  <span className="spec-opt-price">{fmtPrice(s.price)}</span>
                  {specialtyId === s.id && <span className="spec-opt-check"><IconCheck size={14} /></span>}
                </button>
              ))}
            </div>
            <div className="book-nav">
              <Button variant="ghost" onClick={() => navigate('/paciente')}>Cancelar</Button>
              <Button variant="primary" size="lg" icon={IconChevronRight} disabled={!specialtyId} onClick={() => {
                const first = specDoctors[0]
                setDoctorId(first?.id)
                setStep(2)
                toast(`Especialidad seleccionada: ${findSpecialty(specialties, specialtyId)?.name}`, { type: 'info' })
              }}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ——— Paso 2: Médico y calendario semanal ——— */}
        {step === 2 && (
          <div className="anim-in">
            <div className="doctor-pick-list">
              {specDoctors.map((d) => {
                const selected = d.id === doctorId
                return (
                  <button key={d.id} className={`doc-row card-hover ${selected ? 'doc-row-selected' : ''}`} onClick={() => setDoctorId(d.id)}>
                    <Avatar name={d.name} initials={d.initials} size={52} />
                    <div className="grow doc-row-info">
                      <p className="bold">{d.name}</p>
                      <p className="small muted">★ {d.rating} · {d.exp} años de experiencia · {d.studies}</p>
                      <p className="doc-row-availability">
                        <span className={`slot-free-dot ${doctorSlotCount(d.id) ? '' : 'slot-zero'}`} />
                        {doctorSlotCount(d.id) ? `${doctorSlotCount(d.id)} horarios libres esta semana` : 'Sin disponibilidad esta semana'}
                      </p>
                    </div>
                    {selected && <span className="doc-selected-badge"><IconCheck size={15} /> Seleccionado</span>}
                  </button>
                )
              })}
            </div>

            {doctor && (
              <Card className="calendar-card mt-3">
                <div className="row-between mb-2">
                  <div>
                    <h3 className="bold">Calendario semanal de {doctor.name.split(' ')[0]}</h3>
                    <p className="small muted">Toca un horario libre para elegirlo</p>
                  </div>
                  <div className="calendar-legend">
                    <span className="legend-item"><span className="legend-dot dot-free" /> Libre</span>
                    <span className="legend-item"><span className="legend-dot dot-taken" /> Ocupado</span>
                    <span className="legend-item"><span className="legend-dot dot-selected" /> Elegido</span>
                  </div>
                </div>
                <div className="week-tabs">
                  {WEEK.map((w) => (
                    <button
                      key={w.date}
                      className={`week-tab ${activeDay === w.date ? 'week-tab-active' : ''}`}
                      onClick={() => setActiveDay(w.date)}
                    >
                      <span className="week-tab-label">{w.label}</span>
                      <span className="week-tab-date">{new Date(w.date + 'T00:00:00').getDate()}</span>
                    </button>
                  ))}
                </div>
                <div className="day-slots">
                  {slotsOfDay(doctorId, activeDay).map((s) => (
                    <button
                      key={s.start}
                      className={`slot-btn ${slot?.date === activeDay && slot?.time === s.start ? 'slot-btn-selected' : ''}`}
                      onClick={() => setSlot({ date: activeDay, time: s.start })}
                    >
                      <span className="slot-btn-time">{s.start}</span>
                      <span className="slot-btn-free">Libre</span>
                    </button>
                  ))}
                  {slotsOfDay(doctorId, activeDay).length === 0 && (
                    <div className="day-empty">Sin horarios libres este día · <span onClick={() => setActiveDay('2026-08-07')}>ver Viernes 07</span></div>
                  )}
                </div>
                <div className="book-nav">
                  <Button variant="ghost" onClick={() => setStep(1)} icon={IconChevronLeft}>Especialidad</Button>
                  <Button variant="primary" size="lg" icon={IconChevronRight} disabled={!slot} onClick={() => setStep(3)}>
                    Continuar con {slot ? `${fmtDate(slot.date)} ${slot.time}` : ''}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ——— Paso 3: Confirmación ——— */}
        {step === 3 && doctor && spec && slot && (
          <div className="anim-in">
            <div className="grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
              <Card className="confirm-card">
                <h3 className="bold mb-2">Resumen de tu reserva</h3>
                <div className="confirm-rows">
                  <div className="confirm-row"><span className="muted">Especialidad</span><strong>{spec.name}</strong></div>
                  <div className="confirm-row"><span className="muted">Médico</span><strong>{doctor.name}</strong></div>
                  <div className="confirm-row"><span className="muted">Fecha</span><strong>{fmtDateFull(slot.date)}</strong></div>
                  <div className="confirm-row"><span className="muted">Hora</span><strong>{slot.time} · 30 min</strong></div>
                  <div className="confirm-row"><span className="muted">Costo</span><strong>{fmtPrice(spec.price)}</strong></div>
                  <div className="confirm-row"><span className="muted">Ubicación</span><strong>{consultorioOf(consultorios, doctors, doctor.id)?.nombre} · {consultorioOf(consultorios, doctors, doctor.id)?.piso}</strong></div>
                </div>
                <Textarea
                  label="Motivo de consulta (opcional)"
                  placeholder="Ej. Dolor de cabeza desde hace 3 días…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  hint="Este texto lo verá tu médico antes de la consulta."
                />
                <label className={`conflict-toggle ${simulateConflict ? 'conflict-toggle-on' : ''}`}>
                  <input type="checkbox" checked={simulateConflict} onChange={(e) => setSimulateConflict(e.target.checked)} />
                  <IconAlertTriangle size={16} />
                  <div>
                    <p className="bold small">Simular conflicto de concurrencia</p>
                    <p className="tiny muted">Otro paciente “reserva” este horario justo antes que tú.</p>
                  </div>
                </label>
              </Card>

              <Card className="confirm-side">
                <h3 className="bold mb-2">Lo que debes saber</h3>
                <ul className="confirm-tips">
                  <li><IconClock size={15} /> Llega 10 minutos antes con tu DNI.</li>
                  <li><IconCalendar size={15} /> Puedes reprogramar hasta 12 horas antes sin costo.</li>
                  <li><IconCheck size={15} /> Realiza el pago en caja; sin pago no podrás hacer check-in.</li>
                </ul>
                <Button variant="primary" size="xl" full icon={IconCalendarCheck} onClick={() => setConfirmOpen(true)}>
                  Confirmar reserva
                </Button>
                <Button variant="ghost" full className="mt-1" onClick={() => setStep(2)} icon={IconChevronLeft}>Cambiar horario</Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ——— Modal de confirmación ——— */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={book}
        title="¿Confirmar esta reserva?"
        message={`Vas a reservar ${spec?.name} con ${doctor?.name} el ${fmtDateFull(slot?.date)} a las ${slot?.time}. El horario quedará bloqueado para ti.`}
        confirmLabel="Sí, confirmar cita"
        tone="primary"
        icon={IconCalendarCheck}
      />

      {/* ——— Conflicto de concurrencia (horario ya no disponible) ——— */}
      <Modal
        open={!!conflict}
        onClose={() => setConflict(null)}
        title="Este horario ya no está disponible"
        subtitle="Otro paciente lo reservó justo en este momento (bloqueo atómico)."
        tone="warning"
        icon={IconAlertTriangle}
        size="md"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => { setConflict(null); setStep(2) }}>Elegir otro día</Button>
            <Button variant="accent" icon={IconRefresh} onClick={() => pickAlt(alternativeSlots[0])}>
              Tomar alternativa sugerida
            </Button>
          </div>
        }
      >
        <div className="conflict-body">
          <div className="conflict-slot">
            <span className="muted">Horario solicitado</span>
            <strong>{fmtDateFull(conflict?.slot?.date)} · {conflict?.slot?.time}</strong>
            <Badge status="cancelada">Ya no disponible</Badge>
          </div>
          <p className="bold mt-2">Horarios alternativos libres</p>
          <div className="alt-slots">
            {alternativeSlots.map((s) => (
              <button key={s.date + s.time} className="alt-slot" onClick={() => pickAlt(s)}>
                <span><strong>{fmtDate(s.date)}</strong></span>
                <span className="alt-slot-time">{s.time}</span>
                <IconChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
