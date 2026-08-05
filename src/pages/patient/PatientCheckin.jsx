import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, findConsultorio, fmtDateFull, fmtPrice } from '../../utils/helpers'
import { IconCalendarCheck, IconCheck, IconClock, IconMapPin, IconSmartphone } from '../../components/Icons'
import './Checkin.css'

export default function PatientCheckin() {
  const { appointments, doctors, specialties, consultorios, auth, updateAppointment } = useApp()
  const toast = useToast()
  const appt = appointments.find((a) => a.patientId === auth.user.id && ['agendada', 'pagada'].includes(a.status))
  const [confirmed, setConfirmed] = useState(false)

  const doctor = appt && findDoctor(doctors, appt.doctorId)
  const spec = appt && findSpecialty(specialties, appt.specialtyId)
  const room = appt && doctor && findConsultorio(consultorios, doctor.consultorioId)

  const confirm = () => {
    setConfirmed(true)
    updateAppointment(appt.id, { status: 'check_in' }, {
      user: auth.user.email, action: 'Check-in desde el móvil', detail: `El paciente confirmó su llegada para ${appt.id}`, sev: 'info', icon: 'check',
    })
    toast('Check-in registrado. La recepción te pasará a la cola de triaje.', { type: 'success', title: '¡Hasta pronto!' })
  }

  return (
    <div className="anim-in checkin-page">
        <PageHeader
          title="Check-in desde tu móvil"
          subtitle="Avísanos que ya llegaste. En recepción te pasarán a la cola de triaje."
          back="/paciente"
        />

      {!appt ? (
        <Card className="checkin-empty">
          <p className="bold">No tienes citas listas para el check-in</p>
          <p className="muted small mt-1">Solo puedes hacer check-in si tu cita está pagada.</p>
          <Link to="/paciente/reservar" className="mt-2"><Button variant="primary">Reservar cita</Button></Link>
        </Card>
      ) : confirmed ? (
        <Card className="checkin-confirmed anim-in">
          <span className="checkin-icon ok"><IconCheck size={30} /></span>
          <h2>¡Check-in registrado!</h2>
          <p className="muted">Te esperamos. Estos son tus datos:</p>
          <div className="checkin-summary">
            <div><span>Médico</span><strong>{doctor.name}</strong></div>
            <div><span>Especialidad</span><strong>{spec.name}</strong></div>
            <div><span>Fecha y hora</span><strong>{fmtDateFull(appt.date)} · {appt.time}</strong></div>
            <div><span>Consultorio</span><strong>{room?.nombre} · {room?.piso}</strong></div>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link to="/paciente"><Button variant="secondary">Ir al inicio</Button></Link>
          </div>
        </Card>
      ) : (
        <Card className="checkin-card anim-in">
          <div className="checkin-head">
            <span className="checkin-cal">
              <strong>{new Date(appt.date + 'T00:00:00').getDate()}</strong>
              <span>{new Date(appt.date + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short' })}</span>
            </span>
            <div className="grow">
              <p className="small muted">Cita {appt.id}</p>
              <h2 className="checkin-doctor">{doctor.name}</h2>
              <p className="checkin-spec">{spec.name} · {fmtDateFull(appt.date)} · {appt.time}</p>
            </div>
            <Badge status={appt.status} />
          </div>
          <div className="checkin-info">
            <span className="row"><IconMapPin size={16} /> {room?.nombre} · {room?.piso}</span>
            <span className="row"><IconClock size={16} /> Llega 10 minutos antes</span>
            <span className="row"><IconSmartphone size={16} /> Lleva tu DNI · Pago: {fmtPrice(spec.price)}</span>
          </div>
          <Button variant="accent" size="xl" full icon={IconCalendarCheck} onClick={confirm} className="checkin-btn">
            Confirmar mi llegada
          </Button>
          <p className="tiny muted center">Con este toque, la recepción sabrá que llegaste y te enviará a la cola de triaje.</p>
        </Card>
      )}
    </div>
  )
}
