import React, { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Field, Input, Textarea } from '../../components/ui/Field'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, findConsultorio } from '../../utils/helpers'
import { IconFirstAid, IconMapPin, IconCheckCircle, IconArrowLeft } from '../../components/Icons'
import './Triage.css'

const INITIAL = { pa: '', temp: '', fc: '', peso: '', talla: '', motivo: '', alergias: '', observaciones: '' }

export default function TriageForm() {
  const { cid } = useParams()
  const navigate = useNavigate()
  const { appointments, patients, doctors, specialties, consultorios, nurse, completeTriage } = useApp()
  const toast = useToast()

  const appt = useMemo(() => appointments.find((a) => a.id === cid), [appointments, cid])
  const editable = appt && (appt.status === 'en_espera_triaje' || appt.status === 'en_triaje')

  const [form, setForm] = useState(() =>
    appt?.triage ? Object.fromEntries(Object.keys(INITIAL).map((k) => [k, appt.triage[k] || ''])) : INITIAL
  )
  const [errors, setErrors] = useState({})

  if (!appt) {
    return (
      <div className="anim-in">
        <PageHeader title="Triaje" subtitle="No se encontró la cita." />
        <EmptyState icon={IconFirstAid} title="Cita no encontrada" message="La cita pudo haber sido cancelada o reprogramada." />
      </div>
    )
  }

  const patient = findPatient(patients, appt.patientId)
  const spec = findSpecialty(specialties, appt.specialtyId)
  const doctor = findDoctor(doctors, appt.doctorId)
  const room = doctor && findConsultorio(consultorios, doctor.consultorioId)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = () => {
    const errs = {}
    if (!form.pa.trim()) errs.pa = 'Obligatorio'
    if (!form.temp.trim()) errs.temp = 'Obligatorio'
    if (!form.fc.trim()) errs.fc = 'Obligatorio'
    if (!form.peso.trim()) errs.peso = 'Obligatorio'
    if (!form.talla.trim()) errs.talla = 'Obligatorio'
    if (!form.motivo.trim()) errs.motivo = 'Obligatorio'
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast('Completa los campos obligatorios para continuar.', { type: 'error', title: 'Campos incompletos' })
      return
    }
    completeTriage(appt.id, {
      ...form,
      nurseName: nurse?.name,
      at: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    })
    toast(`Triaje de ${patient?.name} enviado al médico ${doctor?.name}.`, { type: 'success', title: 'Triaje completado' })
    navigate('/enfermeria')
  }

  if (!editable) {
    return (
      <div className="anim-in">
        <PageHeader
          title="Triaje completado"
          subtitle={`${patient?.name} ya fue evaluado por ${nurse?.name || 'enfermería'}.`}
          action={<Button variant="outline" size="sm" icon={IconArrowLeft} onClick={() => navigate('/enfermeria')}>Volver a la cola</Button>}
        />
        <Card>
          <div className="tq-detail-grid">
            <TriageDetail label="Presión arterial" value={appt.triage?.pa} />
            <TriageDetail label="Temperatura" value={appt.triage?.temp} />
            <TriageDetail label="Frec. cardíaca" value={appt.triage?.fc} />
            <TriageDetail label="Peso" value={appt.triage?.peso} />
            <TriageDetail label="Talla" value={appt.triage?.talla} />
            <TriageDetail label="Motivo" value={appt.triage?.motivo} wide />
            <TriageDetail label="Alergias" value={appt.triage?.alergias} />
            <TriageDetail label="Observaciones" value={appt.triage?.observaciones} wide />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="anim-in">
      <PageHeader
        title={`Triaje · ${patient?.name}`}
        subtitle={
          <span className="row">
            <Badge status={appt.status} /> {spec?.name} · {doctor?.name} · {room?.nombre} {room?.piso}
          </span>
        }
        action={<Button variant="outline" size="sm" icon={IconArrowLeft} onClick={() => navigate('/enfermeria')}>Cancelar</Button>}
      />

      <Card>
        <div className="row mb-2">
          <span className="chip chip-blue"><IconMapPin size={14} /> {room?.nombre} · {room?.piso}</span>
          <span className="chip chip-blue"><IconFirstAid size={14} /> Signos vitales y anamnesis rápida</span>
        </div>

        <div className="tq-form-grid">
          <Field label="Presión arterial" required error={errors.pa}>
            <Input placeholder="120/80" value={form.pa} onChange={set('pa')} />
          </Field>
          <Field label="Temperatura (°C)" required error={errors.temp}>
            <Input placeholder="36.5" value={form.temp} onChange={set('temp')} />
          </Field>
          <Field label="Frecuencia cardíaca (lpm)" required error={errors.fc}>
            <Input placeholder="72" value={form.fc} onChange={set('fc')} />
          </Field>
          <Field label="Peso (kg)" required error={errors.peso}>
            <Input placeholder="68" value={form.peso} onChange={set('peso')} />
          </Field>
          <Field label="Talla (m)" required error={errors.talla}>
            <Input placeholder="1.70" value={form.talla} onChange={set('talla')} />
          </Field>
          <Field label="Alergias">
            <Input placeholder="Penicilina, látex…" value={form.alergias} onChange={set('alergias')} />
          </Field>
        </div>

        <div className="mt-2">
          <Field label="Motivo de consulta" required error={errors.motivo}>
            <Textarea rows={3} placeholder="Describe brevemente el motivo por el que el paciente acude…" value={form.motivo} onChange={set('motivo')} />
          </Field>
          <Field label="Observaciones de la enfermera">
            <Textarea rows={3} placeholder="Alergias, medicación actual, signos de alarma…" value={form.observaciones} onChange={set('observaciones')} />
          </Field>
        </div>

        <div className="row mt-3" style={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => navigate('/enfermeria')}>Descartar</Button>
          <Button variant="accent" icon={IconCheckCircle} onClick={submit}>Completar triaje y enviar al médico</Button>
        </div>
      </Card>
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
