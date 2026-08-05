import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Textarea, Select } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Misc'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio } from '../../utils/helpers'
import { IconStethoscope, IconLock, IconSave, IconCheckCircle, IconAlertTriangle, IconFileText, IconFirstAid, IconMapPin } from '../../components/Icons'
import './Diagnosis.css'

export default function DoctorDiagnosis() {
  const { cid } = useParams()
  const navigate = useNavigate()
  const { appointments, doctors, patients, specialties, consultorios, updateAppointment } = useApp()
  const toast = useToast()
  const appt = appointments.find((a) => a.id === cid)

  const [dx, setDx] = useState('')
  const [notes, setNotes] = useState('')
  const [severity, setSeverity] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  if (!appt) return <p className="muted">Cita no encontrada.</p>

  const patient = findPatient(patients, appt.patientId)
  const spec = findSpecialty(specialties, appt.specialtyId)
  const doctor = findDoctor(doctors, appt.doctorId)
  const room = findConsultorio(consultorios, doctor?.consultorioId)
  const enabled = appt.status === 'en_atencion'

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (!dx.trim() || dx.trim().length < 5) er.dx = 'Describe el diagnóstico (mínimo 5 caracteres)'
    if (!notes.trim()) er.notes = 'Agrega observaciones clínicas'
    setErrors(er)
    if (Object.keys(er).length) { toast('Completa los campos obligatorios', { type: 'error', title: 'Diagnóstico no guardado' }); return }
    setSaving(true)
    setTimeout(() => {
      updateAppointment(appt.id, { status: 'documentada', diag: { dx: dx.trim(), notes: notes.trim(), severity, at: 'Hoy' } }, {
        user: 'rosa.quispe@cmas.com', action: 'Diagnóstico documentado', detail: `Cita ${appt.id} marcada como documentada`, sev: 'info', icon: 'file',
      })
      setSaving(false)
      toast('El diagnóstico quedó registrado y la cita pasó a documentada.', { type: 'success', title: 'Historia clínica actualizada' })
      navigate('/medico')
    }, 700)
  }

  return (
    <div className="anim-in">
      <PageHeader title="Registrar diagnóstico" subtitle={`Cita ${appt.id}`} back="/medico" />

      {!enabled && (
        <div className="diag-locked">
          <IconLock size={18} />
          <p className="small">
            Este formulario se habilita <strong>solo cuando la cita está en estado “en atención”</strong>.
            Estado actual: <Badge status={appt.status} />
          </p>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start', gap: 20 }}>
        <Card className="diag-form-card">
          <div className="diag-patient">
            <Avatar name={patient?.name} initials={patient?.initials} size={48} />
            <div className="grow">
              <p className="bold">{patient?.name}</p>
              <p className="small muted">DNI {patient?.dni} · {patient?.age} años</p>
            </div>
            <Badge status={appt.status} />
          </div>

          <form onSubmit={save} noValidate>
            <div className="grid" style={{ gap: 16, marginTop: 18 }}>
              <div className="field">
                <label className="field-label">Diagnóstico <span className="field-req">*</span></label>
                <input
                  className={`input ${errors.dx ? 'input-invalid' : ''}`}
                  value={dx}
                  disabled={!enabled}
                  onChange={(e) => setDx(e.target.value)}
                  placeholder="Ej. Hipertensión arterial leve"
                />
                {errors.dx && <p className="field-msg field-msg-error">{errors.dx}</p>}
                {dx && !errors.dx && <p className="field-msg field-msg-success">Diagnóstico válido</p>}
              </div>
              <Select label="Severidad" value={severity} disabled={!enabled} onChange={(e) => setSeverity(e.target.value)}>
                <option value="">Selecciona…</option>
                <option>Leve</option>
                <option>Moderada</option>
                <option>Severa</option>
              </Select>
              <div className="field">
                <label className="field-label">Observaciones clínicas <span className="field-req">*</span></label>
                <textarea
                  className={`input textarea ${errors.notes ? 'input-invalid' : ''}`}
                  value={notes}
                  disabled={!enabled}
                  rows={5}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Indicaciones, medicamentos, controles…"
                />
                {errors.notes && <p className="field-msg field-msg-error">{errors.notes}</p>}
                <p className="field-msg field-msg-hint">Este texto será visible en el historial del paciente y se incluye en el PDF.</p>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={enabled ? IconSave : IconLock}
                disabled={!enabled || saving}
                full
              >
                {saving ? 'Guardando…' : enabled ? 'Guardar y marcar como documentada' : 'Disponible solo en citas en atención'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="diag-side">
          <Card className="diag-side-card">
            <p className="bold small mb-1">Datos de la consulta</p>
            <div className="confirm-rows">
              <div className="confirm-row"><span className="muted">Especialidad</span><strong>{spec?.name}</strong></div>
              <div className="confirm-row"><span className="muted">Consultorio</span><strong>{room?.nombre || '—'} · {room?.piso || ''}</strong></div>
              <div className="confirm-row"><span className="muted">Fecha</span><strong>{appt.date}</strong></div>
              <div className="confirm-row"><span className="muted">Hora</span><strong>{appt.time}</strong></div>
              <div className="confirm-row"><span className="muted">Motivo</span><strong className="small">{appt.reason}</strong></div>
            </div>
          </Card>
          {appt.triage && (
            <Card className="diag-side-card">
              <p className="bold small mb-1"><IconFirstAid size={14} style={{ verticalAlign: '-2px' }} /> Triaje de enfermería</p>
              <div className="confirm-rows">
                <div className="confirm-row"><span className="muted">PA</span><strong>{appt.triage.pa}</strong></div>
                <div className="confirm-row"><span className="muted">Temp</span><strong>{appt.triage.temp}</strong></div>
                <div className="confirm-row"><span className="muted">FC</span><strong>{appt.triage.fc}</strong></div>
                <div className="confirm-row"><span className="muted">Peso</span><strong>{appt.triage.peso}</strong></div>
                <div className="confirm-row"><span className="muted">Talla</span><strong>{appt.triage.talla}</strong></div>
                <div className="confirm-row"><span className="muted">Alergias</span><strong>{appt.triage.alergias}</strong></div>
                <div className="confirm-row"><span className="muted">Por</span><strong className="small">{appt.triage.nurseName}</strong></div>
              </div>
              <p className="tiny muted mt-1">{appt.triage.motivo}</p>
            </Card>
          )}
          <Card className="diag-side-card">
            <p className="bold small mb-1">Estado del documento</p>
            <div className="diag-state">
              <span className={`diag-state-item ${appt.status === 'en_atencion' ? 'diag-state-ok' : ''}`}><IconStethoscope size={14} /> 1. En atención</span>
              <span className="diag-state-arrow">→</span>
              <span className={`diag-state-item ${appt.status === 'documentada' ? 'diag-state-ok' : ''}`}><IconFileText size={14} /> 2. Documentada</span>
            </div>
            <p className="tiny muted mt-1">
              <IconAlertTriangle size={13} style={{ verticalAlign: '-2px' }} /> La cita debe estar en atención para guardar el diagnóstico.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
