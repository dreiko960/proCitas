import React from 'react'
import {
  IconStethoscope, IconHeartPulse, IconFirstAid, IconActivity, IconSparkles,
  IconStethoSmall, IconClipboard, IconWallet,
} from '../components/Icons'

const ICON_MAP = {
  stethoscope: IconStethoscope,
  heart: IconHeartPulse,
  firstaid: IconFirstAid,
  activity: IconActivity,
  sparkles: IconSparkles,
  brain: IconStethoSmall,
  apple: IconClipboard,
  wallet: IconWallet,
}

export function SpecialtyIcon({ id, size = 20 }) {
  const base = { medicina: 'stethoscope', pediatria: 'heart', ginecologia: 'firstaid', cardiologia: 'activity', dermatologia: 'sparkles', psicologia: 'brain', nutricion: 'apple' }
  const Icon = ICON_MAP[base[id]] || IconStethoscope
  return React.createElement(Icon, { size })
}

export function findDoctor(doctors, id) {
  return doctors.find((d) => d.id === id)
}

export function findSpecialty(specialties, id) {
  return specialties.find((s) => s.id === id)
}

export function findPatient(patients, id) {
  return patients.find((p) => p.id === id)
}

export function fmtPrice(n) {
  return `S/ ${n.toFixed(0)}`
}

export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function fmtDateFull(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return { dow: days[d.getDay()], day: d.getDate(), month: months[d.getMonth()] }
}

export function genWeek(dates) {
  const opts = ['2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10', '2026-08-11']
  const { dow, day, month } = dayLabel(dates[0])
  const week = { month, from: day, to: day + 6 }
  return week
}

export function hourSlots() {
  return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
}

export const STATUS_LABEL = {
  agendada: 'Agendada',
  pagada: 'Pagada',
  check_in: 'Check-in',
  en_espera_triaje: 'En espera de triaje',
  en_triaje: 'En triaje',
  triaje_completado: 'Triaje completado',
  en_atencion: 'En atención',
  atendida: 'Atendida',
  documentada: 'Documentada',
  cancelada: 'Cancelada',
  reprogramada: 'Reprogramada',
  pendiente: 'Pendiente de confirmación',
  confirmada: 'Confirmada',
}

export const PAY_TYPE_LABEL = {
  adelanto: 'Abono 50%',
  total: 'Pago total',
}

export function fmtPayType(t) {
  return PAY_TYPE_LABEL[t] || t || ''
}

export function paidTotalOf(appointmentId, payments) {
  return payments
    .filter((p) => p.appointmentId === appointmentId && p.status === 'pagado')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
}

export function findConsultorio(consultorios, id) {
  return consultorios.find((c) => c.id === id)
}

export function consultorioOf(consultorios, doctors, doctorId) {
  const doctor = findDoctor(doctors, doctorId)
  if (!doctor) return null
  return findConsultorio(consultorios, doctor.consultorioId) || null
}

export function waitMinutes(checkInTime, now = '08:30') {
  if (!checkInTime || checkInTime === 'Ahora') return 0
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  return Math.max(0, toMin(now) - toMin(checkInTime))
}
