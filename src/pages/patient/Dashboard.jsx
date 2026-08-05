import React from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { Card, CardHeader, StatCard } from '../../components/ui/Card'
import AppointmentCard from '../../components/AppointmentCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, fmtDateFull, fmtPrice } from '../../utils/helpers'
import {
  IconCalendarPlus, IconCalendarCheck, IconHistory, IconListCheck, IconWallet,
  IconClock, IconArrowRight, IconSparkles, IconBell, IconMapPin,
} from '../../components/Icons'
import './Dashboard.css'

export default function PatientDashboard() {
  const { appointments, doctors, specialties, waitlist, payments, auth } = useApp()
  const toast = useToast()
  const next = appointments.find((a) => a.patientId === auth.user.id && a.status === 'confirmada')
  const history = appointments.filter((a) => a.patientId === auth.user.id && (a.status === 'documentada' || a.status === 'atendida'))
  const activeWL = waitlist.find((w) => w.patientId === auth.user.id && (w.status === 'en_espera' || w.status === 'oferta'))
  const hasPendingPay = payments.some((p) => p.patientId === auth.user.id && p.status === 'pendiente_verificacion')

  const doctor = next && findDoctor(doctors, next.doctorId)
  const spec = next && findSpecialty(specialties, next.specialtyId)

  return (
    <div className="anim-in">
      <PageHeader
        title={`Hola, ${auth.user.name.split(' ')[0]} 👋`}
        subtitle={new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={
          <Button variant="primary" icon={IconCalendarPlus} onClick={() => toast('Inicia el flujo de reserva de 3 pasos', { type: 'info', title: 'Reserva de cita' })}>
            <Link to="/paciente/reservar" style={{ color: 'inherit', textDecoration: 'none' }}>Reservar cita</Link>
          </Button>
        }
      />

      {hasPendingPay && (
        <div className="pay-reminder">
          <IconBell size={20} />
          <div className="grow">
            <p className="bold">Tienes un pago pendiente de verificación</p>
            <p className="small">Nuestra recepción debe confirmar tu declaración de pago con Yape. Revisa <Link to="/paciente/pagos">Mis pagos</Link>.</p>
          </div>
          <Link to="/paciente/pagos"><Button variant="secondary" size="sm">Revisar</Button></Link>
        </div>
      )}

      {/* ——— Próxima cita destacada ——— */}
      {next ? (
        <Card className="next-card">
          <div className="next-card-top">
            <div className="row" style={{ gap: 16 }}>
              <span className="next-date-chip">
                <strong>{new Date(next.date + 'T00:00:00').getDate()}</strong>
                <span>{new Date(next.date + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short' })}</span>
              </span>
              <div>
                <p className="next-kicker">Tu próxima cita</p>
                <h2 className="next-title">{spec?.name} · {next.time}</h2>
                <p className="next-doctor">{doctor?.name} · {fmtDateFull(next.date)}</p>
              </div>
            </div>
            <Badge status={next.status} />
          </div>
          <div className="next-card-bottom">
            <span className="row"><IconMapPin size={15} /> Consultorio {next.doctorId === 'd1' ? '2' : '4'} · Piso 1</span>
            <span className="row"><IconClock size={15} /> Llega 10 minutos antes</span>
            <div className="row">
              <Link to="/paciente/citas"><Button variant="ghost" size="sm">Ver mis citas</Button></Link>
              <Link to="/paciente/checkin"><Button variant="accent" size="sm" icon={IconCalendarCheck}>Confirmar asistencia</Button></Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="next-card">
          <p className="next-kicker">Aún no tienes citas próximas</p>
          <h2 className="next-title">¿Cuándo quieres tu próxima consulta?</h2>
          <div className="row mt-2">
            <Link to="/paciente/reservar"><Button variant="accent" icon={IconCalendarPlus}>Reservar ahora</Button></Link>
            <Link to="/paciente/lista-espera/inscripcion"><Button variant="secondary" icon={IconSparkles}>Lista de espera</Button></Link>
          </div>
        </Card>
      )}

      {/* ——— Accesos rápidos ——— */}
      <h3 className="section-title">Accesos rápidos</h3>
      <div className="quick-grid">
        <Link to="/paciente/reservar" className="quick-card card-hover">
          <span className="quick-icon t-primary"><IconCalendarPlus size={22} /></span>
          <span className="bold">Reservar cita</span>
          <small className="muted">Elige especialidad y médico</small>
          <IconArrowRight size={18} className="quick-arrow" />
        </Link>
        <Link to="/paciente/historial" className="quick-card card-hover">
          <span className="quick-icon t-info"><IconHistory size={22} /></span>
          <span className="bold">Mi historial</span>
          <small className="muted">{history.length} atenciones documentadas</small>
          <IconArrowRight size={18} className="quick-arrow" />
        </Link>
        <Link to="/paciente/lista-espera" className="quick-card card-hover quick-wl">
          <span className="quick-icon t-coral"><IconListCheck size={22} /></span>
          <span className="bold">Lista de espera</span>
          <small className="muted">
            {activeWL
              ? activeWL.status === 'oferta' ? '¡Tienes una oferta de cupo!' : `En espera · posición ~${activeWL.position}`
              : 'Cupos liberados al instante'}
          </small>
          {activeWL && activeWL.status === 'oferta' && <span className="quick-live">En vivo</span>}
          <IconArrowRight size={18} className="quick-arrow" />
        </Link>
        <Link to="/paciente/pagos" className="quick-card card-hover">
          <span className="quick-icon t-warning"><IconWallet size={22} /></span>
          <span className="bold">Mis pagos</span>
          <small className="muted">{payments.filter((p) => p.patientId === auth.user.id).length} comprobantes</small>
          <IconArrowRight size={18} className="quick-arrow" />
        </Link>
      </div>

      {/* ——— Próximas citas ——— */}
      <div className="row-between section-title">
        <h3>Próximas citas</h3>
        <Link to="/paciente/citas" className="small bold">Ver todas</Link>
      </div>
      <div className="column-list">
        {appointments.filter((a) => a.patientId === auth.user.id && a.status === 'confirmada').slice(0, 2).map((a) => (
          <AppointmentCard key={a.id} appt={a} doctors={doctors} specialties={specialties} highlight />
        ))}
        {!appointments.some((a) => a.patientId === auth.user.id && a.status === 'confirmada') && (
          <p className="muted small">No tienes citas confirmadas próximamente.</p>
        )}
      </div>

      {/* ——— Mini stats ——— */}
      <div className="grid mini-stats">
        <StatCard icon={IconCalendarCheck} label="Citas este año" value={appointments.filter((a) => a.patientId === auth.user.id).length} sub="Atenciones gestionadas en línea" tone="primary" />
        <StatCard icon={IconListCheck} label="Lista de espera" value={activeWL ? `#${activeWL.position}` : '—'} sub={activeWL ? activeWL.specialtyId : 'Sin inscripciones activas'} tone="accent" />
        <StatCard icon={IconWallet} label="Invertido en salud" value={fmtPrice(payments.filter((p) => p.patientId === auth.user.id && p.status === 'pagado').reduce((s, p) => s + p.amount, 0))} sub={`${payments.filter((p) => p.patientId === auth.user.id).length} pagos registrados`} tone="success" />
      </div>
    </div>
  )
}
