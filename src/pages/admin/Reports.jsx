import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findPatient, findSpecialty, findDoctor, fmtDate } from '../../utils/helpers'
import { IconDownload, IconFileText, IconFilter, IconCalendar, IconX, IconWallet } from '../../components/Icons'
import './Reports.css'

const REPORT_ROWS = [
  { id: 'C-1042', type: 'cita', patient: 'Julia Mamani', service: 'Medicina General', date: '05/08', amount: 50, status: 'confirmada' },
  { id: 'C-1041', type: 'pago', patient: 'María Flores', service: 'Ginecología', date: '05/08', amount: 80, status: 'pagado' },
  { id: 'C-1040', type: 'cita', patient: 'Carlos Paredes', service: 'Medicina General', date: '05/08', amount: 50, status: 'confirmada' },
  { id: 'C-1039', type: 'cancelacion', patient: 'Julia Mamani', service: 'Medicina General', date: '04/08', amount: 0, status: 'cancelada' },
  { id: 'C-1035', type: 'cita', patient: 'Rosa Palomino', service: 'Pediatría', date: '03/08', amount: 65, status: 'documentada' },
  { id: 'P-0805', type: 'pago', patient: 'Julia Mamani', service: 'Nutrición', date: '22/07', amount: 55, status: 'pagado' },
  { id: 'C-1019', type: 'cancelacion', patient: 'Carlos Paredes', service: 'Dermatología', date: '30/07', amount: 0, status: 'cancelada' },
  { id: 'P-0801', type: 'pago', patient: 'Julia Mamani', service: 'Medicina General', date: '18/06', amount: 50, status: 'pagado' },
]

export default function AdminReports() {
  const toast = useToast()
  const [period, setPeriod] = useState('Agosto 2026')
  const [typeFilter, setTypeFilter] = useState('')

  const rows = REPORT_ROWS.filter((r) => !typeFilter || r.type === typeFilter)

  const totalIngresos = rows.filter((r) => r.type === 'pago' && r.status === 'pagado').reduce((s, r) => s + r.amount, 0)

  return (
    <div className="anim-in">
      <PageHeader
        title="Reportes"
        subtitle="Citas, cancelaciones y pagos · exportable a Excel/PDF"
        action={
          <div className="row">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Agosto 2026</option>
              <option>Julio 2026</option>
              <option>Junio 2026</option>
              <option>Últimos 90 días</option>
            </Select>
            <Button variant="primary" icon={IconDownload} onClick={() => toast('Exportando reporte a Excel…', { type: 'info', title: 'Descarga iniciada' })}>
              Exportar
            </Button>
          </div>
        }
      />

      <div className="grid report-summary">
        <Card className="rep-sum">
          <span className="quick-icon t-primary"><IconCalendar size={20} /></span>
          <div><p className="small muted">Citas</p><p className="bold">{rows.filter((r) => r.type === 'cita').length}</p></div>
        </Card>
        <Card className="rep-sum">
          <span className="quick-icon t-coral"><IconX size={20} /></span>
          <div><p className="small muted">Cancelaciones</p><p className="bold">{rows.filter((r) => r.type === 'cancelacion').length}</p></div>
        </Card>
        <Card className="rep-sum">
          <span className="quick-icon t-success"><IconWallet size={20} /></span>
          <div><p className="small muted">Ingresos confirmados</p><p className="bold">S/ {totalIngresos}</p></div>
        </Card>
      </div>

      <Card className="report-table-card">
        <div className="row-between" style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
          <p className="bold">Detalle de operaciones · {period}</p>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="cita">Citas</option>
            <option value="cancelacion">Cancelaciones</option>
            <option value="pago">Pagos</option>
          </Select>
        </div>
        <div className="report-table">
          <div className="rp-head"><span>Operación</span><span>Paciente</span><span>Servicio</span><span>Fecha</span><span>Monto</span><span>Estado</span></div>
          {rows.map((r) => (
            <div key={r.id} className="rp-row">
              <span className="small bold">{r.id}</span>
              <span className="small">{r.patient}</span>
              <span className="small muted">{r.service}</span>
              <span className="small">{r.date}</span>
              <span className="small bold">{r.amount ? `S/ ${r.amount}` : '—'}</span>
              <Badge status={r.status} />
            </div>
          ))}
        </div>
        <div className="report-footer">
          <span className="small muted">Generado por SGCM-CMAS · <IconFileText size={13} style={{ verticalAlign: '-2px' }} /> base de datos centralizada</span>
        </div>
      </Card>
    </div>
  )
}
