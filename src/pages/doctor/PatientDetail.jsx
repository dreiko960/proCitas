import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Misc'
import { useApp } from '../../context/AppContext'
import { findPatient, findSpecialty, findDoctor, findConsultorio } from '../../utils/helpers'
import { IconShield, IconUserX, IconFileText, IconCalendar, IconDownload, IconCheckCircle, IconStethoscope, IconFirstAid, IconChevronDown, IconMapPin } from '../../components/Icons'
import './PatientDetail.css'

export default function DoctorPatientDetail() {
  const { pid } = useParams()
  const navigate = useNavigate()
  const { patients, appointments, doctors, specialties, consultorios, auth } = useApp()
  const [openTriage, setOpenTriage] = useState(null)
  const patient = findPatient(patients, pid)

  // Relación vigente: solo si el paciente tiene citas pasadas con este médico
  const relatedAppts = appointments.filter((a) => a.patientId === pid && a.doctorId === 'd1' && a.status !== 'cancelada')
  const hasRelation = relatedAppts.length > 0

  if (!hasRelation) {
    return (
      <div className="anim-in">
        <PageHeader title="Detalle del paciente" back="/medico" />
        <Card className="denied-card">
          <span className="denied-icon"><IconShield size={34} /></span>
          <h2>Acceso denegado</h2>
          <p className="muted">
            No tienes una relación clínica vigente con <strong>{patient?.name || 'este paciente'}</strong>.
          </p>
          <div className="denied-detail">
            <span className="row"><IconUserX size={16} /> Sin citas previas con este médico</span>
            <span className="row"><IconShield size={16} /> Regla: historial visible solo con relación activa</span>
            <span className="row"><IconCheckCircle size={16} /> Auditoría: este acceso quedó registrado</span>
          </div>
          <div className="row">
            <Button variant="ghost" onClick={() => navigate('/medico')}>Volver a mi agenda</Button>
          </div>
        </Card>
      </div>
    )
  }

  const history = relatedAppts.sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="anim-in">
      <PageHeader title={patient.name} subtitle={`DNI ${patient.dni} · ${patient.age} años · ${patient.phone}`} back="/medico" />

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 18 }}>
        <Card className="pd-summary">
          <div className="row" style={{ gap: 16 }}>
            <Avatar name={patient.name} initials={patient.initials} size={56} />
            <div className="grow">
              <p className="bold">{patient.name}</p>
              <p className="small muted">{patient.dob} · {patient.address}</p>
              <div className="row mt-1" style={{ gap: 8 }}>
                <Badge status="documentada">Relación vigente</Badge>
                <Badge status="pagado">Ficha activa</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={IconDownload} onClick={() => { /* */ }}>Ficha (PDF)</Button>
          </div>
        </Card>

        <Card>
          <div className="pd-hist-head">
            <h3 className="bold">Historial de atenciones contigo</h3>
            <span className="small muted">{history.length} registros</span>
          </div>
          <div className="pd-hist">
            {history.map((a) => {
              const spec = findSpecialty(specialties, a.specialtyId)
              const doc = findDoctor(doctors, a.doctorId)
              const room = findConsultorio(consultorios, doc?.consultorioId)
              const hasTriage = !!a.triage
              return (
                <div key={a.id} className="pd-hist-row">
                  <span className="pd-hist-date">
                    <strong>{new Date(a.date + 'T00:00:00').getDate()}</strong>
                    <span>{new Date(a.date + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short' })}</span>
                  </span>
                  <div className="grow">
                    <p className="bold small">{spec?.name}</p>
                    <p className="tiny muted">
                      {a.reason}
                      {room && <span className="pd-room"><IconMapPin size={12} /> {room.nombre} · {room.piso}</span>}
                    </p>
                    {a.diag && (
                      <p className="pd-diag"><IconFileText size={13} /> {a.diag.dx} — {a.diag.notes}</p>
                    )}
                    {hasTriage && (
                      <>
                        <button className={`pd-triage-toggle ${openTriage === a.id ? 'pd-triage-open' : ''}`} onClick={() => setOpenTriage(openTriage === a.id ? null : a.id)}>
                          <IconFirstAid size={13} /> Datos de triaje <IconChevronDown size={13} />
                        </button>
                        {openTriage === a.id && (
                          <div className="pd-triage-box">
                            <div><span>PA</span><strong>{a.triage.pa}</strong></div>
                            <div><span>Temp</span><strong>{a.triage.temp}</strong></div>
                            <div><span>FC</span><strong>{a.triage.fc}</strong></div>
                            <div><span>Peso</span><strong>{a.triage.peso}</strong></div>
                            <div><span>Talla</span><strong>{a.triage.talla}</strong></div>
                            <div><span>Alergias</span><strong>{a.triage.alergias}</strong></div>
                            <p className="pd-triage-note">{a.triage.motivo}</p>
                            {a.triage.observaciones && a.triage.observaciones !== '—' && (
                              <p className="pd-triage-note">{a.triage.observaciones}</p>
                            )}
                            <p className="tiny muted">Por {a.triage.nurseName} · {a.triage.at}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <Badge status={a.status} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
