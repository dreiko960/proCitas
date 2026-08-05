import React, { useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Input } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Misc'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio } from '../../utils/helpers'
import { IconSearch, IconCheckCircle, IconFirstAid, IconClock, IconMapPin } from '../../components/Icons'

export default function ReceptionCheckin() {
  const { appointments, patients, doctors, specialties, consultorios, sendToTriage } = useApp()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [doneIds, setDoneIds] = useState([])

  const todayAppts = useMemo(() => {
    const t = q.trim().toLowerCase()
    return appointments
      .filter((a) => a.date === '2026-08-05' && a.status !== 'cancelada')
      .filter((a) => {
        const p = findPatient(patients, a.patientId)
        return !t || (p && (p.name.toLowerCase().includes(t) || p.dni.includes(t) || a.id.toLowerCase().includes(t)))
      })
      .sort((a, b) => (a.time < b.time ? -1 : 1))
  }, [q, appointments, patients])

  const canCheckIn = (a) => a.status === 'pagada'
  const alreadySent = (a) => ['check_in', 'en_espera_triaje', 'en_triaje', 'triaje_completado', 'en_atencion'].includes(a.status)

  const mark = (a) => {
    const patient = findPatient(patients, a.patientId)
    const doctor = findDoctor(doctors, a.doctorId)
    const room = findConsultorio(consultorios, doctor?.consultorioId)
    sendToTriage(a.id, patient?.name, room?.nombre || 'Consultorio')
    setDoneIds((d) => [...d, a.id])
    toast(`${patient?.name} enviado a Triaje — ${room?.nombre}.`, { type: 'success', title: 'Check-in registrado' })
  }

  return (
    <div className="anim-in">
      <PageHeader title="Check-in presencial" subtitle="Marca la llegada de pacientes que ya pagaron. El check-in los envía a la cola de triaje de su consultorio." />
      <div className="row" style={{ maxWidth: 520 }}>
        <Input
          icon={IconSearch}
          placeholder="Buscar por nombre, DNI o N° de cita (C-1042)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="rec-citas mt-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--surface)' }}>
        {todayAppts.length === 0 && (
          <EmptyState small icon={IconClock} title="Sin citas para hoy" message="No se encontraron citas con esos criterios." />
        )}
        {todayAppts.map((a) => {
          const patient = findPatient(patients, a.patientId)
          const spec = findSpecialty(specialties, a.specialtyId)
          const doctor = findDoctor(doctors, a.doctorId)
          const room = findConsultorio(consultorios, doctor?.consultorioId)
          const done = doneIds.includes(a.id)
          const sent = alreadySent(a)
          return (
            <div key={a.id} className={`rec-cita ${done || sent ? 'rec-cita-checked' : ''}`}>
              <Avatar name={patient?.name} initials={patient?.initials} size={40} />
              <span className="rec-cita-time">{a.time}</span>
              <div className="grow">
                <p className="bold small">{patient?.name}</p>
                <p className="tiny muted">
                  {spec?.name} · {doctor?.name} · {a.id}
                  {room && <span className="row" style={{ gap: 4, marginTop: 2 }}><IconMapPin size={12} /> {room.nombre} · {room.piso}</span>}
                </p>
              </div>
              {done || sent ? (
                <span className="row" style={{ color: 'var(--success)', fontWeight: 800, fontSize: 'var(--fs-sm)' }}>
                  <IconCheckCircle size={18} /> En triaje
                </span>
              ) : canCheckIn(a) ? (
                <Button variant="accent" size="sm" icon={IconFirstAid} onClick={() => mark(a)}>Llegó · enviar a Triaje</Button>
              ) : a.status === 'agendada' ? (
                <span className="row" style={{ color: 'var(--warning)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>
                  <IconClock size={16} /> Esperando pago
                </span>
              ) : (
                <Badge status={a.status} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
