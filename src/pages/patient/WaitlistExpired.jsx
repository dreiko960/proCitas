import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'
import { findDoctor, findSpecialty } from '../../utils/helpers'
import { IconTimer, IconSparkles } from '../../components/Icons'

export default function WaitlistExpired() {
  const { waitlist, auth, doctors, specialties } = useApp()
  const navigate = useNavigate()
  const expired = [...waitlist].reverse().find((w) => w.patientId === auth.user.id && w.status === 'expirada')

  return (
    <div className="anim-in wl-offer-wrap">
      <PageHeader title="Cupo expirado" back="/paciente/lista-espera" />
      <Card className="wl-result-card wl-result-expired">
        <span className="wl-result-icon no"><IconTimer size={30} /></span>
        <h2>El tiempo para confirmar venció</h2>
        {expired ? (
          <p className="muted">
            El cupo con <strong>{findDoctor(doctors, expired.doctorId)?.name}</strong>
            ({findSpecialty(specialties, expired.specialtyId)?.name}) pasó automáticamente al
            siguiente paciente de la lista porque no respondiste en la ventana de <strong>15 minutos</strong>.
          </p>
        ) : (
          <p className="muted">
            Cuando una oferta expira por no ser confirmada a tiempo, el cupo se asigna al siguiente paciente de la lista.
          </p>
        )}
        <div className="wl-expired-note">
          <IconSparkles size={18} />
          <p className="small">Puedes inscribirte de nuevo para recibir nuevas ofertas cuando se liberen cupos.</p>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => navigate('/paciente/lista-espera')}>Mis inscripciones</Button>
          <Button variant="accent" icon={IconSparkles} onClick={() => navigate('/paciente/lista-espera/inscripcion')}>Inscribirme de nuevo</Button>
        </div>
      </Card>
    </div>
  )
}
