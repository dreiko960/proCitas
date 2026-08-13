import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import {
  DOCTORS, PATIENTS, ME, SPECIALTIES, CONSULTORIOS, NURSE, INITIAL_APPOINTMENTS, INITIAL_PAYMENTS,
  INITIAL_WAITLIST, AUDIT_LOG, USERS,
} from '../data/mock'

const AppContext = createContext(null)

export const useApp = () => useContext(AppContext)

export const QUEUE_TODAY = '2026-08-05'

export const QUEUE_PIPELINE = ['en_espera_triaje', 'en_triaje', 'triaje_completado', 'en_atencion']

const STORAGE_KEY = 'procitas-appointments-v1'

let seq = 2000

export function turnoOf(a) {
  const m = /^A-0*(\d+)$/.exec(a.turno || '')
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER
}

export function nextTurno(appointments) {
  const max = appointments
    .filter((x) => x.turno)
    .reduce((acc, x) => Math.max(acc, turnoOf(x)), 0)
  return `A-${String(max + 1).padStart(3, '0')}`
}

export function queuedToday(appointments, date = QUEUE_TODAY) {
  return appointments
    .filter((a) => a.date === date && QUEUE_PIPELINE.includes(a.status))
    .sort((a, b) => turnoOf(a) - turnoOf(b))
}

export default function AppProvider({ children }) {
  const [auth, setAuth] = useState({ role: 'paciente', user: { ...ME, role: 'paciente' } })
  const [appointments, setAppointments] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      /* almacenamiento no disponible */
    }
    return INITIAL_APPOINTMENTS
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
    } catch (e) {
      /* almacenamiento no disponible */
    }
  }, [appointments])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setAppointments(JSON.parse(e.newValue))
        } catch (err) {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const [payments, setPayments] = useState(INITIAL_PAYMENTS)
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST)
  const [users, setUsers] = useState(USERS)
  const [audit, setAudit] = useState(AUDIT_LOG)
  const [settings, setSettings] = useState({
    minCancelHours: 12,
    nonWorkingDays: ['2026-08-01', '2026-08-02', '2026-07-28', '2026-07-29'],
    tokenExpiryMin: 30,
    waitlistWindowMin: 15,
    lateFeeDays: 2,
  })

  const pushAudit = useCallback((entry) => {
    setAudit((a) => [
      { id: `A-${seq++}`, at: 'Hace unos segundos', ...entry },
      ...a,
    ])
  }, [])

  const login = useCallback((role) => {
    const userByRole = {
      paciente: { ...ME, role: 'paciente' },
      medico: { id: 'd1', name: 'Dra. Rosa Quispe Villanueva', role: 'medico', initials: 'RQ' },
      recepcionista: { id: 'r1', name: 'Sofía Mendoza Ríos', role: 'recepcionista', initials: 'SM' },
      enfermera: { ...NURSE },
      administrador: { id: 'u7', name: 'Miguel Ángel Huaraca', role: 'administrador', initials: 'MH' },
    }
    setAuth({ role, user: userByRole[role] })
    pushAudit({ user: userByRole[role].email || 'demo', action: 'Inicio de sesión', detail: `Sesión iniciada como ${role}`, sev: 'info', icon: 'check' })
  }, [pushAudit])

  const logout = useCallback(() => setAuth(null), [])

  const bookAppointment = useCallback((data) => {
    const id = `C-${1050 + Math.floor(Math.random() * 800)}`
    setAppointments((a) => [{ id, ...data, status: data.status || 'agendada', diag: null, triage: null, checkInTime: null }, ...a])
    pushAudit({ user: 'julia.mamani@gmail.com', action: 'Cita creada', detail: `Cita ${id} · ${data.date} ${data.time}`, sev: 'info', icon: 'check' })
    return id
  }, [pushAudit])

  const updateAppointment = useCallback((id, patch, auditEntry) => {
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    if (auditEntry) pushAudit(auditEntry)
  }, [pushAudit])

  const addPayment = useCallback((payment) => {
    setPayments((p) => [{ ...payment, id: `P-${800 + Math.floor(Math.random() * 900)}`, date: '2026-08-05', receipt: payment.status === 'pagado' ? `R-2026-${800 + Math.floor(Math.random() * 900)}` : null }, ...p])
  }, [])

  const enrollWaitlist = useCallback((data) => {
    const id = `WL-${110 + Math.floor(Math.random() * 800)}`
    const entry = {
      id, patientId: ME.id, ...data, position: Math.ceil(Math.random() * 2) + 1,
      enrolledAt: '2026-08-05', status: 'en_espera', offer: null,
    }
    setWaitlist((w) => [entry, ...w])
    pushAudit({ user: 'julia.mamani@gmail.com', action: 'Lista de espera', detail: `Inscripción ${id} · ${data.specialtyId}`, sev: 'info', icon: 'list' })
    return entry
  }, [pushAudit])

  const offerWaitlist = useCallback((wlId, offer) => {
    setWaitlist((w) => w.map((x) => (x.id === wlId ? { ...x, status: 'oferta', offer } : x)))
  }, [])

  const confirmOffer = useCallback((wlId) => {
    let createdId = null
    setWaitlist((w) => {
      const entry = w.find((x) => x.id === wlId)
      if (entry?.offer) {
        createdId = bookAppointment({
          patientId: entry.patientId, doctorId: entry.doctorId, specialtyId: entry.specialtyId,
          date: entry.offer.date, time: entry.offer.time, duration: 30, status: 'agendada',
          reason: 'Cupo asignado desde lista de espera inteligente.',
        })
        addPayment({
          appointmentId: createdId, patientId: entry.patientId, amount: 0,
          method: 'Pago en recepción', status: 'pendiente_verificacion', specialtyId: entry.specialtyId,
        })
      }
      return w.map((x) => (x.id === wlId ? { ...x, status: 'confirmada' } : x))
    })
    return createdId
  }, [bookAppointment, addPayment])

  const rejectOffer = useCallback((wlId) => {
    setWaitlist((w) => w.map((x) => (x.id === wlId ? { ...x, status: 'en_espera', offer: null } : x)))
  }, [])

  const expireOffer = useCallback((wlId) => {
    setWaitlist((w) => w.map((x) => (x.id === wlId ? { ...x, status: 'expirada', offer: null } : x)))
  }, [])

  const sendToTriage = useCallback((id, patientName, consultorio, turno) => {
    setAppointments((a) => {
      const next = turno || nextTurno(a)
      return a.map((x) => (x.id === id ? { ...x, status: 'en_espera_triaje', checkInTime: 'Ahora', turno: next } : x))
    })
    pushAudit({ user: 'sofia.mendoza@cmas.com', action: 'Check-in presencial', detail: `${patientName} enviado a Triaje · ${consultorio}`, sev: 'info', icon: 'check' })
  }, [pushAudit])

  const startTriage = useCallback((id) => {
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status: 'en_triaje' } : x)))
  }, [])

  const completeTriage = useCallback((id, triageData) => {
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status: 'triaje_completado', triage: triageData } : x)))
    pushAudit({ user: 'diana.prado@cmas.com', action: 'Triaje completado', detail: `Triaje de la cita ${id} enviado al médico`, sev: 'info', icon: 'check' })
  }, [pushAudit])

  const startAttention = useCallback((id) => {
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status: 'en_atencion' } : x)))
    pushAudit({ user: 'rosa.quispe@cmas.com', action: 'Atención iniciada', detail: `Cita ${id} iniciada por el médico`, sev: 'info', icon: 'stethoscope' })
  }, [pushAudit])

  const finalizeTriage = useCallback((id, triageData) => {
    setAppointments((a) => a.map((x) =>
      x.id === id
        ? {
            ...x,
            status: 'triaje_completado',
            triage: triageData || x.triage || { motivo: x.reason, alergias: 'Ninguna', observaciones: 'Triaje registrado desde la lista de espera.', nurseName: 'Lic. Diana Prado Peña', at: 'Ahora' },
          }
        : x,
    ))
    pushAudit({ user: 'diana.prado@cmas.com', action: 'Triaje completado', detail: `Triaje de la cita ${id} enviado al médico`, sev: 'info', icon: 'check' })
  }, [pushAudit])

  const markAttended = useCallback((id) => {
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status: 'atendida' } : x)))
    pushAudit({ user: 'diana.prado@cmas.com', action: 'Paciente atendido', detail: `El paciente de la cita ${id} completó su atención`, sev: 'info', icon: 'check' })
  }, [pushAudit])

  const resetDemo = useCallback(() => {
    setAppointments(INITIAL_APPOINTMENTS)
    pushAudit({ user: 'demo', action: 'Demo restablecida', detail: 'La cola del día volvió a su estado inicial', sev: 'info', icon: 'refresh' })
  }, [pushAudit])

  const value = useMemo(
    () => ({
      auth, login, logout,
      appointments, setAppointments, updateAppointment, bookAppointment,
      payments, addPayment,
      waitlist, enrollWaitlist, offerWaitlist, confirmOffer, rejectOffer, expireOffer,
      sendToTriage, startTriage, completeTriage, startAttention, finalizeTriage, markAttended, resetDemo,
      users, setUsers, audit, pushAudit, settings, setSettings,
      doctors: DOCTORS, patients: PATIENTS, specialties: SPECIALTIES,
      consultorios: CONSULTORIOS, nurse: NURSE,
    }),
    [auth, appointments, payments, waitlist, users, audit, settings,
      login, logout, updateAppointment, bookAppointment, addPayment,
      enrollWaitlist, offerWaitlist, confirmOffer, rejectOffer, expireOffer,
      sendToTriage, startTriage, completeTriage, startAttention, finalizeTriage, markAttended, resetDemo, pushAudit]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
