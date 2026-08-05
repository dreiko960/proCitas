import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { Tabs } from '../../components/ui/Tabs'
import AppointmentCard from '../../components/AppointmentCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconCalendarX, IconCalendarCheck, IconRefresh, IconAlertTriangle, IconClock, IconCalendar } from '../../components/Icons'

function canCancelLate(appt) {
  return ['2026-08-04', '2026-08-05'].some((d) => appt.date === d && appt.time >= '12:00')
}

export default function MyAppointments() {
  const { appointments, doctors, specialties, consultorios, auth, updateAppointment } = useApp()
  const toast = useToast()
  const mine = useMemo(() => appointments.filter((a) => a.patientId === auth.user.id), [appointments, auth.user.id])
  const [tab, setTab] = useState('upcoming')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [lateNote, setLateNote] = useState(null)
  const [resched, setResched] = useState(null)

  const upcoming = mine.filter((a) => ['agendada', 'pagada', 'check_in', 'en_espera_triaje', 'en_triaje', 'triaje_completado', 'en_atencion', 'reprogramada'].includes(a.status))
  const past = mine.filter((a) => ['atendida', 'documentada'].includes(a.status))
  const cancelled = mine.filter((a) => a.status === 'cancelada')

  const requestCancel = (a) => {
    if (canCancelLate(a)) {
      setLateNote(a)
    } else {
      setCancelTarget(a)
    }
  }

  const confirmCancel = (a) => {
    updateAppointment(a.id, { status: 'cancelada' }, {
      user: auth.user.email, action: 'Cita cancelada', detail: `Cita ${a.id} cancelada por el paciente`, sev: 'warning', icon: 'x',
    })
    setCancelTarget(null)
    toast('Cita cancelada. Liberamos el horario para otro paciente.', { type: 'info', title: 'Cita cancelada' })
  }

  const confirmLateCancel = (a) => {
    confirmCancel(a)
    setLateNote(null)
  }

  const reschedule = (a) => {
    updateAppointment(a.id, { status: 'reprogramada', time: '11:00', date: '2026-08-11' }, {
      user: auth.user.email, action: 'Cita reprogramada', detail: `Cita ${a.id} reprogramada a 11/08 11:00`, sev: 'info', icon: 'refresh',
    })
    setResched(null)
    toast('Reprogramamos tu cita para el martes 11 de agosto a las 11:00.', { type: 'success', title: 'Cita reprogramada' })
  }

  const renderCard = (a) => (
    <AppointmentCard
      key={a.id}
      appt={a}
      doctors={doctors}
      specialties={specialties}
      consultorios={consultorios}
      actions={
        <div className="row wrap">
          {['agendada', 'pagada'].includes(a.status) && (
            <>
              <Button variant="outline" size="sm" icon={IconRefresh} onClick={() => setResched(a)}>Reprogramar</Button>
              <Button variant="destructive" size="sm" icon={IconCalendarX} onClick={() => requestCancel(a)}>Cancelar</Button>
              <Link to="/paciente/checkin"><Button variant="secondary" size="sm" icon={IconCalendarCheck}>Hacer check-in</Button></Link>
            </>
          )}
          {a.status === 'en_espera_triaje' && (
            <span className="small" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>En la cola de triaje de tu consultorio</span>
          )}
          {a.status === 'en_triaje' && (
            <span className="small" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>Te está evaluando la enfermera</span>
          )}
          {a.status === 'triaje_completado' && (
            <span className="small" style={{ color: 'var(--success)', fontWeight: 700 }}>Tu médico ya te espera</span>
          )}
          {a.status === 'en_atencion' && (
            <span className="small" style={{ color: 'var(--success)', fontWeight: 700 }}>Estás en consulta</span>
          )}
          {a.status === 'reprogramada' && <Badge status="reprogramada">Reprogramada</Badge>}
          {a.status === 'cancelada' && <Badge status="cancelada">Cancelada</Badge>}
        </div>
      }
    />
  )

  return (
    <div className="anim-in">
      <PageHeader title="Mis citas" subtitle="Gestiona tus citas próximas, pasadas y canceladas." />
      <Tabs
        tabs={[
          { value: 'upcoming', label: 'Próximas', count: upcoming.length },
          { value: 'past', label: 'Pasadas', count: past.length },
          { value: 'cancelled', label: 'Canceladas', count: cancelled.length },
        ]}
        active={tab}
        onChange={setTab}
      >
        {tab === 'upcoming' && (
          upcoming.length ? <div className="column-list">{upcoming.map(renderCard)}</div> :
          <EmptyState icon={IconCalendar} title="No tienes citas próximas" message="Reserva tu próxima consulta o únete a la lista de espera." action="Reservar cita" actionIcon={IconCalendarCheck} onAction={() => window.location.assign('#/paciente/reservar')} />
        )}
        {tab === 'past' && (
          past.length ? <div className="column-list">{past.map(renderCard)}</div> :
          <EmptyState icon={IconClock} title="Aún no tienes atenciones" message="Cuando acudas a tus citas, tu historial se construirá aquí." />
        )}
        {tab === 'cancelled' && (
          cancelled.length ? <div className="column-list">{cancelled.map(renderCard)}</div> :
          <EmptyState icon={IconCalendarX} title="Sin citas canceladas" message="Las citas que canceles aparecerán aquí." />
        )}
      </Tabs>

      {/* ——— Modal cancelar ——— */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="¿Cancelar esta cita?"
        tone="danger"
        icon={IconCalendarX}
        size="sm"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Volver</Button>
            <Button variant="destructive" onClick={() => confirmCancel(cancelTarget)}>Sí, cancelar cita</Button>
          </div>
        }
      >
        {cancelTarget && (
          <p>
            Cancelarás tu cita de <strong>{cancelTarget.date}</strong> a las <strong>{cancelTarget.time}</strong>.
            El horario volverá a estar disponible para otros pacientes.
          </p>
        )}
      </Modal>

      {/* ——— Modal cancelación tardía ——— */}
      <Modal
        open={!!lateNote}
        onClose={() => setLateNote(null)}
        title="Cancelación fuera de plazo"
        tone="warning"
        icon={IconAlertTriangle}
        size="sm"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setLateNote(null)}>Mantener mi cita</Button>
            <Button variant="destructive" onClick={() => confirmLateCancel(lateNote)}>Aun así cancelar</Button>
          </div>
        }
      >
        {lateNote && (
          <div>
            <p>
              Tu cita es <strong>mañana</strong> y el plazo mínimo de cancelación es de <strong>12 horas</strong> antes.
            </p>
            <p className="mt-1 small">Cancelaciones tardías pueden afectar la disponibilidad de otros pacientes. Te invitamos a acudir o reprogramar.</p>
          </div>
        )}
      </Modal>

      {/* ——— Modal reprogramar ——— */}
      <Modal
        open={!!resched}
        onClose={() => setResched(null)}
        title="Reprogramar cita"
        tone="primary"
        icon={IconRefresh}
        size="sm"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setResched(null)}>Volver</Button>
            <Button variant="primary" onClick={() => reschedule(resched)}>Reprogramar a 11/08 · 11:00</Button>
          </div>
        }
      >
        {resched && (
          <p>
            Sugerimos el <strong>martes 11 de agosto a las 11:00</strong> con el mismo médico. El sistema conserva tu cita original hasta que confirmes.
          </p>
        )}
      </Modal>
    </div>
  )
}
