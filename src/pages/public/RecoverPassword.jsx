import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useToast } from '../../components/ui/Toast'
import { IconMail, IconArrowRight, IconCheckCircleFilled } from '../../components/Icons'

export default function RecoverPassword({ step = 'request' }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(step === 'sent')

  const submit = (e) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Ingresa un correo electrónico válido')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        subtitle={`Enviamos un enlace de recuperación a ${email || 'tu correo'}.`}
        footer={<Link to="/login">← Volver a iniciar sesión</Link>}
      >
        <div className="recover-sent">
          <span className="recover-icon"><IconCheckCircleFilled size={40} /></span>
          <div className="recover-step">
            <span className="recover-step-badge">Paso 1 de 2</span>
            <h3>Enlace enviado</h3>
            <p className="small">
              Si existe una cuenta con ese correo, recibirás un enlace válido por 30 minutos.
              Revisa también la carpeta de spam.
            </p>
          </div>
          <Button variant="secondary" size="lg" full onClick={() => navigate('/recuperar/nueva-password')}>
            Continuar con enlace de ejemplo
          </Button>
          <p className="small muted center">
            El enlace del correo lleva a la pantalla de nueva contraseña (siguiente paso).
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para restablecerla."
      footer={<Link to="/login">← Volver a iniciar sesión</Link>}
    >
      <form onSubmit={submit} className="auth-form" noValidate>
        <Input
          label="Correo electrónico" type="email" icon={IconMail} placeholder="tucorreo@gmail.com"
          value={email} onChange={(e) => { setEmail(e.target.value); setError('') }}
          error={error}
          hint="Usamos este correo solo para enviarte el enlace de recuperación."
        />
        <Button type="submit" variant="primary" size="xl" full icon={IconArrowRight}>Enviar enlace</Button>
      </form>
    </AuthLayout>
  )
}
