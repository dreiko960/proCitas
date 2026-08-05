import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import Modal from '../../components/ui/Modal'
import useCountdown from '../../hooks/useCountdown'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, fmtDateFull, fmtPrice } from '../../utils/helpers'
import { IconTimer, IconCheck, IconX, IconBell, IconSparkles, IconChevronRight } from '../../components/Icons'
import './WaitlistOffer.css'

export default function WaitlistOffer() {
  const { waitlist, doctors, specialties, auth, confirmOffer, rejectOffer, expireOffer, offerWaitlist, enrollWaitlist } = useApp()
  const toast = useToast()
  const navigate = useNavigate()

  const entry = waitlist.find((w) => w.patientId === auth.user.id && w.status === 'oferta')
  const { remaining, mm, ss, done } = useCountdown(entry?.offer ? entry.offer.confirmWindowMin * 60 : 900)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [result, setResult] = useState(null)

  const simulateOffer = () => {
    let target = waitlist.find((w) => w.patientId === auth.user.id && w.status === 'en_espera')
    if (!target) {
      target = enrollWaitlist({
        specialtyId: 'cardiologia',
        doctorId: 'd5',
        preferred: 'Por las mañanas (08:00 – 12:00)',
      })
    }
    offerWaitlist(target.id, {
      date: '2026-08-07',
      time: '09:00',
      expiresAt: '2026-08-05 10:25',
      confirmWindowMin: 15,
    })
    toast('Un paciente canceló y se te asignó su cupo por ser el siguiente en la lista.', { type: 'info', title: 'Oferta generada' })
    navigate('/paciente/lista-espera/oferta')
  }

  if (!entry) {
    return (
      <div className="anim-in wl-offer-wrap">
        <PageHeader title="Oferta de cupo" back="/paciente/lista-espera" />
        <Card className="wl-no-offer">
          <h3 className="bold">No tienes una oferta activa</h3>
          <p className="muted small mt-1">Cuando se libere un cupo que calce con tu inscripción, aquí aparecerá con una cuenta regresiva.</p>
          <div className="row mt-2">
            <Button variant="secondary" onClick={() => navigate('/paciente/lista-espera/inscripcion')}>Inscribirme</Button>
            <Button variant="accent" onClick={simulateOffer}>Simular oferta de demo</Button>
          </div>
        </Card>
      </div>
    )
  }

  const doctor = findDoctor(doctors, entry.doctorId)
  const spec = findSpecialty(specialties, entry.specialtyId)
  const offer = entry.offer

  // Si el countdown llegó a 0 → expirar
  if (done) {
    expireOffer(entry.id)
    toast('El tiempo de confirmación venció. El cupo pasó al siguiente paciente.', { type: 'warning', title: 'Cupo expirado' })
    return (
      <WaitlistExpiredView doctor={doctor} spec={spec} offer={offer} onReEnroll={() => navigate('/paciente/lista-espera/inscripcion')} onGoList={() => navigate('/paciente/lista-espera')} />
    )
  }

  const doConfirm = () => {
    const id = confirmOffer(entry.id)
    setConfirmOpen(false)
    setResult({ type: 'confirm', appointmentId: id, doctor, spec, offer })
    toast('¡Cupo confirmado! Se creó tu cita automáticamente.', { type: 'success', title: 'Cita creada' })
  }

  const doReject = () => {
    rejectOffer(entry.id)
    setRejectOpen(false)
    setResult({ type: 'reject', doctor, spec, offer })
    toast('Rechazaste el cupo. Sigue en la lista para futuras ofertas.', { type: 'info', title: 'Cupo rechazado' })
  }

  const secondsLeft = remaining
  const isLow = secondsLeft <= 180

  if (result) {
    if (result.type === 'confirm') {
      return (
        <div className="anim-in wl-offer-wrap">
          <PageHeader title="¡Cita creada desde la lista de espera!" />
          <Card className="wl-result-card wl-result-ok">
            <span className="wl-result-icon ok"><IconCheck size={30} /></span>
            <h2>Confirmaste el cupo. ¡Ya tienes cita!</h2>
            <p className="muted">El horario quedó bloqueado para ti y se generó tu cita <strong>{result.appointmentId}</strong>.</p>
            <div className="done-summary">
              <div><span>Médico</span><strong>{doctor.name}</strong></div>
              <div><span>Especialidad</span><strong>{spec.name}</strong></div>
              <div><span>Fecha y hora</span><strong>{fmtDateFull(offer.date)} · {offer.time}</strong></div>
              <div><span>Costo</span><strong>{fmtPrice(spec.price)} (pago en recepción)</strong></div>
            </div>
            <div className="row" style={{ justifyContent: 'center' }}>
              <Button variant="primary" icon={IconChevronRight} onClick={() => navigate('/paciente/citas')}>Ver en mis citas</Button>
            </div>
          </Card>
        </div>
      )
    }
    return (
      <div className="anim-in wl-offer-wrap">
        <PageHeader title="Cupo rechazado" />
        <Card className="wl-result-card">
          <span className="wl-result-icon no"><IconX size={30} /></span>
          <h2>Mantienes tu posición en la lista</h2>
          <p className="muted">El cupo de <strong>{fmtDateFull(offer.date)} a las {offer.time}</strong> se ofrecerá al siguiente paciente. Seguirás recibiendo ofertas que calcen con tu preferencia.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/paciente/lista-espera')}>Ver mis inscripciones</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="anim-in wl-offer-wrap">
      <PageHeader title="Oferta de cupo" back="/paciente/lista-espera" />

      {/* ——— Banner urgente con cuenta regresiva ——— */}
      <div className={`offer-banner ${isLow ? 'offer-banner-low' : ''}`}>
        <span className="offer-banner-icon"><IconBell size={22} /></span>
        <div className="grow">
          <p className="offer-banner-title">¡Se liberó un cupo para ti!</p>
          <p className="offer-banner-sub">Fue ofrecido por la cancelación de otro paciente. Responde antes de que expire.</p>
        </div>
        <div className={`offer-timer ${isLow ? 'offer-timer-low' : ''}`}>
          <IconTimer size={20} />
          <div className="offer-timer-nums">
            <strong>{mm}:{ss}</strong>
            <span>para confirmar</span>
          </div>
        </div>
      </div>

      <div className="offer-grid">
        <Card className="offer-detail">
          <div className="offer-detail-head">
            <Avatar name={doctor.name} initials={doctor.initials} size={56} />
            <div>
              <h3 className="bold">{doctor.name}</h3>
              <p className="small muted">{spec?.name} · ★ {doctor.rating} · {doctor.exp} años de experiencia</p>
            </div>
          </div>
          <div className="offer-slot-box">
            <div className="offer-slot">
              <span className="muted">Fecha</span>
              <strong>{fmtDateFull(offer.date)}</strong>
            </div>
            <div className="offer-slot">
              <span className="muted">Hora</span>
              <strong>{offer.time} · 30 min</strong>
            </div>
            <div className="offer-slot">
              <span className="muted">Costo</span>
              <strong>{fmtPrice(spec.price)}</strong>
            </div>
          </div>
          <div className="offer-why">
            <Badge status="reprogramada" dot={false}>Cupo por cancelación</Badge>
            <p className="tiny muted">La paciente del turno reprogramó y el sistema te asignó la prioridad por ser el siguiente en la lista.</p>
          </div>
        </Card>

        <Card className="offer-actions-card">
          <h3 className="bold mb-1">¿Tomas el cupo?</h3>
          <p className="small muted mb-2">Al confirmar se crea tu cita al instante. Al rechazar, tu posición se mantiene.</p>
          <Button variant="accent" size="xl" full icon={IconCheck} onClick={() => setConfirmOpen(true)}>Confirmar cupo</Button>
          <Button variant="ghost" size="lg" full className="mt-1" icon={IconX} onClick={() => setRejectOpen(true)}>Rechazar y esperar otra</Button>
          <div className="offer-demo-tools">
            <button onClick={() => { setRejectOpen(false); expireOffer(entry.id); toast('Simulamos que se agotó el tiempo.', { type: 'warning', title: 'Demo: expiración' }); }}>Simular expiración →</button>
          </div>
        </Card>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar cupo y crear cita"
        tone="success"
        icon={IconCheck}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Volver</Button>
            <Button variant="accent" onClick={doConfirm}>Confirmar y crear cita</Button>
          </div>
        }
      >
        <p>Se creará tu cita con <strong>{doctor.name}</strong> el <strong>{fmtDateFull(offer.date)}</strong> a las <strong>{offer.time}</strong>.</p>
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="¿Rechazar este cupo?"
        tone="warning"
        icon={IconX}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Volver</Button>
            <Button variant="destructive" onClick={doReject}>Sí, rechazar</Button>
          </div>
        }
      >
        <p>El cupo pasará al siguiente paciente de la lista. Mantendrás tu posición para futuras ofertas.</p>
      </Modal>
    </div>
  )
}

function WaitlistExpiredView({ doctor, spec, offer, onReEnroll, onGoList }) {
  return (
    <div className="anim-in wl-offer-wrap">
      <PageHeader title="Cupo expirado" back="/paciente/lista-espera" />
      <Card className="wl-result-card wl-result-expired">
        <span className="wl-result-icon no"><IconTimer size={30} /></span>
        <h2>El tiempo para confirmar venció</h2>
        <p className="muted">
          El cupo de <strong>{fmtDateFull(offer.date)} a las {offer.time}</strong> con <strong>{doctor.name}</strong>
          pasó automáticamente al siguiente paciente de la lista.
        </p>
        <div className="wl-expired-note">
          <IconSparkles size={18} />
          <p className="small">Puedes volver a inscribirte para recibir nuevas ofertas cuando se liberen cupos.</p>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Button variant="secondary" onClick={onGoList}>Mis inscripciones</Button>
          <Button variant="accent" icon={IconSparkles} onClick={onReEnroll}>Inscribirme de nuevo</Button>
        </div>
      </Card>
    </div>
  )
}
