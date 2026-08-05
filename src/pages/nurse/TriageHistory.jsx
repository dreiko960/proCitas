import React, { useMemo } from 'react'
import PageHeader from '../../components/PageHeader'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { findPatient, findSpecialty, findDoctor } from '../../utils/helpers'
import { IconFirstAid } from '../../components/Icons'
import './Triage.css'

const TODAY = '2026-08-05'

export default function TriageHistory() {
  const { appointments, patients, doctors, specialties, nurse } = useApp()

  const triaged = useMemo(() => {
    const done = ['triaje_completado', 'en_atencion', 'atendida', 'documentada']
    return appointments
      .filter((a) => a.date === TODAY && done.includes(a.status) && a.triage)
      .sort((a, b) => (a.time < b.time ? -1 : 1))
  }, [appointments])

  return (
    <div className="anim-in">
      <PageHeader
        title="Triajes del turno"
        subtitle={`Miércoles 05 de agosto · ${triaged.length} paciente(s) con triaje completado`}
      />

      {triaged.length === 0 ? (
        <EmptyState
          icon={IconFirstAid}
          title="Aún no hay triajes completados"
          message="Los triajes que completes aparecerán aquí durante el turno."
        />
      ) : (
        <div className="tq-history-list">
          {triaged.map((a) => {
            const patient = findPatient(patients, a.patientId)
            const spec = findSpecialty(specialties, a.specialtyId)
            const doctor = findDoctor(doctors, a.doctorId)
            return (
              <Card key={a.id}>
                <div className="tq-card-head">
                  <Avatar name={patient?.name} initials={patient?.initials} size={42} />
                  <div className="grow">
                    <p className="bold small">{patient?.name}</p>
                    <p className="tiny muted">{spec?.name} · {doctor?.name} · {a.time} · {a.id}</p>
                  </div>
                  <Badge status={a.status} />
                </div>
                <div className="tq-detail-grid">
                  <TriageDetail label="PA" value={a.triage.pa} />
                  <TriageDetail label="Temp" value={a.triage.temp} />
                  <TriageDetail label="FC" value={a.triage.fc} />
                  <TriageDetail label="Peso" value={a.triage.peso} />
                  <TriageDetail label="Talla" value={a.triage.talla} />
                  <TriageDetail label="Motivo" value={a.triage.motivo} wide />
                  {a.triage.alergias && a.triage.alergias !== 'Ninguna' && <TriageDetail label="Alergias" value={a.triage.alergias} />}
                  {a.triage.observaciones && a.triage.observaciones !== '—' && <TriageDetail label="Observaciones" value={a.triage.observaciones} wide />}
                </div>
                <p className="tiny muted mt-1">
                  Evaluado por {a.triage.nurseName || nurse?.name} a las {a.triage.at || '—'}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TriageDetail({ label, value, wide }) {
  return (
    <div className={`tq-detail ${wide ? 'tq-detail-wide' : ''}`}>
      <span className="tiny muted">{label}</span>
      <p className="bold small">{value || '—'}</p>
    </div>
  )
}
