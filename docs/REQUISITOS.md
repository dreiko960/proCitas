# Requisitos del Sistema — SGCM-CMAS

Documento que formaliza los **requisitos funcionales (RF)** y **no funcionales (RNF)** del prototipo **SGCM-CMAS** (gestión de citas médicas, Ayacucho). Los requisitos funcionales se derivan de las historias de usuario de [`HISTORIAS_DE_USUARIO.md`](HISTORIAS_DE_USUARIO.md) y se detallan por módulo en [`MODULOS.md`](MODULOS.md).

> **Convenciones**
>
> - **RF-xx**: requisito funcional. Cada uno tiene prioridad y traza a una o más historias de usuario (US-xx).
> - **RNF-xx**: requisito no funcional (calidad del sistema: rendimiento, seguridad, usabilidad, etc.).
> - Prioridades: **Alta** (núcleo del flujo), **Media** (funcionalidad secundaria), **Baja** (mejora o demo).

---

## Índice

1. [Requisitos funcionales (RF)](#requisitos-funcionales-rf)
2. [Requisitos no funcionales (RNF)](#requisitos-no-funcionales-rnf)
3. [Matriz de trazabilidad RF → US](#matriz-de-trazabilidad-rf--us)

---

## Requisitos funcionales (RF)

### Autenticación y acceso (RF-01 … RF-05)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-01 | El sistema debe permitir iniciar sesión con correo y contraseña y **detectar el rol** automáticamente por heurística del correo. | Alta | US-01 |
| RF-02 | El sistema debe validar el correo (formato) y la contraseña (≥ 6 caracteres) al iniciar sesión. | Alta | US-01 |
| RF-03 | El sistema debe ofrecer **botones de acceso rápido demo** que ingresen a cada panel en 500 ms sin credenciales. | Baja | US-01 |
| RF-04 | El sistema debe permitir el **registro público de pacientes** validando nombre, correo único, DNI, celular y política de contraseña. | Alta | US-02 |
| RF-05 | El sistema debe permitir **recuperar la contraseña** en 2 pasos (solicitar enlace → definir nueva clave) y **cerrar sesión** limpiando `auth` y registrando auditoría. | Media | US-03, US-04 |

### Público y búsqueda de disponibilidad (RF-06 … RF-08)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-06 | El sistema debe mostrar la **landing** con hero, especialidades, proceso de reserva y CTA de lista de espera, enlazando cada especialidad a `/disponibilidad`. | Media | US-05 |
| RF-07 | El sistema debe permitir **buscar disponibilidad sin sesión** por especialidad y rango de fechas, mostrando únicamente slots libres. | Media | US-06 |
| RF-08 | El sistema debe redirigir a `/login` al intentar reservar sin sesión y forzar el estado "sin disponibilidad" para la especialidad `cardiologia` (demo). | Media | US-06 |

### Reserva y pago en línea (RF-09 … RF-12)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-09 | El sistema debe permitir **reservar citas en 3 pasos** (especialidad → médico/horario → confirmación), bloqueando el horario elegido en todo el sistema. | Alta | US-07 |
| RF-10 | El sistema debe **simular conflictos de concurrencia** mostrando 3 alternativas sugeridas cuando un horario ya no está disponible. | Media | US-07 |
| RF-11 | El sistema debe permitir **pagar en línea** (abono 50% o pago total) mediante una pasarela simulada de tarjeta, generando la operación `OP-2026-XXXX`. | Alta | US-08 |
| RF-12 | El sistema debe crear la cita como `pagada` (con `paidType`) si hubo pago en línea, o `agendada` si se paga en caja, y mostrar la **pantalla de confirmación** con el resumen. | Alta | US-08, US-09 |

### Mis citas, check-in móvil e historial (RF-13 … RF-18)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-13 | El sistema debe listar las **citas del paciente** en pestañas Próximas / Pasadas / Canceladas con estados vivos del flujo clínico. | Alta | US-10 |
| RF-14 | El sistema debe permitir **reprogramar** una cita (estado `reprogramada`) y **cancelarla** liberando el horario, con alerta de cancelación tardía (< 12 h). | Alta | US-11, US-12 |
| RF-15 | El sistema debe permitir el **check-in móvil** solo para citas `agendada`/`pagada`, pasándolas a `check_in` con auditoría. | Alta | US-13 |
| RF-16 | El sistema debe mostrar el **historial clínico** del paciente en línea de tiempo expandible con citas `atendida`/`documentada`. | Alta | US-14 |
| RF-17 | El sistema debe permitir **descargar el historial en PDF** (simulado), por cita o completo. | Baja | US-15 |
| RF-18 | El sistema debe permitir **editar el perfil del paciente** con validación por campo y cambio de contraseña simulado. | Media | US-20 |

### Lista de espera de cupos (RF-19 … RF-22)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-19 | El sistema debe permitir **inscribirse en la lista de espera** de cupos por especialidad, médico y rango horario (wizard 3 pasos). | Alta | US-16 |
| RF-20 | El sistema debe asignar una **posición estimada** (`~N°3`) y mantener el estado `en_espera` mientras no haya oferta. | Media | US-16 |
| RF-21 | El sistema debe emitir una **oferta de cupo** con cuenta regresiva de 15 min (`useCountdown`), permitiendo confirmar (crea la cita + pago `pendiente_verificacion`), rechazar (vuelve a `en_espera`) o expirar (pasa al siguiente). | Alta | US-17 |
| RF-22 | El sistema debe informar el **cupo expirado** y ofrecer reinscripción o regreso a mis inscripciones. | Media | US-18 |

### Pagos del paciente (RF-23)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-23 | El sistema debe permitir **declarar pagos** (Yape/Plin/Transferencia/Efectivo) eligiendo abono 50% o pago total, dejándolos `pendiente_verificacion` hasta que recepción los verifique (< 15 min) y recién entonces habilitar el comprobante. | Alta | US-19 |

### Agenda y atención del médico (RF-24 … RF-29)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-24 | El sistema debe mostrar la **agenda del día del médico** en timeline con filtros por estado y banner de cola. | Alta | US-21 |
| RF-25 | El sistema debe permitir **administrar la disponibilidad** semanal en grilla de 7 días × 30 min, detectando solapamientos y conservando citas confirmadas. | Alta | US-22 |
| RF-26 | El sistema debe permitir **editar el perfil profesional** del médico con contador de bio (280 caracteres). | Media | US-23 |
| RF-27 | El sistema debe permitir **iniciar la atención** de citas `triaje_completado` (pasando a `en_atencion`). | Alta | US-24 |
| RF-28 | El sistema debe permitir **registrar el diagnóstico** (diagnóstico ≥ 5 caracteres, severidad, observaciones) solo en citas `en_atencion`, pasándolas a `documentada`. | Alta | US-25 |
| RF-29 | El sistema debe mostrar la **ficha del paciente** con regla de acceso (deniega y audita si no hay relación clínica previa). | Alta | US-26 |

### Triaje de enfermería (RF-30 … RF-32)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-30 | El sistema debe mostrar la **cola de triaje** en dos columnas (esperando / en progreso) ordenada por tiempo de espera, con advertencia > 10 min. | Alta | US-27 |
| RF-31 | El sistema debe permitir **registrar signos vitales** (PA, temperatura, FC, peso, talla, motivo obligatorios; alergias y observaciones opcionales), pasando la cita a `triaje_completado`. | Alta | US-28 |
| RF-32 | El sistema debe listar el **historial de triajes del turno** con signos vitales y responsable. | Media | US-29 |

### Cola del día y pantalla de TV (RF-33 … RF-35)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-33 | El sistema debe **asignar turnos secuenciales** `A-00X` en el check-in presencial y gestionar la cola con acciones por estado (llamar a triaje, finalizar triaje, llamar a consulta, marcar atendida). | Alta | US-30 |
| RF-34 | El sistema debe mostrar una **pantalla de TV** (`/tv`) fullscreen con el turno actual en triaje/consulta, próximos turnos, reloj en vivo y **actualización automática** entre pestañas (persistencia + evento `storage`). | Alta | US-31 |
| RF-35 | El sistema debe mostrar la sección **"Atendidos hoy"** y permitir **restablecer la demo** al mock inicial. | Media | US-30, US-32 |

### Operación de recepción (RF-36 … RF-40)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-36 | El sistema debe mostrar la **agenda general del día** de todos los médicos filtrable por especialidad y médico. | Alta | US-33 |
| RF-37 | El sistema debe permitir **registrar citas** con búsqueda de paciente o "alta rápida", naciendo la cita `confirmada`, con pago opcional inmediato. | Alta | US-34 |
| RF-38 | El sistema debe realizar el **check-in presencial** solo para citas `pagada`, asignando el turno `A-00X` y enviando a triaje. | Alta | US-35 |
| RF-39 | El sistema debe **cobrar citas** (generando comprobante `R-2026-XXXX`), **completar abonos del 50%** y **verificar pagos** declarados por el paciente. | Alta | US-36 |
| RF-40 | El sistema debe permitir **cancelar y reprogramar citas** con confirmación, detectando cancelaciones tardías (< 12 h). | Alta | US-37 |

### Administración (RF-41 … RF-47)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-41 | El sistema debe mostrar el **dashboard de indicadores** (citas del mes, tasa de cancelación, inasistencia, ingresos) con gráficos estáticos. | Alta | US-38 |
| RF-42 | El sistema debe permitir **gestionar usuarios** (crear con correo único, asignar rol, activar/desactivar). | Alta | US-39 |
| RF-43 | El sistema debe permitir **gestionar especialidades** (crear/editar, precio, activación con advertencia si hay médicos asociados). | Media | US-40 |
| RF-44 | El sistema debe permitir **gestionar consultorios** (piso, área, especialidades; advertencia si está en uso). | Media | US-41 |
| RF-45 | El sistema debe **generar reportes** simulados filtrables por tipo y periodo con exportación demo. | Media | US-42 |
| RF-46 | El sistema debe permitir **configurar reglas de negocio** (cancelación, reserva, token, ventana de lista de espera) y días no laborables. | Media | US-43 |
| RF-47 | El sistema debe mostrar la **auditoría de eventos** con filtro por veredicto y búsqueda por texto. | Media | US-44 |

### Transversales (RF-48 … RF-50)

| ID | Requisito | Prioridad | Traza |
|---|---|---|---|
| RF-48 | El sistema debe **persistir las citas** en `localStorage` (`procitas-appointments-v1`) y sincronizarlas entre pestañas del mismo navegador (evento `storage`). | Alta | US-31 |
| RF-49 | El sistema debe **registrar auditoría** (`pushAudit`) en las operaciones sensibles: login/logout, reservas, cancelaciones, check-ins, triajes, diagnósticos e intentos de acceso. | Alta | US-01, US-12, US-13, US-26, US-30, US-37 |
| RF-50 | El sistema debe mantener el **ciclo de vida de la cita**: `agendada → pagada → check_in/en_espera_triaje → en_triaje → triaje_completado → en_atencion → documentada`, con ramas `cancelada`, `reprogramada`, `check_in` y `atendida`. | Alta | US-10, US-13, US-24, US-25, US-28, US-30, US-35, US-36 |

---

## Requisitos no funcionales (RNF)

### Rendimiento (RNF-01 … RNF-04)

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-01 | La aplicación debe ser de tipo **SPA** con carga inicial ágil (build con Vite 5.4); no se requieren tiempos de respuesta de red porque el sistema es 100 % local (estado en memoria + `localStorage`). | Alta |
| RNF-02 | Las **demoras simuladas** deben ser breves y consistentes: login ~700 ms, acceso rápido 500 ms, pasarela de pago ~1.6 s, registro ~700 ms, redirección de nueva contraseña 1.4 s. | Media |
| RNF-03 | La **cuenta regresiva de ofertas** (15 min) y el **modo automático del TV** (4.5 s/paso) deben ser precisos con el temporizador del navegador. | Alta |
| RNF-04 | La **sincronización entre pestañas** debe actualizar la pantalla de TV en el instante en que cambia el estado de las citas (misma pestaña y otras pestañas del mismo navegador). | Alta |

### Usabilidad y accesibilidad (RNF-05 … RNF-09)

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-05 | La interfaz debe ser **responsive** con breakpoints ≤ 768 px (sidebar → drawer + navegación inferior, grids a 1 columna) y ≤ 480 px (modales tipo *bottom-sheet*). | Alta |
| RNF-06 | El sistema debe usar un **sistema de diseño** consistente (tokens en `tokens.css`, componentes en `components/ui/`) con **feedback visual** para todas las acciones (toasts, badges, estados vacíos). | Alta |
| RNF-07 | La **pantalla de TV** debe tener alto contraste (tema oscuro), números de turno en tamaño gigante y animación de pulso para lectura a distancia. | Alta |
| RNF-08 | Los formularios deben mostrar **validación visual por campo** (error/success/hint) y mensajes claros en español. | Alta |
| RNF-09 | La galería `/componentes` debe documentar visualmente todos los componentes del sistema de diseño. | Baja |

### Seguridad (RNF-10 … RNF-14)

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-10 | El sistema debe validar **todas las entradas de usuario** (correo, DNI, celular, contraseña) con reglas claras y mensajes de error. | Alta |
| RNF-11 | Las **contraseñas** deben cumplir política de seguridad (mayúscula, número, ≥ 6 caracteres) y las claves de recuperación expirar a los 30 min (un solo uso). | Media |
| RNF-12 | El sistema debe llevar un **registro de auditoría** de eventos sensibles (accesos, intentos, operaciones) con severidad `info|warning|danger` y política de bloqueo tras 5 intentos fallidos (demo). | Alta |
| RNF-13 | La **pasarela de pago es simulada**: no debe procesar cobros reales, no debe enviar datos de tarjeta a ningún servicio y los datos deben descartarse al terminar la demo. | Alta |
| RNF-14 | La **ficha del paciente** debe protegerse con la regla de acceso por "relación clínica vigente" y registrar el intento de acceso denegado en auditoría. | Alta |

### Compatibilidad y disponibilidad (RNF-15 … RNF-18)

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-15 | La aplicación debe ejecutarse en **navegadores modernos** (Chrome, Edge, Firefox) en Windows y en **Node.js 20+** para desarrollo/build. | Alta |
| RNF-16 | El sistema debe **persistir las citas** entre recargas mediante `localStorage`; el resto de colecciones (pagos, lista de espera, usuarios, auditoría, configuración) es volátil por sesión (limitación documentada). | Media |
| RNF-17 | El proyecto debe **desplegarse en Netlify** como SPA (`netlify.toml` + `_redirects`), funcionando en cualquier ruta directa (p. ej. `/tv`). | Alta |
| RNF-18 | El día de operación es **fijo** (`TODAY = '2026-08-05'`); los datos y fechas del prototipo deben mantenerse coherentes con esa constante. | Media |

### Mantenibilidad y portabilidad (RNF-19 … RNF-22)

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-19 | El código debe organizarse por **capas y carpetas** (`pages`, `components`, `context`, `data`, `utils`, `hooks`, `styles`) y usar **componentes reutilizables** de `components/ui/`. | Alta |
| RNF-20 | Todo el **estado global** debe vivir en `AppContext.jsx` (datos + acciones) y consumirse vía `useApp()`; los datos simulados en `src/data/mock.js`. | Alta |
| RNF-21 | La documentación debe mantenerse **actualizada** (`README.md`, `docs/MODULOS.md`, `docs/HISTORIAS_DE_USUARIO.md`, `docs/REQUISITOS.md`) en cada cambio. | Media |
| RNF-22 | El build de producción debe compilarse sin errores con `npm run build` (en Windows, usar `npm.cmd`). | Alta |

### Legal y normativo (RNF-23 … RNF-24)

| ID | Requisito | Prioridad |
|---|---|---|
| RNF-23 | El registro público debe **mencionar la Ley N.º 29733** (protección de datos personales) y el historial clínico debe mostrar aviso de protección de datos. | Media |
| RNF-24 | Los datos del prototipo son **ficticios** (pagos, historial y estadísticas simuladas) y no deben presentarse como información real de pacientes. | Media |

---

## Matriz de trazabilidad RF → US

| RF | US |
|---|---|
| RF-01, RF-02, RF-03 | US-01 |
| RF-04 | US-02 |
| RF-05 | US-03, US-04 |
| RF-06 | US-05 |
| RF-07, RF-08 | US-06 |
| RF-09, RF-10 | US-07 |
| RF-11, RF-12 | US-08, US-09 |
| RF-13 | US-10 |
| RF-14 | US-11, US-12 |
| RF-15 | US-13 |
| RF-16, RF-17 | US-14, US-15 |
| RF-18 | US-20 |
| RF-19, RF-20 | US-16 |
| RF-21 | US-17 |
| RF-22 | US-18 |
| RF-23 | US-19 |
| RF-24 | US-21 |
| RF-25 | US-22 |
| RF-26 | US-23 |
| RF-27 | US-24 |
| RF-28 | US-25 |
| RF-29 | US-26 |
| RF-30 | US-27 |
| RF-31 | US-28 |
| RF-32 | US-29 |
| RF-33 | US-30 |
| RF-34 | US-31 |
| RF-35 | US-30, US-32 |
| RF-36 | US-33 |
| RF-37 | US-34 |
| RF-38 | US-35 |
| RF-39 | US-36 |
| RF-40 | US-37 |
| RF-41 | US-38 |
| RF-42 | US-39 |
| RF-43 | US-40 |
| RF-44 | US-41 |
| RF-45 | US-42 |
| RF-46 | US-43 |
| RF-47 | US-44 |
| RF-48 | US-31 |
| RF-49 | US-01, US-12, US-13, US-26, US-30, US-37 |
| RF-50 | US-10, US-13, US-24, US-25, US-28, US-30, US-35, US-36 |
