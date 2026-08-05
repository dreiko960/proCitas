import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../layout/Logo'
import './Auth.css'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-visual hidden-mobile">
        <div className="auth-visual-inner">
          <Logo light />
          <h2>Citas médicas centralizadas para el centro de salud de Ayacucho.</h2>
          <p>Agenda, pagos, historial y lista de espera inteligente en un solo lugar. Sin papel, sin llamadas interminables.</p>
          <div className="auth-quote">
            <p>“Antes perdía horas llamando para reservar. Ahora tengo mi cita en 2 minutos desde el celular.”</p>
            <span>— Julia M., paciente CMAS</span>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box">
          <Link to="/" className="auth-logo-mobile hidden-desktop"><Logo size="sm" /></Link>
          <div className="auth-title-wrap">
            <span className="auth-kicker">SGCM-CMAS</span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
