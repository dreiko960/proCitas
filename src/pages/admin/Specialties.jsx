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
import { SpecialtyIcon, fmtPrice } from '../../utils/helpers'
import { IconPlus, IconStethoscope, IconAlertTriangle, IconEdit, IconTrash } from '../../components/Icons'
import './Specialties.css'

export default function AdminSpecialties() {
  const { specialties, doctors } = useApp()
  const toast = useToast()
  const [list, setList] = useState(specialties.map((s) => ({ ...s, active: s.id !== 'dermatologia' })))
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', icon: 'stethoscope' })
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const doctorCount = (id) => doctors.filter((d) => d.specialtyId === id).length

  const openCreate = () => { setForm({ name: '', price: '', icon: 'stethoscope' }); setModal('create') }
  const openEdit = (s) => { setForm({ name: s.name, price: String(s.price) }); setModal('edit'); setForm((f) => ({ ...f, editing: s })) }

  const save = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price || Number(form.price) <= 0) {
      toast('Completa nombre y precio válido', { type: 'error', title: 'Especialidad no guardada' })
      return
    }
    if (modal === 'edit') {
      setList((l) => l.map((x) => (x.id === form.editing.id ? { ...x, name: form.name, price: Number(form.price) } : x)))
      toast('Especialidad actualizada', { type: 'success' })
    } else {
      const id = form.name.toLowerCase().replace(/[^a-z]+/g, '_')
      setList((l) => [{ id, name: form.name, price: Number(form.price), active: true }, ...l])
      toast('Especialidad creada', { type: 'success', title: '¡Lista!' })
    }
    setModal(null)
  }

  const toggleActive = (s) => {
    if (s.active && doctorCount(s.id) > 0) {
      setDeactivateTarget(s)
      return
    }
    setList((l) => l.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)))
    toast(s.active ? 'Especialidad desactivada' : 'Especialidad activada', { type: 'info' })
  }

  const confirmDeactivate = () => {
    setList((l) => l.map((x) => (x.id === deactivateTarget.id ? { ...x, active: false } : x)))
    setDeactivateTarget(null)
    toast('Especialidad desactivada. Los médicos asociados dejan de recibir reservas nuevas.', { type: 'info', title: 'Desactivada' })
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Especialidades"
        subtitle="Catálogo de servicios, precios y estado de activación."
        action={<Button variant="primary" icon={IconPlus} onClick={openCreate}>Nueva especialidad</Button>}
      />

      <div className="spec-admin-grid">
        {list.map((s) => {
          const n = doctorCount(s.id)
          return (
            <Card key={s.id} className={`spec-admin-card ${!s.active ? 'spec-inactive' : ''}`}>
              <div className="row-between">
                <span className="spec-icon"><SpecialtyIcon id={s.id} size={22} /></span>
                <Switch checked={s.active} onChange={() => toggleActive(s)} label={`Activar ${s.name}`} />
              </div>
              <h3 className="bold">{s.name}</h3>
              <p className="small muted">{s.desc}</p>
              <div className="row-between mt-1">
                <span className="bold" style={{ color: 'var(--primary-800)' }}>{fmtPrice(s.price)}</span>
                <Badge status={n > 0 ? 'activar' : 'inactiva'} dot={false}>
                  {n > 0 ? `${n} médico(s)` : 'Sin médicos'}
                </Badge>
              </div>
              <div className="row mt-2">
                <Button variant="ghost" size="sm" icon={IconEdit} onClick={() => openEdit(s)}>Editar</Button>
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
        title={modal === 'create' ? 'Nueva especialidad' : 'Editar especialidad'}
        tone="primary"
        icon={IconStethoscope}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button variant="primary" onClick={save}>Guardar</Button>
          </div>
        }
      >
        <form onSubmit={save} noValidate>
          <div className="grid" style={{ gap: 14 }}>
            <Input label="Nombre" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Oftalmología" />
            <Input label="Precio de consulta (S/)" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0" />
          </div>
        </form>
      </Modal>

      {/* ——— Advertencia desactivar con médicos ——— */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
        title="Esta especialidad tiene médicos asociados"
        message={`${deactivateTarget?.name} tiene ${doctorCount(deactivateTarget?.id)} médico(s) activos. Al desactivarla dejarán de recibir reservas nuevas, pero sus citas ya confirmadas se mantienen.`}
        confirmLabel="Desactivar de todos modos"
        icon={IconAlertTriangle}
        tone="warning"
      />
    </div>
  )
}
