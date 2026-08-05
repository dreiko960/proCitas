import React from 'react'
import './Badge.css'

const MAP = {
  agendada: ['st-agendada', 'Agendada'],
  pagada: ['st-pagado', 'Pagada'],
  pagado: ['st-pagado', 'Pagado'],
  check_in: ['st-checkin', 'Check-in'],
  checkin: ['st-checkin', 'Check-in'],
  en_espera_triaje: ['st-triaje-espera', 'En espera de triaje'],
  en_triaje: ['st-triaje-activo', 'En triaje'],
  triaje_completado: ['st-triaje-completo', 'Triaje completado'],
  en_atencion: ['st-atencion', 'En atención'],
  atendida: ['st-atendida', 'Atendida'],
  documentada: ['st-documentada', 'Documentada'],
  cancelada: ['st-cancelada', 'Cancelada'],
  reprogramada: ['st-reprogramada', 'Reprogramada'],
  pendiente: ['st-pendiente', 'Pendiente'],
  confirmada: ['st-confirmada', 'Confirmada'],
  verificado: ['st-pagado', 'Verificado'],
  pendiente_verificacion: ['st-pendiente-verif', 'Pendiente de verificación'],
  en_espera: ['st-espera', 'En espera'],
  oferta: ['st-oferta', 'Oferta disponible'],
  ofertada: ['st-oferta', 'Oferta disponible'],
  expirada: ['st-expirada', 'Cupo expirado'],
  activa: ['st-activa', 'Activa'],
  inactiva: ['st-inactiva', 'Inactiva'],
  late: ['st-late', 'Cancelación tardía'],
  success: ['st-success', 'Éxito'],
}

const LEAD_CHECK = {
  documentada: '✓✓',
  atendida: '✓',
  pagada: '✓',
}

export default function Badge({ status, children, dot, className = '' }) {
  const [cls, label] = MAP[status] || [status, children || status]
  return (
    <span className={`badge ${cls} ${className}`}>
      {dot !== false && LEAD_CHECK[status] === undefined && <span className="badge-dot" />}
      {LEAD_CHECK[status] !== undefined && <span className="badge-check">{LEAD_CHECK[status]}</span>}
      {children || label}
    </span>
  )
}
