import React, { useMemo } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import EmptyState from '../../components/ui/EmptyState'
import { useApp, QUEUE_TODAY } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio, waitMinutes } from '../../utils/helpers'
import {
  IconMonitor, IconMegaphone, IconFirstAid, IconStethoscope, IconCheckCircle,
  IconClock, IconMapPin, IconActivity, IconRefresh,
} from '../../components/Icons'
import './WaitingQueue.css'

const ATENDIDOS = ['atendida', 'documentada']

export default function WaitingQueue() {
  const { appointments, patients, doctors, specialties, consultorios, startTriage, startAttention, finalizeTriage, markAttended, resetDemo } = useApp()
  const toast = useToast()

  const { waiting, active, attended, doneCount } = useMemo(() => {
    const day = appointments.filter((a) => a.date === QUEUE_TODAY && a.status !== 'cancelada')
    const byTurno = (a, b) => (a.turno < b.turno ? -1 : a.turno > b.turno ? 1 : 0)
    return {
      waiting: day.filter((a) => a.status === 'en_espera_triaje' || a.status === 'triaje_completado').sort(byTurno),
      active: day.filter((a) => a.status === 'en_triaje' || a.status === 'en_atencion'),
      attended: day.filter((a) => ATENDIDOS.includes(a.status)).sort(byTurno),
      doneCount: day.filter((a) => ATENDIDOS.includes(a.status)).length,
    }
  }, [appointments])

  const openTv = () => {
    window.open('/tv', '_blank')
    toast('Pantalla de TV abierta en una nueva pestaña. Se actualiza sola con cada llamada.', { type: 'info', title: 'Pantalla en vivo' })
  }

  const handle = (fn, message, title) => {
    fn()
    toast(message, { type: 'success', title })
  }

  const nextStage = (a) => (a.status === 'en_espera_triaje' ? 'triaje' : 'consulta')

  const Card = ({ a }) => {
    const patient = findPatient(patients, a.patientId)
    const spec = findSpecialty(specialties, a.specialtyId)
    const doctor = findDoctor(doctors, a.doctorId)
    const room = doctor && findConsultorio(consultorios, doctor.consultorioId)
    const mins = waitMinutes(a.checkInTime)
    const longWait = mins > 10
    const stage = nextStage(a)
    return (
      <div className={`wq-card ${a.status === 'en_atencion' ? 'wq-in-consulta' : ''} ${a.status === 'en_triaje' ? 'wq-in-triaje' : ''}`}>
        <div className="wq-card-head">
          <span className={`wq-turno ${a.status === 'en_atencion' ? 'wq-turno-consulta' : ''} ${a.status === 'en_triaje' ? 'wq-turno-triaje' : ''}`}>{a.turno || '—'}</span>
          <Avatar name={patient?.name} initials={patient?.initials} size={44} />
          <div className="grow">
            <p className="bold">{patient?.name}</p>
            <p className="small muted">{spec?.name} · {doctor?.name}</p>
          </div>
          <Badge status={a.status} />
        </div>
        <div className="wq-meta">
          <span className="row"><IconMapPin size={15} /> {room?.nombre || '—'} · {room?.piso || ''}</span>
          <span className="row"><IconClock size={15} /> Cita {a.time} · 30 min</span>
          <span className={`row ${longWait ? 'wq-wait-warn' : ''}`}>
            <IconActivity size={15} />
            {mins > 0 ? `Esperando ${mins} min` : 'Acaba de llegar'}
          </span>
        </div>
        <div className="wq-card-actions">
          {a.status === 'en_espera_triaje' && (
            <Button variant="accent" icon={IconFirstAid} onClick={() => handle(() => startTriage(a.id), `${patient?.name} llamado a triaje.`, 'Llamando a triaje')}>
              Llamar a triaje
            </Button>
          )}
          {a.status === 'triaje_completado' && (
            <Button variant="primary" icon={IconStethoscope} onClick={() => handle(() => startAttention(a.id), `${patient?.name} llamado a consulta (${room?.nombre || 'Consultorio'}).`, 'Llamando a consulta')}>
              Llamar a consulta
            </Button>
          )}
          {a.status === 'en_triaje' && (
            <Button variant="secondary" icon={IconCheckCircle} onClick={() => handle(() => finalizeTriage(a.id), `${patient?.name} pasa a espera de consulta.`, 'Triaje finalizado')}>
              Finalizar triaje
            </Button>
          )}
          {a.status === 'en_atencion' && (
            <Button variant="secondary" icon={IconCheckCircle} onClick={() => handle(() => markAttended(a.id), `${patient?.name} atendido. La cola avanzó automáticamente.`, 'Atención completada')}>
              Marcar atendida
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Lista de espera inteligente"
        subtitle={`Miércoles 05 de agosto · ${waiting.length} esperando · ${active.length} activos · ${doneCount} atendidos hoy`}
        action={
          <div className="row" style={{ gap: 10 }}>
            <Button variant="ghost" size="sm" icon={IconRefresh} onClick={() => { resetDemo(); toast('La cola del día volvió a su estado inicial de demo.', { type: 'info', title: 'Demo restablecida' }) }}>Restablecer demo</Button>
            <Button variant="accent" icon={IconMonitor} onClick={openTv}>Abrir pantalla TV</Button>
          </div>
        }
      />

      <div className="wq-strip">
        <div className="wq-stat"><strong>{waiting.length}</strong><span>Esperando turno</span></div>
        <div className="wq-stat"><strong>{active.filter((a) => a.status === 'en_triaje').length}</strong><span>En triaje</span></div>
        <div className="wq-stat"><strong>{active.filter((a) => a.status === 'en_atencion').length}</strong><span>En consulta</span></div>
        <div className="wq-stat"><strong>{doneCount}</strong><span>Atendidos hoy</span></div>
        <div className="wq-stat wq-stat-live"><span className="live-chip"><span className="live-dot" /> En vivo</span><span>Se actualiza solo al llamar o pasar pacientes</span></div>
      </div>

      {waiting.length === 0 && active.length === 0 ? (
        <EmptyState
          icon={IconMegaphone}
          title="Cola vacía"
          message="Cuando recepción haga el check-in de un paciente, aparecerá aquí con su turno asignado y en la pantalla de TV."
        />
      ) : (
        <div className="grid wq-grid">
          <div>
            <h3 className="wq-sec-title"><IconClock size={18} /> Esperando turno <span className="wq-count">{waiting.length}</span></h3>
            <div className="wq-list">
              {waiting.map((a, i) => (
                <div key={a.id}>
                  {i === 0 && <span className="wq-next-chip"><IconMegaphone size={13} /> SIGUIENTE EN LLAMAR</span>}
                  <Card a={a} />
                </div>
              ))}
              {waiting.length === 0 && <p className="small muted">Sin pacientes esperando turno.</p>}
            </div>
          </div>
          <div>
            <h3 className="wq-sec-title"><IconActivity size={18} /> Activos ahora <span className="wq-count wq-count-accent">{active.length}</span></h3>
            <div className="wq-list">
              {active.map((a) => <Card key={a.id} a={a} />)}
              {active.length === 0 && <p className="small muted">Ningún paciente llamándose en este momento.</p>}
            </div>
            {attended.length > 0 && (
              <div className="wq-done">
                <h3 className="wq-sec-title"><IconCheckCircle size={18} /> Atendidos hoy <span className="wq-count wq-count-ok">{attended.length}</span></h3>
                <div className="wq-done-list">
                  {attended.map((a) => {
                    const patient = findPatient(patients, a.patientId)
                    return (
                      <div key={a.id} className="wq-done-row">
                        <span className="wq-turno wq-turno-done">{a.turno || '—'}</span>
                        <span className="small grow">{patient?.name}</span>
                        <Badge status={a.status} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
