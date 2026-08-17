import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, findConsultorio, consultorioOf, fmtPrice } from '../../utils/helpers'
import { IconHistory, IconPdf, IconChevronDown, IconFileText, IconDownload, IconFirstAid, IconMapPin, IconClock } from '../../components/Icons'
import './History.css'

export default function PatientHistory() {
  const { appointments, doctors, specialties, consultorios, patients, auth } = useApp()
  const toast = useToast()
  const [open, setOpen] = useState(null)
  const [pdfTarget, setPdfTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const history = appointments
    .filter((a) => a.patientId === auth.user.id && (a.status === 'atendida' || a.status === 'documentada'))
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const patient = patients.find((p) => p.id === auth.user.id)

  const downloadOne = async (a) => {
    try {
      const { generateAppointmentPdf } = await import('../../utils/clinicPdf')
      const doctor = findDoctor(doctors, a.doctorId)
      const spec = findSpecialty(specialties, a.specialtyId)
      const room = findConsultorio(consultorios, doctor?.consultorioId)
      generateAppointmentPdf({ appt: a, patient, doctor, spec, room })
      setPdfTarget(null)
      toast('El resumen de la cita se descargó en PDF con el membrete de la clínica.', { type: 'success', title: 'PDF generado' })
    } catch {
      toast('No se pudo generar el PDF. Intenta nuevamente.', { type: 'error', title: 'Error al descargar' })
    }
  }

  const downloadAll = async () => {
    if (busy) return
    setBusy(true)
    toast('Generando el PDF del historial completo…', { type: 'info', title: 'Preparando documento' })
    try {
      const { generateClinicalRecordPdf } = await import('../../utils/clinicPdf')
      generateClinicalRecordPdf({
        patient,
        rows: history,
        doctors,
        specialties,
        consultorios,
      })
      toast('Historial clínico descargado con membrete oficial.', { type: 'success', title: 'PDF generado' })
    } catch {
      toast('No se pudo generar el PDF. Intenta nuevamente.', { type: 'error', title: 'Error al descargar' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Mi historial clínico"
        subtitle={`${history.length} atenciones documentadas · datos protegidos`}
        action={
          history.length > 0 && (
            <Button variant="secondary" icon={IconDownload} onClick={downloadAll} disabled={busy}>
              {busy ? 'Generando…' : 'Descargar todo (PDF)'}
            </Button>
          )
        }
      />

      {history.length === 0 ? (
        <EmptyState icon={IconHistory} title="Tu historial está vacío" message="Cuando acudas a tus citas, los diagnósticos y notas de tus médicos aparecerán aquí." />
      ) : (
        <div className="timeline">
          {history.map((a, i) => {
            const doctor = findDoctor(doctors, a.doctorId)
            const spec = findSpecialty(specialties, a.specialtyId)
            const room = consultorioOf(consultorios, doctors, a.doctorId)
            const expanded = open === a.id
            return (
              <div key={a.id} className={`tl-item ${expanded ? 'tl-expanded' : ''}`}>
                <div className="tl-dot-wrap">
                  <span className={`tl-dot ${a.status === 'documentada' ? 'tl-done' : ''}`} />
                  {i < history.length - 1 && <span className="tl-line" />}
                </div>
                <div className="tl-content card">
                  <button className="tl-head" onClick={() => setOpen(expanded ? null : a.id)}>
                    <span className="tl-date">
                      <strong>{new Date(a.date + 'T00:00:00').getDate()}</strong>
                      <span>{new Date(a.date + 'T00:00:00').toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}</span>
                    </span>
                    <span className="grow tl-info">
                      <span className="bold">{spec?.name}</span>
                      <span className="small muted">{doctor?.name} · {a.time}</span>
                    </span>
                    <Badge status={a.status} />
                    <span className={`tl-chev ${expanded ? 'tl-chev-open' : ''}`}><IconChevronDown size={18} /></span>
                  </button>
                  {expanded && (
                    <div className="tl-body anim-in">
                      <div className="tl-meta">
                        <span><IconClock size={13} /> {a.date} · {a.time} · {a.duration || 30} min</span>
                        {room && <span><IconMapPin size={13} /> {room.nombre} · {room.piso}</span>}
                        {a.turno && <span className="tl-turno">Turno {a.turno}</span>}
                        <span>Cita {a.id}</span>
                      </div>

                      {a.reason && (
                        <div className="tl-notes">
                          <span className="tl-dx-label">Motivo de consulta</span>
                          <p>{a.reason}</p>
                        </div>
                      )}

                      <div className="tl-dx">
                        <span className="tl-dx-label"><IconFileText size={15} /> Diagnóstico</span>
                        <p className="tl-dx-text">{a.diag?.dx || 'Sin diagnóstico registrado'}</p>
                        {a.diag?.severity && <span className={`tl-sev tl-sev-${a.diag.severity.toLowerCase()}`}>{a.diag.severity}</span>}
                      </div>
                      {a.diag?.notes && (
                        <div className="tl-notes">
                          <span className="tl-dx-label">Notas e indicaciones del médico</span>
                          <p>{a.diag.notes}</p>
                        </div>
                      )}

                      {a.triage && (
                        <div className="tl-triage">
                          <span className="tl-dx-label"><IconFirstAid size={15} /> Triaje de enfermería</span>
                          <div className="tl-vitals">
                            <div className="tl-vital"><span>P. arterial</span><strong>{a.triage.pa}</strong></div>
                            <div className="tl-vital"><span>Temperatura</span><strong>{a.triage.temp}</strong></div>
                            <div className="tl-vital"><span>Frec. cardíaca</span><strong>{a.triage.fc}</strong></div>
                            <div className="tl-vital"><span>Peso</span><strong>{a.triage.peso}</strong></div>
                            <div className="tl-vital"><span>Talla</span><strong>{a.triage.talla}</strong></div>
                          </div>
                          <div className="tl-triage-rows">
                            <div className="tl-triage-row"><span>Alergias</span><strong>{a.triage.alergias || '—'}</strong></div>
                            {a.triage.motivo && <div className="tl-triage-row"><span>Motivo</span><strong>{a.triage.motivo}</strong></div>}
                            {a.triage.observaciones && a.triage.observaciones !== '—' && (
                              <div className="tl-triage-row"><span>Observaciones</span><strong>{a.triage.observaciones}</strong></div>
                            )}
                            <div className="tl-triage-row"><span>Registrado por</span><strong>{a.triage.nurseName}{a.triage.at ? ` · ${a.triage.at}` : ''}</strong></div>
                          </div>
                        </div>
                      )}

                      <div className="row-between tl-foot">
                        <span className="small muted">Costo {fmtPrice(spec?.price)} · Documentado con firma médica en PDF</span>
                        <Button variant="outline" size="sm" icon={IconPdf} onClick={() => setPdfTarget(a)}>Descargar PDF</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!pdfTarget}
        onClose={() => setPdfTarget(null)}
        title="Descargar resumen clínico"
        tone="primary"
        icon={IconPdf}
        size="sm"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setPdfTarget(null)}>Cancelar</Button>
            <Button variant="primary" icon={IconDownload} onClick={() => pdfTarget && downloadOne(pdfTarget)}>Descargar PDF</Button>
          </div>
        }
      >
        <p>
          Se generará el resumen de la cita <strong>{pdfTarget?.id}</strong> con diagnóstico, notas del médico y triaje, en un PDF con el membrete oficial de la clínica.
        </p>
      </Modal>
    </div>
  )
}