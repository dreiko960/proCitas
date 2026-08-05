import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/layout/Logo'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Field'
import { DoctorSearchCard } from '../../components/AppointmentCard'
import EmptyState from '../../components/ui/EmptyState'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../components/ui/Toast'
import { findSpecialty, fmtDate } from '../../utils/helpers'
import { IconSearch, IconCalendarX, IconSparkles, IconArrowRight, IconCalendar, IconMapPin, IconUser, IconSmartphone, IconClock } from '../../components/Icons'
import './SearchAvailability.css'

export default function SearchAvailability() {
  const { doctors, specialties, appointments, consultorios } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const [specialtyId, setSpecialtyId] = useState('')
  const [from, setFrom] = useState('2026-08-05')
  const [to, setTo] = useState('2026-08-09')
  const [searched, setSearched] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showDemoEmpty, setShowDemoEmpty] = useState(false)

  const results = useMemo(() => {
    if (!searched || showDemoEmpty) return []
    if (!specialtyId && !from && !to) return []
    return doctors
      .filter((d) => !specialtyId || d.specialtyId === specialtyId)
      .map((d) => {
        const taken = appointments
          .filter((a) => a.doctorId === d.id && a.status !== 'cancelada')
          .map((a) => `${a.date} ${a.time}`)
        const slots = d.slots.filter((s) => {
          const okRange = s.day >= from && s.day <= to
          const okTaken = !taken.includes(`${s.day} ${s.start}`)
          return okRange && okTaken
        })
        return { doctor: d, slots }
      })
      .filter((r) => r.slots.length > 0)
  }, [doctors, appointments, specialtyId, from, to, searched, showDemoEmpty])

  const search = (e) => {
    e.preventDefault()
    if (specialtyId === 'cardiologia' && from <= '2026-08-09') {
      setSearched(true)
      setShowDemoEmpty(true)
      return
    }
    setShowDemoEmpty(false)
    setSearched(true)
    if (!specialtyId && !from && !to) {
      toast('Selecciona una especialidad o un rango de fechas', { type: 'warning', title: 'Filtros incompletos' })
    } else if (!results.length) {
      setShowDemoEmpty(true)
    } else {
      toast(`Encontramos horarios en ${results.length} médico(s)`, { type: 'success', title: 'Disponibilidad encontrada' })
    }
  }

  const goWaitlist = () => {
    toast('Te redirigimos a la Lista de Espera Inteligente', { type: 'info', title: '¡Buena idea!' })
    navigate('/paciente/lista-espera/inscripcion')
  }

  return (
    <div className="search-page">
      <header className="pub-header">
        <div className="container pub-header-inner">
          <Logo size="sm" />
          <div className="row">
            <span className="pub-role-chip hidden-mobile">Modo público · sin sesión</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/')}>Volver al inicio</Button>
          </div>
        </div>
      </header>

      <section className="search-hero">
        <div className="container">
          <h1>Busca disponibilidad real</h1>
          <p>Elige especialidad y rango de fechas. Los horarios se muestran en tiempo real.</p>
          <form className="search-bar card" onSubmit={search}>
            <div className="search-field">
              <label>Especialidad</label>
              <Select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="">Todas las especialidades</option>
                {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div className="search-field">
              <label>Desde</label>
              <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="search-field">
              <label>Hasta</label>
              <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button type="submit" variant="primary" size="xl" icon={IconSearch} className="search-submit">
              Buscar horarios
            </Button>
          </form>
          {searched && !showDemoEmpty && results.length === 0 && (
            <p className="small muted center mt-2">Sin resultados con esos filtros. Intenta ampliar el rango de fechas.</p>
          )}
        </div>
      </section>

      <section className="container search-results">
        {searched && showDemoEmpty ? (
          <div className="anim-in">
            <EmptyState
              icon={IconCalendarX}
              title="No hay horarios disponibles en este rango"
              message="Amplía el rango de fechas o regístrate en la Lista de Espera Inteligente: te avisamos al instante si se libera un cupo con Cardiología."
              action="Anotarme en lista de espera"
              actionIcon={IconSparkles}
              onAction={goWaitlist}
            />
            <div className="search-demo-note">
              <div className="row" style={{ gap: 10 }}>
                <span className="search-demo-icon"><IconClock size={20} /></span>
                <div>
                  <p className="bold">Sugerencia del sistema</p>
                  <p className="small muted">Los horarios de Cardiología con el Dr. Jorge Mendoza están llenos hasta el 11 de agosto. La lista de espera estima <strong>2–3 días</strong> para conseguir cupo.</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowDemoEmpty(false)}>Mostrar otros resultados →</Button>
            </div>
          </div>
        ) : (
          <div className="results-list">
            {results.length > 0 ? (
              <>
                <div className="row-between mb-2">
                  <p className="small muted"><strong>{results.length}</strong> profesional(es) con disponibilidad entre {fmtDate(from)} y {fmtDate(to)}</p>
                  {selectedSlot && <Button variant="accent" size="sm" icon={IconArrowRight} onClick={() => { toast('Para reservar inicia sesión o regístrate', { type: 'info', title: 'Casi listo' }); navigate('/login') }}>Reservar {selectedSlot.time}</Button>}
                </div>
                {results.map(({ doctor, slots }) => (
                  <DoctorSearchCard
                    key={doctor.id}
                    doctor={doctor}
                    specialty={findSpecialty(specialties, doctor.specialtyId)}
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSlot={(s) => setSelectedSlot(s)}
                    consultorios={consultorios}
                  />
                ))}
              </>
            ) : (
              <EmptyState
                icon={IconCalendar}
                title={searched ? 'Sin resultados en este rango' : 'Busca para ver disponibilidad'}
                message={searched ? 'Prueba con otro rango de fechas o selecciona todas las especialidades.' : 'Usa los filtros y presiona “Buscar horarios”.'}
                onAction={searched ? undefined : () => { setSearched(true); setShowDemoEmpty(true) }}
                action={searched ? undefined : 'Ver ejemplo sin disponibilidad'}
                actionIcon={IconCalendarX}
              />
            )}
          </div>
        )}
      </section>

      <footer className="pub-footer">
        <div className="container pub-footer-inner">
          <div>
            <Logo size="sm" />
            <p className="pub-footer-note">Centro Médico de Atención en Salud · Ayacucho, Perú</p>
          </div>
          <div className="pub-footer-links">
            <span className="row"><IconSmartphone size={16} /> (066) 31-2456</span>
            <span className="row"><IconMapPin size={16} /> Jr. Dos de Mayo 245, Ayacucho</span>
            <span className="row"><IconUser size={16} /> Lunes a Sábado 08:00–17:30</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
