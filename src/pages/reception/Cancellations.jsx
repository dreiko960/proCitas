import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, fmtDate } from '../../utils/helpers'
import { IconCalendarX, IconAlertTriangle, IconRefresh, IconCalendarCheck } from '../../components/Icons'
import './Cancellations.css'

function isLate(a) {
  return a.date === '2026-08-05' && a.time >= '14:00'
}

export default function ReceptionCancellations() {
  const { appointments, patients, doctors, specialties, updateAppointment, bookAppointment } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState('active')
  const [target, setTarget] = useState(null)
  const [reschedTarget, setReschedTarget] = useState(null)

  const active = appointments
    .filter((a) => a.date >= '2026-08-05' && !['cancelada', 'reprogramada', 'documentada'].includes(a.status))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
  const cancelled = appointments.filter((a) => a.status === 'cancelada').sort((a, b) => (a.date < b.date ? 1 : -1))

  const doCancel = () => {
    updateAppointment(target.id, { status: 'cancelada' }, {
      user: 'sofia.mendoza@cmas.com', action: 'Cita cancelada por recepción', detail: `Cita ${target.id} a nombre del paciente`, sev: 'warning', icon: 'x',
    })
    setTarget(null)
    toast('Cita cancelada a nombre del paciente. Se notificó y se liberó el cupo.', { type: 'info', title: 'Cancelación registrada' })
  }

  const doResched = () => {
    const a = reschedTarget
    updateAppointment(a.id, { status: 'reprogramada', date: '2026-08-07', time: '15:30' }, {
      user: 'sofia.mendoza@cmas.com', action: 'Cita reprogramada', detail: `Cita ${a.id} reprogramada por recepción`, sev: 'info', icon: 'refresh',
    })
    setReschedTarget(null)
    toast(`Se ofreció el 07/08 a las 15:30. El paciente confirmará por SMS.`, { type: 'success', title: 'Cita reprogramada' })
  }

  const renderRow = (a) => {
    const patient = findPatient(patients, a.patientId)
    const spec = findSpecialty(specialties, a.specialtyId)
    const doctor = findDoctor(doctors, a.doctorId)
    const late = isLate(a)
    return (
      <div key={a.id} className="cancel-row">
        <Avatar name={patient?.name} initials={patient?.initials} size={40} />
        <div className="grow">
          <p className="bold small">{patient?.name}</p>
          <p className="tiny muted">{spec?.name} · {doctor?.name} · {a.id} · {fmtDate(a.date)} {a.time}</p>
          {late && <span className="late-tag"><IconAlertTriangle size={13} /> Cancelación tardía (menos de 12h)</span>}
        </div>
        {a.status === 'cancelada' ? (
          <Badge status="cancelada" />
        ) : (
          <div className="row">
            {reschedTarget?.id !== a.id && (
              <Button variant="outline" size="sm" icon={IconRefresh} onClick={() => setReschedTarget(a)}>Reprogramar</Button>
            )}
            <Button variant="destructive" size="sm" icon={IconCalendarX} onClick={() => setTarget(a)}>Cancelar</Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="anim-in">
      <PageHeader title="Gestión de cancelaciones" subtitle="Cancela o reprograma citas a nombre del paciente." />
      <Tabs
        tabs={[
          { value: 'active', label: 'Próximas', count: active.length },
          { value: 'cancelled', label: 'Canceladas', count: cancelled.length },
        ]}
        active={tab}
        onChange={setTab}
      >
        {tab === 'active' && (
          active.length ? (
            <Card style={{ padding: 0 }}>
              <div className="cancel-list">{active.map(renderRow)}</div>
            </Card>
          ) : (
            <EmptyState icon={IconCalendarCheck} title="Sin citas próximas" message="No hay citas próximas para gestionar." />
          )
        )}
        {tab === 'cancelled' && (
          cancelled.length ? (
            <Card style={{ padding: 0 }}>
              <div className="cancel-list">{cancelled.map(renderRow)}</div>
            </Card>
          ) : (
            <EmptyState icon={IconCalendarX} title="Sin cancelaciones" message="Las citas canceladas aparecerán aquí." />
          )
        )}
      </Tabs>

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Cancelar cita a nombre del paciente"
        tone={isLate(target) ? 'warning' : 'danger'}
        icon={isLate(target) ? IconAlertTriangle : IconCalendarX}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setTarget(null)}>Volver</Button>
            <Button variant="destructive" onClick={doCancel}>Cancelar cita</Button>
          </div>
        }
      >
        {target && (
          <div>
            <p>Se cancelará la cita <strong>{target.id}</strong> de <strong>{findPatient(patients, target.patientId)?.name}</strong>.</p>
            {isLate(target) && (
              <p className="mt-1 small" style={{ color: 'var(--warning)', fontWeight: 700 }}>
                ⚠️ Es una cancelación tardía (menos de 12 horas antes). El paciente puede perder la prioridad.
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!reschedTarget}
        onClose={() => setReschedTarget(null)}
        title="Reprogramar cita"
        tone="primary"
        icon={IconRefresh}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setReschedTarget(null)}>Volver</Button>
            <Button variant="primary" onClick={doResched}>Ofrecer 07/08 · 15:30</Button>
          </div>
        }
      >
        <p>Se reprogramará la cita de <strong>{reschedTarget && findPatient(patients, reschedTarget.patientId)?.name}</strong> al <strong>viernes 07/08 a las 15:30</strong>. El paciente confirmará por SMS.</p>
      </Modal>
    </div>
  )
}
