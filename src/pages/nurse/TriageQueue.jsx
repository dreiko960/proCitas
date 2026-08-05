import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio, waitMinutes } from '../../utils/helpers'
import { IconFirstAid, IconClock, IconMapPin, IconChevronRight, IconActivity } from '../../components/Icons'
import './Triage.css'

const TODAY = '2026-08-05'

export default function TriageQueue() {
  const { appointments, patients, doctors, specialties, consultorios, startTriage } = useApp()
  const toast = useToast()
  const navigate = useNavigate()

  const { waiting, inProgress } = useMemo(() => {
    const day = appointments
      .filter((a) => a.date === TODAY && a.status !== 'cancelada')
      .sort((a, b) => (a.time < b.time ? -1 : 1))
    return {
      waiting: day.filter((a) => a.status === 'en_espera_triaje')
        .sort((a, b) => (waitMinutes(a.checkInTime) > waitMinutes(b.checkInTime) ? 1 : -1)),
      inProgress: day.filter((a) => a.status === 'en_triaje'),
    }
  }, [appointments])

  const start = (a) => {
    startTriage(a.id)
    toast(`Iniciando triaje de ${findPatient(patients, a.patientId)?.name}. La cita pasó a “en triaje”.`, { type: 'info', title: 'Triaje en progreso' })
    navigate(`/enfermeria/triaje/${a.id}`)
  }

  const CardBody = ({ a, isWaiting }) => {
    const patient = findPatient(patients, a.patientId)
    const spec = findSpecialty(specialties, a.specialtyId)
    const doctor = findDoctor(doctors, a.doctorId)
    const room = doctor && findConsultorio(consultorios, doctor.consultorioId)
    const mins = waitMinutes(a.checkInTime)
    const longWait = mins > 10
    return (
      <div className={`tq-card ${isWaiting ? '' : 'tq-inprogress'}`}>
        <div className="tq-card-head">
          <Avatar name={patient?.name} initials={patient?.initials} size={46} />
          <div className="grow">
            <p className="bold">{patient?.name}</p>
            <p className="small muted">{spec?.name} · {doctor?.name}</p>
          </div>
          <Badge status={a.status} />
        </div>
        <div className="tq-meta">
          <span className="row"><IconMapPin size={15} /> {room?.nombre || '—'} · {room?.piso || ''}</span>
          <span className={`row ${longWait ? 'tq-wait-warn' : ''}`}>
            <IconClock size={15} />
            {mins > 0 ? `Esperando ${mins} min desde el check-in` : 'Acaba de llegar'}
          </span>
          <span className="row"><IconActivity size={15} /> {a.time} · 30 min</span>
        </div>
        {isWaiting ? (
          <Button variant="accent" size="lg" full icon={IconFirstAid} onClick={() => start(a)}>
            Iniciar triaje
          </Button>
        ) : (
          <Button variant="secondary" size="lg" full icon={IconChevronRight} onClick={() => navigate(`/enfermeria/triaje/${a.id}`)}>
            Continuar triaje
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Cola de triaje"
        subtitle={`Miércoles 05 de agosto · ${waiting.length} paciente(s) esperando triaje`}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/enfermeria/historial')}>
            Ver triajes del turno
          </Button>
        }
      />

      {waiting.length === 0 && inProgress.length === 0 ? (
        <EmptyState
          icon={IconFirstAid}
          title="Cola de triaje vacía"
          message="Cuando recepción haga el check-in de un paciente, aparecerá aquí para iniciar el triaje."
        />
      ) : (
        <div className="grid tq-grid">
          <div>
            <h3 className="tq-sec-title">Esperando triaje <span className="tq-count">{waiting.length}</span></h3>
            <div className="tq-list">
              {waiting.map((a) => <CardBody key={a.id} a={a} isWaiting />)}
              {waiting.length === 0 && <p className="small muted">Sin pacientes en cola por ahora.</p>}
            </div>
          </div>
          <div>
            <h3 className="tq-sec-title">En progreso <span className="tq-count tq-count-accent">{inProgress.length}</span></h3>
            <div className="tq-list">
              {inProgress.map((a) => <CardBody key={a.id} a={a} isWaiting={false} />)}
              {inProgress.length === 0 && <p className="small muted">Ningún triaje en curso.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
