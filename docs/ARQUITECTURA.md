# Arquitectura del Sistema — SGCM-CMAS (Versión de Producción)

Documento que define la arquitectura del sistema real **SGCM-CMAS** que reemplazará al prototipo. Se mantiene el modelo funcional y modular ya documentado ([`MODULOS.md`](MODULOS.md), [`CASOS_DE_USO.md`](CASOS_DE_USO.md), [`MER.md`](MER.md)) y se especifica el stack de producción.

> **Stack objetivo**
>
> | Capa | Tecnología |
> |---|---|
> | Frontend | **React 18+ / Vite** (SPA, modular por feature) |
> | Backend | **Laravel 11/12** (API REST, "modular monolith") |
> | Base de datos | **PostgreSQL** |
> | Tiempo real | Laravel **Reverb** (WebSocket) + Laravel Echo (cola y TV) |
> | Autenticación | Laravel **Sanctum** (SPA) + middleware de roles/policies |
> | Tareas asíncronas | Colas Laravel (expiración de cupos, verificación de pagos, recordatorios) |
> | Pasarela de pago | Integración real **Izipay/Niubiz** (sustituye la pasarela simulada) |

**Decisión de arquitectura:** **monolito modular** (*modular monolith*) — no microservicios. Los módulos de negocio están delimitados en el código (misma base de datos, mismo despliegue) y pueden extraerse a microservicios en el futuro si algún módulo crece (p. ej. pagos), sin rediseñar el frontend.

---

## 1. Índice

1. [Visión general y diagrama](#2-visión-general-y-diagrama)
2. [Estructura del repositorio](#3-estructura-del-repositorio)
3. [Backend Laravel: monolito modular](#4-backend-laravel-monolito-modular)
4. [Frontend React: modular por feature](#5-frontend-react-modular-por-feature)
5. [Comunicación: REST + WebSockets + colas](#6-comunicación-rest--websockets--colas)
6. [Modelo de datos en PostgreSQL](#7-modelo-de-datos-en-postgresql)
7. [Seguridad, roles y auditoría](#8-seguridad-roles-y-auditoría)
8. [Estrategia de migración del prototipo](#9-estrategia-de-migración-del-prototipo)
9. [Despliegue](#10-despliegue)

---

## 2. Visión general y diagrama

El sistema es una **SPA React** que consume una **API REST Laravel**. La base de datos **PostgreSQL** es la única fuente de verdad. La **cola del día y la pantalla de TV** usan **WebSocket** (Reverb) para actualización en tiempo real real (a diferencia del `localStorage` + evento `storage` del prototipo).

```mermaid
flowchart LR
    subgraph FW[Frontend SPA React]
        Web["React + Vite<br/>features/ por rol"]
        TV["Pantalla TV /tv<br/>(WebSocket)"]
    end

    subgraph BE[Backend Laravel · Monolito Modular]
        API["HTTP API REST<br/>routes/api.php + módulos"]
        Reverb["Laravel Reverb<br/>(WebSocket)"]
        Jobs["Colas · Jobs · Scheduler"]
    end

    DB[("PostgreSQL")]
    Pago["Izipay / Niubiz<br/>(pasarela real)"]

    Web -->|"HTTPS · JSON<br/>Bearer (Sanctum)"| API
    TV -->|"WSS · canales queue/*"| Reverb
    API --> DB
    Reverb --> DB
    Jobs --> DB
    API --> Pago
    Reverb --> Web
```

---

## 3. Estructura del repositorio

Monorepo con dos aplicaciones y un paquete compartido:

```
SGCM-CMAS/
├── apps/
│   ├── web/                    # React + Vite (SPA)
│   │   └── src/
│   │       ├── features/
│   │       ├── shared/
│   │       └── App.jsx         # enrutado por rol (protegido)
│   └── api/                    # Laravel
│       ├── app/
│       │   ├── Modules/        # ★ módulos de negocio
│       │   └── Shared/
│       ├── routes/
│       ├── database/
│       │   ├── migrations/
│       │   └── seeders/
│       └── composer.json
├── packages/
│   └── contracts/              # DTOs y tipos compartidos (openapi → TS)
├── docs/
│   └── (ARQUITECTURA, MER, MODULOS, CASOS_DE_USO, REQUISITOS…)
└── openapi.yaml                # Contrato de API (fuente única)
```

El **contrato de API se define en `openapi.yaml`** y a partir de él se generan el cliente TypeScript del frontend y las pruebas del backend.

---

## 4. Backend Laravel: monolito modular

Cada módulo del prototipo (`docs/MODULOS.md`) se convierte en un **módulo Laravel** autocontenido dentro de `app/Modules/`:

```
app/Modules/
├── Auth/                 # Módulo 1 · login, registro, roles, tokens (Sanctum)
│   ├── Http/Controllers/ # + Requests (validación) + Resources (JSON)
│   ├── Models/           # User
│   ├── Services/
│   ├── Policies/
│   ├── routes/           # auth.php
│   └── database/         # migrations/seeders del módulo
├── Catalog/              # Módulos 2 y 15 · especialidades, consultorios, médicos
├── Patients/             # Módulos 5 y 8 · pacientes, historial, perfiles
├── Appointments/         # ★ Módulos 3, 4, 9, 11, 14 · citas y ciclo de vida
├── Triage/               # Módulo 12 · signos vitales y cola de enfermería
├── Queue/                # Módulo 13 · turnos, cola del día, eventos de TV
├── Payments/             # Módulos 3, 7, 14 · pagos y pasarela
├── Waitlist/             # Módulo 6 · lista de espera de cupos
└── Admin/                # Módulo 15 · usuarios, reportes, configuración, auditoría
app/Shared/
├── Audit/                # trait audit() + modelo AuditLog
├── Notification/         # correo/SMS/notificaciones
├── Queues/               # jobs compartidos
└── Support/              # helpers, enums, excepciones
```

**Convenciones por módulo:**

- **Regla de negocio en el modelo/Servicio**: el ciclo `agendada → pagada → check_in → en_espera_triaje → en_triaje → triaje_completado → en_atencion → documentada` vive en `Appointments` como **máquina de estados** (enum `Status` + transiciones validadas). Las ramas `cancelada`, `reprogramada`, `check_in`, `atendida` se modelan con estados permitidos por transición.
- **Validación con Form Requests** por módulo (mismas reglas que el prototipo: correo único, DNI 8, celular 9, clave con política, etc.).
- **DTOs/Resources** para exponer JSON estable; **no se expone el modelo directamente**.
- **Cada módulo registra sus rutas** en `routes/api.php` con prefijo `/api/v1/{modulo}`.
- **Los módulos no se importan entre sí por el modelo**, sino por **interfaces/servicios** (p. ej. `Appointments` declara `PaymentPort` que implementa `Payments`) para conservar los límites modulares.

---

## 5. Frontend React: modular por feature

El prototipo ya sugiere la organización; se formaliza en `apps/web/src`:

```
src/
├── features/
│   ├── auth/                  # login, registro, recuperar contraseña
│   ├── public/                # landing, disponibilidad
│   ├── patient/               # reserva, mis citas, check-in, historial, pagos, lista de espera, perfil
│   ├── doctor/                # agenda, disponibilidad, diagnóstico, ficha del paciente
│   ├── nurse/                 # cola de triaje, formulario, historial
│   ├── reception/             # agenda, nueva cita, check-in, cobros, cancelaciones
│   ├── admin/                 # dashboard, usuarios, especialidades, consultorios, reportes, configuración
│   ├── queue/                 # tablero de la cola (recepción y enfermería)
│   └── tv/                    # pantalla de TV
├── shared/
│   ├── api/                   # cliente generado desde openapi.yaml
│   ├── ui/                    # componentes (se reutiliza components/ui del prototipo)
│   ├── hooks/
│   └── context/               # estado de cliente (auth, toasts) — NO el estado de negocio
└── App.jsx                    # rutas protegidas por rol (guards)
```

**Gestión de estado:**
- **Estado de servidor**: TanStack Query (citas, pagos, catálogos) — cachea, revalida y maneja mutaciones.
- **Estado de cliente**: Context/Zustand solo para sesión (`auth`) y UI (toasts, modales).
- **Tiempo real**: Laravel Echo suscrito a canales privados `queue.{fecha}` para el tablero y `/tv`.
- **Enrutado protegido**: guards por rol (`<RequireRole role="medico">`) que consumen el rol del token.

---

## 6. Comunicación: REST + WebSockets + colas

| Canal | Uso | Tecnología |
|---|---|---|
| **REST** | Todas las operaciones CRUD y de negocio | `api/v1/*`, JSON, Sanctum |
| **WebSocket** | Cola del día, TV, estado de la cita del paciente | Reverb + Echo (canales `queue.{fecha}`, `appointment.{id}`) |
| **Colas** | Expiración de cupos de lista de espera, verificación de pagos (>15 min), recordatorios de cita, conciliación de la pasarela | Jobs + Scheduler |

**Ejemplo — flujo de check-in con tiempo real:**
1. `POST /api/v1/reception/check-in` (recepción) asigna el turno `A-00X` y cambia el estado a `en_espera_triaje`.
2. `AppointmentsService` dispara el evento `AppointmentCheckedIn` (broadcast).
3. Reverb publica en el canal `queue.2026-08-05` → el tablero y la TV se actualizan **en todos los dispositivos**.

---

## 7. Modelo de datos en PostgreSQL

Mapeo del [`MER.md`](MER.md) a tablas normalizadas (se eliminan los objetos embebidos del prototipo):

| Entidad MER | Tabla PostgreSQL | Notas |
|---|---|---|
| USUARIO | `users` | Tabla nativa de Laravel + columna `role` (enum) |
| PACIENTE | `pacientes` | FK `user_id` (en el prototipo no estaba vinculado) |
| MEDICO | `medicos` | FK `user_id`, `especialidad_id`, `consultorio_id` |
| ESPECIALIDAD | `especialidades` | |
| CONSULTORIO | `consultorios` | |
| — | `consultorio_especialidad` | ★ tabla pivote (el prototipo usaba array) |
| MEDICO.slots | `disponibilidad` | ★ normalizado: `{ medico_id, dia, hora_inicio, hora_fin }` |
| CITA | `citas` | `status` como enum PostgreSQL; FK paciente/medico/especialidad |
| CITA.diag | `diagnosticos` | ★ normalizado: `{ cita_id, dx, notas }` |
| CITA.triage | `triajes` | ★ normalizado: `{ cita_id, pa, temp, fc, peso, talla, motivo, alergias, observaciones, enfermera_id, at }` |
| CITA.turno | `citas.turno` | columna `turno` + índice único `(fecha, turno)` |
| PAGO | `pagos` | FK `cita_id`, `paciente_id`; `paidType` enum (`adelanto|total`), `gateway` bool, `opRef` |
| LISTA_ESPERA | `lista_espera` | FK paciente/especialidad/medico |
| LISTA_ESPERA.offer | `ofertas_cupo` | ★ normalizado: `{ lista_espera_id, fecha, hora, expira_en }` |
| AUDITORIA | `auditoria` | FK `user_id` (id, ya no email desnormalizado) |
| SETTINGS | `configuraciones` | tabla de una fila o clave-valor |

**Convenciones:**
- IDs **UUID** (o `bigint`) en todas las tablas; **timestamps** auditables (`created_at`, `updated_at`) y `soft deletes` donde aplique.
- **Enums PostgreSQL** para `role`, `citas.status`, `pagos.status`, `pagos.paid_type`, `lista_espera.status`.
- Índices para las consultas calientes: `(doctor_id, date, time)` en citas, `(fecha, turno)`, `(paciente_id, date)`.
- **`date`/`time`** tipados en PostgreSQL (el prototipo manejaba strings).
- Migraciones y seeders por módulo (el prototipo alimenta `database/seeders/` con `SPECIALTIES`, `CONSULTORIOS`, `DOCTORS`, `PATIENTS`, citas, pagos, lista de espera y auditoría).

---

## 8. Seguridad, roles y auditoría

- **Autenticación**: Sanctum (tokens SPA + refresh). Se mantiene la heurística de roles como seed, pero el rol se asigna por `users.role` y se valida con **middleware de rol** y **Policies** por recurso (p. ej. `PatientDetailPolicy`: solo con relación clínica vigente → cierra la "regla de acceso" del Módulo 11).
- **Autorización**:
  - `PatientDetailPolicy` → acceso a historial (US-26).
  - `AppointmentPolicy` → el paciente solo sobre sus citas; el médico solo sobre las de su consultorio.
  - Rutas de administración bajo `role:administrador`.
- **Auditoría**: trait `AuditTrait` en `Shared/Audit` que registra en `auditoria` toda operación sensible (login/logout, reservas, cancelaciones, check-ins, triajes, diagnósticos, intentos fallidos) con severidad `info|warning|danger`. Política de bloqueo tras **5 intentos fallidos** (RNF-12).
- **Pasarela real**: tokenización y cobro con Izipay/Niubiz; **no se almacena la tarjeta**, solo `opRef` y estado; jobs de conciliación y reembolsos.
- **Protección de datos**: cumplir Ley N.º 29733 (RNF-23) — consentimiento, cifrado en reposo, backups, y no exponer datos clínicos fuera de los canales autorizados.

---

## 9. Estrategia de migración del prototipo

| Paso | Qué hacer | Cómo |
|---|---|---|
| 1 | **Modelar la BD** | Migraciones por módulo + seeders con los datos de `src/data/mock.js` (`SPECIALTIES`, `DOCTORS`, `PATIENTS`, citas, pagos, lista de espera, auditoría). |
| 2 | **Crear la API por módulo** | Empezar por `Auth` + `Catalog`; luego `Appointments` (núcleo) y `Payments`; continuar con `Triage`, `Queue`, `Waitlist`, `Admin`. |
| 3 | **Generar el cliente** | Definir `openapi.yaml` y generar el cliente TS para el frontend. |
| 4 | **Portar el frontend por feature** | Copiar `src/pages/*` del prototipo a `src/features/*`, reemplazando `useApp()` por hooks de TanStack Query. Conservar `shared/ui` tal cual. |
| 5 | **Tiempo real** | Sustituir `localStorage` + evento `storage` por canales Reverb en `queue/` y `tv/`. |
| 6 | **Protección por rol** | Agregar guards en el router y middleware/Policies en la API (el prototipo lo dejó pendiente). |
| 7 | **Pasarela real** | Reemplazar `PaymentGateway.jsx` (simulado) por integración Izipay/Niubiz manteniendo la misma UI y flujo 50%/100%. |

**Orden de prioridad** sugerido por valor de negocio: `Auth → Appointments → Payments → Queue/TV → Triage → Waitlist → Admin`.

---

## 10. Despliegue

```mermaid
flowchart LR
    CD["CI/CD (GitHub Actions)"] -->|build + test| API
    CD -->|build + test| Web
    API -->|deploy| BE["Servidor web (PHP-FPM + Nginx)"]
    Web -->|deploy| FE["CDN / Vercel / Netlify"]
    BE --> DB[(PostgreSQL)]
    ReverbR["Reverb (WebSocket)"] --> BE
    Web -->|WSS| ReverbR
```

- **Backend**: contenedor PHP-FPM + Nginx; `php artisan migrate --force` y jobs con supervisor.
- **Frontend**: build estático en CDN con `_redirects` para el enrutado SPA (mismo patrón del prototipo en Netlify).
- **PostgreSQL**: servicio gestionado con backups diarios.
- **Variables de entorno** para claves de la pasarela y credenciales; jamás en el repositorio.
