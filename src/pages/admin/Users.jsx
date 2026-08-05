import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Misc'
import { Switch } from '../../components/ui/Misc'
import { Select, Input } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconUsers, IconPlus, IconMail, IconSearch } from '../../components/Icons'
import './Users.css'

const ROLE_META = {
  medico: { label: 'Médico', tone: 'st-confirmada' },
  enfermera: { label: 'Enfermera', tone: 'st-pagado' },
  recepcionista: { label: 'Recepcionista', tone: 'st-espera' },
  administrador: { label: 'Administrador', tone: 'st-documentada' },
  paciente: { label: 'Paciente', tone: 'st-pendiente' },
}

export default function AdminUsers() {
  const { users, setUsers } = useApp()
  const toast = useToast()
  const [roleFilter, setRoleFilter] = useState('')
  const [q, setQ] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'medico', dni: '' })
  const [errors, setErrors] = useState({})

  const filtered = users.filter((u) => {
    const byRole = !roleFilter || u.role === roleFilter
    const t = q.trim().toLowerCase()
    const byQ = !t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t)
    return byRole && byQ
  })

  const toggle = (u) => {
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)))
    toast(`${u.name} ${u.active ? 'desactivado' : 'activado'}`, { type: 'info', title: 'Cuenta actualizada' })
  }

  const create = (e) => {
    e.preventDefault()
    const err = {}
    if (form.name.trim().length < 5) err.name = 'Nombre incompleto'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = 'Correo inválido'
    if (users.some((u) => u.email === form.email)) err.email = 'Correo ya existe'
    setErrors(err)
    if (Object.keys(err).length) { toast('Revisa los campos en rojo', { type: 'error' }); return }
    const nu = { id: `u${Date.now()}`, name: form.name, role: form.role, email: form.email, active: true, lastLogin: 'Nunca', createdAt: 'Hoy' }
    setUsers((l) => [nu, ...l])
    setCreateOpen(false)
    setForm({ name: '', email: '', role: 'medico', dni: '' })
    toast(`Cuenta de ${ROLE_META[nu.role].label} creada. Se envió invitación por correo.`, { type: 'success', title: 'Cuenta creada' })
  }

  return (
    <div className="anim-in">
      <PageHeader
        title="Usuarios y roles"
        subtitle={`${users.length} cuentas · gestión de accesos al sistema`}
        action={<Button variant="primary" icon={IconPlus} onClick={() => setCreateOpen(true)}>Crear cuenta</Button>}
      />

      <div className="row mb-2" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="row">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="medico">Médicos</option>
            <option value="enfermera">Enfermeras</option>
            <option value="recepcionista">Recepcionistas</option>
            <option value="administrador">Administradores</option>
            <option value="paciente">Pacientes</option>
          </Select>
          <Input icon={IconSearch} placeholder="Buscar por nombre o correo…" value={q} onChange={(e) => setQ(e.target.value)} className="users-search" />
        </div>
        <span className="small muted"><strong>{filtered.length}</strong> resultados</span>
      </div>

      <Card className="users-table-card">
        <div className="users-table">
          <div className="ut-head">
            <span>Usuario</span><span>Rol</span><span>Correo</span><span>Último acceso</span><span>Estado</span><span />
          </div>
          {filtered.map((u) => (
            <div key={u.id} className="ut-row">
              <div className="row">
                <Avatar name={u.name} initials={u.name.split(' ').map((w) => w[0]).slice(0, 2).join('')} size={38} />
                <span className="bold small">{u.name}</span>
              </div>
              <Badge status={ROLE_META[u.role].tone} dot={false}>{ROLE_META[u.role].label}</Badge>
              <span className="small muted">{u.email}</span>
              <span className="small">{u.lastLogin}</span>
              <span className="row" style={{ gap: 8 }}>
                <Switch checked={u.active} onChange={() => toggle(u)} label={`Activar ${u.name}`} />
                <span className={`small bold ${u.active ? '' : 'muted'}`}>{u.active ? 'Activa' : 'Inactiva'}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={() => toast(`Opciones de ${u.name} (editar rol, resetear clave)`, { type: 'info', title: 'Acciones' })}>⋯</Button>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Crear cuenta"
        subtitle="Médico, recepcionista o administrador. El paciente se registra solo."
        tone="primary"
        icon={IconPlus}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={create}>Crear e invitar</Button>
          </div>
        }
      >
        <form onSubmit={create} noValidate>
          <div className="grid" style={{ gap: 14 }}>
            <Input label="Nombre completo" required icon={IconUsers} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
            <Input label="Correo institucional" required type="email" icon={IconMail} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} hint="Se enviará la invitación y clave temporal." />
            <Select label="Rol" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="administrador">Administrador</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}
