import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/layout/Logo'
import Button from '../../components/ui/Button'
import { Card, StatCard } from '../../components/ui/Card'
import { Input, Select, Textarea, Checkbox } from '../../components/ui/Field'
import Badge from '../../components/ui/Badge'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { Tabs, Segmented } from '../../components/ui/Tabs'
import { Switch, Avatar, StepIndicator, Progress } from '../../components/ui/Misc'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { SpecialtyIcon } from '../../utils/helpers'
import {
  IconBell, IconCheckCircle, IconAlertTriangle, IconInfo, IconCalendar, IconClock,
  IconWallet, IconSparkles, IconListCheck, IconUser, IconStethoscope, IconArrowRight,
  IconPlus, IconTrash, IconSave, IconSearch, IconX, IconHeartPulse, IconFirstAid,
} from '../../components/Icons'
import './Components.css'

const CYCLE_BADGES = [
  { status: 'agendada', hint: 'Reservada, sin pagar' },
  { status: 'pagada', hint: 'Pago registrado' },
  { status: 'check_in', hint: 'Confirmó asistencia' },
  { status: 'en_espera_triaje', hint: 'En cola de enfermería' },
  { status: 'en_triaje', hint: 'Siendo triajeado' },
  { status: 'triaje_completado', hint: 'Listo para el médico' },
  { status: 'en_atencion', hint: 'El médico lo atiende' },
  { status: 'atendida', hint: 'Consulta terminada' },
  { status: 'documentada', hint: 'Historia clínica completa' },
  { status: 'cancelada', hint: 'Anulada' },
  { status: 'reprogramada', hint: 'Movida de horario' },
]

const EXTRA_BADGES = [
  { status: 'en_espera', hint: 'Lista de espera' },
  { status: 'oferta', hint: 'Cupo disponible' },
  { status: 'expirada', hint: 'Cupo vencido' },
  { status: 'pendiente_verificacion', hint: 'Pago a verificar' },
  { status: 'late', hint: 'Cancelación tardía' },
  { status: 'inactiva', hint: 'Cuenta inactiva' },
]

export default function Components() {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [tab, setTab] = useState('uno')
  const [seg, setSeg] = useState('a')
  const [sw, setSw] = useState(true)
  const [chk, setChk] = useState(false)
  const [selected, setSelected] = useState('medicina')

  return (
    <div className="cmp-page">
      <header className="cmp-header">
        <div className="container cmp-header-inner">
          <Link to="/"><Logo /></Link>
          <Link to="/" className="cmp-back">← Volver al sitio</Link>
        </div>
      </header>

      <main className="container cmp-main">
        <section className="cmp-hero">
          <span className="cmp-kicker">07 · Componentes</span>
          <h1>Sistema de diseño SGCM-CMAS</h1>
          <p className="cmp-sub">Lenguaje visual del prototipo: el ciclo de estados de la cita es el hilo conductor de todo el sistema.</p>
        </section>

        {/* ——— Badges: fila de referencia ——— */}
        <section className="cmp-section">
          <h2>Badges del ciclo de la cita</h2>
          <p className="cmp-hint">De la reserva al expediente documentado. Cada estado tiene color, ícono y texto propios (accesible, no solo color).</p>
          <Card className="cmp-badge-row">
            {CYCLE_BADGES.map((b) => (
              <div key={b.status} className="cmp-badge-cell">
                <Badge status={b.status} />
                <span className="cmp-badge-key">{b.status}</span>
                <span className="cmp-badge-hint">{b.hint}</span>
              </div>
            ))}
          </Card>
          <h3 className="cmp-subtitle">Estados complementarios</h3>
          <Card className="cmp-badge-row">
            {EXTRA_BADGES.map((b) => (
              <div key={b.status} className="cmp-badge-cell">
                <Badge status={b.status} />
                <span className="cmp-badge-key">{b.status}</span>
                <span className="cmp-badge-hint">{b.hint}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* ——— Botones ——— */}
        <section className="cmp-section">
          <h2>Botones</h2>
          <Card className="cmp-row">
            <Button variant="primary" icon={IconPlus}>Primario</Button>
            <Button variant="accent" icon={IconSparkles}>Acento</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="text">Texto</Button>
            <Button variant="destructive" icon={IconTrash}>Destructivo</Button>
          </Card>
          <Card className="cmp-row">
            <Button variant="primary" size="sm" icon={IconCheckCircle}>Pequeño</Button>
            <Button variant="primary">Mediano</Button>
            <Button variant="accent" size="lg">Grande</Button>
            <Button variant="primary" size="xl" icon={IconArrowRight}>Extra grande</Button>
            <Button variant="primary" disabled icon={IconSave}>Deshabilitado</Button>
          </Card>
        </section>

        {/* ——— Formularios ——— */}
        <section className="cmp-section">
          <h2>Formularios</h2>
          <div className="grid cmp-grid2">
            <Card>
              <Input label="Nombre completo" placeholder="Ej. Julia Mamani Quispe" icon={IconUser} hint="Tal como figura en tu DNI." />
              <Input label="Correo electrónico" type="email" defaultValue="" placeholder="tucorreo@gmail.com" icon={IconBell}
                error="Este correo ya está registrado. Usa otro o inicia sesión." />
              <Input label="DNI" defaultValue="45123876" icon={IconUser} success="DNI válido (8 dígitos)" />
              <Textarea label="Motivo de consulta" placeholder="Describe brevemente tu molestia…" hint="Este texto lo lee tu médico antes de la consulta." rows={3} />
            </Card>
            <Card>
              <Select label="Especialidad">
                <option>Medicina General</option>
                <option>Pediatría</option>
                <option>Ginecología</option>
              </Select>
              <Checkbox label="Acepto los términos de la atención" checked={chk} onChange={setChk} />
              <p className="cmp-hint">El switch y el checkbox tienen objetivos táctiles ≥ 44 px.</p>
              <div className="row">
                <Switch checked={sw} onChange={setSw} label="Activar recordatorios por WhatsApp" />
                <span className="small muted">{sw ? 'Activados' : 'Desactivados'}</span>
              </div>
              <div className="cmp-tag-demo">
                <SpecialtyIcon id={selected} size={20} />
                <div>
                  <p className="bold small">Selector de especialidad (icono)</p>
                  <div className="row wrap mt-1">
                    {['medicina', 'pediatria', 'ginecologia', 'cardiologia', 'dermatologia', 'nutricion', 'psicologia'].map((s) => (
                      <button key={s} className={`cmp-icon-chip ${selected === s ? 'cmp-icon-chip-on' : ''}`} onClick={() => setSelected(s)}>
                        <SpecialtyIcon id={s} size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ——— Componentes de elección ——— */}
        <section className="cmp-section">
          <h2>Tabs, píldoras y pasos</h2>
          <Card className="cmp-block">
            <Tabs tabs={[{ value: 'uno', label: 'Próximas' }, { value: 'dos', label: 'Pasadas' }, { value: 'tres', label: 'Canceladas' }]} active={tab} onChange={setTab}>
              <p className="cmp-hint">Contenido de la tab “{tab}”.</p>
            </Tabs>
            <div className="divider" />
            <Segmented value={seg} onChange={setSeg} options={[{ value: 'a', label: 'Todos' }, { value: 'b', label: 'Confirmadas' }, { value: 'c', label: 'Atendidas' }]} />
            <div className="divider" />
            <StepIndicator steps={['Especialidad', 'Médico y horario', 'Confirmar']} current={1} />
            <div className="row">
              <Progress value={65} />
              <Progress value={30} tone="accent" />
              <Progress value={80} tone="coral" />
            </div>
          </Card>
        </section>

        {/* ——— Estados ——— */}
        <section className="cmp-section">
          <h2>Estados y avisos</h2>
          <div className="grid cmp-grid2">
            <Card>
              <div className="cmp-note t-info"><IconInfo size={18} /><p>Nota informativa: llegue 10 minutos antes con su DNI.</p></div>
              <div className="cmp-note t-warn"><IconAlertTriangle size={18} /><p>Cancelación tardía: el plazo mínimo es de 12 horas.</p></div>
              <div className="cmp-note t-success"><IconCheckCircle size={18} /><p>Pago registrado. Comprobante R-2026-0813.</p></div>
              <div className="cmp-note t-danger"><IconX size={18} /><p>Este horario ya no está disponible.</p></div>
            </Card>
            <Card>
              <StatCard icon={IconCalendar} label="Citas del mes" value="486" sub="+12 % vs julio" tone="primary" />
              <StatCard icon={IconWallet} label="Ingresos del mes" value="S/ 21,340" sub="Objetivo: S/ 22,000" tone="success" />
              <StatCard icon={IconClock} label="Tasa de cancelación" value="8.2 %" sub="Objetivo: < 10 %" tone="warning" />
            </Card>
          </div>
        </section>

        {/* ——— Empty state + avatares ——— */}
        <section className="cmp-section">
          <h2>Estados vacíos y avatares</h2>
          <div className="grid cmp-grid2">
            <Card>
              <EmptyState small icon={IconSearch} title="Sin resultados para hoy" message="Prueba con otro filtro o inscríbete en la lista de espera." />
            </Card>
            <Card>
              <p className="cmp-hint">Avatares con iniciales y estado de conexión.</p>
              <div className="row">
                <Avatar name="Julia Mamani" initials="JM" size={56} online />
                <Avatar name="Dra. Rosa Quispe" initials="RQ" size={48} tone="primary" online />
                <Avatar name="Lic. Diana Prado" initials="DP" size={48} tone="coral" />
                <Avatar name="Sofía Mendoza" initials="SM" size={48} tone="accent" />
              </div>
              <div className="cmp-icon-grid">
                {[IconUser, IconStethoscope, IconHeartPulse, IconFirstAid, IconCalendar, IconClock, IconWallet, IconListCheck, IconSparkles, IconBell].map((I, i) => (
                  <span key={i} className="cmp-icon-chip-static"><I size={18} /></span>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ——— Modales y toasts ——— */}
        <section className="cmp-section">
          <h2>Modales y notificaciones</h2>
          <Card className="cmp-row">
            <Button variant="primary" icon={IconBell} onClick={() => setModalOpen(true)}>Abrir modal</Button>
            <Button variant="destructive" icon={IconAlertTriangle} onClick={() => setConfirmOpen(true)}>Diálogo de confirmación</Button>
            <Button variant="accent" icon={IconCheckCircle} onClick={() => toast('Acción completada correctamente', { type: 'success', title: '¡Listo!' })}>Toast éxito</Button>
            <Button variant="outline" icon={IconAlertTriangle} onClick={() => toast('Este horario ya no está disponible', { type: 'warning', title: 'Atención' })}>Toast aviso</Button>
            <Button variant="ghost" icon={IconInfo} onClick={() => toast('El paciente ya está visible en la agenda del médico', { type: 'info', title: 'Triaje completado' })}>Toast info</Button>
            <Button variant="text" icon={IconX} onClick={() => toast('No se pudo guardar el diagnóstico', { type: 'error', title: 'Error' })}>Toast error</Button>
          </Card>
        </section>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal de ejemplo"
        subtitle="Para confirmaciones y formularios rápidos."
        tone="primary"
        icon={IconCalendar}
        footer={
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Aceptar</Button>
          </div>
        }
      >
        <p>Este es el patrón de modal reutilizable del sistema: header con ícono y tono, cuerpo y footer de acciones.</p>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); toast('Acción confirmada', { type: 'success' }) }}
        title="¿Confirmar esta acción?"
        message="Los cambios no se pueden deshacer. Esta es la advertencia estándar del prototipo."
        confirmLabel="Sí, confirmar"
        icon={IconAlertTriangle}
      />
    </div>
  )
}
