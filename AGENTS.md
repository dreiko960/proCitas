# AGENTS.md — Reglas de trabajo para agentes

## Regla principal: documentar cada cambio

- **Cada cambio funcional o estructural que se realice o agregue al prototipo debe reflejarse en los documentos**, en la misma sesión y antes de dar la tarea por terminada:
  - `README.md` — arquitectura, rutas, modelo de cita, estados, reglas de negocio, funcionalidades por rol, design system, limitaciones y pasos siguientes.
  - `docs/MODULOS.md` — detalle técnico-funcional por módulo (propósito, rutas, flujo, reglas, archivos) e índice.
- Al actualizar, respetar el estilo y convenciones existentes de cada documento (tablas, secciones numeradas, convenciones del encabezado).
- Si el cambio toca más de un módulo/área, actualizar todas las secciones afectadas de ambos documentos (no solo la primera que se encuentre).

## Entorno y comandos

- Proyecto: React 18 + Vite 5.4 + React Router 6 (Windows).
- **Usar `npm.cmd run build`** para verificar builds. `npm.ps1` está bloqueado por ExecutionPolicy de PowerShell.
- Verificar el build después de cada cambio de código antes de cerrar la tarea.
- No ejecutar `git commit` salvo que el usuario lo pida explícitamente.

## Contexto del prototipo (SGCM-CMAS)

- Día de operación fijo `TODAY = '2026-08-05'`; turnos `A-00X`; persistencia de citas en `localStorage` (`procitas-appointments-v1`); los pagos no persisten.
- Roles demo: paciente `julia.mamani@gmail.com`, médico `rosa.quispe@cmas.com`, enfermera `diana.prado@cmas.com`, recepcionista `sofia.mendoza@cmas.com`, admin `miguel.huaraca@cmas.com`.
- La pasarela de pago es simulada (no hay integración real Izipay/Niubiz/VisaNet).
