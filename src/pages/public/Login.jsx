import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import {
  IconMail, IconLock, IconEye, IconEyeOff, IconUser, IconStethoscope,
  IconBriefcase, IconShield, IconArrowRight, IconCheckCircleFilled, IconHeartPulse,
} from '../../components/Icons'

const DEMO = [
  { role: 'paciente', label: 'Paciente', sub: 'julia.mamani@gmail.com', icon: IconUser },
  { role: 'medico', label: 'Médico', sub: 'Dra. Rosa Quispe', icon: IconStethoscope },
  { role: 'enfermera', label: 'Enfermería', sub: 'Lic. Diana Prado', icon: IconHeartPulse },
  { role: 'recepcionista', label: 'Recepción', sub: 'Sofía Mendoza', icon: IconBriefcase },
  { role: 'administrador', label: 'Administrador', sub: 'Miguel Huaraca', icon: IconShield },
]

const PANEL_HOME = {
  paciente: '/paciente',
  medico: '/medico',
  enfermera: '/enfermeria',
  recepcionista: '/recepcion',
  administrador: '/admin',
}

export default function Login() {
  const { login } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com'
    if (pass.length < 6) e.pass = 'La contraseña debe tener al menos 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast('Revisa los campos marcados en rojo', { type: 'error', title: 'No pudimos iniciar sesión' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      const role = email.includes('medico') || email.includes('cmas.com') && email.includes('rosa') ? 'medico'
        : email.includes('diana') || email.includes('enfermera') ? 'enfermera'
        : email.includes('sofia') ? 'recepcionista'
        : email.includes('huaraca') || email.includes('admin') ? 'administrador'
        : 'paciente'
      login(role)
      toast(`Bienvenido/a, sesión iniciada`, { type: 'success', title: 'Acceso correcto' })
      navigate(PANEL_HOME[role])
    }, 700)
  }

  const quickLogin = (role) => {
    setLoading(true)
    setTimeout(() => {
      login(role)
      toast('Sesión de demostración iniciada', { type: 'info', title: `Modo ${DEMO.find((d) => d.role === role).label}` })
      navigate(PANEL_HOME[role])
    }, 500)
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede con tu correo y contraseña. Tu rol se detecta automáticamente."
      footer={<>¿No tienes cuenta? <Link to="/registro">Regístrate como paciente</Link></>}
    >
      <form onSubmit={submit} className="auth-form" noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          icon={IconMail}
          placeholder="tucorreo@gmail.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }) }}
          error={errors.email}
          success={email && !errors.email ? 'Formato correcto' : ''}
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type={show ? 'text' : 'password'}
          icon={IconLock}
          placeholder="••••••••"
          value={pass}
          onChange={(e) => { setPass(e.target.value); if (errors.pass) setErrors({ ...errors, pass: '' }) }}
          error={errors.pass}
          rightEl={
            <button type="button" className="input-ico-btn" onClick={() => setShow(!show)} aria-label="Mostrar contraseña">
              {show ? <IconEyeOff size={19} /> : <IconEye size={19} />}
            </button>
          }
          autoComplete="current-password"
        />
        <div className="row-between">
          <Link to="/recuperar" className="small bold">¿Olvidaste tu contraseña?</Link>
        </div>
        <Button type="submit" variant="primary" size="xl" full icon={loading ? undefined : IconArrowRight} disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="auth-badge-line">Acceso rápido de demostración</div>
      <div className="demo-creds">
        <p className="demo-title">Elige un rol para explorar el prototipo</p>
        <div className="demo-grid">
          {DEMO.map((d) => (
            <button key={d.role} className="demo-btn" onClick={() => quickLogin(d.role)} disabled={loading}>
              <span className="demo-btn-icon"><d.icon size={17} /></span>
              <span>{d.label}<small>{d.sub}</small></span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 small muted">
        <IconCheckCircleFilled size={13} style={{ verticalAlign: '-2px' }} /> Todos los roles inician sesión con el mismo formulario; el rol se determina por las credenciales.
      </p>
    </AuthLayout>
  )
}
