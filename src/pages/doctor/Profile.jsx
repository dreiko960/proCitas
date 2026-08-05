import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Textarea, Select } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Misc'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconPhone, IconMail, IconStethoscope, IconMapPin, IconStar, IconEye } from '../../components/Icons'

export default function DoctorProfile() {
  const toast = useToast()
  const [form, setForm] = useState({
    specialtyId: 'medicina', phone: '966 111 222', email: 'rosa.quispe@cmas.com',
    room: 'Consultorio 2 · Piso 1',
    bio: 'Médica general con 12 años de experiencia en atención primaria comunitaria. Me interesa la prevención y el trato cercano con mis pacientes.',
  })
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    setSaved(true)
    toast('Tu perfil profesional se actualizó. Es visible en la búsqueda pública.', { type: 'success', title: 'Perfil actualizado' })
  }

  return (
    <div className="anim-in">
      <PageHeader title="Mi perfil profesional" subtitle="Estos datos son visibles para pacientes en la búsqueda de disponibilidad." />
      <div className="grid" style={{ gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
        <Card className="profile-side" style={{ textAlign: 'center' }}>
          <Avatar name="Dra. Rosa Quispe Villanueva" initials="RQ" size={88} />
          <p className="bold mt-2">Dra. Rosa Quispe Villanueva</p>
          <p className="small muted">CMP 045712 · Medicina General</p>
          <div className="divider" />
          <div className="row" style={{ justifyContent: 'center' }}>
            <span className="star">★ 4.8</span>
            <span className="small muted">(132 valoraciones)</span>
          </div>
          <p className="small muted mt-1">12 años de experiencia · UNMSM</p>
          <Button variant="secondary" size="sm" className="mt-2" icon={IconEye} onClick={() => toast('Vista previa pública de tu perfil', { type: 'info', title: 'Vista paciente' })}>
            Ver como paciente
          </Button>
        </Card>

        <Card className="profile-form-card">
          <form onSubmit={save} noValidate>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Especialidad" icon={IconStethoscope} value={form.specialtyId} onChange={(e) => setForm((f) => ({ ...f, specialtyId: e.target.value }))}>
                <option value="medicina">Medicina General</option>
                <option value="pediatria">Pediatría</option>
                <option value="cardiologia">Cardiología</option>
              </Select>
              <Input label="Consultorio" icon={IconMapPin} value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
              <Input label="Teléfono de contacto" icon={IconPhone} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <Input label="Correo institucional" type="email" icon={IconMail} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea
                  label="Biografía breve (visible para pacientes)"
                  value={form.bio}
                  rows={4}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  hint={`${form.bio.length}/280 caracteres. Los pacientes leen esto antes de reservar.`}
                />
              </div>
            </div>
            <div className="row mt-2" style={{ justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary">{saved ? 'Guardado ✓' : 'Guardar perfil'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
