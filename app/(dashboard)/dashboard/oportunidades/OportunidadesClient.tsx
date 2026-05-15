'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Search, Download, Eye, Pencil, Trash2, Wrench, FileText,
  X, Loader2, AlertCircle, ChevronDown, ChevronUp, Save, Check, History,
} from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import QuickCreateClienteModal from '@/components/dashboard/QuickCreateClienteModal'

type OportunidadEstado = 'NUEVA' | 'EN_SEGUIMIENTO' | 'CERRADA' | 'PERDIDA'
type TipoOp = 'OP_NUEVA' | 'SEGUIMIENTO' | 'CROSS_SELLING'

type Oportunidad = {
  id: number
  nro_tarea: number | null
  nro_oportunidad: number | null
  titulo: string | null
  registrada_por: string | null
  fecha_inicio: string | null
  fecha_vencimiento: string | null
  tipo_tarea: string | null
  cliente_codigo: string | null
  cliente_nombre: string | null
  origen: string | null
  tipo_oportunidad: string | null
  zona_gestion: string | null
  primer_nombre: string | null
  apellido: string | null
  empresa: string | null
  provincia_ciudad: string | null
  telefono: string | null
  email_contacto: string | null
  comentarios: string | null
  email_subject: string | null
  email_from: string | null
  email_fecha: string | null
  estado: OportunidadEstado
  notas: string | null
  servicio_id: number | null
  presupuesto_id: number | null
  tipo_op: TipoOp | null
  nro_oportunidad_origen: number | null
  created_at: string
}

type EmailResult = {
  uid: number
  messageId: string
  subject: string
  from: string
  date: string
  snippet: string
  body: string
}

type ClienteSimple = { id: number; nombre: string }

type TipoContacto = 'telefono' | 'whatsapp' | 'mail' | 'presencial' | 'otro'

type Iteracion = {
  id: number
  oportunidad_id: number
  fecha: string
  contacto: string | null
  detalle: string | null
  tipo_contacto: TipoContacto
  created_at: string
}

const TIPO_CONTACTO_LABELS: Record<TipoContacto, string> = {
  telefono: 'Teléfono',
  whatsapp: 'WhatsApp',
  mail: 'Mail',
  presencial: 'Presencial',
  otro: 'Otro',
}
const TIPO_CONTACTO_COLORS: Record<TipoContacto, { bg: string; text: string }> = {
  telefono:   { bg: '#E3F2FD', text: '#1565C0' },
  whatsapp:   { bg: '#E8F5E9', text: '#2E7D32' },
  mail:       { bg: '#FFF3E0', text: '#E65100' },
  presencial: { bg: '#F3E8FF', text: '#7C3AED' },
  otro:       { bg: '#F1F5F9', text: '#475569' },
}

const ESTADOS: OportunidadEstado[] = ['NUEVA', 'EN_SEGUIMIENTO', 'CERRADA', 'PERDIDA']
const ESTADO_LABELS: Record<OportunidadEstado, string> = {
  NUEVA: 'Nueva',
  EN_SEGUIMIENTO: 'En seguimiento',
  CERRADA: 'Cerrada',
  PERDIDA: 'Perdida',
}
const ESTADO_COLORS: Record<OportunidadEstado, { bg: string; text: string }> = {
  NUEVA: { bg: '#E3F2FD', text: '#1565C0' },
  EN_SEGUIMIENTO: { bg: '#FFF3E0', text: '#E65100' },
  CERRADA: { bg: `${theme.colors.success}18`, text: theme.colors.success },
  PERDIDA: { bg: `${theme.colors.error}14`, text: theme.colors.error },
}

const TIPO_OP_LABELS: Record<TipoOp, string> = {
  OP_NUEVA: 'Nueva',
  SEGUIMIENTO: 'Seguimiento',
  CROSS_SELLING: 'Cross Selling',
}
const TIPO_OP_COLORS: Record<TipoOp, { bg: string; text: string }> = {
  OP_NUEVA: { bg: '#E3F2FD', text: '#1565C0' },
  SEGUIMIENTO: { bg: '#FFF3E0', text: '#E65100' },
  CROSS_SELLING: { bg: '#E8F5E9', text: '#2E7D32' },
}
const TIPO_OP_KEYWORDS: Record<TipoOp, string> = {
  OP_NUEVA: 'Contactar con el cliente',
  SEGUIMIENTO: 'Seguimiento de potencial cliente',
  CROSS_SELLING: 'Cross Selling de Cliente',
}

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: theme.fontSizes.sm,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
  backgroundColor: '#fff',
}
const labelStyle = {
  display: 'block', fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, marginBottom: '4px',
}
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '10px 14px', fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: '#F8F9FB',
}
const tdStyle: React.CSSProperties = {
  padding: '12px 14px', fontSize: theme.fontSizes.sm, color: theme.colors.text,
  borderBottom: `1px solid ${theme.colors.border}`,
}

function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function ModalCard({ title, onClose, children, formId }: { title: string; onClose: () => void; children: React.ReactNode; formId?: string }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {formId && (
            <button type="submit" form={formId} title="Guardar"
              style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.primary, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
              <Save size={15} />
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}><X size={18} /></button>
        </div>
      </div>
      <div style={{ padding: '22px' }}>{children}</div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm }}>
      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />{message}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: OportunidadEstado }) {
  const { bg, text } = ESTADO_COLORS[estado]
  return (
    <span style={{ padding: '3px 10px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
      {ESTADO_LABELS[estado]}
    </span>
  )
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text }}>{value ?? '—'}</p>
    </div>
  )
}

const genServicioSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  valor: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
type GenServicioForm = z.infer<typeof genServicioSchema>

const genPresupuestoSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  fecha_vencimiento: z.string().optional().nullable(),
})
type GenPresupuestoForm = z.infer<typeof genPresupuestoSchema>

export default function OportunidadesClient({
  initialOportunidades,
  clientes,
  permisos,
}: {
  initialOportunidades: Oportunidad[]
  clientes: ClienteSimple[]
  permisos: ModulePermisos
}) {
  const [oportunidades, setOportunidades] = useState(initialOportunidades)
  useEffect(() => { setOportunidades(initialOportunidades) }, [initialOportunidades])

  const [localClientes, setLocalClientes] = useState(clientes)

  // Search panel
  const [searchOpen, setSearchOpen] = useState(true)
  const [tipoBusqueda, setTipoBusqueda] = useState<TipoOp>('OP_NUEVA')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [remitente, setRemitente] = useState('zlavisos@zoologic.com.ar')
  const [asunto, setAsunto] = useState('Avisos ZL')
  const [palabrasClave, setPalabrasClave] = useState(TIPO_OP_KEYWORDS['OP_NUEVA'])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [emailResults, setEmailResults] = useState<EmailResult[]>([])
  const [searchTotal, setSearchTotal] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [extracting, setExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<{ procesados: number; duplicados: number; errores: number; errorDetails?: string[] } | null>(null)

  // Table filters
  const [filterEstado, setFilterEstado] = useState('')
  const [filterTipo, setFilterTipo] = useState('')

  // Modals
  const [viewTarget, setViewTarget] = useState<Oportunidad | null>(null)
  const [editTarget, setEditTarget] = useState<Oportunidad | null>(null)
  const [editEstado, setEditEstado] = useState<OportunidadEstado>('NUEVA')
  const [editNotas, setEditNotas] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Oportunidad | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Historial de iteraciones
  const [historialTarget, setHistorialTarget] = useState<Oportunidad | null>(null)
  const [iteraciones, setIteraciones] = useState<Iteracion[]>([])
  const [loadingIteraciones, setLoadingIteraciones] = useState(false)
  const [iteracionFecha, setIteracionFecha] = useState(new Date().toISOString().split('T')[0])
  const [iteracionTipo, setIteracionTipo] = useState<TipoContacto>('telefono')
  const [iteracionContacto, setIteracionContacto] = useState('')
  const [iteracionDetalle, setIteracionDetalle] = useState('')
  const [savingIteracion, setSavingIteracion] = useState(false)
  const [iteracionError, setIteracionError] = useState<string | null>(null)

  const openHistorial = async (op: Oportunidad) => {
    setHistorialTarget(op)
    setIteraciones([])
    setIteracionError(null)
    setIteracionFecha(new Date().toISOString().split('T')[0])
    setIteracionTipo('telefono')
    setIteracionContacto('')
    setIteracionDetalle('')
    setLoadingIteraciones(true)
    const res = await fetch(`/api/dashboard/oportunidades/${op.id}/iteraciones`)
    setLoadingIteraciones(false)
    if (res.ok) setIteraciones(await res.json())
  }

  const saveIteracion = async () => {
    if (!historialTarget) return
    setSavingIteracion(true)
    setIteracionError(null)
    const res = await fetch(`/api/dashboard/oportunidades/${historialTarget.id}/iteraciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha: iteracionFecha,
        tipo_contacto: iteracionTipo,
        contacto: iteracionContacto || null,
        detalle: iteracionDetalle || null,
      }),
    })
    const json = await res.json()
    setSavingIteracion(false)
    if (!res.ok) { setIteracionError(json.error); return }
    setIteraciones((prev) => [json, ...prev])
    setIteracionDetalle('')
    setIteracionContacto('')
    setIteracionFecha(new Date().toISOString().split('T')[0])
  }

  const deleteIteracion = async (iteracionId: number) => {
    if (!historialTarget) return
    const res = await fetch(`/api/dashboard/oportunidades/${historialTarget.id}/iteraciones/${iteracionId}`, { method: 'DELETE' })
    if (res.ok) setIteraciones((prev) => prev.filter((i) => i.id !== iteracionId))
  }

  // Generate service/presupuesto
  const [genServicioTarget, setGenServicioTarget] = useState<Oportunidad | null>(null)
  const [genPresupuestoTarget, setGenPresupuestoTarget] = useState<Oportunidad | null>(null)
  const [showQCCliente, setShowQCCliente] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const servicioForm = useForm<GenServicioForm>({
    resolver: zodResolver(genServicioSchema),
    defaultValues: { cliente_id: 0, titulo: '', descripcion: '', valor: 0, fecha: new Date().toISOString().split('T')[0] },
  })
  const presupuestoForm = useForm<GenPresupuestoForm>({
    resolver: zodResolver(genPresupuestoSchema),
    defaultValues: { cliente_id: 0, titulo: '', descripcion: '', fecha_vencimiento: '' },
  })

  const buildPreDesc = (op: Oportunidad) => {
    const parts = []
    if (op.nro_oportunidad) parts.push(`Nro OP: ${op.nro_oportunidad}`)
    if (op.nro_tarea) parts.push(`Nro Tarea: ${op.nro_tarea}`)
    if (op.telefono) parts.push(`Tel: ${op.telefono}`)
    if (op.email_contacto) parts.push(`Mail: ${op.email_contacto}`)
    if (op.zona_gestion) parts.push(`Zona: ${op.zona_gestion}`)
    if (op.origen) parts.push(`Origen: ${op.origen}`)
    if (op.comentarios) parts.push(`\nComentarios: ${op.comentarios}`)
    return parts.join(' | ')
  }

  const openGenServicio = (op: Oportunidad) => {
    const nombre = [op.primer_nombre, op.apellido].filter(Boolean).join(' ') || op.empresa || ''
    servicioForm.reset({
      cliente_id: 0,
      titulo: op.titulo ? `${op.titulo}${nombre ? ' — ' + nombre : ''}` : `Contactar con el cliente${nombre ? ' — ' + nombre : ''}`,
      descripcion: buildPreDesc(op),
      valor: 0,
      fecha: new Date().toISOString().split('T')[0],
    })
    setGenError(null)
    setGenServicioTarget(op)
  }

  const openGenPresupuesto = (op: Oportunidad) => {
    const nombre = [op.primer_nombre, op.apellido].filter(Boolean).join(' ') || op.empresa || ''
    presupuestoForm.reset({
      cliente_id: 0,
      titulo: op.titulo ? `${op.titulo}${nombre ? ' — ' + nombre : ''}` : `Presupuesto${nombre ? ' — ' + nombre : ''}`,
      descripcion: buildPreDesc(op),
      fecha_vencimiento: '',
    })
    setGenError(null)
    setGenPresupuestoTarget(op)
  }

  const handleClienteCreado = (c: { id: number; nombre: string }) => {
    setLocalClientes((prev) => [...prev, c].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    if (genServicioTarget) servicioForm.setValue('cliente_id', c.id)
    if (genPresupuestoTarget) presupuestoForm.setValue('cliente_id', c.id)
    setShowQCCliente(false)
  }

  // Search emails via IMAP
  const handleSearch = async () => {
    if (!desde && !hasta && !remitente && !asunto && !palabrasClave) {
      setSearchError('Ingresá al menos un criterio de búsqueda')
      return
    }
    setSearching(true)
    setSearchError(null)
    setEmailResults([])
    setSelectedIds(new Set())
    setExtractResult(null)

    const res = await fetch('/api/dashboard/oportunidades/buscar-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desde, hasta, remitente, asunto, palabrasClave }),
    })
    const json = await res.json()
    setSearching(false)
    if (!res.ok) { setSearchError(json.error); return }
    setEmailResults(json.emails)
    setSearchTotal(json.total)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === emailResults.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(emailResults.map((e) => e.messageId)))
  }

  const handleExtract = async () => {
    const selected = emailResults.filter((e) => selectedIds.has(e.messageId))
    if (selected.length === 0) return
    setExtracting(true)
    setExtractResult(null)
    const res = await fetch('/api/dashboard/oportunidades/extraer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: selected, tipo_op: tipoBusqueda }),
    })
    const json = await res.json()
    setExtracting(false)
    if (!res.ok) { setSearchError(json.error); return }
    setExtractResult(json)
    // Refresh table
    if (json.procesados > 0) {
      const listRes = await fetch('/api/dashboard/oportunidades')
      if (listRes.ok) setOportunidades(await listRes.json())
    }
  }

  const openEdit = (op: Oportunidad) => {
    setEditEstado(op.estado)
    setEditNotas(op.notas ?? '')
    setEditError(null)
    setEditTarget(op)
  }

  const saveEdit = async () => {
    if (!editTarget) return
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/oportunidades/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: editEstado, notas: editNotas }),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setOportunidades((prev) => prev.map((o) => o.id === editTarget.id ? { ...o, estado: editEstado, notas: editNotas } : o))
    setEditTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/oportunidades/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) { const j = await res.json(); setGlobalError(j.error); setDeleteTarget(null); return }
    setOportunidades((prev) => prev.filter((o) => o.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const onGenServicioSubmit = async (data: GenServicioForm) => {
    if (!genServicioTarget) return
    setGenLoading(true)
    setGenError(null)
    const res = await fetch('/api/dashboard/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, estado: 'INGRESADO', estado_pago: 'PENDIENTE' }),
    })
    const json = await res.json()
    if (!res.ok) { setGenError(json.error); setGenLoading(false); return }

    // Link servicio to oportunidad
    await fetch(`/api/dashboard/oportunidades/${genServicioTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicio_id: json.id }),
    })
    setOportunidades((prev) => prev.map((o) => o.id === genServicioTarget.id ? { ...o, servicio_id: json.id } : o))
    setGenLoading(false)
    setGenServicioTarget(null)
  }

  const onGenPresupuestoSubmit = async (data: GenPresupuestoForm) => {
    if (!genPresupuestoTarget) return
    setGenLoading(true)
    setGenError(null)
    const res = await fetch('/api/dashboard/presupuestos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        estado: 'BORRADOR',
        fecha: new Date().toISOString().split('T')[0],
        fecha_vencimiento: data.fecha_vencimiento || null,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setGenError(json.error); setGenLoading(false); return }

    // Link presupuesto to oportunidad
    await fetch(`/api/dashboard/oportunidades/${genPresupuestoTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presupuesto_id: json.id }),
    })
    setOportunidades((prev) => prev.map((o) => o.id === genPresupuestoTarget.id ? { ...o, presupuesto_id: json.id } : o))
    setGenLoading(false)
    setGenPresupuestoTarget(null)
  }

  const formatDate = (s: string | null | undefined) => {
    if (!s) return '—'
    const dateStr = s.includes('T') ? s.split('T')[0] : s
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y.slice(2)}`
  }

  const filtered = oportunidades
    .filter((o) =>
      (!filterEstado || o.estado === filterEstado) &&
      (!filterTipo || (o.tipo_op ?? 'OP_NUEVA') === filterTipo)
    )
    .sort((a, b) => {
      const da = a.fecha_inicio ?? a.created_at
      const db = b.fecha_inicio ?? b.created_at
      return db.localeCompare(da)
    })

  const actionBtnStyle: React.CSSProperties = {
    background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
    cursor: 'pointer', color: theme.colors.textMuted, padding: '4px 7px', display: 'flex', alignItems: 'center',
  }

  return (
    <>
      {/* Search panel */}
      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, marginBottom: '20px' }}>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text }}>
            <Mail size={15} style={{ color: theme.colors.primary }} />
            Buscar en correos
          </div>
          {searchOpen ? <ChevronUp size={15} color={theme.colors.textMuted} /> : <ChevronDown size={15} color={theme.colors.textMuted} />}
        </button>

        {searchOpen && (
          <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${theme.colors.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={labelStyle}>Tipo de OP</label>
                <select
                  value={tipoBusqueda}
                  onChange={(e) => {
                    const t = e.target.value as TipoOp
                    setTipoBusqueda(t)
                    setPalabrasClave(TIPO_OP_KEYWORDS[t])
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="OP_NUEVA">OP Nueva</option>
                  <option value="SEGUIMIENTO">Seguimiento</option>
                  <option value="CROSS_SELLING">Cross Selling</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Desde</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Hasta</label>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Remitente</label>
                <input type="text" value={remitente} onChange={(e) => setRemitente(e.target.value)} placeholder="email o dominio" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Asunto</label>
                <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="palabras del asunto" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Palabras clave en texto</label>
                <input type="text" value={palabrasClave} onChange={(e) => setPalabrasClave(e.target.value)} placeholder="ej: oportunidad tarea" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSearch}
                disabled={searching}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: searching ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: searching ? 'not-allowed' : 'pointer' }}
              >
                {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {searching ? 'Buscando...' : 'Buscar correos'}
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: extracting ? `${theme.colors.success}99` : theme.colors.success, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: extracting ? 'not-allowed' : 'pointer' }}
                >
                  {extracting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {extracting ? 'Extrayendo...' : `Extraer ${selectedIds.size} seleccionado${selectedIds.size !== 1 ? 's' : ''}`}
                </button>
              )}

              {searchTotal !== null && !searching && (
                <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                  {searchTotal > 50 ? `${searchTotal} encontrados — mostrando los últimos 50` : `${searchTotal} correo${searchTotal !== 1 ? 's' : ''} encontrado${searchTotal !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>

            {searchError && <div style={{ marginTop: '10px' }}><ErrorBox message={searchError} /></div>}

            {extractResult && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ padding: '10px 14px', backgroundColor: `${theme.colors.success}18`, border: `1px solid ${theme.colors.success}`, borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, color: theme.colors.success, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} />
                  {extractResult.procesados} importado{extractResult.procesados !== 1 ? 's' : ''}
                  {extractResult.duplicados > 0 && `, ${extractResult.duplicados} duplicado${extractResult.duplicados !== 1 ? 's' : ''} omitido${extractResult.duplicados !== 1 ? 's' : ''}`}
                  {extractResult.errores > 0 && `, ${extractResult.errores} con error`}
                </div>
                {extractResult.errorDetails && extractResult.errorDetails.length > 0 && (
                  <div style={{ marginTop: '6px', padding: '10px 14px', backgroundColor: `${theme.colors.error}10`, border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm }}>
                    {extractResult.errorDetails.map((d, i) => (
                      <p key={i} style={{ fontSize: theme.fontSizes.xs, color: theme.colors.error, margin: i > 0 ? '4px 0 0' : '0', fontFamily: 'monospace' }}>{d}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Email results list */}
            {emailResults.length > 0 && (
              <div style={{ marginTop: '16px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#F8F9FB', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === emailResults.length && emailResults.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedIds.size === 0 ? 'Seleccionar todos' : `${selectedIds.size} seleccionado${selectedIds.size !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {emailResults.map((email) => (
                  <div
                    key={email.messageId}
                    onClick={() => toggleSelect(email.messageId)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px',
                      borderBottom: `1px solid ${theme.colors.border}`, cursor: 'pointer',
                      backgroundColor: selectedIds.has(email.messageId) ? `${theme.colors.primary}08` : '#fff',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(email.messageId)}
                      onChange={() => toggleSelect(email.messageId)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, margin: 0 }}>{email.subject}</p>
                        <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: 0, whiteSpace: 'nowrap' }}>{formatDate(email.date)}</p>
                      </div>
                      <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: '2px 0' }}>{email.from}</p>
                      <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.snippet}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            style={{ padding: '8px 12px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los tipos</option>
            <option value="OP_NUEVA">OP Nueva</option>
            <option value="SEGUIMIENTO">Seguimiento</option>
            <option value="CROSS_SELLING">Cross Selling</option>
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{ padding: '8px 12px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
          </select>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            {filtered.length} oportunidad{filtered.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      {/* Oportunidades table */}
      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nro OP</th>
                <th style={thStyle}>Nro Tarea</th>
                <th style={thStyle}>Fecha inicio</th>
                <th style={thStyle}>Contacto</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Zona</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                    No hay oportunidades registradas
                  </td>
                </tr>
              )}
              {filtered.map((op) => {
                const nombre = [op.primer_nombre, op.apellido].filter(Boolean).join(' ') || '—'
                return (
                  <tr key={op.id}>
                    <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{op.nro_oportunidad ?? '—'}</td>
                    <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{op.nro_tarea ?? '—'}</td>
                    <td style={{ ...tdStyle, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>{formatDate(op.fecha_inicio)}</td>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontWeight: theme.fontWeights.medium }}>{nombre}</p>
                      {op.empresa && <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{op.empresa}</p>}
                    </td>
                    <td style={{ ...tdStyle, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>{op.telefono ?? '—'}</td>
                    <td style={{ ...tdStyle, color: theme.colors.textMuted, fontSize: theme.fontSizes.xs }}>{op.email_contacto ?? '—'}</td>
                    <td style={{ ...tdStyle, color: theme.colors.textMuted, fontSize: theme.fontSizes.xs }}>{op.zona_gestion ?? '—'}</td>
                    <td style={tdStyle}>
                      {(() => {
                        const t = (op.tipo_op ?? 'OP_NUEVA') as TipoOp
                        const { bg, text } = TIPO_OP_COLORS[t]
                        return (
                          <span style={{ padding: '3px 8px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
                            {TIPO_OP_LABELS[t]}
                          </span>
                        )
                      })()}
                    </td>
                    <td style={tdStyle}><EstadoBadge estado={op.estado} /></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                        <button onClick={() => setViewTarget(op)} style={actionBtnStyle} title="Ver detalle"><Eye size={13} /></button>
                        <button onClick={() => openHistorial(op)} style={{ ...actionBtnStyle, color: '#7C3AED' }} title="Historial de contactos"><History size={13} /></button>
                        {permisos.can_edit && (
                          <button onClick={() => openEdit(op)} style={actionBtnStyle} title="Editar estado / notas"><Pencil size={13} /></button>
                        )}
                        {permisos.can_create && !op.servicio_id && (
                          <button onClick={() => openGenServicio(op)} style={{ ...actionBtnStyle, color: '#1565C0' }} title="Crear servicio"><Wrench size={13} /></button>
                        )}
                        {permisos.can_create && !op.presupuesto_id && (
                          <button onClick={() => openGenPresupuesto(op)} style={{ ...actionBtnStyle, color: '#7C3AED' }} title="Crear presupuesto"><FileText size={13} /></button>
                        )}
                        {permisos.can_delete && (
                          <button onClick={() => setDeleteTarget(op)} style={{ ...actionBtnStyle, borderColor: `${theme.colors.error}44`, color: theme.colors.error }} title="Eliminar"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View modal */}
      {viewTarget && (
        <ModalOverlay>
          <ModalCard title={`Oportunidad #${viewTarget.nro_oportunidad ?? viewTarget.id}`} onClose={() => setViewTarget(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Sección OP origen para Seguimiento y Cross Selling */}
              {viewTarget.nro_oportunidad_origen && (viewTarget.tipo_op === 'SEGUIMIENTO' || viewTarget.tipo_op === 'CROSS_SELLING') && (() => {
                const origen = oportunidades.find((o) => o.nro_oportunidad === viewTarget.nro_oportunidad_origen)
                const tipoLabel = viewTarget.tipo_op === 'CROSS_SELLING' ? 'Cross Selling de' : 'Seguimiento de'
                return (
                  <div style={{ padding: '12px 14px', backgroundColor: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: theme.radii.sm }}>
                    <p style={{ fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      {tipoLabel} OP #{viewTarget.nro_oportunidad_origen}
                    </p>
                    {origen ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <Field label="Contacto" value={[origen.primer_nombre, origen.apellido].filter(Boolean).join(' ') || origen.empresa} />
                        <Field label="Empresa" value={origen.empresa} />
                        <Field label="Teléfono" value={origen.telefono} />
                        <Field label="Email" value={origen.email_contacto} />
                        <Field label="Zona" value={origen.zona_gestion} />
                        <Field label="Estado actual" value={ESTADO_LABELS[origen.estado]} />
                      </div>
                    ) : (
                      <p style={{ fontSize: theme.fontSizes.sm, color: '#1D4ED8' }}>OP #{viewTarget.nro_oportunidad_origen} (no disponible en el período actual)</p>
                    )}
                  </div>
                )
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Nro Oportunidad" value={viewTarget.nro_oportunidad} />
                <Field label="Nro Tarea" value={viewTarget.nro_tarea} />
                <Field label="Título" value={viewTarget.titulo} />
                <Field label="Registrada por" value={viewTarget.registrada_por} />
                <Field label="Fecha inicio" value={formatDate(viewTarget.fecha_inicio)} />
                <Field label="Fecha vencimiento" value={formatDate(viewTarget.fecha_vencimiento)} />
                <Field label="Tipo de tarea" value={viewTarget.tipo_tarea} />
                <Field label="Estado" value={ESTADO_LABELS[viewTarget.estado]} />
              </div>
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
                <p style={{ fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Datos del contacto</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Nombre" value={[viewTarget.primer_nombre, viewTarget.apellido].filter(Boolean).join(' ')} />
                  <Field label="Empresa" value={viewTarget.empresa} />
                  <Field label="Teléfono" value={viewTarget.telefono} />
                  <Field label="Email" value={viewTarget.email_contacto} />
                  <Field label="Provincia / Ciudad" value={viewTarget.provincia_ciudad} />
                  <Field label="Zona de gestión" value={viewTarget.zona_gestion} />
                  <Field label="Cliente CRM" value={viewTarget.cliente_codigo && viewTarget.cliente_nombre ? `${viewTarget.cliente_codigo} - ${viewTarget.cliente_nombre}` : (viewTarget.cliente_nombre ?? null)} />
                  <Field label="Origen" value={viewTarget.origen} />
                  <Field label="Tipo de oportunidad" value={viewTarget.tipo_oportunidad} />
                </div>
                {viewTarget.comentarios && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Comentarios</p>
                    <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text, whiteSpace: 'pre-wrap' }}>{viewTarget.comentarios}</p>
                  </div>
                )}
              </div>
              {viewTarget.notas && (
                <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
                  <p style={{ fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Notas internas</p>
                  <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text, whiteSpace: 'pre-wrap' }}>{viewTarget.notas}</p>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
                <p style={{ fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Mail origen</p>
                <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Asunto: {viewTarget.email_subject ?? '—'}</p>
                <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>De: {viewTarget.email_from ?? '—'}</p>
                <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Fecha: {formatDate(viewTarget.email_fecha)}</p>
              </div>
              {(viewTarget.servicio_id || viewTarget.presupuesto_id) && (
                <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {viewTarget.servicio_id && (
                    <span style={{ fontSize: theme.fontSizes.xs, padding: '3px 10px', backgroundColor: '#E3F2FD', color: '#1565C0', borderRadius: theme.radii.full }}>
                      Servicio #{viewTarget.servicio_id} vinculado
                    </span>
                  )}
                  {viewTarget.presupuesto_id && (
                    <span style={{ fontSize: theme.fontSizes.xs, padding: '3px 10px', backgroundColor: '#F3E8FF', color: '#7C3AED', borderRadius: theme.radii.full }}>
                      Presupuesto #{viewTarget.presupuesto_id} vinculado
                    </span>
                  )}
                </div>
              )}
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Edit estado/notas modal */}
      {editTarget && (
        <ModalOverlay>
          <ModalCard title="Editar oportunidad" onClose={() => setEditTarget(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Estado</label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value as OportunidadEstado)}
                  style={{ ...inputStyle, fontSize: theme.fontSizes.base }}
                >
                  {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Notas internas</label>
                <textarea
                  value={editNotas}
                  onChange={(e) => setEditNotas(e.target.value)}
                  rows={4}
                  placeholder="Observaciones, próximos pasos, historial de contacto..."
                  style={{ ...inputStyle, resize: 'vertical', fontSize: theme.fontSizes.base }}
                />
              </div>
              {editError && <ErrorBox message={editError} />}
              <button
                onClick={saveEdit}
                disabled={editLoading}
                style={{ padding: '10px', backgroundColor: editLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: editLoading ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {editLoading && <Loader2 size={14} className="animate-spin" />}
                {editLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <ModalOverlay>
          <ModalCard title="Eliminar oportunidad" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás la oportunidad <strong>#{deleteTarget.nro_oportunidad ?? deleteTarget.id}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', fontSize: theme.fontSizes.sm }}>Cancelar</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '10px', backgroundColor: deleting ? `${theme.colors.error}99` : theme.colors.error, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: deleting ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Generar Servicio modal */}
      {genServicioTarget && (
        <ModalOverlay>
          <ModalCard title="Crear servicio desde oportunidad" onClose={() => setGenServicioTarget(null)} formId="gen-servicio-form">
            <form id="gen-servicio-form" onSubmit={servicioForm.handleSubmit(onGenServicioSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Cliente <span style={{ color: theme.colors.error }}>*</span></label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      {...servicioForm.register('cliente_id', { valueAsNumber: true })}
                      style={{ ...inputStyle, flex: 1, fontSize: theme.fontSizes.base }}
                    >
                      <option value={0}>Seleccioná un cliente...</option>
                      {localClientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowQCCliente(true)}
                      style={{ padding: '9px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', color: theme.colors.primary, display: 'flex', alignItems: 'center' }}>
                      +
                    </button>
                  </div>
                  {servicioForm.formState.errors.cliente_id && (
                    <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{servicioForm.formState.errors.cliente_id.message}</p>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Título <span style={{ color: theme.colors.error }}>*</span></label>
                  <input {...servicioForm.register('titulo')} style={{ ...inputStyle, fontSize: theme.fontSizes.base }} />
                  {servicioForm.formState.errors.titulo && (
                    <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{servicioForm.formState.errors.titulo.message}</p>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Descripción</label>
                  <textarea {...servicioForm.register('descripcion')} rows={4} style={{ ...inputStyle, resize: 'vertical', fontSize: theme.fontSizes.base }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Valor ($)</label>
                    <input type="number" min={0} step="0.01" {...servicioForm.register('valor', { valueAsNumber: true })} style={{ ...inputStyle, fontSize: theme.fontSizes.base }} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Fecha</label>
                    <input type="date" {...servicioForm.register('fecha')} style={{ ...inputStyle, fontSize: theme.fontSizes.base }} />
                  </div>
                </div>
                {genError && <ErrorBox message={genError} />}
                <button
                  type="submit"
                  disabled={genLoading}
                  style={{ padding: '11px', backgroundColor: genLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: genLoading ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {genLoading && <Loader2 size={14} className="animate-spin" />}
                  {genLoading ? 'Creando servicio...' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Generar Presupuesto modal */}
      {genPresupuestoTarget && (
        <ModalOverlay>
          <ModalCard title="Crear presupuesto desde oportunidad" onClose={() => setGenPresupuestoTarget(null)} formId="gen-presupuesto-form">
            <form id="gen-presupuesto-form" onSubmit={presupuestoForm.handleSubmit(onGenPresupuestoSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Cliente <span style={{ color: theme.colors.error }}>*</span></label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      {...presupuestoForm.register('cliente_id', { valueAsNumber: true })}
                      style={{ ...inputStyle, flex: 1, fontSize: theme.fontSizes.base }}
                    >
                      <option value={0}>Seleccioná un cliente...</option>
                      {localClientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowQCCliente(true)}
                      style={{ padding: '9px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', color: theme.colors.primary, display: 'flex', alignItems: 'center' }}>
                      +
                    </button>
                  </div>
                  {presupuestoForm.formState.errors.cliente_id && (
                    <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{presupuestoForm.formState.errors.cliente_id.message}</p>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Título <span style={{ color: theme.colors.error }}>*</span></label>
                  <input {...presupuestoForm.register('titulo')} style={{ ...inputStyle, fontSize: theme.fontSizes.base }} />
                  {presupuestoForm.formState.errors.titulo && (
                    <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{presupuestoForm.formState.errors.titulo.message}</p>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Descripción</label>
                  <textarea {...presupuestoForm.register('descripcion')} rows={4} style={{ ...inputStyle, resize: 'vertical', fontSize: theme.fontSizes.base }} />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: theme.fontSizes.sm }}>Fecha de vencimiento (opcional)</label>
                  <input type="date" {...presupuestoForm.register('fecha_vencimiento')} style={{ ...inputStyle, fontSize: theme.fontSizes.base }} />
                </div>
                {genError && <ErrorBox message={genError} />}
                <button
                  type="submit"
                  disabled={genLoading}
                  style={{ padding: '11px', backgroundColor: genLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: genLoading ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {genLoading && <Loader2 size={14} className="animate-spin" />}
                  {genLoading ? 'Creando presupuesto...' : 'Crear presupuesto'}
                </button>
              </div>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Historial de iteraciones modal */}
      {historialTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} color="#7C3AED" />
                  <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
                    Historial — Op #{historialTarget.nro_oportunidad ?? historialTarget.id}
                  </h2>
                </div>
                <button onClick={() => setHistorialTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Formulario nueva iteración */}
                <div style={{ backgroundColor: '#F8F9FB', borderRadius: theme.radii.sm, padding: '16px', border: `1px solid ${theme.colors.border}` }}>
                  <p style={{ margin: '0 0 12px', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Agregar contacto
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={labelStyle}>Fecha</label>
                      <input
                        type="date"
                        value={iteracionFecha}
                        onChange={(e) => setIteracionFecha(e.target.value)}
                        style={{ ...inputStyle, backgroundColor: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Tipo de contacto</label>
                      <select
                        value={iteracionTipo}
                        onChange={(e) => setIteracionTipo(e.target.value as TipoContacto)}
                        style={{ ...inputStyle, backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        {(Object.keys(TIPO_CONTACTO_LABELS) as TipoContacto[]).map((t) => (
                          <option key={t} value={t}>{TIPO_CONTACTO_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={labelStyle}>Contacto (nombre / cargo)</label>
                    <input
                      type="text"
                      value={iteracionContacto}
                      onChange={(e) => setIteracionContacto(e.target.value)}
                      placeholder="ej: Juan Pérez — Gerente"
                      style={{ ...inputStyle, backgroundColor: '#fff' }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Detalle</label>
                    <textarea
                      value={iteracionDetalle}
                      onChange={(e) => setIteracionDetalle(e.target.value)}
                      rows={3}
                      placeholder="Resultado del contacto, próximos pasos..."
                      style={{ ...inputStyle, backgroundColor: '#fff', resize: 'vertical' }}
                    />
                  </div>
                  {iteracionError && <div style={{ marginBottom: '10px' }}><ErrorBox message={iteracionError} /></div>}
                  <button
                    onClick={saveIteracion}
                    disabled={savingIteracion || !iteracionFecha}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '9px 16px',
                      backgroundColor: savingIteracion || !iteracionFecha ? `${theme.colors.primary}66` : theme.colors.primary,
                      color: '#fff', border: 'none', borderRadius: theme.radii.sm,
                      cursor: savingIteracion || !iteracionFecha ? 'not-allowed' : 'pointer',
                      fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
                    }}
                  >
                    {savingIteracion ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    {savingIteracion ? 'Guardando...' : 'Agregar'}
                  </button>
                </div>

                {/* Lista de iteraciones */}
                <div>
                  <p style={{ margin: '0 0 12px', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Historial ({iteraciones.length})
                  </p>
                  {loadingIteraciones && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                      <Loader2 size={18} className="animate-spin" style={{ color: theme.colors.textMuted }} />
                    </div>
                  )}
                  {!loadingIteraciones && iteraciones.length === 0 && (
                    <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, textAlign: 'center', padding: '16px 0' }}>
                      Sin contactos registrados
                    </p>
                  )}
                  {!loadingIteraciones && iteraciones.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {iteraciones.map((it) => {
                        const { bg, text } = TIPO_CONTACTO_COLORS[it.tipo_contacto]
                        return (
                          <div key={it.id} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, padding: '12px 14px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ padding: '2px 9px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
                                  {TIPO_CONTACTO_LABELS[it.tipo_contacto]}
                                </span>
                                <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>
                                  {formatDate(it.fecha)}
                                </span>
                                {it.contacto && (
                                  <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.text, fontWeight: theme.fontWeights.medium }}>
                                    {it.contacto}
                                  </span>
                                )}
                              </div>
                              {permisos.can_delete && (
                                <button
                                  onClick={() => deleteIteracion(it.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: '2px', display: 'flex', flexShrink: 0 }}
                                  title="Eliminar"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                            {it.detalle && (
                              <p style={{ margin: '8px 0 0', fontSize: theme.fontSizes.sm, color: theme.colors.text, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                {it.detalle}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQCCliente && (
        <QuickCreateClienteModal onClose={() => setShowQCCliente(false)} onCreated={handleClienteCreado} />
      )}
    </>
  )
}
