import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { StatCard } from '../../components/ui/Card'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'
import { fmtPrice } from '../../utils/helpers'
import { IconCalendarCheck, IconCalendarX, IconUserX, IconWallet, IconUsers, IconFileText, IconStethoscope, IconArrowRight, IconActivity } from '../../components/Icons'
import './Dashboard.css'

const OCCUPATION = [
  { name: 'Medicina General', pct: 92, color: 'var(--primary-600)' },
  { name: 'Pediatría', pct: 88, color: 'var(--primary-500)' },
  { name: 'Ginecología', pct: 76, color: 'var(--primary-400)' },
  { name: 'Cardiología', pct: 98, color: 'var(--coral-500)' },
  { name: 'Dermatología', pct: 54, color: 'var(--primary-300)' },
  { name: 'Nutrición', pct: 61, color: 'var(--primary-400)' },
  { name: 'Psicología', pct: 70, color: 'var(--primary-500)' },
]

const MONTH_TREND = [
  { label: 'Sem 1', v: 62 }, { label: 'Sem 2', v: 78 }, { label: 'Sem 3', v: 71 }, { label: 'Sem 4', v: 88 },
]

export default function AdminDashboard() {
  const { appointments, payments } = useApp()
  const navigate = useNavigate()

  const citasMes = appointments.length
  const canceladas = appointments.filter((a) => a.status === 'cancelada').length
  const tasaCancel = Math.round((canceladas / citasMes) * 100)
  const inasistencia = 6
  const ingresos = payments.filter((p) => p.status === 'pagado').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="anim-in">
      <PageHeader title="Indicadores del centro" subtitle="Resumen operativo · Agosto 2026" />

      <div className="admin-stats">
        <StatCard icon={IconCalendarCheck} label="Citas del mes" value={citasMes} sub="+12% vs julio" trend={{ dir: 'up', text: 'crecimiento mensual' }} tone="primary" />
        <StatCard icon={IconCalendarX} label="Tasa de cancelación" value={`${tasaCancel}%`} sub="Objetivo: < 10%" trend={{ dir: 'down', text: 'mejorando' }} tone="warning" />
        <StatCard icon={IconUserX} label="Tasa de inasistencia" value={`${inasistencia}%`} sub="6 pacientes no asistieron" tone="danger" />
        <StatCard icon={IconWallet} label="Ingresos por pagos" value={fmtPrice(ingresos)} sub="S/ 420 en verificación" trend={{ dir: 'up', text: 'vs julio' }} tone="success" />
      </div>

      <div className="grid admin-charts">
        <Card className="chart-card">
          <div className="row-between mb-2">
            <div>
              <h3 className="bold">Ocupación por especialidad</h3>
              <p className="small muted">% de agenda usada en los últimos 14 días</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reportes')}>Ver reportes <IconArrowRight size={15} /></Button>
          </div>
          <div className="occ-bars">
            {OCCUPATION.map((o) => (
              <div key={o.name} className="occ-row">
                <span className="occ-label">{o.name}</span>
                <div className="occ-track">
                  <span className="occ-fill" style={{ width: `${o.pct}%`, background: o.color }} />
                </div>
                <span className="occ-pct">{o.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="chart-card">
          <h3 className="bold mb-2">Citas gestionadas por semana</h3>
          <div className="bar-chart">
            {MONTH_TREND.map((m, i) => (
              <div key={m.label} className="bar-col">
                <span className="bar-val">{m.v}</span>
                <div className="bar-track">
                  <span className="bar-fill" style={{ height: `${m.v}%`, background: i === 3 ? 'var(--coral-500)' : 'var(--primary-500)' }} />
                </div>
                <span className="bar-label">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="tiny muted mt-2">Esta semana cerró con el mayor volumen de citas del mes.</p>
        </Card>
      </div>

      <div className="grid admin-shortcuts">
        <button className="admin-sc card-hover" onClick={() => navigate('/admin/usuarios')}>
          <span className="quick-icon t-info"><IconUsers size={22} /></span>
          <div className="grow"><p className="bold">Usuarios y roles</p><p className="small muted">Gestiona accesos del equipo</p></div>
          <IconArrowRight size={18} />
        </button>
        <button className="admin-sc card-hover" onClick={() => navigate('/admin/especialidades')}>
          <span className="quick-icon t-primary"><IconStethoscope size={22} /></span>
          <div className="grow"><p className="bold">Especialidades</p><p className="small muted">Precios y disponibilidad</p></div>
          <IconArrowRight size={18} />
        </button>
        <button className="admin-sc card-hover" onClick={() => navigate('/admin/auditoria')}>
          <span className="quick-icon t-coral"><IconActivity size={22} /></span>
          <div className="grow"><p className="bold">Log de auditoría</p><p className="small muted">Eventos de seguridad</p></div>
          <IconArrowRight size={18} />
        </button>
        <button className="admin-sc card-hover" onClick={() => navigate('/admin/reportes')}>
          <span className="quick-icon t-warning"><IconFileText size={22} /></span>
          <div className="grow"><p className="bold">Reportes exportables</p><p className="small muted">Citas, cancelaciones y pagos</p></div>
          <IconArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
