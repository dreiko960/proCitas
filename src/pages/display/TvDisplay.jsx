import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp, QUEUE_TODAY, queuedToday } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio } from '../../utils/helpers'
import Logo from '../../components/layout/Logo'
import { IconMonitor, IconPlay, IconPause, IconMapPin } from '../../components/Icons'
import './TvDisplay.css'

const WAITING_ST = ['en_espera_triaje', 'triaje_completado']

export default function TvDisplay() {
  const { appointments, patients, doctors, specialties, consultorios, startTriage, startAttention, finalizeTriage, markAttended } = useApp()
  const toast = useToast()
  const [now, setNow] = useState(() => new Date())
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const queue = useMemo(() => queuedToday(appointments), [appointments])
  const attendedCount = useMemo(
    () => appointments.filter((a) => a.date === QUEUE_TODAY && ['atendida', 'documentada'].includes(a.status)).length,
    [appointments],
  )

  const inTriage = queue.find((a) => a.status === 'en_triaje')
  const inConsulta = queue.find((a) => a.status === 'en_atencion')
  const waiting = queue.filter((a) => WAITING_ST.includes(a.status))
  const next = waiting[0]

  const roomOf = (a) => {
    const doctor = findDoctor(doctors, a.doctorId)
    return (doctor && findConsultorio(consultorios, doctor.consultorioId)) || null
  }

  const advance = () => {
    if (inConsulta) return markAttended(inConsulta.id)
    if (inTriage) return finalizeTriage(inTriage.id)
    const nextTriaje = waiting.find((a) => a.status === 'en_espera_triaje')
    if (nextTriaje) return startTriage(nextTriaje.id)
    const nextConsulta = waiting.find((a) => a.status === 'triaje_completado')
    if (nextConsulta) return startAttention(nextConsulta.id)
    return null
  }

  useEffect(() => {
    if (!demo) return undefined
    const t = setInterval(() => advance(), 4500)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, queue])

  const toggleDemo = () => {
    setDemo((d) => !d)
    toast(demo ? 'Modo automático desactivado. El panel espera acciones de recepción/enfermería.' : 'Modo automático: la cola avanzará sola cada 4.5 s para la demostración.', { type: 'info', title: demo ? 'Pausado' : 'Demo automática' })
  }

  const dateLabel = now.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeLabel = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const NowPanel = ({ title, item, tag, accent }) => (
    <div className={`tv-now tv-${accent}`}>
      <p className="tv-now-label">{title}</p>
      {item ? (
        <>
          <div className="tv-now-num">{item.turno}</div>
          <p className="tv-now-name">{findPatient(patients, item.patientId)?.name}</p>
          <p className="tv-now-room"><IconMapPin size={18} /> {roomOf(item)?.nombre || 'Consultorio'} · {roomOf(item)?.piso || ''}</p>
          <span className="tv-now-tag">{tag}</span>
        </>
      ) : (
        <div className="tv-now-empty">
          <IconMonitor size={40} />
          <p>Sin llamadas en este momento</p>
        </div>
      )}
    </div>
  )

  const Row = ({ a, idx, dim }) => {
    const patient = findPatient(patients, a.patientId)
    const spec = findSpecialty(specialties, a.specialtyId)
    const room = roomOf(a)
    return (
      <div className={`tv-row ${dim ? 'tv-row-dim' : ''}`}>
        <span className="tv-row-idx">{idx}</span>
        <span className="tv-row-num">{a.turno || '—'}</span>
        <span className="tv-row-name">{patient?.name}</span>
        <span className="tv-row-meta">{spec?.name} · {a.status === 'en_espera_triaje' ? 'Espera triaje' : 'Listo para consulta'}</span>
        <span className="tv-row-room">{room?.nombre || '—'}</span>
      </div>
    )
  }

  return (
    <div className="tv">
      <header className="tv-head">
        <div className="tv-brand">
          <Logo light />
          <span className="tv-brand-divider" />
          <span className="tv-brand-sub">Pantalla de lista de espera</span>
        </div>
        <div className="tv-clock">
          <p className="tv-date">{dateLabel}</p>
          <p className="tv-time">{timeLabel}</p>
        </div>
        <div className="tv-head-right">
          <span className="tv-attended">Atendidos hoy: <strong>{attendedCount}</strong></span>
          <button className={`tv-demo-btn ${demo ? 'tv-demo-on' : ''}`} onClick={toggleDemo}>
            {demo ? <IconPause size={16} /> : <IconPlay size={16} />}
            {demo ? 'Demo automática: ON' : 'Modo automático (demo)'}
          </button>
          <Link to="/" className="tv-exit">← Sistema</Link>
        </div>
      </header>

      <main className="tv-body">
        <div className="tv-now-grid">
          <NowPanel title="AHORA · EN TRIAGE" item={inTriage} tag="Pase a enfermería · triaje" accent="triage" />
          <NowPanel title="AHORA · EN CONSULTA" item={inConsulta} tag="Diríjase al consultorio indicado" accent="consulta" />
        </div>

        <section className="tv-next">
          <div className="tv-next-title">
            <span>PROXIMOS TURNOS</span>
            {next && <span className="tv-next-hl">Siguiente: <strong>{next.turno}</strong></span>}
          </div>
          <div className="tv-list">
            {waiting.length === 0 && <p className="tv-empty">No hay pacientes en espera. La pantalla se actualiza automáticamente.</p>}
            {waiting.slice(0, 5).map((a, i) => <Row key={a.id} a={a} idx={i + 1} />)}
          </div>
        </section>

        {waiting.length > 5 && (
          <section className="tv-rest">
            <div className="tv-list">
              {waiting.slice(5).map((a, i) => <Row key={a.id} a={a} idx={i + 6} dim />)}
            </div>
          </section>
        )}
      </main>

      <footer className="tv-foot">
        <span className="tv-foot-live"><span className="tv-foot-dot" /> Transmisión en vivo · los turnos cambian automáticamente</span>
      </footer>
    </div>
  )
}
