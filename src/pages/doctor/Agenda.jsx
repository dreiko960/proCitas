import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Misc'
import { Segmented } from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio, fmtDateFull } from '../../utils/helpers'
import { IconRefresh, IconCalendarX, IconClock, IconStethoscope, IconCheckCircle, IconPlus, IconMapPin, IconActivity } from '../../components/Icons'
import './Agenda.css'

const HOURS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
const EN_ROUTE = ['check_in', 'en_espera_triaje', 'en_triaje']

export default function DoctorAgenda() {
  const { appointments, doctors, patients, specialties, consultorios, auth, updateAppointment, startAttention } = useApp()
  const toast = useToast()
  const [day, setDay] = useState('2026-08-05')
  const [filter, setFilter] = useState('todos')
  const [target, setTarget] = useState(null)
  const [flash, setFlash] = useState(null)

  const myId = 'd1'
  const me = findDoctor(doctors, myId)
  const room = findConsultorio(consultorios, me?.consultorioId)

  const dayAppts = appointments
    .filter((a) => a.doctorId === myId && a.date === day && a.status !== 'cancelada')
    .sort((a, b) => (a.time < b.time ? -1 : 1))

  const enRoute = dayAppts.filter((a) => EN_ROUTE.includes(a.status)).length
  const porAtender = dayAppts.filter((a) => a.status === 'triaje_completado').length

  const confirmAttention = (a) => {
    startAttention(a.id)
    setTarget(null)
    toast(`Paciente ${findPatient(patients, a.patientId)?.name} en atención.`, { type: 'success', title: 'Atención iniciada' })
  }

  const simulateCancellation = (a) => {
    updateAppointment(a.id, { status: 'cancelada' }, { user: 'paciente', action: 'Cita cancelada en vivo', detail: `Cita ${a.id} cancelada mientras el médico revisaba la agenda`, sev: 'warning', icon: 'x' })
    setFlash(a.id)
    toast('Un paciente canceló su cita. La agenda se actualizó en vivo.', { type: 'info', title: 'Actualización en tiempo real' })
    setTimeout(() => setFlash(null), 4000)
  }

  const filtered = filter === 'todos'
    ? dayAppts
    : filter === 'en_camino' ? dayAppts.filter((a) => EN_ROUTE.includes(a.status))
    : dayAppts.filter((a) => a.status === filter)

  return (
    <div className="anim-in">
      <PageHeader
        title="Agenda del día"
        subtitle={`Miércoles 05 de agosto · ${room?.nombre} (${room?.piso}) · ${dayAppts.length} citas programadas`}
        action={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'todos', label: `Todos (${dayAppts.length})` },
              { value: 'en_camino', label: `En camino (${enRoute})` },
              { value: 'triaje_completado', label: `Por atender (${porAtender})` },
              { value: 'en_atencion', label: 'En atención' },
              { value: 'documentada', label: 'Documentadas' },
            ]}
          />
        }
      />

      <div className="agenda-toolbar">
        <Button variant="ghost" size="sm" icon={IconRefresh} onClick={() => { toast('Agenda sincronizada con el servidor', { type: 'info', title: 'Actualizada' }) }}>Sincronizar</Button>
        <span className="live-chip"><span className="live-dot" /> En vivo</span>
      </div>

      {(enRoute > 0 || porAtender > 0) && (
        <div className="agenda-queue-banner">
          <span className="row" style={{ gap: 8 }}><IconActivity size={16} /> {enRoute} en triaje/en camino</span>
          <span className="agenda-queue-sep">·</span>
          <span className="row" style={{ gap: 8 }}><IconStethoscope size={16} /> {porAtender} listos para atender</span>
        </div>
      )}

      <div className="timeline">
        {HOURS.map((h) => {
          const appts = filtered.filter((a) => a.time.startsWith(h.slice(0, 2)))
          return (
            <div key={h} className={`tl-row ${appts.length ? 'tl-row-has' : ''}`}>
              <span className="tl-hour">{h}</span>
              <div className="tl-hour-body">
                {appts.map((a) => {
                  const patient = findPatient(patients, a.patientId)
                  const spec = findSpecialty(specialties, a.specialtyId)
                  const isFlash = flash === a.id
                  const route = EN_ROUTE.includes(a.status)
                  return (
                    <div key={a.id} className={`tl-block ${route ? 'tl-block-route' : ''} status-${a.status} ${isFlash ? 'tl-block-flash' : ''}`}>
                      <div className="tl-block-top">
                        <span className="tl-block-time">{a.time} · {a.duration} min · {room?.nombre}</span>
                        <Badge status={a.status} />
                      </div>
                      <div className="row" style={{ gap: 10 }}>
                        <Avatar name={patient?.name} initials={patient?.initials} size={34} />
                        <div className="grow">
                          <p className="bold">{patient?.name}</p>
                          <p className="small muted">{a.reason}</p>
                        </div>
                      </div>
                      {route && (
                        <div className="tl-route-chip">
                          <IconClock size={14} /> En camino · te avisaremos cuando llegue a la puerta del consultorio
                        </div>
                      )}
                      {a.status === 'agendada' && (
                        <p className="tiny muted"><IconMapPin size={12} style={{ verticalAlign: '-2px' }} /> Esperando pago en caja</p>
                      )}
                      {isFlash && (
                        <div className="tl-flash-banner">
                          <IconCalendarX size={15} /> Cita cancelada ahora mismo · horario liberado
                        </div>
                      )}
                      <div className="tl-block-actions">
                        <Link to={`/medico/paciente/${a.patientId}`}><Button variant="ghost" size="sm">Ver historial</Button></Link>
                        {a.status === 'triaje_completado' && (
                          <Button variant="accent" size="sm" icon={IconCheckCircle} onClick={() => setTarget(a)}>Iniciar atención</Button>
                        )}
                        {a.status === 'en_atencion' && (
                          <Link to={`/medico/diagnostico/${a.id}`}><Button variant="primary" size="sm" icon={IconStethoscope}>Registrar diagnóstico</Button></Link>
                        )}
                        {!route && a.status !== 'documentada' && a.status !== 'en_atencion' && a.status !== 'triaje_completado' && (
                          <button className="sim-cancel" onClick={() => simulateCancellation(a)} title="Simular cancelación en vivo">
                            Simular cancelación en vivo
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {appts.length === 0 && <span className="tl-empty">Sin citas</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* ——— Stats resumen ——— */}
      <div className="agenda-stats">
        <div><strong>{enRoute}</strong><span>En triaje / camino</span></div>
        <div><strong>{porAtender}</strong><span>Por atender</span></div>
        <div><strong>{dayAppts.filter((a) => a.status === 'en_atencion').length}</strong><span>En atención</span></div>
        <div><strong>{dayAppts.filter((a) => a.status === 'documentada').length}</strong><span>Documentadas</span></div>
      </div>

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Iniciar atención"
        tone="accent"
        icon={IconStethoscope}
        size="sm"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setTarget(null)}>Volver</Button>
            <Button variant="accent" onClick={() => confirmAttention(target)}>Iniciar atención</Button>
          </div>
        }
      >
        {target && (
          <p>
            Vas a iniciar la atención de <strong>{findPatient(patients, target.patientId)?.name}</strong>
            ({fmtDateFull(target.date)} · {target.time} · {room?.nombre}). El triaje de enfermería ya está listo.
          </p>
        )}
      </Modal>
    </div>
  )
}
