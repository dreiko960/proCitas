import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import { Select } from '../../components/ui/Field'
import { useApp } from '../../context/AppContext'
import { findPatient, findSpecialty, findConsultorio, fmtDate } from '../../utils/helpers'
import { IconMapPin } from '../../components/Icons'
import './Agenda.css'

const HOURS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

export default function ReceptionAgenda() {
  const { appointments, doctors, patients, specialties, consultorios } = useApp()
  const [doctorFilter, setDoctorFilter] = useState('')
  const [specFilter, setSpecFilter] = useState('')

  const filtered = appointments
    .filter((a) => a.date === '2026-08-05' && a.status !== 'cancelada')
    .filter((a) => !doctorFilter || a.doctorId === doctorFilter)
    .filter((a) => !specFilter || a.specialtyId === specFilter)
    .sort((a, b) => (a.time < b.time ? -1 : 1))

  const byDoctor = (did) => {
    const doc = doctors.find((d) => d.id === did)
    const appts = filtered.filter((a) => a.doctorId === did)
    return { doc, appts }
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Agenda general del día"
        subtitle="Vista consolidada de todos los médicos · Miércoles 05 de agosto"
        action={
          <div className="row">
            <Select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}>
              <option value="">Especialidad: todas</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
              <option value="">Médico: todos</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
        }
      />

      <div className="rec-agenda-stats">
        <div><strong>{filtered.length}</strong><span>citas hoy</span></div>
        <div><strong>{filtered.filter((a) => ['check_in', 'en_espera_triaje', 'en_triaje', 'triaje_completado', 'en_atencion'].includes(a.status)).length}</strong><span>en flujo de atención</span></div>
        <div><strong>{filtered.filter((a) => a.status === 'documentada').length}</strong><span>documentadas</span></div>
        <div><strong>{new Set(filtered.map((a) => a.doctorId)).size}</strong><span>médicos con agenda</span></div>
      </div>

      <div className="rec-days">
        {['2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07'].map((d) => (
          <button key={d} className={`rec-day ${d === '2026-08-05' ? 'rec-day-active' : ''}`}>
            <span className="small bold">{fmtDate(d)}</span>
          </button>
        ))}
      </div>

      {doctors.map((doc) => {
        const { appts } = byDoctor(doc.id)
        if (!appts.length) return null
        const room = findConsultorio(consultorios, doc.consultorioId)
        return (
          <div key={doc.id} className="rec-doctor-block">
            <div className="rec-doctor-head">
              <Avatar name={doc.name} initials={doc.initials} size={40} />
              <div className="grow">
                <p className="bold">{doc.name}</p>
                <p className="tiny muted">
                  {findSpecialty(specialties, doc.specialtyId)?.name} · {appts.length} citas
                  {room && <span className="row" style={{ gap: 4, marginTop: 2 }}><IconMapPin size={12} /> {room.nombre} · {room.piso}</span>}
                </p>
              </div>
              <span className="rec-doctor-count">{appts.length}</span>
            </div>
            <div className="rec-citas">
              {appts.map((a) => {
                const patient = findPatient(patients, a.patientId)
                return (
                  <div key={a.id} className={`rec-cita st-${a.status}`}>
                    <span className="rec-cita-time">{a.time}</span>
                    <div className="grow">
                      <p className="bold small">{patient?.name}</p>
                      <p className="tiny muted">{a.reason}</p>
                    </div>
                    <Badge status={a.status} />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && <p className="muted center mt-3">Sin citas con los filtros seleccionados.</p>}
    </div>
  )
}
