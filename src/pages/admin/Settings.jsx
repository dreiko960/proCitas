import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Field'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconSettings, IconClock, IconCalendar, IconTimer, IconListCheck, IconCheck } from '../../components/Icons'
import './Settings.css'

const MONTH_DAYS = [
  { d: '2026-08-01', label: 'Sáb' }, { d: '2026-08-02', label: 'Dom' }, { d: '2026-08-03', label: 'Lun' },
  { d: '2026-08-04', label: 'Mar' }, { d: '2026-08-05', label: 'Mié' }, { d: '2026-08-06', label: 'Jue' },
  { d: '2026-08-07', label: 'Vie' }, { d: '2026-08-08', label: 'Sáb' }, { d: '2026-08-09', label: 'Dom' },
  { d: '2026-08-10', label: 'Lun' }, { d: '2026-08-11', label: 'Mar' }, { d: '2026-08-12', label: 'Mié' },
  { d: '2026-08-13', label: 'Jue' }, { d: '2026-08-14', label: 'Vie' }, { d: '2026-08-15', label: 'Sáb' },
]

export default function AdminSettings() {
  const { settings, setSettings } = useApp()
  const toast = useToast()
  const [form, setForm] = useState({ ...settings })
  const [nonWorking, setNonWorking] = useState(settings.nonWorkingDays)

  const toggleDay = (d) => {
    setNonWorking((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]))
  }

  const save = (e) => {
    e.preventDefault()
    setSettings({ ...form, nonWorkingDays: nonWorking })
    toast('Configuración general guardada y aplicada en todo el sistema.', { type: 'success', title: 'Configuración guardada' })
  }

  return (
    <div className="anim-in">
      <PageHeader title="Configuración general" subtitle="Reglas de negocio del centro médico." />

      <form onSubmit={save}>
        <div className="grid settings-grid">
          <Card>
            <CardHeader icon={IconClock} title="Reglas de citas" subtitle="Plazos y ventanas de tiempo" />
            <div className="settings-body">
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Input
                  label="Anticipación mínima de cancelación (horas)"
                  type="number" value={form.minCancelHours}
                  onChange={(e) => setForm((f) => ({ ...f, minCancelHours: Number(e.target.value) }))}
                  hint="Antes de este plazo el paciente puede cancelar sin penalización."
                />
                <Input
                  label="Anticipación mínima de reserva (horas)"
                  type="number" value="2"
                  onChange={() => {}}
                  hint="Horas mínimas antes de la cita para poder reservar."
                />
              </div>
              <div className="settings-note">
                <IconClock size={16} />
                <p className="small">Si el paciente cancela con menos de {form.minCancelHours} horas, se marca como <strong>cancelación tardía</strong> y se registra en auditoría.</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon={IconTimer} title="Recuperación de contraseña" subtitle="Seguridad de los enlaces" />
            <div className="settings-body">
              <Input
                label="Tiempo de expiración del token (minutos)"
                type="number" value={form.tokenExpiryMin}
                onChange={(e) => setForm((f) => ({ ...f, tokenExpiryMin: Number(e.target.value) }))}
                hint="El enlace de recuperación deja de funcionar después de este tiempo."
              />
              <div className="settings-note">
                <IconTimer size={16} />
                <p className="small">Un token se invalida al primer uso. Los intentos fallidos se registran en el log de auditoría.</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon={IconListCheck} title="Lista de espera inteligente" subtitle="Módulo de innovación" />
            <div className="settings-body">
              <Input
                label="Ventana de tiempo para confirmar cupo (minutos)"
                type="number" value={form.waitlistWindowMin}
                onChange={(e) => setForm((f) => ({ ...f, waitlistWindowMin: Number(e.target.value) }))}
                hint="Tiempo que tiene el paciente para aceptar o rechazar una oferta."
              />
              <div className="settings-note">
                <IconListCheck size={16} />
                <p className="small">Al vencer la ventana, el cupo pasa automáticamente al siguiente paciente de la lista.</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon={IconCalendar} title="Días no laborables" subtitle="El centro no agenda citas en estas fechas" />
            <div className="settings-body">
              <div className="cal-grid">
                {MONTH_DAYS.map((m) => (
                  <button key={m.d} type="button" className={`cal-day ${nonWorking.includes(m.d) ? 'cal-day-off' : ''}`} onClick={() => toggleDay(m.d)}>
                    <span className="cal-dow">{m.label}</span>
                    <strong>{m.d.slice(8)}</strong>
                    {nonWorking.includes(m.d) && <span className="cal-off-tag">No laborable</span>}
                  </button>
                ))}
              </div>
              <p className="tiny muted mt-2">Toca un día para marcarlo como no laborable.</p>
            </div>
          </Card>
        </div>

        <div className="row mt-3" style={{ justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={() => toast('Se restablecieron los valores anteriores', { type: 'info', title: 'Cambios descartados' })}>Descartar</Button>
          <Button type="submit" variant="primary" icon={IconCheck} size="lg">Guardar configuración</Button>
        </div>
      </form>
    </div>
  )
}
