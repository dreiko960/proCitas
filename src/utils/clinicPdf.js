import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CLINIC, CLINIC_COLORS as C } from '../data/clinic'
import { TODAY } from '../data/mock'
import { findDoctor, findSpecialty, findConsultorio, fmtPrice, fmtDateFull, STATUS_LABEL } from './helpers'

const PAGE_W = 210
const PAGE_H = 297
const M = 14 // margen horizontal

const FONT = 'helvetica'

export function slugify(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
}

function todayLabel() {
  const d = new Date(TODAY + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtTime(t) {
  return t || '—'
}

// ——— Escudo SVG del sistema convertido a path (viewBox 24 → mm) ———
function drawLogo(doc, x, y, scale = 0.75) {
  const T = (px, py) => `${(px * scale + x).toFixed(2)} ${(py * scale + y).toFixed(2)}`
  const shield =
    `M${T(12, 3)} L${T(5, 6)} L${T(5, 11)} ` +
    `C${T(5, 15.4)} ${T(8, 19.2)} ${T(12, 20.5)} ` +
    `C${T(16, 19.2)} ${T(19, 15.4)} ${T(19, 11)} ` +
    `L${T(19, 6)} Z`
  doc.setFillColor(...C.primary)
  doc.path(shield, { fillColor: C.primary, stroke: false })
  doc.setDrawColor(...C.white)
  doc.setLineWidth(1.05)
  doc.path(`M${T(9, 12)} L${T(11, 14)} L${T(15, 9.5)}`)
}

// ——— Membrete con datos de la clínica ———
export function drawHeader(doc, { compact = false } = {}) {
  if (compact) {
    drawLogo(doc, M, 10, 0.55)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...C.primary)
    doc.text(CLINIC.system, 24.5, 15.5)
    doc.setFont(FONT, 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.muted)
    doc.text(CLINIC.legalName, 24.5, 20)
    doc.setDrawColor(...C.primaryDark)
    doc.setLineWidth(1)
    doc.line(M, 25, PAGE_W - M, 25)
    return 25
  }

  drawLogo(doc, M, 9, 0.75)
  doc.setFont(FONT, 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...C.primary)
  doc.text(CLINIC.legalName, 34, 17)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.muted)
  doc.text(CLINIC.tagline + ' · Sistema ' + CLINIC.system, 34, 22.5)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.text)
  doc.text(CLINIC.address, PAGE_W - M, 12, { align: 'right' })
  doc.text(`Tel. ${CLINIC.phone} · ${CLINIC.email}`, PAGE_W - M, 16, { align: 'right' })
  doc.setTextColor(...C.muted)
  doc.text(`RUC ${CLINIC.ruc} · ${CLINIC.hours}`, PAGE_W - M, 20, { align: 'right' })

  doc.setDrawColor(...C.primaryDark)
  doc.setLineWidth(1.1)
  doc.line(M, 26, PAGE_W - M, 26)
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.25)
  doc.line(M, 27.2, PAGE_W - M, 27.2)
  return 27.2
}

// ——— Pie de página con validación y paginación ———
export function drawFooter(doc, docId) {
  const page = doc.getCurrentPageInfo().pageNumber
  const total = doc.getNumberOfPages()
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.25)
  doc.line(M, 285, PAGE_W - M, 285)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(...C.muted)
  doc.text(`Documento generado por ${CLINIC.system} · ${CLINIC.legalName} · ${todayLabel()}`, M, 289.5)
  doc.text(`Página ${page} de ${total}`, PAGE_W - M, 289.5, { align: 'right' })
  doc.text(`Doc. ${docId} · Uso exclusivo del paciente · Información confidencial protegida por ley`, M, 293.2)
}

// ——— Título del documento ———
function drawTitle(doc, title, docId) {
  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...C.primary)
  doc.text(title, M, 36)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.muted)
  doc.text(`N° ${docId} · Emitido el ${todayLabel()}`, M, 41)
  return 45
}

// ——— Encabezado de sección ———
function section(doc, label, y) {
  doc.setFillColor(...C.primaryDark)
  doc.rect(M, y - 3.4, 2.4, 4.4, 'F')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...C.primary)
  doc.text(label, M + 5, y)
  return y + 4
}

// ——— Datos del paciente en tabla 2 columnas ———
function patientBox(doc, patient, startY) {
  autoTable(doc, {
    startY,
    theme: 'grid',
    margin: { left: M, right: M },
    body: [
      [
        { content: 'Paciente', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: patient?.name || '—', styles: { fontStyle: 'bold' } },
        { content: 'DNI', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: patient?.dni || '—' },
      ],
      [
        { content: 'Edad', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: `${patient?.age || '—'} años` },
        { content: 'Fec. nacimiento', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: patient?.dob || '—' },
      ],
      [
        { content: 'Teléfono', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: patient?.phone || '—' },
        { content: 'Correo', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: patient?.email || '—' },
      ],
      [
        { content: 'Dirección', styles: { fontStyle: 'bold', textColor: C.muted } },
        { content: patient?.address || '—', colSpan: 3 },
      ],
    ],
    styles: { fontSize: 8, cellPadding: 2.6, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
    columnStyles: { 0: { cellWidth: 28 }, 2: { cellWidth: 28 } },
  })
  return doc.lastAutoTable.finalY + 4
}

// ——— Datos de la atención ———
function apptBox(doc, appt, doctor, spec, room, startY) {
  const rows = [
    ['Cita', appt.id, 'Fecha', fmtDateFull(appt.date)],
    ['Hora', fmtTime(appt.time), 'Estado', STATUS_LABEL[appt.status] || appt.status],
    ['Especialidad', spec?.name || '—', 'Médico', doctor?.name || '—'],
    ['Consultorio', room ? `${room.nombre} · ${room.piso}` : '—', 'Turno', appt.turno || '—'],
    ['Costo', spec ? fmtPrice(spec.price) : '—', 'Duración', `${appt.duration || 30} min`],
  ]
  if (appt.reason) rows.push([{ content: 'Motivo de consulta', styles: { fontStyle: 'bold', textColor: C.muted } }, { content: appt.reason, colSpan: 3 }])

  autoTable(doc, {
    startY,
    theme: 'grid',
    margin: { left: M, right: M },
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.6, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
    columnStyles: { 0: { cellWidth: 34, fontStyle: 'bold', textColor: C.muted }, 2: { cellWidth: 34, fontStyle: 'bold', textColor: C.muted } },
  })
  return doc.lastAutoTable.finalY + 4
}

// ——— Signos vitales / triaje ———
function triageBox(doc, triage, startY) {
  const vital = (k, label, unit = '') => `${triage[k] || '—'}${unit}`
  const vitals = [
    ['P. arterial', vital('pa', 'PA', ' mmHg')],
    ['Temperatura', vital('temp', 'Temp', ' °C')],
    ['Frec. cardiaca', vital('fc', 'FC', ' lpm')],
    ['Peso', vital('peso', 'Peso', ' kg')],
    ['Talla', vital('talla', 'Talla', ' m')],
  ]
  autoTable(doc, {
    startY,
    theme: 'grid',
    margin: { left: M, right: M },
    head: [[vitals.map(([label]) => label)]],
    body: [[vitals.map(([, value]) => ({ content: value, styles: { fontStyle: 'bold', fontSize: 9.5 } }))]],
    headStyles: { fillColor: C.primaryDark, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.6, textColor: C.text, lineColor: C.border, lineWidth: 0.15, halign: 'center' },
  })
  let y = doc.lastAutoTable.finalY + 3

  const extra = [
    ['Alergias', triage.alergias || '—'],
    ['Motivo de triaje', triage.motivo || '—'],
  ]
  if (triage.observaciones && triage.observaciones !== '—') extra.push(['Observaciones', triage.observaciones])
  if (triage.nurseName) extra.push(['Registrado por', `${triage.nurseName}${triage.at ? ' · ' + triage.at : ''}`])

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    margin: { left: M, right: M },
    body: extra.map(([k, v]) => [
      { content: k, styles: { fontStyle: 'bold', textColor: C.muted } },
      v,
    ]),
    styles: { fontSize: 8, cellPadding: 2.6, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
    columnStyles: { 0: { cellWidth: 38 } },
  })
  return doc.lastAutoTable.finalY + 4
}

// ——— Caja de diagnóstico ———
function diagBox(doc, diag, startY) {
  autoTable(doc, {
    startY,
    theme: 'grid',
    margin: { left: M, right: M },
    body: [
      [
        { content: 'DIAGNÓSTICO' + (diag.severity ? ` · ${diag.severity.toUpperCase()}` : ''), styles: { fontStyle: 'bold', fontSize: 8.5, textColor: C.primaryDark } },
        { content: diag.dx || '—', styles: { fontStyle: 'bold', fontSize: 9.5, textColor: C.primary } },
      ],
    ],
    styles: { fontSize: 8, cellPadding: 3, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
  })
  let y = doc.lastAutoTable.finalY + 2.5
  if (diag.notes) {
    const lines = doc.splitTextToSize(diag.notes, PAGE_W - M * 2 - 8)
    doc.setFillColor(...C.primarySoft)
    doc.rect(M, y - 1.5, PAGE_W - M * 2, lines.length * 4 + 5, 'F')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...C.muted)
    doc.text('OBSERVACIONES CLÍNICAS / INDICACIONES', M + 4, y + 2)
    doc.setFont(FONT, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.text)
    doc.text(lines, M + 4, y + 7)
    y += lines.length * 4 + 9
  }
  return y
}

// ——— Firma del médico ———
function signature(doc, doctor, y) {
  if (y > 252) {
    doc.addPage()
    drawHeader(doc, { compact: true })
    y = 40
  }
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.35)
  doc.line(M, y, 70, y)
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...C.text)
  doc.text(doctor?.name || 'Médico tratante', M, y + 4.5)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...C.muted)
  doc.text('Firma del médico tratante', M, y + 8.5)
}

// ——— PDF individual de una atención ———
export function buildAppointmentPdf({ appt, patient, doctor, spec, room }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const docId = `RA-${appt.id}`
  const filename = `resumen-atencion-${slugify(patient?.name || appt.id)}-${appt.id}.pdf`

  doc.setProperties({
    title: `Resumen de atención ${appt.id} — ${CLINIC.legalName}`,
    subject: `Historia clínica de ${patient?.name || ''}`,
    creator: CLINIC.system,
  })

  let y = drawHeader(doc)
  y = drawTitle(doc, 'RESUMEN DE ATENCIÓN CLÍNICA', docId)
  y = patientBox(doc, patient, y)
  y = section(doc, 'Datos de la atención', y)
  y = apptBox(doc, appt, doctor, spec, room, y)

  if (appt.diag) {
    if (y > 210) {
      doc.addPage()
      y = drawHeader(doc, { compact: true }) + 10
    }
    y = section(doc, 'Diagnóstico y observaciones', y)
    y = diagBox(doc, appt.diag, y)
  }

  if (appt.triage) {
    if (y > 180) {
      doc.addPage()
      y = drawHeader(doc, { compact: true }) + 10
    }
    y = section(doc, 'Triaje de enfermería', y)
    y = triageBox(doc, appt.triage, y)
  }

  signature(doc, doctor, y + 10)

  return { doc, docId, filename }
}

export function generateAppointmentPdf(opts) {
  const { doc, docId, filename } = buildAppointmentPdf(opts)
  doc.save(filename)
  return { filename, docId }
}

// ——— PDF del historial clínico completo (o ficha del paciente) ———
export function buildClinicalRecordPdf({ patient, rows, title = 'HISTORIA CLÍNICA', filename, doctors = [], specialties = [], consultorios = [] }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const docId = `HC-${slugify(patient?.name || 'paciente').slice(0, 10).toUpperCase()}-${rows.length}`
  const safeName = filename || `historia-clinica-${slugify(patient?.name || 'paciente')}.pdf`

  doc.setProperties({
    title: `${title} de ${patient?.name || ''} — ${CLINIC.legalName}`,
    subject: `Historial clínico de ${patient?.name || ''}`,
    creator: CLINIC.system,
  })

  const didDraw = (data) => {
    drawFooter(doc, docId)
    if (data.pageNumber > 1) drawHeader(doc, { compact: true })
  }

  let y = drawHeader(doc)
  y = drawTitle(doc, title, docId)
  y = patientBox(doc, patient, y)

  // ——— Tabla resumen ———
  y = section(doc, `Resumen de atenciones (${rows.length})`, y)
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, bottom: 22 },
    didDrawPage: didDraw,
    theme: 'grid',
    head: [['Fecha', 'Especialidad', 'Médico', 'Diagnóstico', 'Estado']],
    body: rows.map((a) => [
      fmtDateFull(a.date),
      findSpecialty(specialties, a.specialtyId)?.name || '—',
      findDoctor(doctors, a.doctorId)?.name || '—',
      a.diag?.dx || '—',
      STATUS_LABEL[a.status] || a.status,
    ]),
    headStyles: { fillColor: C.primaryDark, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.4, textColor: C.text, lineColor: C.border, lineWidth: 0.15 },
    alternateRowStyles: { fillColor: C.primarySoft },
    columnStyles: { 0: { cellWidth: 26 }, 1: { cellWidth: 32 }, 2: { cellWidth: 44 }, 4: { cellWidth: 24 } },
  })
  y = doc.lastAutoTable.finalY + 6

  // ——— Detalle por atención ———
  const ordered = [...rows].sort((a, b) => (a.date > b.date ? 1 : -1))
  ordered.forEach((a) => {
    if (y > 230) {
      doc.addPage()
      y = drawHeader(doc, { compact: true }) + 10
    }
    const spec = findSpecialty(specialties, a.specialtyId)
    const doctor = findDoctor(doctors, a.doctorId)
    const room = findConsultorio(consultorios, doctor?.consultorioId)
    y = section(doc, `Atención ${a.id} · ${fmtDateFull(a.date)} · ${spec?.name || ''}`, y)
    y = apptBox(doc, a, doctor, spec, room, y)
    if (a.diag) {
      if (y > 215) {
        doc.addPage()
        y = drawHeader(doc, { compact: true }) + 10
      }
      y = section(doc, 'Diagnóstico y observaciones', y)
      y = diagBox(doc, a.diag, y)
    }
    if (a.triage) {
      if (y > 185) {
        doc.addPage()
        y = drawHeader(doc, { compact: true }) + 10
      }
      y = section(doc, 'Triaje de enfermería', y)
      y = triageBox(doc, a.triage, y)
    }
    y += 4
  })

  // ——— Bloque de validación ———
  if (y > 250) {
    doc.addPage()
    y = drawHeader(doc, { compact: true }) + 10
  }
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, bottom: 22 },
    theme: 'plain',
    body: [[
      {
        content: [
          `Documento emitido por ${CLINIC.system} el ${todayLabel()}.`,
          `${CLINIC.legalName} · ${CLINIC.address} · Tel. ${CLINIC.phone} · RUC ${CLINIC.ruc}`,
          'Copia fiel del historial clínico digital. Documento sin valor legal fuera del sistema en el entorno de demostración.',
        ],
        styles: { fontSize: 7, textColor: C.muted },
      },
    ]],
    didDrawPage: didDraw,
  })

  return { doc, docId, filename: safeName }
}

export function generateClinicalRecordPdf(opts) {
  const { doc, docId, filename } = buildClinicalRecordPdf(opts)
  doc.save(filename)
  return { docId, filename }
}