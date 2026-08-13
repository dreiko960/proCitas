import React from 'react'
import { Link } from 'react-router-dom'
import Badge from './ui/Badge'
import { Avatar } from './ui/Misc'
import { findDoctor, findSpecialty, findConsultorio, fmtDate, fmtPrice, fmtPayType } from '../utils/helpers'
import { IconClock, IconCalendar, IconChevronRight, IconMapPin } from './Icons'
import './AppointmentCard.css'

export default function AppointmentCard({
  appt, doctors, specialties, consultorios, highlight, actions, expanded, onExpand,
}) {
  const doctor = findDoctor(doctors, appt.doctorId)
  const spec = findSpecialty(specialties, appt.specialtyId)
  const room = consultorios && doctor && findConsultorio(consultorios, doctor.consultorioId)
  return (
    <div className={`appt-card ${highlight ? 'appt-highlight' : ''}`}>
      <div className="appt-date-box">
        <span className="appt-date-dow">{fmtDate(appt.date).split(',')[0]}</span>
        <span className="appt-date-day">{new Date(appt.date + 'T00:00:00').getDate()}</span>
        <span className="appt-date-time">{appt.time}</span>
      </div>
      <div className="appt-main">
        <div className="row-between">
          <div className="row">
            <Avatar name={doctor?.name} size={38} />
            <div>
              <p className="appt-doctor">{doctor?.name}</p>
              <p className="appt-spec">{spec?.name} · {fmtPrice(spec?.price)}</p>
            </div>
          </div>
          <Badge status={appt.status} />
          {appt.paidType && <span className="pay-chip">{fmtPayType(appt.paidType)}</span>}
        </div>
        {appt.reason && <p className="appt-reason">{appt.reason}</p>}
        <div className="row appt-meta">
          <span className="row"><IconCalendar size={14} /> {fmtDate(appt.date)}</span>
          <span className="row"><IconClock size={14} /> {appt.time} · {appt.duration} min</span>
          {room && <span className="row"><IconMapPin size={14} /> {room.nombre} · {room.piso}</span>}
        </div>
        {actions && <div className="appt-actions">{actions}</div>}
      </div>
      {onExpand && (
        <button className="appt-expand" onClick={onExpand} aria-label="Ver detalle">
          <IconChevronRight size={18} style={{ transform: expanded ? 'rotate(90deg)' : 'none' }} />
        </button>
      )}
    </div>
  )
}

export function DoctorSearchCard({ doctor, specialty, slots, onSlot, selectedSlot, consultorios }) {
  const room = consultorios && findConsultorio(consultorios, doctor.consultorioId)
  return (
    <div className="doctor-search-card">
      <div className="row-between">
        <div className="row">
          <Avatar name={doctor.name} initials={doctor.initials} size={52} />
          <div>
            <p className="doctor-name">{doctor.name}</p>
            <p className="doctor-spec">{specialty?.name}</p>
            <p className="row doctor-meta">
              <span className="star">★ {doctor.rating}</span>
              <span>({doctor.ratingCount} valoraciones)</span>
              <span className="row"><IconMapPin size={13} /> {room?.nombre || 'Consultorio'} · {room?.piso || ''}</span>
            </p>
          </div>
        </div>
        <div className="row">
          <span className="doctor-price">{fmtPrice(specialty?.price)}</span>
        </div>
      </div>
      <p className="doctor-bio">{doctor.bio}</p>
      {slots && slots.length > 0 && (
        <div className="slot-section">
          <p className="slot-title">Próximos horarios libres</p>
          <div className="slot-grid">
            {slots.map((s) => (
              <button
                key={s.date + s.time}
                className={`slot-chip ${selectedSlot?.date === s.date && selectedSlot?.time === s.time ? 'slot-chip-selected' : ''}`}
                onClick={() => onSlot(s)}
              >
                <span className="slot-chip-day">{fmtDate(s.date).split(',')[0]} {new Date(s.date + 'T00:00:00').getDate()}</span>
                <span className="slot-chip-time">{s.time}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {(!slots || slots.length === 0) && (
        <p className="slot-none">Sin horarios libres en el rango seleccionado.</p>
      )}
    </div>
  )
}
