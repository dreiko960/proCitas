import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Misc'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconUser, IconMail, IconPhone, IconLock, IconCheckCircleFilled, IconShield } from '../../components/Icons'
import './Profile.css'

export default function PatientProfile() {
  const { auth } = useApp()
  const toast = useToast()
  const [form, setForm] = useState({
    name: auth.user.name, email: 'julia.mamani@gmail.com', phone: '966 010 101',
    dob: '1985-03-14', address: 'Jr. Dos de Mayo 245, Ayacucho', dni: '45123876',
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })); setSaved(false) }

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (form.name.trim().length < 5) er.name = 'Nombre incompleto'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = 'Correo inválido'
    if (!/^\d{9}$/.test(form.phone)) er.phone = '9 dígitos'
    if (!/^\d{8}$/.test(form.dni)) er.dni = '8 dígitos'
    setErrors(er)
    if (Object.keys(er).length) { toast('Revisa los campos en rojo', { type: 'error', title: 'Perfil no guardado' }); return }
    setSaved(true)
    toast('Tus datos fueron actualizados.', { type: 'success', title: 'Perfil guardado' })
  }

  return (
    <div className="anim-in">
      <PageHeader title="Mi perfil" subtitle="Mantén tus datos actualizados para una atención más rápida." />
      <div className="grid" style={{ gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
        <Card className="profile-side">
          <div className="center" style={{ flexDirection: 'column', gap: 10 }}>
            <Avatar name={form.name} size={88} />
            <div style={{ textAlign: 'center' }}>
              <p className="bold">{form.name}</p>
              <p className="small muted">Paciente desde enero 2026</p>
            </div>
          </div>
          <div className="divider" />
          <div className="profile-side-info">
            <span className="row"><IconShield size={15} /> Historia clínica digital</span>
            <span className="row"><IconCheckCircleFilled size={15} /> Correo verificado</span>
            <span className="row"><IconCheckCircleFilled size={15} /> Datos protegidos</span>
          </div>
        </Card>

        <Card className="profile-form-card">
          <form onSubmit={save} noValidate>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="grid" style={{ gridColumn: '1 / -1', gridTemplateColumns: '1fr', gap: 0 }}>
                <Input label="Nombre completo" required icon={IconUser} value={form.name} onChange={set('name')} error={errors.name} success={form.name && !errors.name ? '✓' : ''} />
              </div>
              <Input label="Correo electrónico" type="email" icon={IconMail} value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Celular" icon={IconPhone} value={form.phone} onChange={set('phone')} error={errors.phone} maxLength={9} />
              <Input label="DNI" icon={IconUser} value={form.dni} onChange={set('dni')} error={errors.dni} maxLength={8} />
              <Input label="Fecha de nacimiento" type="date" value={form.dob} onChange={set('dob')} />
              <div className="grid" style={{ gridColumn: '1 / -1' }}>
                <Input label="Dirección" value={form.address} onChange={set('address')} placeholder="Jr., Av., Calle…" />
              </div>
            </div>
            <div className="row mt-2" style={{ justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" onClick={() => toast('Te enviamos el enlace de cambio de contraseña a tu correo', { type: 'info', title: 'Cambiar contraseña' })} icon={IconLock}>
                Cambiar contraseña
              </Button>
              <Button type="submit" variant="primary">{saved ? 'Guardado ✓' : 'Guardar cambios'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
