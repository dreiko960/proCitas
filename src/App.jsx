import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PanelLayout from './components/layout/PanelLayout'
import { useApp } from './context/AppContext'

import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import RecoverPassword from './pages/public/RecoverPassword'
import NewPassword from './pages/public/NewPassword'
import SearchAvailability from './pages/public/SearchAvailability'
import Components from './pages/public/Components'

import PatientDashboard from './pages/patient/Dashboard'
import PatientBook from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import PatientCheckin from './pages/patient/PatientCheckin'
import PatientHistory from './pages/patient/PatientHistory'
import PatientWaitlist from './pages/patient/Waitlist'
import WaitlistEnroll from './pages/patient/WaitlistEnroll'
import WaitlistOffer from './pages/patient/WaitlistOffer'
import WaitlistExpired from './pages/patient/WaitlistExpired'
import PatientPayments from './pages/patient/PatientPayments'
import PatientProfile from './pages/patient/PatientProfile'

import DoctorAgenda from './pages/doctor/Agenda'
import DoctorAvailability from './pages/doctor/Availability'
import DoctorPatientDetail from './pages/doctor/PatientDetail'
import DoctorDiagnosis from './pages/doctor/Diagnosis'
import DoctorProfile from './pages/doctor/Profile'

import TriageQueue from './pages/nurse/TriageQueue'
import TriageForm from './pages/nurse/TriageForm'
import TriageHistory from './pages/nurse/TriageHistory'

import ReceptionAgenda from './pages/reception/Agenda'
import ReceptionNewAppointment from './pages/reception/NewAppointment'
import ReceptionCheckin from './pages/reception/Checkin'
import ReceptionPayment from './pages/reception/Payment'
import ReceptionCancellations from './pages/reception/Cancellations'

import WaitingQueue from './pages/queue/WaitingQueue'
import TvDisplay from './pages/display/TvDisplay'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminSpecialties from './pages/admin/Specialties'
import AdminSettings from './pages/admin/Settings'
import AdminReports from './pages/admin/Reports'
import AdminAudit from './pages/admin/AuditLog'
import AdminConsultorios from './pages/admin/Consultorios'

export default function App() {
  const { auth } = useApp()
  const role = auth?.role || 'paciente'

  return (
    <Routes>
      {/* ——— Público ——— */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/recuperar/confirmacion" element={<RecoverPassword step="sent" />} />
      <Route path="/recuperar/nueva-password" element={<NewPassword />} />
      <Route path="/disponibilidad" element={<SearchAvailability />} />
      <Route path="/componentes" element={<Components />} />

      {/* ——— Pantalla de TV de la clínica (sin panel) ——— */}
      <Route path="/tv" element={<TvDisplay />} />

      {/* ——— Paneles por rol ——— */}
      <Route element={<PanelLayout />}>
        <Route path="/paciente" element={<PatientDashboard />} />
        <Route path="/paciente/reservar" element={<PatientBook />} />
        <Route path="/paciente/citas" element={<MyAppointments />} />
        <Route path="/paciente/checkin" element={<PatientCheckin />} />
        <Route path="/paciente/historial" element={<PatientHistory />} />
        <Route path="/paciente/lista-espera" element={<PatientWaitlist />} />
        <Route path="/paciente/lista-espera/inscripcion" element={<WaitlistEnroll />} />
        <Route path="/paciente/lista-espera/oferta" element={<WaitlistOffer />} />
        <Route path="/paciente/lista-espera/expirada" element={<WaitlistExpired />} />
        <Route path="/paciente/pagos" element={<PatientPayments />} />
        <Route path="/paciente/perfil" element={<PatientProfile />} />

        <Route path="/medico" element={<DoctorAgenda />} />
        <Route path="/medico/disponibilidad" element={<DoctorAvailability />} />
        <Route path="/medico/paciente/:pid" element={<DoctorPatientDetail />} />
        <Route path="/medico/diagnostico/:cid" element={<DoctorDiagnosis />} />
        <Route path="/medico/perfil" element={<DoctorProfile />} />

        <Route path="/enfermeria" element={<TriageQueue />} />
        <Route path="/enfermeria/triaje/:cid" element={<TriageForm />} />
        <Route path="/enfermeria/historial" element={<TriageHistory />} />
        <Route path="/enfermeria/lista-espera" element={<WaitingQueue />} />

        <Route path="/recepcion" element={<ReceptionAgenda />} />
        <Route path="/recepcion/nueva-cita" element={<ReceptionNewAppointment />} />
        <Route path="/recepcion/checkin" element={<ReceptionCheckin />} />
        <Route path="/recepcion/pago" element={<ReceptionPayment />} />
        <Route path="/recepcion/cancelaciones" element={<ReceptionCancellations />} />
        <Route path="/recepcion/lista-espera" element={<WaitingQueue />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/usuarios" element={<AdminUsers />} />
        <Route path="/admin/especialidades" element={<AdminSpecialties />} />
        <Route path="/admin/consultorios" element={<AdminConsultorios />} />
        <Route path="/admin/configuracion" element={<AdminSettings />} />
        <Route path="/admin/reportes" element={<AdminReports />} />
        <Route path="/admin/auditoria" element={<AdminAudit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
