import React, { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { IconSearch, IconShield, IconAlertTriangle, IconDownload } from '../../components/Icons'
import './AuditLog.css'

const VERDICTS = {
  success: { label: 'Éxito', tone: 'success' },
  warning: { label: 'Advertencia', tone: 'en_espera' },
  blocked: { label: 'Bloqueado', tone: 'cancelada' },
}

export default function AdminAudit() {
  const { audit } = useApp()
  const toast = useToast()
  const [verdict, setVerdict] = useState('')
  const [q, setQ] = useState('')

  const rows = audit.filter((e) => {
    const byV = !verdict || e.verdict === verdict
    const t = q.trim().toLowerCase()
    const byQ = !t || e.user?.toLowerCase().includes(t) || e.action?.toLowerCase().includes(t) || (e.detail || '').toLowerCase().includes(t)
    return byV && byQ
  })

  return (
    <div className="anim-in">
      <PageHeader
        title="Auditoría"
        subtitle="Registro de eventos de seguridad y accesos del sistema."
        action={
          <div className="row">
            <Button variant="ghost" icon={IconShield}>Políticas</Button>
            <Button variant="primary" icon={IconDownload} onClick={() => toast('Exportando registro de auditoría…', { type: 'info', title: 'Descarga iniciada' })}>
              Exportar CSV
            </Button>
          </div>
        }
      />

      <div className="row mb-2" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="row">
          <Input icon={IconSearch} placeholder="Buscar evento, usuario, IP…" value={q} onChange={(e) => setQ(e.target.value)} className="audit-search" />
          <Select value={verdict} onChange={(e) => setVerdict(e.target.value)}>
            <option value="">Todos los resultados</option>
            <option value="success">Éxito</option>
            <option value="warning">Advertencia</option>
            <option value="blocked">Bloqueado</option>
          </Select>
        </div>
        <span className="small muted"><strong>{rows.length}</strong> eventos</span>
      </div>

      <Card className="audit-card">
        <div className="audit-table">
          <div className="au-head"><span>Fecha</span><span>Usuario</span><span>Acción</span><span>Detalle</span><span>Resultado</span></div>
          {rows.map((e, i) => (
            <div key={i} className="au-row">
              <span className="small nowrap">{e.at}</span>
              <span className="small bold nowrap">{e.user}</span>
              <span className="small nowrap">{e.action}</span>
              <span className="small muted">{e.detail}</span>
              <Badge status={VERDICTS[e.verdict]?.tone}>{VERDICTS[e.verdict]?.label}</Badge>
            </div>
          ))}
          {!rows.length && <p className="small muted" style={{ padding: 16 }}>Sin eventos para los filtros seleccionados.</p>}
        </div>
        <div className="audit-note">
          <IconAlertTriangle size={16} style={{ flexShrink: 0 }} />
          <p className="small">Los intentos fallidos de inicio de sesión generan un evento de <strong>advertencia</strong>; 5 fallos consecutivos bloquean temporalmente la cuenta.</p>
        </div>
      </Card>
    </div>
  )
}
