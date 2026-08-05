import React, { useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Field'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconPlus, IconTrash, IconAlertTriangle, IconClock } from '../../components/Icons'
import './Availability.css'

const WEEK = [
  { date: '2026-08-05', label: 'Mié' },
  { date: '2026-08-06', label: 'Jue' },
  { date: '2026-08-07', label: 'Vie' },
  { date: '2026-08-08', label: 'Sáb' },
  { date: '2026-08-09', label: 'Dom' },
  { date: '2026-08-10', label: 'Lun' },
  { date: '2026-08-11', label: 'Mar' },
]

const HOURS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

const INITIAL_BLOCKS = {
  '2026-08-05': ['08:00', '08:30', '09:00', '10:00', '14:00', '14:30', '15:00'],
  '2026-08-06': ['09:00', '09:30', '11:00', '11:30'],
  '2026-08-07': ['08:00', '08:30', '09:00', '15:00', '16:00'],
  '2026-08-10': ['10:00', '10:30', '11:00'],
  '2026-08-11': ['08:00', '08:30'],
}

export default function DoctorAvailability() {
  const { appointments, doctors, consultorios } = useApp()
  const toast = useToast()
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS)
  const [addOpen, setAddOpen] = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm] = useState({ day: '2026-08-06', start: '09:00', end: '09:30' })

  const me = doctors.find((d) => d.id === 'd1')
  const room = consultorios.find((c) => c.id === me?.consultorioId)

  const confirmedByBlock = useMemo(() => {
    const map = {}
    appointments
      .filter((a) => !['cancelada', 'reprogramada'].includes(a.status))
      .forEach((a) => {
        map[`${a.date}|${a.time}`] = a
      })
    return map
  }, [appointments])

  const hasConfirmed = (day, time) => !!confirmedByBlock[`${day}|${time}`]

  const isOverlap = (day, time) => {
    if (blocks[day]?.includes(time)) return true
    return false
  }

  const toggleBlock = (day, time) => {
    setBlocks((b) => {
      const cur = b[day] || []
      if (cur.includes(time)) {
        if (hasConfirmed(day, time)) {
          setDelTarget({ day, time })
          return b
        }
        return { ...b, [day]: cur.filter((t) => t !== time) }
      }
      return { ...b, [day]: [...cur, time].sort() }
    })
    if (!(blocks[day] || []).includes(time)) {
      toast('Bloque de disponibilidad agregado', { type: 'success', title: 'Disponible para reservas' })
    }
  }

  const confirmDelete = () => {
    const { day, time } = delTarget
    setBlocks((b) => ({ ...b, [day]: b[day].filter((t) => t !== time) }))
    setDelTarget(null)
    toast('Bloque eliminado. Las citas ya confirmadas se mantienen.', { type: 'info', title: 'Bloque eliminado' })
  }

  const addBlock = (e) => {
    e.preventDefault()
    const { day, start, end } = form
    if (start >= end) { toast('La hora de inicio debe ser menor a la de fin', { type: 'error' }); return }
    const [sh, sm] = start.split(':').map(Number)
    const [eh] = end.split(':').map(Number)
    const added = []
    for (let h = sh; h < eh; h++) added.push(`${String(h).padStart(2, '0')}:${String(sm).padStart(2, '0')}`)
    setBlocks((b) => ({ ...b, [day]: [...new Set([...(b[day] || []), ...added])].sort() }))
    setAddOpen(false)
    toast(`${added.length} bloque(s) agregados el ${day}`, { type: 'success', title: 'Disponibilidad actualizada' })
  }

  const overlaps = useMemo(() => {
    const list = []
    WEEK.forEach(({ date }) => {
      HOURS.forEach((h) => {
        if (isOverlap(date, h) && isOverlap(date, String(Number(h.slice(0, 2)) + 1).padStart(2, '0') + h.slice(2))) {
          list.push(`${date} ${h}`)
        }
      })
    })
    return list
  }, [blocks])

  return (
    <div className="anim-in">
      <PageHeader
        title="Gestión de disponibilidad"
        subtitle={`${room?.nombre} (${room?.piso}) · Crea o elimina bloques semanales. En rojo se marcan los solapamientos.`}
        action={<Button variant="primary" icon={IconPlus} onClick={() => setAddOpen(true)}>Agregar bloque</Button>}
      />

      {overlaps.length > 0 && (
        <div className="overlap-warning">
          <IconAlertTriangle size={18} />
          <p className="small"><strong>Solapamiento detectado:</strong> {overlaps[0]}. Un bloque se pinta en rojo cuando choca con otro existente.</p>
        </div>
      )}

      <Card className="avail-card">
        <div className="avail-grid">
          <div className="avail-hour-col">
            <span />
            {HOURS.map((h) => <span key={h} className="avail-hour">{h}</span>)}
          </div>
          {WEEK.map((w) => (
            <div key={w.date} className="avail-day-col">
              <div className={`avail-day-head ${w.date === '2026-08-08' ? 'avail-day-sat' : ''}`}>
                <span>{w.label}</span>
                <strong>{new Date(w.date + 'T00:00:00').getDate()}</strong>
              </div>
              {HOURS.map((h) => {
                const on = blocks[w.date]?.includes(h)
                const has = hasConfirmed(w.date, h)
                const overlap = on && blocks[w.date]?.includes(h) && isOverlap(w.date, String(Number(h.slice(0, 2)) + 1).padStart(2, '0') + h.slice(2))
                return (
                  <button
                    key={h}
                    className={`avail-cell ${on ? 'avail-on' : ''} ${overlap ? 'avail-overlap' : ''} ${has ? 'avail-has-cita' : ''}`}
                    onClick={() => toggleBlock(w.date, h)}
                    title={on ? 'Quitar bloque' : 'Agregar bloque'}
                  >
                    {on && has && <span className="avail-cita-mark">●</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="avail-legend">
          <span className="legend-item"><span className="legend-dot dot-free" /> Libre</span>
          <span className="legend-item"><span className="legend-dot dot-ocupado" /> Con cita programada</span>
          <span className="legend-item"><span className="legend-dot dot-rojo" /> Solapamiento</span>
        </div>
      </Card>

      {/* ——— Modal agregar bloque ——— */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Agregar bloque de disponibilidad"
        tone="primary"
        icon={IconClock}
        size="sm"
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={addBlock}>Agregar bloques</Button>
          </div>
        }
      >
        <form onSubmit={addBlock} noValidate>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label className="field-label">Día</label>
              <select className="input select" value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}>
                {WEEK.map((w) => <option key={w.date} value={w.date}>{w.label} {new Date(w.date + 'T00:00:00').getDate()}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Inicio</label>
              <select className="input select" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}>
                {HOURS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Fin</label>
              <select className="input select" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}>
                {HOURS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <p className="small muted mt-2">Se crean bloques de 30 minutos. El sistema valida solapamientos al instante.</p>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={confirmDelete}
        title="Este bloque tiene citas programadas"
        message={`El bloque de las ${delTarget?.time} tiene citas programadas. Si lo eliminas, la cita se mantiene pero el horario dejará de aceptar nuevas reservas.`}
        confirmLabel="Eliminar bloque"
        icon={IconAlertTriangle}
        tone="warning"
      />
    </div>
  )
}
