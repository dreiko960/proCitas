import React from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useToast } from '../ui/Toast'
import Logo from './Logo'
import { Avatar } from '../ui/Misc'
import {
  IconHome, IconCalendar, IconCalendarPlus, IconHistory, IconListCheck, IconWallet,
  IconClock, IconSliders, IconFileText, IconStethoscope, IconUser, IconUsers,
  IconGraph, IconSettings, IconShield, IconLogout, IconCheckCircle, IconCreditCard,
  IconMenu, IconX, IconFirstAid, IconBuilding, IconMonitor,
} from '../Icons'
import './PanelLayout.css'
import { useState } from 'react'

const NAV = {
  paciente: [
    { to: '/paciente', label: 'Inicio', icon: IconHome },
    { to: '/paciente/reservar', label: 'Reservar cita', icon: IconCalendarPlus },
    { to: '/paciente/citas', label: 'Mis citas', icon: IconCalendar },
    { to: '/paciente/historial', label: 'Mi historial', icon: IconHistory },
    { to: '/paciente/lista-espera', label: 'Lista de espera', icon: IconListCheck, highlight: true },
    { to: '/paciente/pagos', label: 'Mis pagos', icon: IconWallet },
    { to: '/paciente/perfil', label: 'Mi perfil', icon: IconUser },
  ],
  medico: [
    { to: '/medico', label: 'Agenda del día', icon: IconCalendar },
    { to: '/medico/disponibilidad', label: 'Disponibilidad', icon: IconClock },
    { to: '/medico/perfil', label: 'Mi perfil', icon: IconUser },
  ],
  enfermera: [
    { to: '/enfermeria', label: 'Cola de triaje', icon: IconFirstAid, highlight: true },
    { to: '/enfermeria/lista-espera', label: 'Lista de espera', icon: IconMonitor, highlight: true },
    { to: '/enfermeria/historial', label: 'Triajes del turno', icon: IconListCheck },
  ],
  recepcionista: [
    { to: '/recepcion', label: 'Agenda general', icon: IconCalendar },
    { to: '/recepcion/nueva-cita', label: 'Registrar cita', icon: IconCalendarPlus },
    { to: '/recepcion/checkin', label: 'Check-in presencial', icon: IconCheckCircle },
    { to: '/recepcion/lista-espera', label: 'Lista de espera', icon: IconMonitor, highlight: true },
    { to: '/recepcion/pago', label: 'Registrar pago', icon: IconCreditCard },
    { to: '/recepcion/cancelaciones', label: 'Cancelaciones', icon: IconX },
  ],
  administrador: [
    { to: '/admin', label: 'Indicadores', icon: IconGraph },
    { to: '/admin/usuarios', label: 'Usuarios y roles', icon: IconUsers },
    { to: '/admin/especialidades', label: 'Especialidades', icon: IconStethoscope },
    { to: '/admin/consultorios', label: 'Consultorios', icon: IconBuilding },
    { to: '/admin/reportes', label: 'Reportes', icon: IconFileText },
    { to: '/admin/configuracion', label: 'Configuración', icon: IconSettings },
    { to: '/admin/auditoria', label: 'Auditoría', icon: IconShield },
  ],
}

const ROLE_LABEL = {
  paciente: 'Paciente',
  medico: 'Médico',
  enfermera: 'Enfermería',
  recepcionista: 'Recepcionista',
  administrador: 'Administrador',
}

export default function PanelLayout() {
  const { auth, logout } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const role = auth?.role || 'paciente'
  const nav = NAV[role]
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    toast('Sesión cerrada correctamente', { type: 'info', title: 'Hasta pronto' })
    navigate('/')
  }

  return (
    <div className="panel">
      {/* ——— Sidebar escritorio ——— */}
      <aside className="sidebar hidden-mobile">
        <div className="sidebar-brand">
          <Logo />
        </div>
        <p className="sidebar-role-label">{ROLE_LABEL[role]}</p>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} ${item.highlight ? 'nav-item-highlight' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.highlight && <span className="nav-highlight-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <IconLogout size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ——— Drawer móvil ——— */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="drawer-head">
            <Logo />
            <button className="drawer-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar">
              <IconX size={22} />
            </button>
          </div>
          <nav className="sidebar-nav">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} ${item.highlight ? 'nav-item-highlight' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button className="nav-item" onClick={handleLogout}>
              <IconLogout size={20} />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>
      )}
      {mobileOpen && <div className="drawer-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ——— Contenido ——— */}
      <div className="panel-main">
        <header className="topbar">
          <button className="topbar-burger hidden-desktop" onClick={() => setMobileOpen(true)} aria-label="Menú">
            <IconMenu size={24} />
          </button>
          <div className="topbar-title">
            <span className="topbar-role-chip">{ROLE_LABEL[role]}</span>
          </div>
          <div className="topbar-right">
            <Link to="/disponibilidad" className="topbar-link hidden-mobile">Ver disponibilidad pública</Link>
            <Avatar name={auth?.user?.name} initials={auth?.user?.initials} size={40} online />
            <div className="topbar-user hidden-mobile">
              <p className="topbar-name">{auth?.user?.name}</p>
              <p className="topbar-mail">{auth?.user?.email || 'demo@cmas.com'}</p>
            </div>
          </div>
        </header>

        <main className="panel-content">
          <Outlet />
        </main>

        {/* ——— Nav inferior móvil ——— */}
        <nav className="mobile-nav hidden-desktop">
          {nav.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mnav-item ${isActive ? 'mnav-active' : ''}`}
            >
              <item.icon size={22} />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
