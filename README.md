# SGCM-CMAS · Sistema de Gestión de Citas Médicas — Prototipo

Prototipo funcional de un sistema de gestión de citas médicas para el **Centro Médico de Atención en Salud (CMAS) de Ayacucho**. Cubre el ciclo completo de atención ambulatoria: reserva, pago, check-in, triaje de enfermería, consulta médica, diagnóstico, historial clínico y pagos — más un módulo de **lista de espera inteligente con pantalla de TV en tiempo real** y una **pasarela de pago en línea** (abono 50% o pago total) para asegurar la asistencia del paciente a su cita.

Todo el sistema funciona con datos simulados en memoria (sin backend): el estado vive en un `Context` global y se persiste/sincroniza en el navegador mediante `localStorage`.

> **Documentación detallada de módulos:** para el desglose funcional y técnico de cada módulo (flujos paso a paso, reglas de negocio, estados, integraciones y archivos), ver [`docs/MODULOS.md`](docs/MODULOS.md).
>
> **Backend (producción):** para el plan integral del backend — base de datos PostgreSQL, contrato de API REST, integración de pagos Culqi, tiempo real, tareas programadas, seguridad y roadmap de implementación — ver [`docs/BACKEND.md`](docs/BACKEND.md).
>
> **Frontend (producción):** para el plan de evolución del frontend — estructura, data fetching con React Query, autenticación con guards, integración de APIs, pantalla TV en tiempo real, Culqi.js, PWA y roadmap — ver [`docs/FRONTEND.md`](docs/FRONTEND.md).

---

## 1. Índice

1. [Visión general](#2-visión-general)
2. [Stack tecnológico](#3-stack-tecnológico)
3. [Cómo ejecutar el proyecto](#4-cómo-ejecutar-el-proyecto)
4. [Estructura del proyecto](#5-estructura-del-proyecto)
5. [Roles y accesos de demostración](#6-roles-y-accesos-de-demostración)
6. [Rutas del sistema](#7-rutas-del-sistema)
7. [Modelo de datos](#8-modelo-de-datos)
8. [Ciclo de vida de una cita](#9-ciclo-de-vida-de-una-cita)
9. [Funcionalidades por rol](#10-funcionalidades-por-rol)
10. [Lista de espera inteligente y pantalla de TV](#11-lista-de-espera-inteligente-y-pantalla-de-tv)
11. [Sistema de diseño y componentes UI](#12-sistema-de-diseño-y-componentes-ui)
12. [Arquitectura técnica](#13-arquitectura-técnica)
13. [Configuración general](#14-configuración-general)
14. [Limitaciones y siguientes pasos](#15-limitaciones-y-siguientes-pasos)

---

## 2. Visión general

El prototipo simula la operación diaria de un centro médico con 5 perfiles de usuario, cada uno con su propio panel:

- **Paciente** — reserva citas, paga, confirma llegada, consulta su historial y participa en la lista de espera inteligente.
- **Médico** — agenda del día, disponibilidad, triaje recibido, atención y registro de diagnósticos.
- **Enfermería** — cola de triaje, toma de signos vitales e historial de triajes.
- **Recepción** — agenda general, registro de citas, check-in, cobros y cancelaciones.
- **Administración** — indicadores, usuarios y roles, especialidades, consultorios, reportes, configuración y auditoría.

El día de operación del prototipo es el **miércoles 05 de agosto de 2026** (constante `TODAY = '2026-08-05'` en `src/data/mock.js`). La semana de reservas es del 05 al 11 de agosto de 2026.

---

## 3. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React 18.3 (`react`, `react-dom`) |
| Build | Vite 5.4 (plugin oficial de React) |
| Enrutado | React Router 6 (`BrowserRouter`) |
| Lenguaje | JavaScript + JSX (sin TypeScript) |
| Estilos | CSS plano con variables (`src/styles/tokens.css`) + CSS por página |
| Tipografía | Manrope (Google Fonts) |
| Estado global | React Context + `useReducer`-style hooks (`src/context/AppContext.jsx`) |
| Persistencia | `localStorage` (solo citas, clave `procitas-appointments-v1`) |
| Generación de PDF | `jspdf` + `jspdf-autotable` (historial clínico y ficha del paciente; carga diferida con `import()`) |
| Despliegue | Netlify (config en `netlify.toml`) |

---

## 4. Cómo ejecutar el proyecto

Requisitos: **Node.js 20+** y npm.

```bash
# Instalar dependencias
npm install

# Entorno de desarrollo (abre el navegador en http://localhost:5173)
npm run dev

# Build de producción (genera la carpeta dist/)
npm run build

# Previsualizar el build generado
npm run preview
```

> El servidor de Vite está configurado con `server.port = 5173` y `open: true` (`vite.config.js`).

### Despliegue en Netlify

`netlify.toml` define:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

El archivo `public/_redirects` (`/* → /index.html 200`) garantiza el enrutado SPA: cualquier ruta (p. ej. `/tv`, `/recepcion/lista-espera`) cae en el `index.html`.

---

## 5. Estructura del proyecto

```
proCitas/
├── index.html                     # HTML raíz (fuente Manrope, #root)
├── vite.config.js                 # Config de Vite (puerto 5173)
├── netlify.toml                   # Config de despliegue
├── package.json
├── public/
│   └── _redirects                 # Fallback SPA para Netlify
└── src/
    ├── main.jsx                   # Punto de entrada (BrowserRouter + AppProvider + ToastProvider)
    ├── App.jsx                    # Definición de TODAS las rutas
    ├── styles/
    │   ├── tokens.css             # Variables de diseño (paleta, tipografía, radios, sombras)
    │   └── global.css             # Reset, utilidades (.row, .grid, .muted…) y animaciones
    ├── context/
    │   └── AppContext.jsx         # Estado global + acciones + helpers de la cola
    ├── data/
    │   ├── mock.js                # TODOS los datos simulados (especialidades, citas, usuarios…)
    │   └── clinic.js              # ★ Datos de la clínica (nombre, dirección, RUC…) para membrete
    ├── utils/
    │   ├── helpers.js             # Funciones de ayuda y STATUS_LABEL
    │   └── clinicPdf.js           # ★ Generador PDF (jsPDF): membrete, resumen por cita, historial/ficha
    ├── hooks/
    │   └── useCountdown.js        # Cuenta regresiva mm:ss (ofertas de cupo)
    ├── components/
    │   ├── Icons.jsx              # Set de iconos SVG propios
    │   ├── PageHeader.jsx         # Encabezado de página con título/subtítulo/acciones
    │   ├── AppointmentCard.jsx    # Tarjeta de cita + DoctorSearchCard
    │   ├── PaymentGateway.jsx     # ★ Pasarela de pago simulada (tarjeta, 50%/100%)
    │   ├── layout/
    │   │   ├── PanelLayout.jsx    # Layout del panel por rol (sidebar, topbar, móvil)
    │   │   ├── AuthLayout.jsx     # Layout de login/registro/recuperación
    │   │   └── Logo.jsx           # Marca del sistema (modo claro/oscuro)
    │   └── ui/                    # Biblioteca de componentes UI
    │       ├── Button.jsx · Badge.jsx · Card.jsx · Field.jsx
    │       ├── Modal.jsx · Tabs.jsx · Misc.jsx · EmptyState.jsx · Toast.jsx
    └── pages/
        ├── public/                # Landing, Login, Register, Recuperar, Disponibilidad, Componentes
        ├── patient/               # 11 páginas del paciente
        ├── doctor/                # Agenda, Disponibilidad, Diagnóstico, Detalle, Perfil
        ├── nurse/                 # Cola de triaje, Formulario, Historial
        ├── reception/             # Agenda, Nueva cita, Check-in, Pago, Cancelaciones
        ├── admin/                 # Dashboard, Usuarios, Especialidades, Consultorios, Reportes, Config, Auditoría
        ├── queue/                 # ★ Lista de espera inteligente (tablero de gestión)
        └── display/               # ★ Pantalla de TV de la clínica
```

---

## 6. Roles y accesos de demostración

Todos los roles inician sesión con el mismo formulario (`/login`); el rol se **infiere del correo** por heurística. También hay **botones de acceso rápido** en la propia pantalla de login (cada uno entra al panel correspondiente en 0.5 s).

| Rol | Usuario demo | Correo | Panel inicial |
|---|---|---|---|
| Paciente | Julia Mamani Quispe | `julia.mamani@gmail.com` | `/paciente` |
| Médico | Dra. Rosa Quispe Villanueva | `rosa.quispe@cmas.com` | `/medico` |
| Enfermería | Lic. Diana Prado Peña | `diana.prado@cmas.com` | `/enfermeria` |
| Recepción | Sofía Mendoza Ríos | `sofia.mendoza@cmas.com` | `/recepcion` |
| Administración | Miguel Ángel Huaraca | `miguel.huaraca@cmas.com` | `/admin` |

**Heurística de rol** (`src/pages/public/Login.jsx`):

- `medico` en el correo, o `rosa` + `cmas.com` → **médico**
- `diana` o `enfermera` → **enfermera**
- `sofia` → **recepcionista**
- `huaraca` o `admin` → **administrador**
- cualquier otro → **paciente**

El registro público (`/registro`) solo crea pacientes. El administrador crea el resto de cuentas desde *Admin → Usuarios*.

---

## 7. Rutas del sistema

### Público (sin panel)

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Landing | Marketing del centro, especialidades y CTA |
| `/login` | Login | Acceso único con detección de rol + accesos demo |
| `/registro` | Register | Registro de paciente (valida correo/DNI/celular únicos) |
| `/recuperar` | RecoverPassword | Paso 1: solicitar enlace (2 pasos) |
| `/recuperar/confirmacion` | RecoverPassword (`step=sent`) | "Revisa tu correo" |
| `/recuperar/nueva-password` | NewPassword | Paso 2: definir nueva clave |
| `/disponibilidad` | SearchAvailability | Búsqueda pública de horarios por especialidad/fechas |
| `/componentes` | Components | Galería del sistema de diseño |
| **`/tv`** | **TvDisplay** | **Pantalla de TV de la clínica (fullscreen, sin panel)** |

### Panel del paciente

| Ruta | Página |
|---|---|
| `/paciente` | Dashboard |
| `/paciente/reservar` | BookAppointment (wizard 3 pasos) |
| `/paciente/citas` | MyAppointments (próximas/pasadas/canceladas) |
| `/paciente/checkin` | PatientCheckin (confirmar llegada desde el móvil) |
| `/paciente/historial` | PatientHistory (historial clínico completo + descarga PDF con membrete) |
| `/paciente/lista-espera` | Waitlist (mis inscripciones) |
| `/paciente/lista-espera/inscripcion` | WaitlistEnroll |
| `/paciente/lista-espera/oferta` | WaitlistOffer (cupo con cuenta regresiva) |
| `/paciente/lista-espera/expirada` | WaitlistExpired |
| `/paciente/pagos` | PatientPayments |
| `/paciente/perfil` | PatientProfile |

### Panel del médico

| Ruta | Página |
|---|---|
| `/medico` | Agenda del día (timeline + filtros + "en vivo") |
| `/medico/disponibilidad` | Availability (grilla 7 días × 30 min) |
| `/medico/paciente/:pid` | PatientDetail (historial con regla de acceso) |
| `/medico/diagnostico/:cid` | Diagnosis (registro de diagnóstico) |
| `/medico/perfil` | Profile |

### Panel de enfermería

| Ruta | Página |
|---|---|
| `/enfermeria` | TriageQueue (cola de triaje) |
| `/enfermeria/triaje/:cid` | TriageForm (signos vitales) |
| `/enfermeria/historial` | TriageHistory (triajes del turno) |
| **`/enfermeria/lista-espera`** | **WaitingQueue (tablero de la cola + TV)** |

### Panel de recepción

| Ruta | Página |
|---|---|
| `/recepcion` | Agenda general del día |
| `/recepcion/nueva-cita` | NewAppointment (wizard + alta rápida) |
| `/recepcion/checkin` | Check-in presencial (asigna turno) |
| `/recepcion/pago` | Payment (cobros y comprobantes) |
| `/recepcion/cancelaciones` | Cancellations (cancelar / reprogramar) |
| **`/recepcion/lista-espera`** | **WaitingQueue (tablero de la cola + TV)** |

### Panel de administración

| Ruta | Página |
|---|---|
| `/admin` | Dashboard (indicadores del centro) |
| `/admin/usuarios` | Users (cuentas y roles) |
| `/admin/especialidades` | Specialties (catálogo y precios) |
| `/admin/consultorios` | Consultorios (pisos y especialidades) |
| `/admin/reportes` | Reports (reportes exportables demo) |
| `/admin/configuracion` | Settings (reglas de negocio) |
| `/admin/auditoria` | AuditLog (eventos de seguridad) |

---

## 8. Modelo de datos

Toda la información vive en `src/data/mock.js` y se expone desde `AppContext`.

### 8.1 Especialidades (`SPECIALTIES`)

7 especialidades con `id`, `name`, `icon`, `price` y `desc`:

| Especialidad | Precio |
|---|---|
| Medicina General | S/ 50 |
| Pediatría | S/ 65 |
| Ginecología | S/ 80 |
| Cardiología | S/ 120 |
| Dermatología | S/ 90 |
| Nutrición | S/ 55 |
| Psicología | S/ 70 |

### 8.2 Consultorios (`CONSULTORIOS`)

5 consultorios con `id`, `nombre`, `piso`, `area`, `especialidades[]` y `activo`. El Consultorio 5 (Nutrición/Psicología) está inactivo.

### 8.3 Doctores (`DOCTORS`)

8 profesionales con `id`, `name`, `initials`, `specialtyId`, `consultorioId`, contacto, biografía, rating y `slots` (día + hora de 30 min). El médico demo autenticado es la **Dra. Rosa Quispe (d1)** en el **Consultorio 2**.

### 8.4 Pacientes (`PATIENTS`)

5 pacientes con `id`, `name`, `dni`, `email`, `phone`, `dob`, `address`, `age`. El paciente con sesión es **Julia Mamani (p1)** (`ME`).

### 8.5 Usuarios (`USERS`)

9 cuentas del sistema con `id`, `name`, `role` (`paciente | medico | enfermera | recepcionista | administrador`), `email`, `active`, `lastLogin`, `createdAt`.

### 8.6 Citas (`INITIAL_APPOINTMENTS`)

Cada cita:

```
{
  id: 'C-1042',
  patientId: 'p1',
  doctorId: 'd1',
  specialtyId: 'medicina',
  date: '2026-08-05', time: '09:00', duration: 30,
  status: 'agendada',
  reason: '…',
  diag: { dx, notes } | null,
  triage: { pa, temp, fc, peso, talla, motivo, alergias, observaciones, nurseName, at } | null,
  checkInTime: '08:05' | null,
  turno: 'A-001' | null        // ★ asignado en el check-in (lista de espera/TV)
  paidType: 'adelanto' | 'total' | null   // ★ si se pagó en línea (50% / 100%)
}
```

### 8.7 Pagos (`INITIAL_PAYMENTS`)

```
{ id: 'P-0813', appointmentId, patientId, amount, method, date, status: 'pagado' | 'pendiente_verificacion', receipt, verifiedBy,
  paidType: 'adelanto' | 'total',   // ★ abono 50% (pasarela) o pago total
  gateway?: true, opRef?: 'OP-2026-XXXX' }  // ★ pago por pasarela en línea
```

> El estado de pago de una cita se resume con `paidTotalOf(appointmentId, payments)` (suma de pagos `pagado`) y el tipo se muestra con `fmtPayType` (`Abono 50%` / `Pago total`).

### 8.8 Lista de espera de cupos (`INITIAL_WAITLIST`)

Lista de espera **de citas liberadas** (módulo del paciente), distinta de la *cola del día*:

```
{ id: 'WL-008', patientId, specialtyId, doctorId, preferred, position, enrolledAt,
  status: 'en_espera' | 'oferta' | 'confirmada' | 'expirada', offer: { date, time, expiresAt, confirmWindowMin } }
```

### 8.9 Auditoría (`AUDIT_LOG`)

Eventos con `id`, `at`, `user`, `action`, `detail`, `sev` (`info|warning|danger`) e `icon`.

---

## 9. Ciclo de vida de una cita

Flujo de estados implementado (`STATUS_LABEL` en `src/utils/helpers.js` y mapa de `Badge`):

```
agendada ──(pago en caja)──▶ pagada ──(check-in recepción)──▶ en_espera_triaje
agendada ──(pasarela 50%/100% en línea)──▶ pagada ──(check-in directo)──┘
                                                                        │
                    en_triaje ◀──(enfermera llama/inicia triaje)─────────┤
                        │                                              │
                        └──(triaje completado)──▶ triaje_completado     │
                                                        │               │
                                              (médico inicia atención)  │
                                                        ▼               │
                                                     en_atencion         │
                                                        │               │
                                             (médico registra diagnóstico)
                                                        ▼
                                                     documentada
```

Además: `check_in` (confirmó llegada desde el móvil, previo a triaje), `atendida` (atención concluida sin documento), y ramas laterales `cancelada` y `reprogramada`.

**Responsabilidades por etapa:**

| Etapa | Quién actúa | Cómo |
|---|---|---|
| `agendada` | Paciente/Recepción | Reserva creada; espera pago en caja |
| `pagada` | Recepción (`/recepcion/pago`) o **pasarela en línea (50%/100%)** | Cobro registrado → habilita check-in. Con abono 50% el saldo se cobra en recepción |
| `check_in` / `en_espera_triaje` | Paciente (móvil) / Recepción (`/recepcion/checkin`) | Confirma llegada; **recepción asigna el turno A-00X** |
| `en_triaje` | Enfermería (`/enfermeria`) | Llama al paciente y evalúa signos vitales |
| `triaje_completado` | Enfermería (`TriageForm`) | Envía el triaje al médico ("por atender") |
| `en_atencion` | Médico (`/medico`) | Inicia la consulta |
| `documentada` | Médico (`/medico/diagnostico/:cid`) | Registra diagnóstico → historial |

---

## 10. Funcionalidades por rol

### Paciente
- **Reservar cita** en 3 pasos (especialidad → médico/horario → confirmar), con demo de conflicto de concurrencia (horarios alternativos) y **pago anticipado en línea** para asegurar la asistencia.
- **Mis citas**: próximas / pasadas / canceladas; reprogramar, cancelar (con alerta de cancelación tardía <12 h) y check-in.
- **Check-in móvil** (estado `check_in`) y aviso de "llegar 10 minutos antes con DNI".
- **Historial clínico** en línea de tiempo expandible: motivo de consulta, diagnóstico con severidad, notas e indicaciones del médico, triaje de enfermería completo (PA, temperatura, FC, peso, talla, alergias, observaciones), consultorio, turno y costo. **Descarga real en PDF** — por cita (resumen de atención con firma del médico) o el historial completo — con membrete oficial de la clínica (`utils/clinicPdf.js`).
- **Lista de espera inteligente**: inscribirse por especialidad/médico/horario, ver posición `~N°`, recibir **ofertas de cupo** con cuenta regresiva de **15 min** (`useCountdown`), confirmar (crea la cita automáticamente) o rechazar (mantiene la posición). Si expira, el cupo pasa al siguiente.
- **Pagos**: declarar pagos (Yape/Plin/Transferencia/Efectivo) eligiendo **Abono 50%** o **Pago total** → quedan `pendiente_verificacion` hasta que recepción los confirme (<15 min).
- **Perfil** con validación por campo y cambio de contraseña simulado.

### Médico
- **Agenda del día** en timeline con filtros (todos / en camino / por atender / en atención / documentadas), banner de cola y simulador de cancelación en vivo.
- **Disponibilidad**: grilla de 7 días × franjas de 30 min, detección de solapamientos; las citas confirmadas no se pierden.
- **Atención**: pasa a `en_atencion` y luego registra diagnóstico (severidad + observaciones) → `documentada`.
- **Detalle del paciente** protegido por "relación clínica vigente" (acceso denegado + auditoría si no hay citas previas). **Ficha clínica descargable en PDF** (historial completo con el médico, con membrete oficial).

### Enfermería
- **Cola de triaje**: pacientes `en_espera_triaje` ordenados por tiempo de espera + triajes en progreso.
- **Formulario de triaje**: PA, temperatura, FC, peso, talla, motivo, alergias y observaciones; envío al médico.
- **Historial de triajes del turno**.
- **★ Lista de espera**: mismo tablero de gestión que recepción (ver sección 11).

### Recepción
- **Agenda general** del día (todos los médicos) con filtros por especialidad/médico.
- **Registrar cita** (wizard 3 pasos + "alta rápida" de paciente) con pago opcional al confirmar.
- **Check-in presencial**: marca la llegada de pacientes `pagada` y los envía a triaje **asignándoles su turno**.
- **Cobros**: cobra citas pendientes, genera comprobante `R-2026-XXXX` con membrete centralizado de la clínica (`data/clinic.js`). **Completa abonos 50%** pagados por la pasarela (cobra el saldo y deja la cita al 100%).
- **Cancelaciones y reprogramaciones**, con alerta de cancelación tardía.
- **★ Lista de espera**: tablero de gestión + botón "Abrir pantalla TV" (sección 11).

### Administración
- **Indicadores**: citas del mes, tasa de cancelación, inasistencia, ingresos, ocupación por especialidad y tendencia semanal.
- **Usuarios y roles**: alta de cuentas con validación de correo único, activar/desactivar.
- **Especialidades**: precios, activación y advertencia si hay médicos asociados.
- **Consultorios**: pisos, áreas, especialidades asignadas y advertencia si están en uso.
- **Reportes** y **auditoría** (veredictos Éxito/Advertencia/Bloqueado, exportación simulada).
- **Configuración**: horas mínimas de cancelación, expiración de token, ventana de lista de espera y días no laborables.

---

## 11. Lista de espera inteligente y pantalla de TV

Funcionalidad transversal que conecta a **recepción** y **enfermería** con un **televisor de sala de espera**, actualizado en tiempo real.

### 11.1 Concepto

- Cada paciente recibe un **turno secuencial** (`A-001`, `A-002`, …) en el momento del **check-in presencial** (`src/pages/reception/Checkin.jsx`). El turno = orden de llegada = **el número que ve el paciente en la TV**.
- Están "en cola" las citas del día con estado en el *pipeline*: `en_espera_triaje`, `en_triaje`, `triaje_completado`, `en_atencion`.
- Al **llamar** o **pasar** a un paciente, la cola se recalcula sola: el número llamándose se muestra en grande y el siguiente turno asciende automáticamente.

### 11.2 Tablero de gestión (`src/pages/queue/WaitingQueue.jsx`)

Rutas compartidas: **`/recepcion/lista-espera`** y **`/enfermeria/lista-espera`** (mismo componente).

- Dos columnas: **"Esperando turno"** (ordenados por turno, con chip "SIGUIENTE EN LLAMAR" en el primero) y **"Activos ahora"**.
- Tarjeta por paciente: turno, avatar, especialidad · médico, consultorio, hora de cita y tiempo de espera.
- **Acciones según estado:**

| Estado | Acción disponible | Transición |
|---|---|---|
| `en_espera_triaje` | Llamar a triaje | → `en_triaje` |
| `en_triaje` | Finalizar triaje | → `triaje_completado` |
| `triaje_completado` | Llamar a consulta | → `en_atencion` |
| `en_atencion` | Marcar atendida | → `atendida` (sale de la cola) |

- Fila de estadísticas en vivo (esperando / en triaje / en consulta / atendidos hoy).
- Botones: **"Abrir pantalla TV"** (abre `/tv` en pestaña nueva) y **"Restablecer demo"** (vuelve a las citas del mock inicial).
- Historial compacto de "Atendidos hoy".

### 11.3 Pantalla de TV (`src/pages/display/TvDisplay.jsx`)

Ruta **`/tv`** — standalone, fullscreen, sin sidebar, tema oscuro de alto contraste.

- Encabezado: marca del centro, fecha y **reloj en vivo** (segundos), contador de atendidos.
- Dos paneles principales: **"AHORA · EN TRIAGE"** y **"AHORA · EN CONSULTA"**, con el número del turno en tamaño gigante (animación de pulso), nombre del paciente y consultorio.
- Lista de **"PRÓXIMOS TURNOS"** (hasta 5) y, si hay más, el resto de la cola atenuado.
- Pie con indicador "Transmisión en vivo".

**Actualización automática:**
- El estado de citas se persiste en `localStorage` (`procitas-appointments-v1`) y se sincroniza entre pestañas mediante el evento `storage` (`AppContext.jsx`). Por eso, si el TV está abierto en otra ventana/dispositivo del mismo navegador, **se actualiza en el instante** en que recepción/enfermería llaman o pasan a un paciente desde el tablero.
- Incluye un botón **"Modo automático (demo)"**: avanza la cola sola cada 4.5 s (llama a triaje → finaliza triaje → llama a consulta → marca atendida) para demostrar el cambio de números sin intervención manual.

### 11.4 Implementación (resumen)

| Pieza | Archivo |
|---|---|
| Turnos: `turnoOf`, `nextTurno`, `queuedToday`, constante `QUEUE_TODAY` | `src/context/AppContext.jsx` |
| Asignación de turno en el check-in | `sendToTriage` (AppContext) + `Checkin.jsx` |
| Acciones `finalizeTriage`, `markAttended`, `resetDemo` | `AppContext.jsx` |
| Persistencia + sincronización entre pestañas | `useEffect` + evento `storage` (AppContext) |
| Tablero de gestión | `src/pages/queue/WaitingQueue.jsx` + `.css` |
| Pantalla TV | `src/pages/display/TvDisplay.jsx` + `.css` |
| Iconos de TV/altavoz | `IconMonitor`, `IconPlay`, `IconPause`, `IconMegaphone` (`Icons.jsx`) |

---

## 12. Sistema de diseño y componentes UI

### Tokens (`src/styles/tokens.css`)

- Paleta primaria **teal profundo** (`--primary-50…950`), acento ámbar/coral (`--accent-*`), neutrales cálidos (`--bg`, `--text`, `--border`), colores de estado (success/warning/danger/info) y variables por estado de cita (`--st-*`).
- Tipografía **Manrope**; escalas `--fs-xs … --fs-3xl`; radios `--r-sm…--r-full`; sombras; `--sidebar-w: 260px`, `--topbar-h: 68px`, `--max-w: 1240px`.

### Utilidades globales (`global.css`)

`.container`, `.row`, `.row-between`, `.grid`, `.grow`, `.muted`, `.small`, `.tiny`, `.bold`, márgenes `mt-*`/`mb-*`, animaciones (`anim-in`, `anim-slide`, `anim-modal`) y keyframes (`fadeIn`, `pulse`, `pulseDot`, `shimmer`…).

**Responsive móvil (≤768 px / ≤480 px):** `hidden-mobile` / `hidden-desktop`, drawer lateral + navegación inferior (primeros 5 ítems) en `PanelLayout`, columnas `.grid` apiladas a 1 columna, filas `.row` con `flex-wrap`, modales tipo *bottom-sheet*, headers apilados con botones a ancho completo, segmentado a ancho completo y tablas con scroll horizontal.

### Biblioteca de componentes (`src/components/ui/`)

| Componente | Props clave | Uso |
|---|---|---|
| `Button` | `variant` (primary/accent/secondary/text/destructive/ghost/outline), `size`, `icon`, `full` | CTA de todo el sistema |
| `Badge` | `status`, `dot`, `children` | Muestra estado de cita/rol/veredicto |
| `Card` / `CardHeader` / `StatCard` | `hover`, `onClick`, `selected`; `trend` | Tarjetas, encabezados y KPIs |
| `Field` / `Input` / `Textarea` / `Select` / `Checkbox` | `label`, `error`, `success`, `hint`, `required`, `icon`, `rightEl` | Formularios con validación visual |
| `Modal` / `ConfirmDialog` | `open`, `onClose`, `title`, `footer`, `size`, `tone`, `closeOnOverlay` | Diálogos y confirmaciones |
| `Tabs` / `Segmented` / `useTabs` | `tabs`/`options` + `value`/`onChange` | Navegación por pestañas y filtros |
| `Misc` (`Avatar`, `Switch`, `StepIndicator`, `Progress`) | — | Identidad, toggles, wizards |
| `EmptyState` | `icon`, `title`, `message`, `action`, `onAction`, `small` | Estados vacíos con CTA |
| `Toast` / `useToast` | `toast(msg, { type, title, duration })` | Notificaciones (`success/error/info/warning`) |
| `PageHeader` | `title`, `subtitle`, `action`, `back` | Encabezados de página |

`/componentes` es una galería viva con todos los badges del ciclo de vida, botones, formularios, tabs, modales y más.

Además de la biblioteca `ui/`, hay componentes propios de alto nivel: `PageHeader`, `AppointmentCard`, y **`PaymentGateway`** (pasarela de pago simulada: formulario de tarjeta con auto-formato y detección de marca, estado de procesamiento y pantalla de éxito; ver sección 10 y `docs/MODULOS.md`).

---

## 13. Arquitectura técnica

### Estado global (`src/context/AppContext.jsx`)

`AppProvider` expone vía `useApp()`:

- **Datos**: `auth`, `appointments`, `payments`, `waitlist`, `users`, `audit`, `settings`, `doctors`, `patients`, `specialties`, `consultorios`, `nurse`.
- **Acciones**: `login/logout`, `bookAppointment`, `updateAppointment`, `addPayment`, `enrollWaitlist`, `offerWaitlist`, `confirmOffer` (crea la cita + pago automáticamente), `rejectOffer`, `expireOffer`, `sendToTriage`, `startTriage`, `completeTriage`, `startAttention`, `finalizeTriage`, `markAttended`, `resetDemo`, `pushAudit`.
- **Helpers exportados**: `turnoOf`, `nextTurno`, `queuedToday`, `QUEUE_TODAY`, `QUEUE_PIPELINE`.

**Persistencia**: cada cambio en `appointments` se escribe a `localStorage` (`procitas-appointments-v1`); al cargar se rehidrata desde ahí y el evento `storage` sincroniza pestañas abiertas. *El resto de colecciones es volátil por sesión.*

### Utilidades (`src/utils/helpers.js`)

`findDoctor`, `findSpecialty`, `findPatient`, `findConsultorio`, `consultorioOf`, `fmtPrice`, `fmtDate`, `fmtDateFull`, `dayLabel`, `genWeek`, `hourSlots`, `waitMinutes`, `SpecialtyIcon`, el mapa `STATUS_LABEL` y los de pago: `fmtPayType` (`Abono 50%`/`Pago total`) y `paidTotalOf(appointmentId, payments)` (suma de pagos `pagado`).

### Hooks

- `useCountdown(targetSeconds)` → `{ remaining, mm, ss, done }` (ofertas de cupo y temporizadores).

### Patrones de UI

- **Wizards** guiados con `StepIndicator` (reservar cita, nueva cita, inscripción a lista de espera).
- **Actualización en vivo** simulada: badges/chips "En vivo", auditoría con `at: 'Hace unos segundos'`, simuladores (cancelación del paciente, oferta de cupo, expiración).
- **Registro de auditoría** en operaciones relevantes vía `pushAudit`.

---

## 14. Configuración general

En *Admin → Configuración* (`src/pages/admin/Settings.jsx`) se editan (estado `settings` del contexto):

| Regla | Valor demo | Efecto |
|---|---|---|
| Anticipación mínima de cancelación | 12 h | Activa el aviso de "cancelación tardía" |
| Anticipación mínima de reserva | 2 h | Referencial |
| Expiración de token de recuperación | 30 min | Referencial (RecoverPassword) |
| Ventana para confirmar cupo de lista de espera | 15 min | Cuenta regresiva de la oferta |
| Días no laborables | `2026-08-01/02`, `2026-07-28/29` | Referencial |

---

## 15. Limitaciones y siguientes pasos

### Limitaciones del prototipo

- **Sin backend ni base de datos**: todo es estado en memoria + `localStorage`; al limpiar el almacenamiento del navegador, las citas vuelven al mock inicial.
- **Datos y fechas fijos**: el día de operación es `2026-08-05` y la semana de reservas 05–11 de agosto (constantes en `mock.js` y `AppContext.jsx`). Varios componentes tienen fechas "duras" embebidas.
- **Sincronización entre pestañas limitada**: solo `appointments` se sincroniza vía `localStorage` (mismo navegador). No hay tiempo real entre dispositivos distintos.
- **Pasarela de pago simulada**: no se realiza ningún cobro real; los datos de tarjeta se validan solo de forma visual y el "pago" es una demora simulada con una operación ficticia `OP-2026-XXXX`.
- **Acciones simuladas**: la descarga de PDF del historial clínico del paciente y de la ficha del médico es **real** (`jspdf`); el comprobante de pago, la exportación CSV de reportes, el envío de correos/SMS y las notificaciones siguen mostrando solo un toast.
- **PDF básico**: los documentos se generan con primitivas de `jsPDF` (texto, tablas y formas); no incluyen aún logos rasterizados, códigos QR ni firma digital. La generación del PDF no persiste un registro del documento emitido.
- **Validación de roles solo visual**: las rutas no están protegidas por rol (cualquier usuario puede navegar a cualquier panel).
- **Persistencia parcial**: pagos, lista de espera, usuarios, auditoría y configuración no persisten entre recargas.

### Siguientes pasos sugeridos

1. **Backend real** (API REST/WebSocket) con autenticación, protección de rutas por rol y `authorization` por recurso — plan completo de implementación en [`docs/BACKEND.md`](docs/BACKEND.md).
2. **Tiempo real entre dispositivos** (WebSocket / Server-Sent Events) para que la TV funcione en pantallas y equipos distintos.
3. **Configurar el TV por consultorio o servicio** (filtro de especialidad/zona) y pantallas secundarias por piso.
4. **Asignación de turnos por cola/servicio** (p. ej. `T-001` para triaje y `C-001` para consulta) en lugar de una sola secuencia global.
5. **Fechas dinámicas** (hoy real) y generación de horarios desde configuración.
6. **Priorización** de la cola (pacientes vulnerables, urgencias) y métricas de tiempo de espera por médico.
7. **Integrar la pasarela de pago real** (p. ej. Izipay/Niubiz/VisaNet en Perú): validación de tarjeta, tokenización, reembolsos, conciliación y notificaciones.
8. **Auditoría persistente** y exportación real de reportes.
