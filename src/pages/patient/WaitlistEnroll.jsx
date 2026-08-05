import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Field'
import { StepIndicator } from '../../components/ui/Misc'
import { Avatar } from '../../components/ui/Misc'
import Modal from '../../components/ui/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, fmtPrice } from '../../utils/helpers'
import { IconSparkles, IconChevronLeft, IconChevronRight, IconCheck, IconTimer, IconUserPlus } from '../../components/Icons'

export default function WaitlistEnroll() {
  const { specialties, doctors, enrollWaitlist } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [specialtyId, setSpecialtyId] = useState('cardiologia')
  const [doctorId, setDoctorId] = useState('d5')
  const [range, setRange] = useState('Mañana (08:00 – 12:00)')
  const [confirmed, setConfirmed] = useState(false)

  const specDoctors = useMemo(() => doctors.filter((d) => d.specialtyId === specialtyId), [doctors, specialtyId])
  const spec = findSpecialty(specialties, specialtyId)

  const submit = () => {
    const entry = enrollWaitlist({ specialtyId, doctorId, preferred: range })
    setConfirmed(true)
    toast('Te inscribimos en la lista de espera. Te avisaremos al instante.', { type: 'success', title: 'Inscripción registrada' })
    setTimeout(() => navigate(`/paciente/lista-espera/oferta`, { state: { entryId: entry.id } }), 2200)
  }

  if (confirmed) {
    return (
      <div className="anim-in">
        <PageHeader title="Inscripción registrada" />
        <Card className="wl-enroll-done">
          <span className="done-icon wl-done-icon"><IconCheck size={34} /></span>
          <h2>Estás en la lista de espera</h2>
          <p className="muted">Te mostraremos el estado de tu inscripción y la oferta cuando un cupo se libere.</p>
          <div className="wl-done-pos">
            <span className="wl-done-pos-label">Tu posición aproximada</span>
            <strong>N° 3</strong>
            <small className="muted">Puedes subir si los pacientes en turno rechazan o expiran su cupo.</small>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Button variant="ghost" onClick={() => navigate('/paciente/lista-espera')}>Ver mis inscripciones</Button>
            <Button variant="accent" onClick={() => navigate('/paciente/lista-espera/oferta')}>Simular oferta de cupo</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="anim-in">
      <PageHeader title="Inscripción en lista de espera" subtitle="Sin disponibilidad hoy no es un problema: el cupo llega a ti." back="/paciente/lista-espera" />
      <StepIndicator steps={['¿Qué necesitas?', 'Preferencias', 'Confirmar']} current={step - 1} />

      <div className="book-stage mt-3">
        {step === 1 && (
          <div className="anim-in">
            <div className="spec-pick-grid">
              {specialties.map((s) => (
                <button key={s.id} className={`spec-opt ${specialtyId === s.id ? 'spec-opt-selected' : ''}`} onClick={() => setSpecialtyId(s.id)}>
                  <span className="spec-opt-icon"><IconTimer size={24} /></span>
                  <span className="bold">{s.name}</span>
                  <small className="muted">{s.desc}</small>
                  <span className="spec-opt-price">{fmtPrice(s.price)}</span>
                </button>
              ))}
            </div>
            <div className="book-nav">
              <Button variant="ghost" onClick={() => navigate('/paciente/lista-espera')}>Cancelar</Button>
              <Button variant="primary" size="lg" icon={IconChevronRight} onClick={() => { setDoctorId(specDoctors[0]?.id); setStep(2) }}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="anim-in wl-step2">
            <div className="wl-field">
              <label className="field-label">Médico preferido</label>
              <div className="doctor-pick-list">
                {specDoctors.map((d) => (
                  <button key={d.id} className={`doc-row ${doctorId === d.id ? 'doc-row-selected' : ''}`} onClick={() => setDoctorId(d.id)}>
                    <Avatar name={d.name} initials={d.initials} size={48} />
                    <div className="grow">
                      <p className="bold">{d.name}</p>
                      <p className="small muted">★ {d.rating} · {d.bio}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="wl-field">
              <label className="field-label">Rango horario preferido</label>
              <div className="wl-range-grid">
                {['Mañana (08:00 – 12:00)', 'Mediodía (12:00 – 14:00)', 'Tarde (14:00 – 17:30)', 'Cualquier horario'].map((r) => (
                  <button key={r} className={`wl-range-opt ${range === r ? 'wl-range-selected' : ''}`} onClick={() => setRange(r)}>
                    <IconClockInline /> {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="book-nav">
              <Button variant="ghost" onClick={() => setStep(1)} icon={IconChevronLeft}>Atrás</Button>
              <Button variant="primary" size="lg" icon={IconChevronRight} onClick={() => setStep(3)}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="anim-in">
            <Card className="wl-confirm-card">
              <div className="wl-confirm-hero">
                <span className="wl-confirm-icon"><IconSparkles size={26} /></span>
                <div>
                  <h3 className="bold">Resumen de tu inscripción</h3>
                  <p className="small muted">Cuando se libere un cupo que calce, tendrás 15:00 minutos para decidir.</p>
                </div>
              </div>
              <div className="confirm-rows">
                <div className="confirm-row"><span className="muted">Especialidad</span><strong>{spec.name}</strong></div>
                <div className="confirm-row"><span className="muted">Médico</span><strong>{findDoctor(doctors, doctorId)?.name}</strong></div>
                <div className="confirm-row"><span className="muted">Preferencia</span><strong>{range}</strong></div>
                <div className="confirm-row"><span className="muted">Costo estimado</span><strong>{fmtPrice(spec.price)}</strong></div>
              </div>
              <div className="wl-notice">
                <IconUserPlus size={18} />
                <p className="small">Tu posición aproximada será <strong>N° 3</strong>. El sistema te notifica por banner, correo y SMS.</p>
              </div>
              <Button variant="accent" size="xl" full icon={IconCheck} onClick={submit}>Confirmar inscripción</Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function IconClockInline() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  )
}
