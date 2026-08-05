import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findDoctor, findSpecialty, fmtDateFull, fmtPrice } from '../../utils/helpers'
import { IconHistory, IconPdf, IconChevronDown, IconFileText, IconDownload } from '../../components/Icons'
import './History.css'

export default function PatientHistory() {
  const { appointments, doctors, specialties, auth } = useApp()
  const toast = useToast()
  const [open, setOpen] = useState(null)
  const [pdfTarget, setPdfTarget] = useState(null)

  const history = appointments
    .filter((a) => a.patientId === auth.user.id && (a.status === 'atendida' || a.status === 'documentada'))
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const downloadPdf = (a) => {
    setPdfTarget(null)
    toast('Descargando resumen clínico en PDF…', { type: 'info', title: 'Comprobante generado' })
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Mi historial clínico"
        subtitle={`${history.length} atenciones documentadas · datos protegidos`}
        action={
          history.length > 0 && (
            <Button variant="secondary" icon={IconDownload} onClick={() => { toast('Preparando PDF del historial completo…', { type: 'info' }) }}>
              Descargar todo (PDF)
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
                      <div className="tl-dx">
                        <span className="tl-dx-label"><IconFileText size={15} /> Diagnóstico</span>
                        <p className="tl-dx-text">{a.diag?.dx || 'Sin diagnóstico registrado'}</p>
                      </div>
                      {a.diag?.notes && (
                        <div className="tl-notes">
                          <span className="tl-dx-label">Notas del médico</span>
                          <p>{a.diag.notes}</p>
                        </div>
                      )}
                      <div className="row-between">
                        <span className="small muted">Cita {a.id} · Costo {fmtPrice(spec?.price)}</span>
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
            <Button variant="primary" icon={IconDownload} onClick={downloadPdf}>Descargar PDF</Button>
          </div>
        }
      >
        <p>
          Se generará el resumen de la cita <strong>{pdfTarget?.id}</strong> con diagnóstico y notas del médico, en formato PDF seguro.
        </p>
      </Modal>
    </div>
  )
}
