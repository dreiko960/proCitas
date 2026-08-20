# SGCM-CMAS · Backend — Documento de implementación

Documento integral para el desarrollo del **backend en producción** del Sistema de Gestión de Citas Médicas (CMAS, Ayacucho). Cubre desde la creación de la base de datos hasta la integración de APIs externas, organizado en partes secuenciales. Todo lo aquí descrito proviene del análisis del prototipo (`src/data/mock.js`, `src/context/AppContext.jsx`, `src/utils/helpers.js`, `README.md`, `docs/MODULOS.md`) y de la arquitectura objetivo (C4).

> **Alcance:** solo backend. El frontend (SPA React + TV) se consume como cliente de estas APIs. Los IDs, estados y reglas de negocio **respetan los del prototipo** para no romper la integración.

---

## Parte 0 · Visión general

### 0.1 Arquitectura objetivo (resumen)

```
SPA React / TV (kiosco)
        │ HTTPS (REST) · wss (Socket.IO)
        ▼
API REST (NestJS) ──► PostgreSQL (fuente de verdad)
     │      │  │
     │      │  ├──► Redis (sesiones, cache horarios, colas BullMQ)
     │      │  └──► S3 / R2 (PDFs emitidos, documentos)
     │      └─────► Realtime Hub (Socket.IO, rooms por consultorio)
     │
     ├──► Culqi (tokenización, cobros, webhooks, reembolsos)
     ├──► RENIEC (validación de DNI)
     └──► Email / SMS (recordatorios de cita)
```

### 0.2 Principios de diseño

1. **Consistencia fuerte para reservar cupo** (requisito de `implementar.md`): toda reserva se hace en transacción con bloqueo de fila; nunca dos citas sobre el mismo `doctor + fecha + hora`.
2. **El servidor es dueño de la verdad**: estados de cita, turnos, cola y pagos solo cambian vía API; el frontend no decide estados.
3. **Tiempo real para cola y TV**: Socket.IO con *rooms* por consultorio; la TV se actualiza con eventos, no con polling.
4. **Auditoría completa y persistente**: toda acción sensible (login, pagos, triaje, acceso a historial, cancelaciones) se registra con timestamp real, IP y usuario.
5. **Datos sensibles protegidos**: cifrado en reposo (Ley 29733), JWT de corta duración, roles en el servidor (nunca confiar en el frontend).
6. **Pagos con Culqi**: tokenización en el navegador; el backend solo cobra con el token (nunca ve la tarjeta) y verifica los webhooks por firma.

### 0.3 Qué se hereda del prototipo (no rediseñar)

| Elemento | Fuente |
|---|---|
| Estados de cita (`agendada…documentada`, `cancelada`, `reprogramada`) | `helpers.js` `STATUS_LABEL` |
| Tipos de pago (`adelanto` 50% / `total` 100%) | `PAY_TYPE_LABEL` |
| Pipeline de cola (`en_espera_triaje → en_triaje → triaje_completado → en_atencion → atendida`) | `AppContext.jsx` `QUEUE_PIPELINE` |
| Turnos secuenciales `A-00X` por día | `turnoOf` / `nextTurno` |
| Reglas de negocio configurables (12 h cancelación, ventana 15 min ofertas, días no laborables) | `Settings.jsx` |
| Heurística de rol | se reemplaza por `role` real en BD |
| Pago 50% habilita check-in directo; saldo se cobra en recepción | `BookAppointment.jsx` / `Payment.jsx` |

---

## Parte 1 · Stack, herramientas y dependencias

### 1.1 Stack elegido

| Capa | Tecnología | Justificación |
|---|---|---|
| Lenguaje | **Node.js 20 LTS + TypeScript** | Mismo ecosistema del frontend (React) |
| Framework | **NestJS 10** | Modular, DI, guards, decoradores de roles, compatible con Socket.IO y BullMQ |
| ORM / migraciones | **TypeORM** | Integración nativa con NestJS, decoradores, migraciones SQL |
| Base de datos | **PostgreSQL 16** | Consistencia fuerte (transacciones, `SELECT FOR UPDATE`), ENUMs, JSONB |
| Cache / sesiones | **Redis 7** | Sesiones de refresh token, cache de horarios libres, colas |
| Colas de trabajo | **BullMQ** | Recordatorios, expiración de ofertas, conciliación |
| Tiempo real | **Socket.IO** (con adaptador Redis) | Cola + TV en vivo entre procesos |
| Pagos | **Culqi** (SDK oficial `culqi-node` + `Culqi.js` en frontend) | Pasarela peruana elegida por el cliente |
| Documentación API | **Swagger / OpenAPI** (`@nestjs/swagger`) | Contrato vivo para el frontend |
| Validación | `class-validator` + `class-transformer` (DTOs) | Validación declarativa en cada endpoint |
| Auth | `@nestjs/jwt`, `@nestjs/passport` (JWT strategy), `bcrypt` | Access + refresh rotativo |
| PDFs | `pdf-lib` / `jspdf` (servidor) → S3 | Historial clínico, comprobantes |
| Pruebas | Jest (unit) + Supertest (e2e) | Calidad mínima |
| Calidad | ESLint + Prettier (config base NestJS) | Convenciones |
| Despliegue | Docker + docker-compose; GitHub Actions (CI/CD) | Ambientes dev/test/prod |

### 1.2 Dependencias principales (`package.json` backend)

```json
{
  "dependencies": {
    "@nestjs/common": "^10", "@nestjs/core": "^10", "@nestjs/platform-express": "^10",
    "@nestjs/typeorm": "^10", "typeorm": "^0.3", "pg": "^8",
    "@nestjs/jwt": "^10", "@nestjs/passport": "^10", "passport-jwt": "^4",
    "bcrypt": "^5", "class-validator": "^0.14", "class-transformer": "^0.5",
    "@nestjs/websockets": "^10", "@nestjs/platform-socket.io": "^10", "socket.io": "^4",
    "@nestjs/bullmq": "^10", "bullmq": "^5", "ioredis": "^5",
    "culqi-node": "^2", "axios": "^1",
    "@nestjs/swagger": "^7", "@nestjs/throttler": "^5",
    "pdf-lib": "^1", "@aws-sdk/client-s3": "^3",
    "helmet": "^7", "joi": "^17"
  },
  "devDependencies": {
    "@nestjs/cli": "^10", "typescript": "^5", "jest": "^29", "supertest": "^7", "ts-jest": "^29"
  }
}
```

### 1.3 Variables de entorno (`.env.example`)

```env
# Servidor
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgcm_cmas
DB_USER=cmas
DB_PASSWORD=change-me

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (generar con: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_ACCESS_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_TTL=30d

# Culqi (NUNCA en el repo; el frontend usa pk_)
CULQI_API_KEY=sk_test_...
CULQI_API_BASE=https://api.culqi.com/v2
CULQI_WEBHOOK_SECRET=whsec_...

# RENIEC (consulta de DNI)
RENIEC_API_URL=https://api.reniec.gob.pe/...
RENIEC_API_TOKEN=...

# Email / SMS
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMS_API_KEY=...

# Storage (PDFs)
S3_ENDPOINT=https://...          # compatible S3 (R2, MinIO, AWS)
S3_BUCKET=sgcm-cmas-docs
S3_REGION=auto
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# Cifrado de datos sensibles
DATA_ENC_KEY=...                 # AES-256, 32 bytes hex
```

---

## Parte 2 · Base de datos (PostgreSQL)

### 2.1 Modelo entidad-relación

```
users ────┬── patients (1:1, rol paciente)
          ├── doctors  (1:1, rol medico)
          ├── refresh_tokens (1:N)
          └── audit_log (1:N, por user_id)

specialties ──┬── doctors (N:1)
              └── consultorio_specialties (N:M con consultorios)

consultorios ─── consultorio_specialties ─── specialties

appointments ── patients (N:1)
             ── doctors (N:1)
             ── specialties (N:1)
             ── payments (1:N)
             ── triages (1:1)
             ── diagnoses (1:1)
             ── waitlist_entries (1:1, la oferta confirmada crea la cita)

doctor_schedules ── doctors (N:1)      # plantilla semanal de horas
doctor_date_exceptions ── doctors (N:1) # días bloqueados / ausencias
waitlist_entries ── patients, doctors, specialties
settings (tabla clave-valor)
```

### 2.2 Script DDL completo

```sql
-- ============================================================
-- SGCM-CMAS · Esquema de base de datos (PostgreSQL 16)
-- Ejecutar como migración inicial (src/db/migrations/001-init.sql)
-- ============================================================

CREATE TYPE user_role AS ENUM
  ('paciente','medico','enfermera','recepcionista','administrador');

CREATE TYPE appointment_status AS ENUM
  ('agendada','pagada','check_in','en_espera_triaje','en_triaje',
   'triaje_completado','en_atencion','atendida','documentada',
   'cancelada','reprogramada');

CREATE TYPE payment_status AS ENUM
  ('pendiente_verificacion','pagado','reembolsado','fallido');

CREATE TYPE payment_method AS ENUM
  ('efectivo','yape','plin','transferencia','tarjeta_pasarela');

CREATE TYPE paid_type AS ENUM ('adelanto','total');   -- 50% / 100%

CREATE TYPE waitlist_status AS ENUM
  ('en_espera','oferta','confirmada','expirada','retirada');

CREATE TYPE audit_sev AS ENUM ('info','warning','danger');

-- ------------------------------------------------------------------
-- USERS · cuentas del sistema (5 roles del prototipo)
-- ------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- PATIENTS · perfil clínico (1:1 con users rol=paciente)
-- DNI y dirección se cifran en la capa de aplicación (AES-256-GCM)
-- ------------------------------------------------------------------
CREATE TABLE patients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dni        VARCHAR(8) NOT NULL UNIQUE,
  phone      VARCHAR(15),
  dob        DATE NOT NULL,
  address    TEXT,
  consent_29733 BOOLEAN NOT NULL DEFAULT FALSE,   -- Ley N.º 29733
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- DOCTORS · perfil profesional (1:1 con users rol=medico)
-- ------------------------------------------------------------------
CREATE TABLE doctors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  initials       VARCHAR(5) NOT NULL,
  specialty_id   UUID NOT NULL REFERENCES specialties(id),
  consultorio_id UUID REFERENCES consultorios(id),
  phone          VARCHAR(15),
  bio            TEXT,
  rating         NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count   INTEGER NOT NULL DEFAULT 0,
  studies        VARCHAR(120),
  exp            INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- SPECIALTIES · catálogo (precios del prototipo)
-- ------------------------------------------------------------------
CREATE TABLE specialties (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code     VARCHAR(30) NOT NULL UNIQUE,   -- 'medicina','pediatria',...
  name     VARCHAR(80) NOT NULL,
  icon     VARCHAR(30) NOT NULL DEFAULT 'stethoscope',
  price    NUMERIC(10,2) NOT NULL CHECK (price > 0),
  desc     TEXT,
  active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------------
-- CONSULTORIOS + especialidades asociadas (M:N)
-- ------------------------------------------------------------------
CREATE TABLE consultorios (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre  VARCHAR(80) NOT NULL,
  piso    VARCHAR(20) NOT NULL,
  area    VARCHAR(80),
  activo  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE consultorio_specialties (
  consultorio_id UUID NOT NULL REFERENCES consultorios(id) ON DELETE CASCADE,
  specialty_id   UUID NOT NULL REFERENCES specialties(id)   ON DELETE CASCADE,
  PRIMARY KEY (consultorio_id, specialty_id)
);

-- ------------------------------------------------------------------
-- DOCTOR_SCHEDULES · plantilla de disponibilidad semanal
-- (en el prototipo eran slots concretos; aquí: franjas por día de semana)
-- ------------------------------------------------------------------
CREATE TABLE doctor_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  UNIQUE (doctor_id, day_of_week, start_time, end_time)
);

-- Días bloqueados (vacaciones, ausencias puntuales)
CREATE TABLE doctor_date_exceptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  reason     VARCHAR(120),
  UNIQUE (doctor_id, date)
);

-- ------------------------------------------------------------------
-- APPOINTMENTS · citas (núcleo del sistema)
-- ------------------------------------------------------------------
CREATE TABLE appointments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(12) NOT NULL UNIQUE,   -- 'C-1042' legible
  patient_id     UUID NOT NULL REFERENCES patients(id),
  doctor_id      UUID NOT NULL REFERENCES doctors(id),
  specialty_id   UUID NOT NULL REFERENCES specialties(id),
  date           DATE NOT NULL,
  time           TIME NOT NULL,
  duration_min   SMALLINT NOT NULL DEFAULT 30,
  status         appointment_status NOT NULL DEFAULT 'agendada',
  reason         TEXT,
  check_in_time  TIME,                          -- llegada confirmada
  turno          VARCHAR(6),                    -- 'A-001' (por día)
  paid_type      paid_type,                     -- adelanto | total
  cancelled_at   TIMESTAMPTZ,
  cancel_reason  TEXT,
  rescheduled_to DATE,                          -- reprogramación
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- consistencia fuerte: un doctor no puede tener 2 citas en la misma
  -- franja el mismo día (excluye canceladas/reprogramadas)
  CONSTRAINT no_double_booking UNIQUE (doctor_id, date, time, status) DEFERRABLE INITIALLY IMMEDIATE
);

-- Índices operativos
CREATE INDEX idx_appt_patient ON appointments (patient_id, date DESC);
CREATE INDEX idx_appt_doctor_day ON appointments (doctor_id, date);
CREATE INDEX idx_appt_day_status ON appointments (date, status);
CREATE UNIQUE INDEX idx_appt_turno_day ON appointments (date, turno) WHERE turno IS NOT NULL;

-- ------------------------------------------------------------------
-- TRIAGES · triaje de enfermería (1:1 con cita)
-- ------------------------------------------------------------------
CREATE TABLE triages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  nurse_id       UUID NOT NULL REFERENCES users(id),
  pa             VARCHAR(12),
  temp           NUMERIC(4,1),
  fc             SMALLINT,
  peso           NUMERIC(5,1),
  talla          NUMERIC(4,2),
  motivo         TEXT NOT NULL,
  alergias       TEXT,
  observaciones  TEXT,
  at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- DIAGNOSES · diagnóstico médico (1:1 con cita)
-- ------------------------------------------------------------------
CREATE TABLE diagnoses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id      UUID NOT NULL REFERENCES users(id),
  dx             TEXT NOT NULL,
  notes          TEXT,
  at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- PAYMENTS · pagos (caja + Culqi). El prototipo suma pagos pagados
-- para calcular el total (paidTotalOf); se mantiene la misma lógica.
-- ------------------------------------------------------------------
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(12) NOT NULL UNIQUE,     -- 'P-0813' / 'R-2026-0813'
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  patient_id     UUID NOT NULL REFERENCES patients(id),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  method         payment_method NOT NULL,
  status         payment_status NOT NULL DEFAULT 'pendiente_verificacion',
  paid_type      paid_type NOT NULL,
  receipt_code   VARCHAR(16),                      -- comprobante 'R-2026-XXXX'
  verified_by    UUID REFERENCES users(id),        -- recepcionista / NULL=Sistema
  gateway        BOOLEAN NOT NULL DEFAULT FALSE,   -- pagado por Culqi
  culqi_order_id VARCHAR(60),                      -- order_xxx
  culqi_charge_id VARCHAR(60),                     -- charge_xxx
  culqi_data     JSONB,                            -- payload del webhook
  refunded_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, culqi_order_id)          -- idempotencia de webhooks
);

CREATE INDEX idx_pay_appt ON payments (appointment_id);
CREATE INDEX idx_pay_status ON payments (status);

-- ------------------------------------------------------------------
-- WAITLIST_ENTRIES · lista de espera de cupos (módulo del paciente)
-- ------------------------------------------------------------------
CREATE TABLE waitlist_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(10) NOT NULL UNIQUE,     -- 'WL-008'
  patient_id      UUID NOT NULL REFERENCES patients(id),
  specialty_id    UUID NOT NULL REFERENCES specialties(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  preferred       VARCHAR(160),
  position        INTEGER NOT NULL,
  status          waitlist_status NOT NULL DEFAULT 'en_espera',
  offer_date      DATE,                            -- cupo ofrecido
  offer_time      TIME,
  offer_expires_at TIMESTAMPTZ,                    -- ventana (15 min)
  confirm_window_min INTEGER NOT NULL DEFAULT 15,  -- settings.waitlistWindowMin
  created_appointment_id UUID REFERENCES appointments(id),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wl_patient ON waitlist_entries (patient_id);
CREATE INDEX idx_wl_spec_status ON waitlist_entries (specialty_id, status);
CREATE INDEX idx_wl_offer_expiry ON waitlist_entries (status, offer_expires_at)
  WHERE status = 'oferta';

-- ------------------------------------------------------------------
-- SETTINGS · reglas de negocio (Admin → Configuración)
-- ------------------------------------------------------------------
CREATE TABLE settings (
  key        VARCHAR(60) PRIMARY KEY,
  value      JSONB NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('minCancelHours',     '{"v": 12}'),
  ('minReserveHours',    '{"v": 2}'),
  ('tokenExpiryMin',     '{"v": 30}'),
  ('waitlistWindowMin',  '{"v": 15}'),
  ('lateFeeDays',        '{"v": 2}'),
  ('nonWorkingDays',     '{"v": ["2026-08-01","2026-08-02","2026-07-28","2026-07-29"]}');

-- ------------------------------------------------------------------
-- AUDIT_LOG · auditoría persistente (reemplaza el mock 'Hace unos segundos')
-- ------------------------------------------------------------------
CREATE TABLE audit_log (
  id         BIGSERIAL PRIMARY KEY,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id    UUID REFERENCES users(id),
  email      VARCHAR(160),
  action     VARCHAR(80) NOT NULL,
  detail     TEXT,
  sev        audit_sev NOT NULL DEFAULT 'info',
  ip         INET,
  user_agent TEXT,
  route      VARCHAR(120),
  method     VARCHAR(10)
);

CREATE INDEX idx_audit_at ON audit_log (at DESC);
CREATE INDEX idx_audit_user ON audit_log (user_id, at DESC);

-- ------------------------------------------------------------------
-- REFRESH_TOKENS · sesiones rotativas
-- ------------------------------------------------------------------
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,        -- SHA-256 del token
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip         INET,
  user_agent TEXT
);

CREATE INDEX idx_rt_user ON refresh_tokens (user_id);
```

### 2.3 Consistencia de la reserva (anti doble reserva)

La reserva se ejecuta **siempre** en transacción. Dos opciones complementarias:

**Opción A — bloqueo de fila (recomendada):** secuencia de 30 min por médico/día materializada en `doctor_schedules` + validación con `SELECT ... FOR UPDATE` sobre la fila de la franja.

**Opción B — constraint + reintento:** `no_double_booking` (UNIQUE sobre `doctor_id, date, time, status`) convierte la carrera en error `23505`; el servicio reintenta y devuelve **409 + alternativas sugeridas** (mismo comportamiento del prototipo: modal "Este horario ya no está disponible" con 3 alternativas).

```sql
-- Pseudocódigo de la reserva (servicio AppointmentsService.reserve)
BEGIN;
  -- 1. Bloquear el registro de franja para impedir otra reserva concurrente
  SELECT id FROM doctor_schedules
   WHERE doctor_id = $1 AND day_of_week = EXTRACT(DOW FROM $2::date)
     AND start_time = $3::time
   FOR UPDATE;

  -- 2. Verificar que no exista cita activa (no cancelada/reprogramada)
  SELECT id FROM appointments
   WHERE doctor_id = $1 AND date = $2 AND time = $3
     AND status NOT IN ('cancelada','reprogramada')
   LIMIT 1;

  -- 3. Si existe → ROLLBACK + 409 con 3 alternativas libres cercanas
  -- 4. Si no existe → INSERT appointment (status 'agendada')
COMMIT;
```

### 2.4 Turnos `A-00X`

Secuencia **por día** (el turno es el orden de llegada, `AppContext.turnoOf/nextTurno`). Se asigna en el check-in:

```sql
-- Transacción del check-in: asignar siguiente turno del día
INSERT INTO appointments_checkin_log ... -- opcional
UPDATE appointments SET status='en_espera_triaje', check_in_time=now(), turno=(
  SELECT 'A-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(turno,3) AS INT)), 0) + 1)::text, 3, '0')
  FROM appointments WHERE date = $1 AND turno IS NOT NULL
) WHERE id = $2;
```

> La TV y la cola solo leen `appointments` con `date = hoy` y `status IN ('en_espera_triaje','en_triaje','triaje_completado','en_atencion')` ordenadas por `turno` (misma lógica que `queuedToday`).

### 2.5 Seed inicial

`src/db/seed.ts` replica `src/data/mock.js` del prototipo: 9 usuarios, 5 pacientes, 8 médicos, 7 especialidades, 5 consultorios, citas de ejemplo (incluidas las del día `2026-08-05` con turnos `A-001…A-003`), pagos, lista de espera y auditoría de muestra. Usado solo en dev/test.

---

## Parte 3 · Estructura del proyecto (NestJS)

```
backend/
├── .env / .env.example
├── docker-compose.yml               # postgres + redis + api + worker
├── Dockerfile
├── src/
│   ├── main.ts                      # bootstrap: Helmet, CORS, Swagger, ValidationPipe
│   ├── app.module.ts                # importa todos los módulos
│   ├── config/
│   │   ├── env.validation.ts        # Joi: valida variables de entorno al arrancar
│   │   └── data-encryption.service.ts  # AES-256-GCM (DNI, dirección)
│   ├── common/
│   │   ├── decorators/roles.decorator.ts
│   │   ├── guards/roles.guard.ts · jwt-auth.guard.ts
│   │   ├── interceptors/audit.interceptor.ts   # auditoría automática
│   │   ├── interceptors/logging.interceptor.ts
│   │   ├── filters/http-exception.filter.ts    # formato de error unificado
│   │   └── dto/pagination.dto.ts
│   ├── db/
│   │   ├── migrations/              # TypeORM migraciones (001-init…)
│   │   └── seed.ts
│   ├── modules/
│   │   ├── auth/                    # login, refresh, logout, registro, recuperar
│   │   ├── users/                   # cuentas, roles, activar/desactivar
│   │   ├── patients/                # perfiles, historial, relación clínica
│   │   ├── doctors/                 # perfiles, disponibilidad, agendas
│   │   ├── specialties/             # catálogo y precios
│   │   ├── consultorios/            # pisos, áreas, especialidades
│   │   ├── availability/            # búsqueda pública de horarios libres
│   │   ├── appointments/            # reserva (transacción), check-in, cancelar, reprogramar
│   │   ├── payments/                # caja + Culqi (cobro, webhooks, reembolsos)
│   │   ├── triage/                  # cola y formulario de triaje
│   │   ├── queue/                   # cola del día, turnos, transiciones
│   │   ├── waitlist/                # lista de espera y ofertas de cupo
│   │   ├── reports/                 # indicadores, ocupación, exportación
│   │   ├── audit/                   # consulta de auditoría
│   │   ├── settings/                # reglas de negocio
│   │   ├── notifications/           # email/SMS + cola BullMQ
│   │   ├── documents/               # PDFs (historial, ficha, comprobantes) → S3
│   │   ├── realtime/                # gateway Socket.IO + rooms por consultorio
│   │   └── renice/                  # integración RENIEC (consulta DNI)
│   └── (cada módulo: controller · service · entity · dto · module)
├── test/
│   ├── e2e/                         # Supertest: flujos críticos
│   └── unit/                        # servicios y reglas de negocio
└── package.json
```

Convenciones por módulo (patrón NestJS estándar):

| Archivo | Responsabilidad |
|---|---|
| `*.module.ts` | Declara controlador, servicio, entidades y re-exporta TypeOrmModule |
| `*.controller.ts` | Endpoints REST + `@Roles` + DTOs |
| `*.service.ts` | Lógica de negocio, transacciones, eventos |
| `*.entity.ts` | Entidad TypeORM |
| `*.dto.ts` | `class-validator` (Create/Update/Query) |
| `*.gateway.ts` | Solo en `realtime` |

---

## Parte 4 · Autenticación y autorización

### 4.1 Flujo de login

1. `POST /auth/login` con `{ email, password }`.
2. Se busca en `users`; si `active = false` → 403. Se compara `bcrypt.compare`.
3. Se emiten **access token** (JWT, 15 min, `sub=user.id`, `role`, `patientId`/`doctorId` si aplica) y **refresh token** (30 días, guardado *hasheado* en `refresh_tokens`, rotativo).
4. Se actualiza `last_login_at` y se registra auditoría (rol **real desde BD**; la heurística del prototipo desaparece).
5. Rate limiting: 5 intentos/min por email+IP → bloqueo temporal (prototipo: "Intento de login fallido").

### 4.2 Recuperación de contraseña

- `POST /auth/forgot-password` → genera token de un solo uso con expiración `settings.tokenExpiryMin` (30 min) → email con enlace `FRONTEND_URL/recuperar/nueva-password?token=…`.
- `POST /auth/reset-password` valida token, política de clave (≥6, mayúscula, número) y rota refresh tokens del usuario.

### 4.3 Registro público (solo pacientes)

- Valida correo/DNI/celular **únicos** (regla de `Register.jsx`), verifica DNI contra **RENIEC** (si la integración está activa), exige consentimiento Ley 29733 (`consent_29733 = true`).
- El resto de roles los crea el admin (`POST /users` con `role`).

### 4.4 Autorización por rol y por recurso

- `JwtAuthGuard` global + `RolesGuard` con `@Roles('medico')` etc. (rutas del frontend hoy no protegidas → esto lo corrige en el servidor).
- **Relación clínica** (regla del prototipo, `PatientDetail.jsx`): un médico solo ve el historial de un paciente con el que tiene citas (`SELECT EXISTS appointments WHERE doctor_id = $me AND patient_id = $pid AND status IN ('documentada','atendida','en_atencion',...)`). Si no → 403 + registro en auditoría (`Acceso denegado`, sev `danger`).
- **TV**: token de solo lectura por consultorio (`POST /tv/token` con clave de pantalla configurada por admin) — nunca usa sesión de empleado.
- `@Roles` también en: `triage` (enfermera), `queue` (recepción/enfermera), `payments/verify` (recepción), `reports/audit/settings` (administrador).

---

## Parte 5 · Contrato de API (endpoints por módulo)

> Formato de respuesta unificado: `{ data: … }` en éxito; `{ statusCode, message[], error }` en error. Paginación `?page=&limit=`. Swagger en `GET /docs`.

### 5.1 Auth
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | Inicio de sesión |
| POST | `/auth/refresh` | público | Renovar access con refresh rotativo |
| POST | `/auth/logout` | autenticado | Revoca refresh token |
| POST | `/auth/register` | público | Registro de paciente (Ley 29733) |
| POST | `/auth/forgot-password` | público | Solicitar enlace |
| POST | `/auth/reset-password` | público | Nueva contraseña |

### 5.2 Usuarios (admin)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Lista con filtro por rol/activo (tabla de `Users.jsx`) |
| POST | `/users` | Alta con correo único (admin crea cualquier rol) |
| PATCH | `/users/:id` | Editar nombre/rol |
| PATCH | `/users/:id/activate` | Activar/desactivar (`{active}`) |

### 5.3 Catálogos
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/specialties` | público | Especialidades activas con precio |
| POST/PATCH | `/specialties` | admin | Precios, activación (advertencia si hay médicos) |
| GET | `/consultorios` | público | Pisos/áreas |
| POST/PATCH | `/consultorios` | admin | Asignación de especialidades (M:N) |
| GET | `/doctors` | público | Profesionales + rating + consultorio |
| GET | `/doctors/:id` | público | Detalle (bio, estudios, exp) |
| GET | `/doctors/:id/slots?from=&to=` | autenticado | Franjas libres (cache Redis 30 s) |
| POST | `/doctors/:id/schedules` | medico/admin | Plantilla semanal |
| POST | `/doctors/:id/exceptions` | medico/admin | Día bloqueado |

### 5.4 Disponibilidad pública
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/availability?specialtyId=&from=&to=` | Replica `SearchAvailability.jsx`: cruza schedules con citas activas; filtra días no laborables; `specialtyId=cardiologia` puede devolver lista vacía (caso demo) |

### 5.5 Citas (núcleo)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/appointments` | paciente/recepción | **Reserva con transacción**; body `{doctorId, specialtyId, date, time, duration, reason, payOnline?: {type: 'adelanto'|'total', culqiToken?}}` → 201 con cita; 409 con `alternatives[]` si hay conflicto |
| GET | `/appointments/me` | paciente | Próximas/pasadas/canceladas (`MyAppointments.jsx`) |
| GET | `/appointments/day?date=` | recepción/medico/enfermera | Agenda del día (filtros por especialidad/médico) |
| GET | `/appointments/:id` | autenticado (autorizado) | Detalle con triage, pago y diagnóstico |
| POST | `/appointments/:id/checkin` | paciente | Check-in móvil → `check_in` (solo `agendada`/`pagada`) |
| PATCH | `/appointments/:id/cancel` | paciente/recepción | Cancela (regla 12 h → warning `cancelacion tardia`); libera franja; reembolso si pagó por Culqi |
| PATCH | `/appointments/:id/reschedule` | paciente/recepción | `{date, time}` → `reprogramada` (valida franja libre) |
| GET | `/appointments/patient/:pid` | medico | Historial del paciente (regla de relación clínica) |

### 5.6 Pagos (caja + Culqi)
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/payments/charge` | paciente | Cobro por Culqi: recibe `{appointmentId, type: 'adelanto'|'total', culqiToken}` → crea `order` en Culqi → `charge` → payment `pagado` (gateway=true, op_ref) |
| POST | `/payments/cash` | recepción | Cobro en caja (efectivo/Yape/Plin/transferencia) → comprobante `R-2026-XXXX` |
| POST | `/payments/verify` | recepción | Confirma `pendiente_verificacion` (declarados por el paciente) |
| POST | `/payments/complete-balance` | recepción | Cobra el saldo de abonos 50% (deja la cita al 100%) |
| POST | `/payments/:id/refund` | admin | Reembolso Culqi (`charge_id`) |
| POST | `/webhooks/culqi` | público* | *Firma HMAC v2 verificada; actualiza `payments` por `culqi_order_id` (idempotente) |
| GET | `/payments/receipts/:id` | paciente | Comprobante (PDF en S3) |

### 5.7 Triaje (enfermería)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/triage/queue` | Cola: `en_espera_triaje` ordenados por tiempo de espera + en progreso (`TriageQueue.jsx`) |
| GET | `/triage/history?date=` | Triajes del turno |
| POST | `/triage/:appointmentId` | Inicia triaje → `en_triaje` (solo desde `en_espera_triaje`) |
| PATCH | `/triage/:appointmentId/complete` | Guarda signos vitales → `triaje_completado` (inserta en `triages`) |

### 5.8 Cola del día (recepción/enfermería) + TV
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/queue/day?date=` | Citas en pipeline ordenadas por `turno` + stats en vivo (esperando/en triaje/en consulta/atendidos) |
| POST | `/queue/:id/send-triage` | Check-in presencial: asigna `turno` → `en_espera_triaje` (solo `pagada`/`check_in`) |
| POST | `/queue/:id/call-triage` | → `en_triaje` (llamado a triaje) |
| POST | `/queue/:id/finish-triage` | → `triaje_completado` (variante desde el tablero) |
| POST | `/queue/:id/call-consult` | → `en_atencion` (llamado a consulta) |
| POST | `/queue/:id/attended` | → `atendida` (sale de la cola) |
| GET | `/queue/stats-today` | Contadores para el header de la TV |
| POST | `/tv/token` | Emite token de solo lectura para la pantalla (clave de consultorio) |

> Cada transición emite evento Socket.IO `queue.updated` al room del consultorio (Parte 8).

### 5.9 Lista de espera (paciente)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/waitlist` | Inscripción `{specialtyId, doctorId, preferred}` → posición `N` |
| GET | `/waitlist/me` | Mis inscripciones (estados y ofertas) |
| POST | `/waitlist/:id/confirm` | Confirma oferta → **crea la cita automáticamente** + payment `pendiente_verificacion` (lógica de `confirmOffer`) |
| POST | `/waitlist/:id/reject` | Rechaza → vuelve a `en_espera`, cupo pasa al siguiente |
| POST | `/waitlist/:id/offer` | (worker) Asigna cupo: `{date, time}` + `offer_expires_at = now + settings.waitlistWindowMin` |
| POST | `/waitlist/:id/expire` | (worker) → `expirada`, oferta al siguiente |

### 5.10 Reportes / Auditoría / Configuración
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/reports/summary?month=` | admin | Citas, tasa de cancelación, inasistencia, ingresos (`Dashboard.jsx`) |
| GET | `/reports/occupancy?from=&to=` | admin | Ocupación por especialidad + tendencia semanal |
| GET | `/reports/export?type=csv` | admin | Exportación (reemplaza el toast simulado) |
| GET | `/audit?sev=&from=&to=` | admin | Registro paginado con `at` real |
| GET/PATCH | `/settings` | admin | Reglas de negocio (tabla `settings`) |
| GET | `/notifications/me` | autenticado | Recordatorios/avisos (lista en el topbar) |
| POST | `/documents/:appointmentId/pdf` | paciente/medico | Genera y sube PDF (historial/ficha) a S3, devuelve URL firmada |

---

## Parte 6 · Reglas de negocio críticas

### 6.1 Estados y transiciones válidas

```
agendada ──(pago caja)────────────► pagada
agendada ──(Culqi 50%/100%)──────► pagada (paid_type adelanto|total)
pagada ──(check-in recepción/móvil)► check_in / en_espera_triaje (turno A-00X)
en_espera_triaje ──(llamar)──────► en_triaje ──(completar)──► triaje_completado
triaje_completado ──(llamar)─────► en_atencion ──(atender)──► atendida | documentada
agendada|pagada ──(cancelar)─────► cancelada      (≤12 h → aviso cancelación tardía)
cualquiera ──(reprogramar)───────► reprogramada
```

Cada transición se valida en el servicio (nunca aceptar saltos inválidos). Tabla de auditoría de cambios de estado opcional: `appointment_status_history`.

### 6.2 Pago 50% / 100%

- **Adelanto (50%)**: monto `round(price/2)` vía Culqi → cita `pagada` con `paid_type='adelanto'` → habilita check-in directo; el saldo se cobra en recepción (`/payments/complete-balance`), mantiene `paidType` y suma el monto (misma semántica de `paidTotalOf`).
- **Total (100%)**: pago completo → `paid_type='total'`.
- **Caja**: cita queda `agendada` hasta el cobro en recepción.
- Métodos del paciente (Yape/Plin/Transferencia declarados en `PatientPayments.jsx`) → `pendiente_verificacion` hasta confirmación de recepción (<15 min).

### 6.3 Cancelación tardía

`(hora de cita - hora de cancelación) < settings.minCancelHours (12 h)` → el sistema **advierte** (toast/modal) y registra en auditoría `Cita cancelada` sev `warning`. Si hubo pago Culqi → reembolso automático (job BullMQ) o manual según política.

### 6.4 Lista de espera

- Posición = orden cronológico de inscripción dentro de `(specialty, doctor)`.
- Al liberarse un cupo, el worker ofrece al primero en `en_espera` (`offer_expires_at` = +`settings.waitlistWindowMin` = 15 min).
- `confirm` crea la cita (misma transacción de reserva) y un pago `pendiente_verificacion` (replica `confirmOffer`).
- `expire` → pasa el cupo al siguiente (el prototipo lo hace manualmente con `useCountdown`).

---

## Parte 7 · Pagos con Culqi (detalle de integración)

### 7.1 Flujo de cobro en línea

```
1. Frontend: Culqi.js genera TOKEN de tarjeta (nunca pasa por nuestro servidor)
2. POST /payments/charge  { appointmentId, type, culqiToken }
3. Backend: crea ORDER en Culqi (POST /v2/orders, monto según type) con SK
   → order_id (op_ref 'OP-2026-XXXX' del prototipo = order_id)
4. Backend: cobra el charge (POST /v2/charges con order_id + token)
5. Respuesta: payment 'pagado' (gateway=true, culqi_order_id, culqi_charge_id),
   cita → 'pagada' + paid_type
6. Culqi además notifica webhook order.paid → verificar firma → idempotencia
   (UNIQUE appointment_id+culqi_order_id)
```

### 7.2 Webhooks (endpoint público con firma)

- Header `Authorization: Bearer <CULQI_WEBHOOK_SECRET>` (firma v2) — rechazar sin verificar.
- Eventos a manejar: `order.paid`, `order.expired`, `charge.created`, `charge.failed`.
- `order.expired` → marca la cita `agendada` (no pagada) y libera para pago en caja.
- `charge.failed` → auditoría sev `danger` + notificación al paciente.
- **Idempotencia**: upsert por `culqi_order_id`.

### 7.3 Reembolsos y conciliación

- `POST /v2/refunds` con `charge_id` (reembolso parcial = solo en producción según contrato Culqi).
- Job diario BullMQ: `GET /v2/orders?created_at[gte]=…` → cruza con `payments` para detectar cargos sin webhook (conciliación).
- Las keys `sk_test_*` / `sk_live_*` viven en `.env`; el frontend solo ve `pk_*` en su configuración.

### 7.4 Tarjetas y métodos

- Tarjetas Visa/Mastercard/Amex (auto-detección de marca ya existe en `PaymentGateway.jsx`).
- **Yape**: Culqi permite cobros Yape vía QR o API (validar contrato del plan); los pagos Yape declarados por el paciente siguen el flujo `pendiente_verificacion` → recepción.

---

## Parte 8 · Tiempo real (Socket.IO)

### 8.1 Diseño

| Pieza | Decisión |
|---|---|
| Namespaces | `/queue` (tablero y TV) |
| Rooms | `consultorio:{id}` y `global` (todas las pantallas) |
| Eventos salientes | `queue.updated` (payload = `GET /queue/day`), `turn.called` `{turno, name, consultorio, destination}`, `tv.refresh` (fuerza recarga de la TV), `notification.new` |
| Eventos entrantes | `subscribe` `{room}`, `unsubscribe` (la TV se suscribe a su consultorio) |
| Adaptador | `@socket.io/redis-adapter` (multi-instancia) |
| Reintentos | Backoff exponencial en el cliente (prototipo ya sincroniza vía `storage`; aquí el servidor es la fuente) |

### 8.2 Quién emite qué

| Acción (API) | Evento |
|---|---|
| `send-triage`, `call-triage`, `finish-triage`, `call-consult`, `attended` | `queue.updated` + `turn.called` |
| Pago verificado / cita creada | `notification.new` al usuario |
| `tv/refresh` manual (admin) | `tv.refresh` |

### 8.3 Pantalla TV

- Autenticación: `POST /tv/token` con clave de consultorio → JWT `aud: 'tv'` (sin privilegios de panel).
- El payload de la TV replica `TvDisplay.jsx`: `now` (en triage / en consulta), `next` (hasta 5), `rest` (atenuado), `attendedToday`, reloj (cliente).
- Si la TV se desconecta, al reconectar hace `GET /queue/day` + suscripción (estado eventualmente consistente).

---

## Parte 9 · Tareas programadas (BullMQ + Redis)

| Trabajo | Schedule | Lógica |
|---|---|---|
| `appointment-reminder` | 24 h y 2 h antes de cada cita | Busca citas `agendada/pagada/check_in` → email + SMS |
| `waitlist-offer-expiry` | cada minuto | `UPDATE waitlist_entries SET status='expirada' WHERE status='oferta' AND offer_expires_at < now()`; ofrece al siguiente |
| `payment-reconciliation` | diario 23:30 | Cruza órdenes Culqi con `payments` (Parte 7.3) |
| `late-cancellation-refund` | cada 5 min | Citas `cancelada` con pago Culqi y sin `refunded_at` → reembolso |
| `token-cleanup` | diario | Elimina `refresh_tokens` expirados/revocados |
| `report-export` | bajo demanda | Genera CSV/PDF de reportes → S3 + URL firmada |

> `confirmWindowMin` (15 min) de `settings` alimenta `waitlist-offer-expiry` y el countdown del frontend (`useCountdown`).

---

## Parte 10 · Integraciones externas

### 10.1 RENIEC (validación de DNI)

- Consulta por DNI en registro y en check-in (opcional): `GET /reniec/dni/:dni` (proxy con cache Redis 30 días y tasa limitada).
- Proveedores peruanos habituales: API oficial RENIEC (servicios web para empresas) o agregadores con token. Contrato a definir; el código debe aislarse detrás de la interfaz `DniProvider` para poder cambiar de proveedor sin tocar el dominio.

### 10.2 Email / SMS

- Email: SMTP (Mailgun/SendGrid/Postmark). Plantillas: confirmación de cita, recordatorio 24 h/2 h, cupo de lista de espera, comprobante, recuperación de contraseña.
- SMS: proveedor peruano (p. ej. Twilio o agregador local). El prototipo solo muestra toasts → aquí se implementa el envío real encolado.

### 10.3 Storage de documentos (S3 / R2 / MinIO)

- PDFs generados por `documents` module con `pdf-lib` (historial clínico con membrete — replicar `clinicPdf.js`/`clinic.js` —, ficha del médico, comprobantes `R-2026-XXXX`).
- Buckets privados + **URLs firmadas** de descarga (7 días). Metadatos: `appointment_id`, `type`, `emitted_at`, `emitted_by`.
- No se guardan datos de tarjeta en ningún documento.

---

## Parte 11 · Seguridad

| Control | Implementación |
|---|---|
| Contraseñas | `bcrypt` (cost 12); política del prototipo (≥6, mayúscula, número) |
| Tokens | Access JWT 15 min + refresh rotativo hasheado en BD; revocación en logout |
| Datos sensibles | AES-256-GCM en reposo para `patients.dni`, `patients.address` y datos clínicos si el plan lo requiere (clave `DATA_ENC_KEY`) |
| Ley 29733 | Consentimiento en registro (`consent_29733`, `consent_at`), aviso de privacidad, derecho de acceso/rectificación (endpoints de datos personales), auditoría de accesos al historial |
| Autorización | Guards por rol + relación clínica (Parte 4.4); CORS restringido a `FRONTEND_URL` |
| Rate limiting | `@nestjs/throttler`: login 5/min, registro 3/h, webhooks 100/min por IP |
| Headers | Helmet (CSP, HSTS, frame-ancestors para la TV) |
| Validación | DTOs `class-validator` en todos los body/query/params; `ValidationPipe whitelist` |
| Errores | Filtro global: nunca exponer stack ni detalles de BD |
| Logs | Interceptor con request-id, tiempos; niveles dev/prod |
| Webhooks | Firma Culqi v2 verificada antes de procesar |
| Pruebas de seguridad | OWASP top-10 básico: inyección (ORM), XSS (escapado en frontend), CSRF (JWT en header, no cookies) |

---

## Parte 12 · Despliegue y ambientes

### 12.1 docker-compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment: { POSTGRES_DB: sgcm_cmas, POSTGRES_USER: cmas, POSTGRES_PASSWORD: ... }
    volumes: [ pgdata:/var/lib/postgresql/data ]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U cmas"], interval: 5s }
  redis:
    image: redis:7-alpine
  api:
    build: .
    command: npm run start:prod
    ports: [ "3000:3000" ]
    depends_on: [ postgres, redis ]
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - NODE_ENV=production
  worker:
    build: .
    command: npm run start:worker        # proceso BullMQ separado
    depends_on: [ postgres, redis ]
volumes: { pgdata: {} }
```

### 12.2 Pipeline CI/CD (GitHub Actions)

1. **CI** (push/PR): `npm ci` → `npm run lint` → `npm run test` (unit) → `npm run test:e2e` (PostgreSQL + Redis de test) → `npm run build`.
2. **Migrations**: `npm run migration:run` (job con acceso a la BD de prod, con lock y backup previo).
3. **CD**: build de imagen → push al registry → deploy (Render/Fly.io/VPS con watchtower).

### 12.3 Ambientes y datos

| Ambiente | Uso | BD | Seed |
|---|---|---|---|
| dev | desarrollo local | docker-compose | sí (mock.js) |
| test | CI/e2e | efímera | parcial |
| staging | validación de integraciones (Culqi test, RENIEC test) | clon anonimizado | sí |
| prod | producción | real | no |

**Backups**: `pg_dump` diario + WAL (PITR) con retención 30 días; restauración probada cada mes; backups cifrados.

---

## Parte 13 · Orden de implementación (roadmap en fases)

| Fase | Contenido | Depende de |
|---|---|---|
| **0 · Scaffold** | NestJS + TypeORM + Swagger + Docker + CI básico + `.env` + errores unificados | — |
| **1 · Datos** | Migración `001-init`, seed del mock, `settings` | 0 |
| **2 · Auth** | usuarios, login JWT+refresh, roles guard, registro paciente, recuperar clave, rate limiting | 1 |
| **3 · Catálogos** | specialties, consultorios, doctors, schedules, exceptions | 2 |
| **4 · Disponibilidad** | `/availability` (cache Redis) + reserva con transacción (409 + alternativas) | 3 |
| **5 · Citas** | CRUD citas, check-in, cancelar (12 h), reprogramar, turnos A-00X | 4 |
| **6 · Triaje** | cola de enfermería, formulario, historial | 5 |
| **7 · Cola + TV** | `/queue/*`, transiciones, Socket.IO, token TV, tablero | 5 |
| **8 · Pagos** | caja, Culqi charge, webhooks, verificación, saldo 50%, reembolsos | 5 |
| **9 · Lista de espera** | inscripción, ofertas, confirm/expire + worker BullMQ | 5, 8 |
| **10 · Historial + PDF** | relación clínica, historial, `documents` → S3 | 6 |
| **11 · Notificaciones** | emails/SMS (recordatorios), plantillas | 9 |
| **12 · Admin** | usuarios CRUD, reportes, auditoría, settings, exportación | todo |
| **13 · Hardening** | cifrado en reposo, RENIEC, monitoreo, backups, e2e completos | todo |

> Cada fase termina con: endpoints + Swagger actualizados, tests del flujo crítico y documentación reflejada en `README.md` / `docs/MODULOS.md` (regla de `AGENTS.md`).

---

## Parte 14 · Lo que falta en la estructura propuesta (gaps detectados)

La arquitectura C4 que brindé era de **nivel 1-2** (contexto y contenedores). Para iniciar el backend faltan estos elementos, que este documento ya incorpora:

1. **Migraciones y versionado de esquema** (TypeORM migrations) — la estructura solo mencionaba PostgreSQL como "fuente de verdad".
2. **Contrato de API completo** (Parte 5): la estructura no listaba endpoints, ni DTOs, ni el formato de error/paginación, ni Swagger/OpenAPI.
3. **Manejo real de la disponibilidad**: el prototipo tiene `slots` fijos por médico; falta el diseño de plantillas semanales (`doctor_schedules`) + días bloqueados, que aquí se resuelve.
4. **Turnos por día (A-00X) en BD** — la estructura no decía cómo se generan; resuelto en Parte 2.4 con índice único `(date, turno)`.
5. **Pipeline CI/CD, backups y plan de recuperación** (Parte 12) — ausentes en el diagrama.
6. **Monitoreo, logs centralizados y alertas** — la estructura solo mencionaba "logs" de pasada; falta definir request-id, métricas y umbrales de alerta (p. ej. tasa de webhooks fallidos).
7. **Pruebas automatizadas** (unit + e2e) — no estaba en el diagrama.
8. **Conciliación de pagos y manejo de fallos** (reintentos, `order.expired`) — la estructura solo decía "webhooks".
9. **Almacenamiento y emisión de PDFs en detalle** — la estructura decía "S3/Cloud Storage" pero no definía URLs firmadas, metadatos ni el módulo `documents`.
10. **Autorización por recurso** (relación clínica médico-paciente) — el diagrama mencionaba roles, pero no la regla de acceso por recurso que el prototipo ya exige.
11. **TV multi-consultorio** — la estructura asumía una pantalla global; hay que definir token de solo lectura y rooms por consultorio.
12. **Métricas de tiempo de espera por médico** (siguiente paso del README) — no definida en la estructura; los datos (check_in_time, timestamps de transición) quedan listos para calcularte en la Parte 2.
13. **Migración de datos del prototipo** → tabla de mapeo `mock.js` → entidades (Parte 0.3); no estaba contemplada.

---

## Parte 15 · Tabla de mapeo prototipo → backend (referencia rápida)

| Prototipo (`src/…`) | Backend |
|---|---|
| `data/mock.js` `SPECIALTIES` | tabla `specialties` |
| `CONSULTORIOS` (especialidades[]) | `consultorios` + `consultorio_specialties` |
| `DOCTORS` (`slots[]`) | `doctors` + `doctor_schedules` + `doctor_date_exceptions` |
| `PATIENTS` / `ME` | `patients` (+ `users` para la cuenta) |
| `USERS` | `users` (rol real, no heurística) |
| `INITIAL_APPOINTMENTS` (`diag`, `triage` embebidos) | `appointments` + `diagnoses` + `triages` |
| `INITIAL_PAYMENTS` (`gateway`, `opRef`) | `payments` (`culqi_order_id`, `culqi_charge_id`, `culqi_data`) |
| `INITIAL_WAITLIST` (`offer` embebido) | `waitlist_entries` (columnas de oferta) |
| `AUDIT_LOG` ("Hace unos segundos") | `audit_log` (timestamps reales, IP, route) |
| `settings` (AppContext) | tabla `settings` (clave-valor JSONB) |
| `AppContext` acciones | services de cada módulo (Parte 3) |
| `queuedToday`, `turnoOf`, `nextTurno` | servicios de `queue` + Parte 2.4 |
| `PaymentGateway` (simulado) | `payments/charge` con Culqi (Parte 7) |
| `clinicPdf.js` (membrete) | `documents` module con `pdf-lib` (Parte 10.3) |
| `useCountdown` (15 min) | `settings.waitlistWindowMin` + worker de expiración |
| TV por `storage` event | Socket.IO rooms por consultorio (Parte 8) |