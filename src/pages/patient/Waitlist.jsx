import React from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { findDoctor, findSpecialty } from '../../utils/helpers'
import { IconListCheck, IconSparkles, IconClock, IconChevronRight, IconAlertTriangle } from '../../components/Icons'
import './Waitlist.css'

export default function PatientWaitlist() {
  const { waitlist, auth, doctors, specialties } = useApp()
  const mine = waitlist.filter((w) => w.patientId === auth.user.id)
  const hasOffer = mine.some((w) => w.status === 'oferta')

  return (
    <div className="anim-in">
      <PageHeader
        title="Lista de espera inteligente"
        subtitle="Te avisamos al instante si se libera un cupo. Tú decides si lo tomas."
        action={
          <Link to="/paciente/lista-espera/inscripcion">
            <Button variant="accent" icon={IconSparkles}>Nueva inscripción</Button>
          </Link>
        }
      />

      {hasOffer && (
        <Link to="/paciente/lista-espera/oferta" className="wl-urgent-banner">
          <span className="wl-urgent-pulse" />
          <div className="grow">
            <p className="bold">¡Tienes una oferta de cupo!</p>
            <p className="small">La cita liberada está esperando tu confirmación.</p>
          </div>
          <span className="wl-urgent-go">Ver oferta <IconChevronRight size={18} /></span>
        </Link>
      )}

      {mine.length === 0 ? (
        <EmptyState
          icon={IconListCheck}
          title="No tienes inscripciones activas"
          message="Cuando no encuentres disponibilidad, inscríbete y el sistema te ubicará automáticamente cuando un cupo se libere."
          action="Inscribirme ahora"
          actionIcon={IconSparkles}
          onAction={() => window.location.assign('#/paciente/lista-espera/inscripcion')}
        />
      ) : (
        <div className="wl-list">
          {mine.map((w) => {
            const spec = findSpecialty(specialties, w.specialtyId)
            const doctor = findDoctor(doctors, w.doctorId)
            const isOffer = w.status === 'oferta'
            return (
              <Card key={w.id} className={`wl-entry ${isOffer ? 'wl-entry-offer' : ''}`}>
                <div className="wl-entry-head">
                  <span className="wl-entry-icon"><IconClock size={20} /></span>
                  <div className="grow">
                    <p className="bold">{spec?.name} · {doctor?.name}</p>
                    <p className="small muted">Preferencia: {w.preferred} · Inscrita {w.enrolledAt}</p>
                  </div>
                  <Badge status={w.status} />
                </div>
                <div className="wl-entry-body">
                  {isOffer ? (
                    <Link to="/paciente/lista-espera/oferta">
                      <Button variant="accent" full icon={IconAlertTriangle}>Confirmar cupo ofrecido</Button>
                    </Link>
                  ) : w.status === 'en_espera' ? (
                    <div className="wl-position">
                      <div className="wl-position-bar">
                        <span className="wl-position-fill" />
                      </div>
                      <div className="row-between">
                        <span className="small muted">Tu posición estimada</span>
                        <span className="wl-position-num">~ N° {w.position}</span>
                      </div>
                      <p className="tiny muted">Si el paciente en turno rechaza o expira su cupo, subes automáticamente.</p>
                    </div>
                  ) : w.status === 'confirmada' ? (
                    <p className="small success bold">Cupo confirmado → ya es tu cita. <Link to="/paciente/citas">Ver en Mis citas</Link></p>
                  ) : (
                    <p className="small muted">Tu cupo expiró y pasó al siguiente paciente de la lista. <Link to="/paciente/lista-espera/inscripcion">Inscríbete de nuevo</Link></p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
