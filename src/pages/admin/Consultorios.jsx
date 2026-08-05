import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Switch } from '../../components/ui/Misc'
import Badge from '../../components/ui/Badge'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Field'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findSpecialty } from '../../utils/helpers'
import { IconPlus, IconBuilding, IconAlertTriangle, IconEdit, IconTrash, IconMapPin } from '../../components/Icons'
import './Consultorios.css'

const PISOS = ['Piso 1', 'Piso 2']

export default function AdminConsultorios() {
  const { consultorios, doctors, specialties, appointments } = useApp()
  const toast = useToast()
  const [list, setList] = useState(consultorios.map((c) => ({ ...c })))
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nombre: '', piso: 'Piso 1', area: '', especialidades: [] })
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const doctorCount = (id) => doctors.filter((d) => d.consultorioId === id).length
  const futureApptCount = (id) => {
    const docIds = doctors.filter((d) => d.consultorioId === id).map((d) => d.id)
    return appointments.filter((a) => docIds.includes(a.doctorId) && a.date >= '2026-08-05' && !['cancelada', 'reprogramada', 'documentada'].includes(a.status)).length
  }

  const openCreate = () => { setForm({ nombre: '', piso: 'Piso 1', area: '', especialidades: [] }); setModal('create') }
  const openEdit = (c) => { setForm({ nombre: c.nombre, piso: c.piso, area: c.area, especialidades: [...c.especialidades] }); setModal('edit'); setForm((f) => ({ ...f, editing: c })) }

  const toggleSpec = (id) => {
    setForm((f) => ({
      ...f,
      especialidades: f.especialidades.includes(id) ? f.especialidades.filter((x) => x !== id) : [...f.especialidades, id],
    }))
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.area.trim() || form.especialidades.length === 0) {
      toast('Completa nombre, área y al menos una especialidad', { type: 'error', title: 'Consultorio no guardado' })
      return
    }
    if (modal === 'edit') {
      setList((l) => l.map((x) => (x.id === form.editing.id ? { ...x, nombre: form.nombre.trim(), piso: form.piso, area: form.area.trim(), especialidades: form.especialidades } : x)))
      toast('Consultorio actualizado', { type: 'success' })
    } else {
      const id = Math.max(0, ...list.map((c) => c.id)) + 1
      setList((l) => [{ id, nombre: form.nombre.trim(), piso: form.piso, area: form.area.trim(), especialidades: form.especialidades, activo: true }, ...l])
      toast('Consultorio creado', { type: 'success', title: '¡Listo!' })
    }
    setModal(null)
  }

  const toggleActive = (c) => {
    const future = futureApptCount(c.id)
    if (c.activo && (doctorCount(c.id) > 0 || future > 0)) {
      setDeactivateTarget(c)
      return
    }
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, activo: !x.activo } : x)))
    toast(c.activo ? 'Consultorio desactivado' : 'Consultorio activado', { type: 'info' })
  }

  const confirmDeactivate = () => {
    setList((l) => l.map((x) => (x.id === deactivateTarget.id ? { ...x, activo: false } : x)))
    setDeactivateTarget(null)
    toast('Consultorio desactivado. Deja de recibir citas nuevas.', { type: 'info', title: 'Desactivado' })
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Consultorios"
        subtitle="Asignación de especialidades por consultorio y estado de operación."
        action={<Button variant="primary" icon={IconPlus} onClick={openCreate}>Nuevo consultorio</Button>}
      />

      <div className="cons-grid">
        {list.map((c) => {
          const docs = doctorCount(c.id)
          const future = futureApptCount(c.id)
          return (
            <Card key={c.id} className={`cons-card ${!c.activo ? 'cons-inactive' : ''}`}>
              <div className="row-between">
                <span className="cons-icon"><IconBuilding size={22} /></span>
                <Switch checked={c.activo} onChange={() => toggleActive(c)} label={`Activar ${c.nombre}`} />
              </div>
              <h3 className="bold">{c.nombre}</h3>
              <p className="small muted row" style={{ gap: 6 }}><IconMapPin size={14} /> {c.piso} · {c.area}</p>
              <div className="cons-specs">
                {c.especialidades.map((sid) => (
                  <span key={sid} className="cons-spec-chip">{findSpecialty(specialties, sid)?.name || sid}</span>
                ))}
              </div>
              <div className="row-between mt-1">
                <Badge status={c.activo ? 'activar' : 'inactiva'} dot={false}>
                  {docs > 0 ? `${docs} médico(s)` : 'Sin médicos'}
                </Badge>
                <span className="tiny muted">{future} citas futuras</span>
              </div>
              <div className="row mt-2">
                <Button variant="ghost" size="sm" icon={IconEdit} onClick={() => openEdit(c)}>Editar</Button>
                <Button variant="text" size="sm" style={{ color: 'var(--danger)' }} icon={IconTrash}
                  onClick={() => { toast('Eliminación lógica: se desactiva antes de borrar', { type: 'info', title: 'Demo' }) }}>
                  Eliminar
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ——— Modal crear/editar ——— */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nuevo consultorio' : 'Editar consultorio'}
        tone="primary"
        icon={IconBuilding}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button variant="primary" onClick={save}>Guardar</Button>
          </div>
        }
      >
        <form onSubmit={save} noValidate>
          <div className="grid" style={{ gap: 14 }}>
            <Input label="Nombre" required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej. Consultorio 6" />
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <label className="field-label">Piso</label>
                <select className="input select" value={form.piso} onChange={(e) => setForm((f) => ({ ...f, piso: e.target.value }))}>
                  {PISOS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <Input label="Área" required value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="Ej. Especialidades" />
            </div>
            <div className="field">
              <label className="field-label">Especialidades asignadas</label>
              <div className="cons-spec-pick">
                {specialties.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`cons-spec-opt ${form.especialidades.includes(s.id) ? 'cons-spec-opt-on' : ''}`}
                    onClick={() => toggleSpec(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* ——— Advertencia desactivar ——— */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
        title="Este consultorio está en uso"
        message={`${deactivateTarget?.nombre} tiene ${doctorCount(deactivateTarget?.id)} médico(s) y ${futureApptCount(deactivateTarget?.id)} citas futuras. Al desactivarlo deja de aceptar citas nuevas; las ya agendadas se mantienen.`}
        confirmLabel="Desactivar de todos modos"
        icon={IconAlertTriangle}
        tone="warning"
      />
    </div>
  )
}
