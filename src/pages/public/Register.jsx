import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { Input, Select, Checkbox } from '../../components/ui/Field'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconMail, IconLock, IconUser, IconCheckCircleFilled, IconPhone } from '../../components/Icons'

export default function Register() {
  const { patients, login } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', pass: '', confirm: '', dni: '', phone: '', dob: '', terms: false })
  const [errors, setErrors] = useState({})
  const [emailChecked, setEmailChecked] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    if (k === 'email') { setEmailChecked(null); setErrors((er) => ({ ...er, emailUnique: '' })) }
  }

  const checkEmail = (val) => {
    const taken = [...patients, { email: 'demo@cmas.com' }].some((p) => p.email.toLowerCase() === val.toLowerCase())
    return taken
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 5) e.name = 'Ingresa tu nombre y apellido completos'
    if (form.dni && !/^\d{8}$/.test(form.dni)) e.dni = 'El DNI debe tener 8 dígitos'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Ingresa un correo válido'
    else if (checkEmail(form.email)) { e.email = 'Este correo ya está registrado'; e.emailUnique = true }
    if (form.pass.length < 6) e.pass = 'Mínimo 6 caracteres'
    if (!/^(?=.*[A-Z])(?=.*\d)/.test(form.pass)) e.pass = 'Debe incluir una mayúscula y un número'
    if (form.confirm !== form.pass) e.confirm = 'Las contraseñas no coinciden'
    if (form.phone && !/^\d{9}$/.test(form.phone)) e.phone = 'Ingresa 9 dígitos (sin prefijo)'
    if (!form.terms) e.terms = 'Debes aceptar los términos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast('Revisa los campos marcados en rojo', { type: 'error', title: 'No pudimos crear tu cuenta' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      login('paciente')
      toast('Tu cuenta fue creada correctamente', { type: 'success', title: '¡Bienvenido/a a SGCM-CMAS!' })
      navigate('/paciente')
    }, 700)
  }

  return (
    <AuthLayout
      title="Crear cuenta de paciente"
      subtitle="Regístrate en menos de 2 minutos para reservar tus citas en línea."
      footer={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      <form onSubmit={submit} className="auth-form" noValidate>
        <Input
          label="Nombre completo" required icon={IconUser} placeholder="Ej. Julia Mamani Quispe"
          value={form.name} onChange={set('name')} error={errors.name}
          success={form.name && !errors.name ? 'Nombre válido' : ''}
        />
        <Input
          label="Correo electrónico" required type="email" icon={IconMail} placeholder="tucorreo@gmail.com"
          value={form.email} onChange={set('email')}
          onBlur={() => { if (form.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && !checkEmail(form.email)) setEmailChecked(true) }}
          error={errors.email}
          success={emailChecked && !errors.email ? 'Correo disponible ✓' : ''}
          hint="Verificamos en línea que el correo no esté registrado."
        />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Input label="DNI" required icon={IconUser} placeholder="45123876" maxLength={8} value={form.dni} onChange={set('dni')} error={errors.dni} />
          <Input label="Celular" icon={IconPhone} placeholder="966 010 101" maxLength={9} value={form.phone} onChange={set('phone')} error={errors.phone} />
        </div>
        <Input label="Fecha de nacimiento" type="date" value={form.dob} onChange={set('dob')} />
        <Input
          label="Contraseña" required type="password" icon={IconLock} placeholder="Mínimo 6 caracteres"
          value={form.pass} onChange={set('pass')} error={errors.pass}
          hint="Incluye al menos una mayúscula y un número."
        />
        <Input
          label="Confirmar contraseña" required type="password" icon={IconLock} placeholder="Repite tu contraseña"
          value={form.confirm} onChange={set('confirm')} error={errors.confirm}
          success={form.confirm === form.pass && form.pass ? 'Coinciden ✓' : ''}
        />
        <Select label="¿Cómo te enteraste de nosotros?" defaultValue="">
          <option value="" disabled>Selecciona una opción</option>
          <option>Recomendación de un familiar</option>
          <option>Redes sociales</option>
          <option>Cartel en el centro médico</option>
          <option>Otro</option>
        </Select>
        <Checkbox
          label="Acepto los términos y condiciones y la política de privacidad de datos de salud."
          checked={form.terms}
          onChange={(v) => { setForm((f) => ({ ...f, terms: v })); setErrors((er) => ({ ...er, terms: '' })) }}
          error={errors.terms}
        />
        {errors.terms && <p className="field-msg field-msg-error" style={{ marginTop: '-4px' }}><IconCheckCircleFilled size={0} />{errors.terms}</p>}
        <Button type="submit" variant="primary" size="xl" full disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </Button>
        <p className="small muted center">
          Al registrarte aceptas que tus datos de salud se traten conforme a la Ley N° 29733.
        </p>
      </form>
    </AuthLayout>
  )
}
