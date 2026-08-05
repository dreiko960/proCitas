import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Logo from '../../components/layout/Logo'
import Button from '../../components/ui/Button'
import { SpecialtyIcon } from '../../utils/helpers'
import {
  IconCalendarCheck, IconSearch, IconSparkles, IconStethoscope, IconUser, IconHeartPulse,
  IconArrowRight, IconCheckCircle, IconClock, IconShield, IconSmartphone,
} from '../../components/Icons'
import './Landing.css'

export default function Landing() {
  const { specialties } = useApp()
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* ——— Header ——— */}
      <header className="pub-header">
        <div className="container pub-header-inner">
          <Logo />
          <nav className="pub-nav hidden-mobile">
            <a href="#especialidades">Especialidades</a>
            <a href="#como-funciona">Cómo funciona</a>
            <Link to="/disponibilidad">Ver disponibilidad</Link>
          </nav>
          <div className="row">
            <Link to="/disponibilidad" className="hidden-desktop pub-mobile-cta">
              <IconSearch size={18} /> Disponibilidad
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Reservar cita</Button>
          </div>
        </div>
      </header>

      {/* ——— Hero ——— */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy anim-in">
            <span className="hero-chip">
              <IconSparkles size={16} /> Nuevo: Lista de espera inteligente
            </span>
            <h1 className="hero-title">
              Tu salud, sin filas.
              <br />
              <span className="hero-title-accent">Tu cita, en línea.</span>
            </h1>
            <p className="hero-sub">
              SGCM-CMAS centraliza las citas médicas del centro médico de Ayacucho:
              agenda en línea, pagos verificados y recordatorios. Se acabó el papel
              y las llamadas interminables.
            </p>
            <div className="hero-actions">
              <Button variant="accent" size="xl" icon={IconCalendarCheck} onClick={() => navigate('/disponibilidad')}>
                Reservar cita
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate('/login')}>
                Iniciar sesión
              </Button>
            </div>
            <div className="hero-stats">
              <div><strong>+4,800</strong><span>citas gestionadas</span></div>
              <div><strong>12</strong><span>especialidades</span></div>
              <div><strong>98%</strong><span>pacientes satisfechos</span></div>
            </div>
          </div>
          <div className="hero-visual anim-in">
            <div className="hero-card-main">
              <div className="hero-card-head">
                <span className="hero-card-date">Mié · 05 ago</span>
                <span className="hero-card-badge">Agendada</span>
              </div>
              <div className="hero-card-doctor">
                <span className="hero-avatar">RQ</span>
                <div>
                  <p className="hero-card-name">Dra. Rosa Quispe</p>
                  <p className="hero-card-spec">Medicina General</p>
                </div>
              </div>
              <div className="hero-card-time">09:00 <span>AM</span></div>
              <div className="hero-card-foot">
                <span className="row"><IconShield size={14} /> Consultorio 2 · Piso 1</span>
                <Button variant="text" size="sm" onClick={() => navigate('/login')}>Ver detalle <IconArrowRight size={14} /></Button>
              </div>
            </div>
            <div className="hero-float-card float-1">
              <IconCheckCircle size={18} />
              <div><p>Pago verificado</p><span>Comprobante R-2026-0812</span></div>
            </div>
            <div className="hero-float-card float-2">
              <IconClock size={18} />
              <div><p>Recordatorio</p><span>Tu cita es mañana 09:00</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Especialidades ——— */}
      <section className="sec" id="especialidades">
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-kicker">Especialidades</span>
              <h2 className="sec-title">Atención integral para toda la familia</h2>
              <p className="sec-sub">Encuentra el especialista que necesitas y reserva en minutos.</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/disponibilidad')}>
              Ver todos <IconArrowRight size={16} />
            </Button>
          </div>
          <div className="spec-grid">
            {specialties.map((s) => (
              <Link to="/disponibilidad" key={s.id} className="spec-card card-hover">
                <span className="spec-icon">
                  <SpecialtyIcon id={s.id} size={24} />
                </span>
                <div className="grow">
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </div>
                <span className="spec-price">S/ {s.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Cómo funciona ——— */}
      <section className="sec sec-alt" id="como-funciona">
        <div className="container">
          <div className="sec-head center-col">
            <span className="sec-kicker">Cómo funciona</span>
            <h2 className="sec-title">Reservar nunca fue tan fácil</h2>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <span className="how-num">1</span>
              <span className="how-icon"><IconSearch size={24} /></span>
              <h3>Busca disponibilidad</h3>
              <p>Elige especialidad, médico y el horario que mejor te quede. Todo en tiempo real.</p>
            </div>
            <div className="how-card">
              <span className="how-num">2</span>
              <span className="how-icon"><IconCalendarCheck size={24} /></span>
              <h3>Confirma tu cita</h3>
              <p>Recibe confirmación y recordatorios. ¿No encontraste cupo? Anótate en la lista de espera.</p>
            </div>
            <div className="how-card">
              <span className="how-num">3</span>
              <span className="how-icon"><IconHeartPulse size={24} /></span>
              <h3>Acude y te atendemos</h3>
              <p>Realiza tu pago en línea o en recepción. Tu historial queda documentado y disponible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA lista de espera ——— */}
      <section className="sec">
        <div className="container">
          <div className="wl-cta">
            <div className="wl-cta-icon"><IconSparkles size={32} /></div>
            <div className="grow">
              <h2>¿Sin horarios disponibles?</h2>
              <p>La Lista de Espera Inteligente te avisa al instante si se libera un cupo. Tú decides: confirmar o ceder tu lugar.</p>
            </div>
            <Button variant="accent" size="lg" onClick={() => navigate('/disponibilidad')}>
              Probar lista de espera <IconArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className="pub-footer">
        <div className="container pub-footer-inner">
          <div>
            <Logo />
            <p className="pub-footer-note">Centro Médico de Atención en Salud · Ayacucho, Perú</p>
          </div>
          <div className="pub-footer-links">
            <span className="row"><IconSmartphone size={16} /> (066) 31-2456</span>
            <span className="row"><IconUser size={16} /> Jr. Dos de Mayo 245, Ayacucho</span>
            <Link to="/componentes" className="row pub-footer-link"><IconSparkles size={16} /> Referencia de componentes</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
