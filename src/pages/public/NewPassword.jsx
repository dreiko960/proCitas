import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useToast } from '../../components/ui/Toast'
import { IconLock, IconEye, IconEyeOff, IconArrowRight, IconAlertTriangle } from '../../components/Icons'

export default function NewPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (pass.length < 6) err.pass = 'Mínimo 6 caracteres'
    if (!/^(?=.*[A-Z])(?=.*\d)/.test(pass)) err.pass = 'Debe incluir una mayúscula y un número'
    if (confirm !== pass) err.confirm = 'Las contraseñas no coinciden'
    setErrors(err)
    if (Object.keys(err).length) return
    setDone(true)
    toast('Contraseña actualizada. Ya puedes iniciar sesión.', { type: 'success', title: '¡Listo!' })
    setTimeout(() => navigate('/login'), 1400)
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Llegaste desde el enlace de recuperación. Define tu nueva clave."
      footer={<Link to="/login">← Volver a iniciar sesión</Link>}
    >
      <form onSubmit={submit} className="auth-form" noValidate>
        <div className="recover-step">
          <span className="recover-step-badge">Paso 2 de 2</span>
          <p className="small muted row" style={{ gap: 8 }}>
            <IconAlertTriangle size={16} style={{ color: 'var(--warning)' }} />
            Este enlace expira en 30 minutos y solo puede usarse una vez.
          </p>
        </div>
        <Input
          label="Nueva contraseña" required type={show ? 'text' : 'password'} icon={IconLock}
          placeholder="Mínimo 6 caracteres" value={pass} onChange={(e) => setPass(e.target.value)}
          error={errors.pass}
          rightEl={
            <button type="button" className="input-ico-btn" onClick={() => setShow(!show)} aria-label="Mostrar">
              {show ? <IconEyeOff size={19} /> : <IconEye size={19} />}
            </button>
          }
        />
        <Input
          label="Confirmar contraseña" required type={show ? 'text' : 'password'} icon={IconLock}
          placeholder="Repite tu nueva contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          success={confirm === pass && pass ? 'Coinciden ✓' : ''}
        />
        <Button type="submit" variant="primary" size="xl" full icon={done ? undefined : IconArrowRight} disabled={done}>
          {done ? 'Contraseña actualizada ✓' : 'Guardar nueva contraseña'}
        </Button>
      </form>
    </AuthLayout>
  )
}
