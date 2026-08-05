export const TODAY = '2026-08-05'

export const SPECIALTIES = [
  { id: 'medicina', name: 'Medicina General', icon: 'stethoscope', price: 50, desc: 'Consultas de atención primaria, control y seguimiento de salud general.' },
  { id: 'pediatria', name: 'Pediatría', icon: 'heart', price: 65, desc: 'Atención integral para niñas y niños desde el nacimiento hasta la adolescencia.' },
  { id: 'ginecologia', name: 'Ginecología', icon: 'firstaid', price: 80, desc: 'Salud de la mujer, control prenatal, chequeos y prevención.' },
  { id: 'cardiologia', name: 'Cardiología', icon: 'activity', price: 120, desc: 'Prevención y tratamiento de enfermedades del corazón y del sistema circulatorio.' },
  { id: 'dermatologia', name: 'Dermatología', icon: 'sparkles', price: 90, desc: 'Diagnóstico y tratamiento de afecciones de la piel, cabello y uñas.' },
  { id: 'nutricion', name: 'Nutrición', icon: 'apple', price: 55, desc: 'Planes de alimentación personalizados y educación nutricional.' },
  { id: 'psicologia', name: 'Psicología', icon: 'brain', price: 70, desc: 'Atención en salud mental, terapia individual y manejo del estrés.' },
]

export const CONSULTORIOS = [
  { id: 1, nombre: 'Consultorio 1', piso: 'Piso 1', area: 'Consultas externas', especialidades: ['medicina'], activo: true },
  { id: 2, nombre: 'Consultorio 2', piso: 'Piso 1', area: 'Consultas externas', especialidades: ['medicina'], activo: true },
  { id: 3, nombre: 'Consultorio 3', piso: 'Piso 2', area: 'Especialidades', especialidades: ['pediatria', 'ginecologia'], activo: true },
  { id: 4, nombre: 'Consultorio 4', piso: 'Piso 2', area: 'Especialidades', especialidades: ['cardiologia', 'dermatologia'], activo: true },
  { id: 5, nombre: 'Consultorio 5', piso: 'Piso 2', area: 'Salud mental y nutrición', especialidades: ['nutricion', 'psicologia'], activo: false },
]

export const NURSE = { id: 'n1', name: 'Lic. Diana Prado Peña', role: 'enfermera', initials: 'DP' }

export const DOCTORS = [
  {
    id: 'd1', name: 'Dra. Rosa Quispe Villanueva', initials: 'RQ', specialtyId: 'medicina', consultorioId: 2,
    phone: '966 111 222', email: 'rosa.quispe@cmas.com', bio: 'Médica general con 12 años de experiencia en atención primaria comunitaria.',
    rating: 4.8, ratingCount: 132, studies: 'UNMSM', exp: 12,
    slots: [
      { day: '2026-08-05', start: '08:00', end: '08:30' }, { day: '2026-08-05', start: '08:30', end: '09:00' },
      { day: '2026-08-05', start: '09:00', end: '09:30' }, { day: '2026-08-05', start: '10:00', end: '10:30' },
      { day: '2026-08-06', start: '09:00', end: '09:30' }, { day: '2026-08-06', start: '09:30', end: '10:00' },
      { day: '2026-08-06', start: '11:00', end: '11:30' }, { day: '2026-08-06', start: '11:30', end: '12:00' },
      { day: '2026-08-07', start: '08:00', end: '08:30' }, { day: '2026-08-07', start: '08:30', end: '09:00' },
      { day: '2026-08-07', start: '15:00', end: '15:30' },
    ],
  },
  {
    id: 'd2', name: 'Dr. Marco Gutiérrez Salas', initials: 'MG', specialtyId: 'medicina', consultorioId: 1,
    phone: '966 222 333', email: 'marco.gutierrez@cmas.com', bio: 'Médico internista enfocado en prevención y manejo de enfermedades crónicas.',
    rating: 4.6, ratingCount: 98, studies: 'UNSAAC', exp: 9,
    slots: [
      { day: '2026-08-05', start: '14:00', end: '14:30' }, { day: '2026-08-05', start: '14:30', end: '15:00' },
      { day: '2026-08-06', start: '08:00', end: '08:30' }, { day: '2026-08-06', start: '08:30', end: '09:00' },
      { day: '2026-08-07', start: '10:00', end: '10:30' }, { day: '2026-08-07', start: '10:30', end: '11:00' },
    ],
  },
  {
    id: 'd3', name: 'Dra. Carmen Huamán Rojas', initials: 'CH', specialtyId: 'pediatria', consultorioId: 3,
    phone: '966 333 444', email: 'carmen.huaman@cmas.com', bio: 'Pediatra dedicada al desarrollo infantil saludable y control del niño sano.',
    rating: 4.9, ratingCount: 210, studies: 'UCSM', exp: 15,
    slots: [
      { day: '2026-08-05', start: '09:00', end: '09:30' }, { day: '2026-08-05', start: '09:30', end: '10:00' },
      { day: '2026-08-05', start: '10:00', end: '10:30' }, { day: '2026-08-06', start: '15:00', end: '15:30' },
      { day: '2026-08-07', start: '08:00', end: '08:30' }, { day: '2026-08-07', start: '09:00', end: '09:30' },
    ],
  },
  {
    id: 'd4', name: 'Dra. Lucía Torres Pacheco', initials: 'LT', specialtyId: 'ginecologia', consultorioId: 3,
    phone: '966 444 555', email: 'lucia.torres@cmas.com', bio: 'Ginecóloga obstetra, especialista en control prenatal y salud reproductiva.',
    rating: 4.7, ratingCount: 175, studies: 'UNMSM', exp: 11,
    slots: [
      { day: '2026-08-05', start: '11:00', end: '11:30' }, { day: '2026-08-05', start: '11:30', end: '12:00' },
      { day: '2026-08-06', start: '09:00', end: '09:30' }, { day: '2026-08-06', start: '09:30', end: '10:00' },
      { day: '2026-08-07', start: '16:00', end: '16:30' },
    ],
  },
  {
    id: 'd5', name: 'Dr. Jorge Mendoza Flores', initials: 'JM', specialtyId: 'cardiologia', consultorioId: 4,
    phone: '966 555 666', email: 'jorge.mendoza@cmas.com', bio: 'Cardiólogo clínico, evaluación de riesgo cardiovascular y seguimiento de hipertensión.',
    rating: 4.9, ratingCount: 88, studies: 'UPCH', exp: 14,
    slots: [
      { day: '2026-08-06', start: '10:00', end: '10:30' }, { day: '2026-08-06', start: '10:30', end: '11:00' },
      { day: '2026-08-07', start: '09:00', end: '09:30' },
    ],
  },
  {
    id: 'd6', name: 'Dra. Elena Vargas Díaz', initials: 'EV', specialtyId: 'dermatologia', consultorioId: 4,
    phone: '966 666 777', email: 'elena.vargas@cmas.com', bio: 'Dermatóloga con interés en dermatología estética y afecciones comunes.',
    rating: 4.5, ratingCount: 120, studies: 'UNMSM', exp: 8,
    slots: [
      { day: '2026-08-05', start: '15:00', end: '15:30' }, { day: '2026-08-06', start: '14:00', end: '14:30' },
      { day: '2026-08-07', start: '10:00', end: '10:30' },
    ],
  },
  {
    id: 'd7', name: 'Lic. Paola Cárdenas Ruiz', initials: 'PC', specialtyId: 'nutricion', consultorioId: 5,
    phone: '966 777 888', email: 'paola.cardenas@cmas.com', bio: 'Nutricionista clínica, planes para diabetes, obesidad y alimentación saludable.',
    rating: 4.7, ratingCount: 145, studies: 'UNALM', exp: 7,
    slots: [
      { day: '2026-08-06', start: '08:30', end: '09:00' }, { day: '2026-08-07', start: '11:00', end: '11:30' },
    ],
  },
  {
    id: 'd8', name: 'Ps. Daniela Ayala Castro', initials: 'DA', specialtyId: 'psicologia', consultorioId: 5,
    phone: '966 888 999', email: 'daniela.ayala@cmas.com', bio: 'Psicóloga clínica, manejo de ansiedad, depresión y terapia cognitivo-conductual.',
    rating: 4.8, ratingCount: 67, studies: 'UCSM', exp: 6,
    slots: [
      { day: '2026-08-06', start: '16:00', end: '16:30' }, { day: '2026-08-07', start: '08:30', end: '09:00' },
    ],
  },
]

export const PATIENTS = [
  { id: 'p1', name: 'Julia Mamani Quispe', initials: 'JM', dni: '45123876', email: 'julia.mamani@gmail.com', phone: '966 010 101', dob: '1985-03-14', address: 'Jr. Dos de Mayo 245, Ayacucho', age: 41 },
  { id: 'p2', name: 'Carlos Paredes Soto', initials: 'CP', dni: '70234518', email: 'carlos.paredes@gmail.com', phone: '966 010 202', dob: '1992-07-02', address: 'Av. Mariscal Cáceres 812, Ayacucho', age: 34 },
  { id: 'p3', name: 'María Flores Camacho', initials: 'MF', dni: '44120987', email: 'maria.flores@gmail.com', phone: '966 010 303', dob: '1978-11-25', address: 'Jr. Asamblea 310, Ayacucho', age: 47 },
  { id: 'p4', name: 'Pedro Huanca Apaza', initials: 'PH', dni: '72654123', email: 'pedro.huanca@gmail.com', phone: '966 010 404', dob: '1999-01-09', address: 'Av. Los Libertadores 560, Ayacucho', age: 27 },
  { id: 'p5', name: 'Rosa Palomino Vera', initials: 'RP', dni: '43111725', email: 'rosa.palomino@gmail.com', phone: '966 010 505', dob: '1965-05-30', address: 'Jr. Lima 189, Ayacucho', age: 61 },
]

// Paciente demo con sesión iniciada
export const ME = PATIENTS[0]

export const USERS = [
  { id: 'u1', name: 'Julia Mamani Quispe', role: 'paciente', email: 'julia.mamani@gmail.com', active: true, lastLogin: 'Hoy 08:12', createdAt: '12/01/2026' },
  { id: 'u2', name: 'Dra. Rosa Quispe Villanueva', role: 'medico', email: 'rosa.quispe@cmas.com', active: true, lastLogin: 'Hoy 07:45', createdAt: '03/02/2026' },
  { id: 'u3', name: 'Dra. Carmen Huamán Rojas', role: 'medico', email: 'carmen.huaman@cmas.com', active: true, lastLogin: 'Ayer 18:02', createdAt: '03/02/2026' },
  { id: 'u4', name: 'Dr. Marco Gutiérrez Salas', role: 'medico', email: 'marco.gutierrez@cmas.com', active: false, lastLogin: '28/07/2026', createdAt: '10/02/2026' },
  { id: 'u5', name: 'Sofía Mendoza Ríos', role: 'recepcionista', email: 'sofia.mendoza@cmas.com', active: true, lastLogin: 'Hoy 08:20', createdAt: '20/01/2026' },
  { id: 'u6', name: 'Raúl Cabrera León', role: 'recepcionista', email: 'raul.cabrera@cmas.com', active: true, lastLogin: '30/07/2026', createdAt: '15/03/2026' },
  { id: 'u7', name: 'Miguel Ángel Huaraca', role: 'administrador', email: 'miguel.huaraca@cmas.com', active: true, lastLogin: 'Hoy 08:00', createdAt: '02/01/2026' },
  { id: 'u8', name: 'Carlos Paredes Soto', role: 'paciente', email: 'carlos.paredes@gmail.com', active: true, lastLogin: 'Ayer 19:10', createdAt: '25/04/2026' },
  { id: 'u9', name: 'Lic. Diana Prado Peña', role: 'enfermera', email: 'diana.prado@cmas.com', active: true, lastLogin: 'Hoy 07:55', createdAt: '18/03/2026' },
]

export const AUDIT_LOG = [
  { id: 'a1', at: 'Hoy 08:31', user: 'julia.mamani@gmail.com', action: 'Acceso denegado', detail: 'Médico d1 intentó ver historial de paciente p3 sin relación vigente', sev: 'danger', icon: 'shield' },
  { id: 'a2', at: 'Hoy 08:22', user: 'sofia.mendoza@cmas.com', action: 'Pago registrado', detail: 'Comprobante R-2026-0813 · S/ 80.00 · Ginecología', sev: 'info', icon: 'wallet' },
  { id: 'a11', at: 'Hoy 08:20', user: 'diana.prado@cmas.com', action: 'Triaje completado', detail: 'Triaje de Pedro Huanca enviado a la Dra. Rosa Quispe', sev: 'info', icon: 'check' },
  { id: 'a12', at: 'Hoy 08:12', user: 'sofia.mendoza@cmas.com', action: 'Check-in presencial', detail: 'Rosa Palomino enviada a Triaje · Consultorio 2', sev: 'info', icon: 'check' },
  { id: 'a13', at: 'Hoy 08:05', user: 'sofia.mendoza@cmas.com', action: 'Check-in presencial', detail: 'María Flores enviada a Triaje · Consultorio 3', sev: 'info', icon: 'check' },
  { id: 'a3', at: 'Hoy 08:14', user: 'rosa.quispe@cmas.com', action: 'Cita marcada atendida', detail: 'Cita C-1042 de Julia Mamani', sev: 'info', icon: 'check' },
  { id: 'a4', at: 'Hoy 07:58', user: 'desconocido', action: 'Intento de login fallido', detail: '5 intentos con el usuario carlos.paredes@gmail.com', sev: 'warning', icon: 'lock' },
  { id: 'a5', at: 'Ayer 18:40', user: 'julia.mamani@gmail.com', action: 'Cita cancelada', detail: 'Cita C-1039 con Dra. Rosa Quispe', sev: 'warning', icon: 'x' },
  { id: 'a6', at: 'Ayer 17:05', user: 'miguel.huaraca@cmas.com', action: 'Cambio de rol', detail: 'Usuario u6 actualizado a rol recepcionista', sev: 'info', icon: 'users' },
  { id: 'a7', at: 'Ayer 16:30', user: 'desconocido', action: 'Acceso denegado', detail: 'Página de reportes solicitada sin rol administrador', sev: 'danger', icon: 'shield' },
  { id: 'a8', at: '28/07/2026 11:12', user: 'miguel.huaraca@cmas.com', action: 'Especialidad desactivada', detail: 'Dermatología desactivada temporalmente', sev: 'warning', icon: 'sliders' },
  { id: 'a9', at: '25/07/2026 15:48', user: 'julia.mamani@gmail.com', action: 'Lista de espera', detail: 'Inscripción en Cardiología · posición 3', sev: 'info', icon: 'list' },
  { id: 'a10', at: '24/07/2026 09:20', user: 'sofia.mendoza@cmas.com', action: 'Cita reprogramada', detail: 'Cita C-1035 de María Flores a 06/08', sev: 'info', icon: 'refresh' },
]

export const INITIAL_APPOINTMENTS = [
  {
    id: 'C-1042', patientId: 'p1', doctorId: 'd1', specialtyId: 'medicina',
    date: '2026-08-05', time: '09:00', duration: 30, status: 'agendada',
    reason: 'Control de presión arterial y renovación de receta de antihipertensivo.',
    diag: null, triage: null, checkInTime: null,
  },
  {
    id: 'C-1041', patientId: 'p3', doctorId: 'd4', specialtyId: 'ginecologia',
    date: '2026-08-05', time: '11:00', duration: 30, status: 'en_espera_triaje',
    reason: 'Control prenatal de 24 semanas.',
    diag: null, triage: null, checkInTime: '08:05',
  },
  {
    id: 'C-1040', patientId: 'p2', doctorId: 'd2', specialtyId: 'medicina',
    date: '2026-08-05', time: '14:30', duration: 30, status: 'pagada',
    reason: 'Dolor abdominal recurrente.',
    diag: null, triage: null, checkInTime: null,
  },
  {
    id: 'C-1043', patientId: 'p5', doctorId: 'd1', specialtyId: 'medicina',
    date: '2026-08-05', time: '10:00', duration: 30, status: 'en_espera_triaje',
    reason: 'Fiebre y dolor de garganta desde hace 2 días.',
    diag: null, triage: null, checkInTime: '08:12',
  },
  {
    id: 'C-1044', patientId: 'p4', doctorId: 'd1', specialtyId: 'medicina',
    date: '2026-08-05', time: '11:00', duration: 30, status: 'triaje_completado',
    reason: 'Dolor de cabeza recurrente y mareos.',
    diag: null, checkInTime: '08:20',
    triage: {
      pa: '118/76', temp: '36.8', fc: '80', peso: '71', talla: '1.74',
      motivo: 'Cefalea recurrente desde hace una semana, mareos ocasionales.',
      alergias: 'Penicilina',
      observaciones: 'Paciente alerta y orientado. Refiere dormir poco por trabajo nocturno.',
      nurseName: 'Lic. Diana Prado Peña', at: '08:22',
    },
  },
  {
    id: 'C-1039', patientId: 'p1', doctorId: 'd1', specialtyId: 'medicina',
    date: '2026-08-04', time: '10:00', duration: 30, status: 'documentada',
    reason: 'Dolor de cabeza frecuente y fatiga.',
    diag: { dx: 'Migraña tensional leve', notes: 'Se recomienda hidratación adecuada, sueño regular y control de estrés. Se indica paracetamol en caso de crisis. Seguimiento en 30 días si persiste.' },
    triage: { pa: '122/80', temp: '36.6', fc: '76', peso: '64', talla: '1.62', motivo: 'Cefalea y fatiga', alergias: 'Ninguna', observaciones: 'Sin signos de alarma.', nurseName: 'Lic. Diana Prado Peña', at: '09:38' },
    checkInTime: '09:32',
  },
  {
    id: 'C-1035', patientId: 'p5', doctorId: 'd3', specialtyId: 'pediatria',
    date: '2026-08-03', time: '09:30', duration: 30, status: 'documentada',
    reason: 'Control de niño sano.',
    diag: { dx: 'Desarrollo normal para la edad', notes: 'Peso y talla dentro de percentiles adecuados. Vacunas al día.' },
    triage: { pa: '—', temp: '36.9', fc: '92', peso: '23', talla: '1.18', motivo: 'Control de niño sano', alergias: 'Ninguna', observaciones: '—', nurseName: 'Lic. Diana Prado Peña', at: '09:12' },
    checkInTime: '09:05',
  },
  {
    id: 'C-1031', patientId: 'p1', doctorId: 'd7', specialtyId: 'nutricion',
    date: '2026-07-22', time: '08:30', duration: 30, status: 'documentada',
    reason: 'Plan de alimentación para control de colesterol.',
    diag: { dx: 'Dislipidemia leve', notes: 'Se entrega plan de 4 semanas: reducción de grasas saturadas, aumento de fibra y actividad física 3 veces/semana.' },
    triage: null, checkInTime: null,
  },
  {
    id: 'C-1027', patientId: 'p1', doctorId: 'd1', specialtyId: 'medicina',
    date: '2026-06-18', time: '08:30', duration: 30, status: 'documentada',
    reason: 'Chequeo general anual.',
    diag: { dx: 'Paciente sano', notes: 'Laboratorios en rango. Se recomienda continuar con dieta y ejercicio.' },
    triage: null, checkInTime: null,
  },
  {
    id: 'C-1019', patientId: 'p2', doctorId: 'd6', specialtyId: 'dermatologia',
    date: '2026-07-30', time: '15:00', duration: 30, status: 'cancelada',
    reason: 'Consulta por manchas en la piel.',
    diag: null, triage: null, checkInTime: null,
  },
]

export const INITIAL_PAYMENTS = [
  { id: 'P-0813', appointmentId: 'C-1041', patientId: 'p3', amount: 80, method: 'Efectivo', date: '2026-08-05 08:02', status: 'pagado', receipt: 'R-2026-0813', verifiedBy: 'Sofía Mendoza' },
  { id: 'P-0810', appointmentId: 'C-1039', patientId: 'p1', amount: 50, method: 'Yape', date: '2026-08-04 09:40', status: 'pagado', receipt: 'R-2026-0810', verifiedBy: 'Sofía Mendoza' },
  { id: 'P-0805', appointmentId: 'C-1031', patientId: 'p1', amount: 55, method: 'Efectivo', date: '2026-07-22 08:15', status: 'pagado', receipt: 'R-2026-0805', verifiedBy: 'Raúl Cabrera' },
  { id: 'P-0801', appointmentId: 'C-1027', patientId: 'p1', amount: 50, method: 'Transferencia', date: '2026-06-18 08:05', status: 'pagado', receipt: 'R-2026-0801', verifiedBy: 'Sofía Mendoza' },
  { id: 'P-0814', appointmentId: 'C-1050', patientId: 'p1', amount: 120, method: 'Yape', date: '2026-08-04 18:22', status: 'pendiente_verificacion', receipt: null },
]

export const INITIAL_WAITLIST = [
  {
    id: 'WL-007', patientId: 'p1', specialtyId: 'cardiologia', doctorId: 'd5',
    preferred: 'Por las mañanas (08:00 – 12:00)', position: 2, enrolledAt: '2026-08-04 15:30',
    status: 'en_espera', offer: null,
  },
  {
    id: 'WL-008', patientId: 'p2', specialtyId: 'medicina', doctorId: 'd2',
    preferred: 'Tardes (14:00 – 17:00)', position: 1, enrolledAt: '2026-08-05 08:10',
    status: 'oferta', offer: { date: '2026-08-06', time: '08:30', expiresAt: '2026-08-05 10:25', confirmWindowMin: 15 },
  },
  {
    id: 'WL-003', patientId: 'p4', specialtyId: 'psicologia', doctorId: 'd8',
    preferred: 'Cualquier horario', position: 3, enrolledAt: '2026-07-30 10:00',
    status: 'expirada', offer: null,
  },
]
