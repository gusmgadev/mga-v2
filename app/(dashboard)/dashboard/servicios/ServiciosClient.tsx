'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Loader2, AlertCircle, Eye, Pencil, Save } from 'lucide-react'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import QuickCreateClienteModal from '@/components/dashboard/QuickCreateClienteModal'
import QuickCreateActivoModal from '@/components/dashboard/QuickCreateActivoModal'

type ServicioEstado = 'INGRESADO' | 'EN PROCESO' | 'CANCELADO' | 'RECHAZADO' | 'TERMINADO' | 'PRESUPUESTADO'
type EstadoPago = 'PENDIENTE' | 'SIN CARGO' | 'GARANTIA' | 'PAGO PARCIAL' | 'PAGADO'

type Servicio = {
  id: number
  cliente_id: number
  activo_id: number | null
  titulo: string
  descripcion: string | null
  estado: ServicioEstado
  estado_pago: EstadoPago
  valor: number
  fecha: string | null
  created_at: string
  clientes: { nombre: string } | null
  activos: { nombre: string } | null
  totalPagado: number
}
type ClienteSimple = { id: number; nombre: string }
type ActivoSimple = { id: number; nombre: string; cliente_id: number }

const ESTADOS: ServicioEstado[] = ['INGRESADO', 'EN PROCESO', 'CANCELADO', 'RECHAZADO', 'TERMINADO', 'PRESUPUESTADO']
const ESTADOS_PAGO: EstadoPago[] = ['PENDIENTE', 'SIN CARGO', 'GARANTIA', 'PAGO PARCIAL', 'PAGADO']

const servicioSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['INGRESADO', 'EN PROCESO', 'CANCELADO', 'RECHAZADO', 'TERMINADO', 'PRESUPUESTADO']),
  estado_pago: z.enum(['PENDIENTE', 'SIN CARGO', 'GARANTIA', 'PAGO PARCIAL', 'PAGADO']),
  valor: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
})
type ServicioForm = z.infer<typeof servicioSchema>

const editSchema = z.object({
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['INGRESADO', 'EN PROCESO', 'CANCELADO', 'RECHAZADO', 'TERMINADO', 'PRESUPUESTADO']),
  estado_pago: z.enum(['PENDIENTE', 'SIN CARGO', 'GARANTIA', 'PAGO PARCIAL', 'PAGADO']),
  valor: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
})
type EditForm = z.infer<typeof editSchema>

const ESTADO_COLORS: Record<ServicioEstado, { bg: string; text: string }> = {
  INGRESADO:     { bg: '#E3F2FD', text: '#1565C0' },
  'EN PROCESO':  { bg: '#FFF3E0', text: '#E65100' },
  TERMINADO:     { bg: `${theme.colors.success}18`, text: theme.colors.success },
  CANCELADO:     { bg: `${theme.colors.error}14`, text: theme.colors.error },
  RECHAZADO:     { bg: `${theme.colors.textMuted}14`, text: theme.colors.textMuted },
  PRESUPUESTADO: { bg: '#F3E8FF', text: '#7C3AED' },
}

const PAGO_COLORS: Record<EstadoPago, { bg: string; text: string }> = {
  PAGADO:         { bg: `${theme.colors.success}18`, text: theme.colors.success },
  PENDIENTE:      { bg: `${theme.colors.warning}18`, text: '#B45309' },
  'PAGO PARCIAL': { bg: '#FFFBEB', text: '#92400E' },
  'SIN CARGO':    { bg: `${theme.colors.textMuted}14`, text: theme.colors.textMuted },
  GARANTIA:       { bg: '#E3F2FD', text: '#1565C0' },
}

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: theme.fontSizes.base,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: '6px',
}
const quickAddBtnStyle: React.CSSProperties = {
  padding: '10px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  backgroundColor: '#fff', cursor: 'pointer', color: theme.colors.primary,
  display: 'flex', alignItems: 'center', flexShrink: 0,
}
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: '#F8F9FB',
}
const tdStyle: React.CSSProperties = {
  padding: '14px 16px', fontSize: theme.fontSizes.sm, color: theme.colors.text,
  borderBottom: `1px solid ${theme.colors.border}`,
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>{children}</div>
    </div>
  )
}

function ModalCard({ title, onClose, children, formId }: { title: string; onClose: () => void; children: React.ReactNode; formId?: string }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {formId && (
            <button
              type="submit"
              form={formId}
              title="Guardar"
              style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.primary, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
            >
              <Save size={16} />
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}><X size={18} /></button>
        </div>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm }}>
      <AlertCircle size={14} style={{ flexShrink: 0 }} />{message}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: ServicioEstado }) {
  const { bg, text } = ESTADO_COLORS[estado]
  return (
    <span style={{ padding: '3px 10px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
      {estado}
    </span>
  )
}

function PagoBadge({ estado }: { estado: EstadoPago }) {
  const { bg, text } = PAGO_COLORS[estado]
  return (
    <span style={{ padding: '3px 10px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
      {estado}
    </span>
  )
}

function ServicioFormFields({
  form,
  clientes,
  setClientes,
  activos,
  setActivos,
}: {
  form: ReturnType<typeof useForm<ServicioForm>>
  clientes: ClienteSimple[]
  setClientes: React.Dispatch<React.SetStateAction<ClienteSimple[]>>
  activos: ActivoSimple[]
  setActivos: React.Dispatch<React.SetStateAction<ActivoSimple[]>>
}) {
  const [showQCCliente, setShowQCCliente] = useState(false)
  const [showQCActivo, setShowQCActivo] = useState(false)
  const clienteId = form.watch('cliente_id')
  const activosFiltrados = activos.filter((a) => a.cliente_id === clienteId)

  const handleClienteCreado = (c: { id: number; nombre: string }) => {
    setClientes((prev) => [...prev, c].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    form.setValue('cliente_id', c.id)
    setShowQCCliente(false)
  }

  const handleActivoCreado = (a: { id: number; nombre: string; cliente_id: number }) => {
    setActivos((prev) => [...prev, a].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    form.setValue('activo_id', a.id)
    setShowQCActivo(false)
  }

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Cliente <span style={{ color: theme.colors.error }}>*</span></label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <select
              {...form.register('cliente_id', { valueAsNumber: true })}
              style={{ ...inputStyle, flex: 1, backgroundColor: '#fff' }}
            >
              <option value={0}>Seleccioná un cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <button type="button" title="Crear nuevo cliente" onClick={() => setShowQCCliente(true)} style={quickAddBtnStyle}>
              <Plus size={14} />
            </button>
          </div>
          {form.formState.errors.cliente_id && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.cliente_id.message}
            </p>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Activo (opcional)</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <select
              {...form.register('activo_id', { setValueAs: (v) => (v === '' || v === '0' || v === 0) ? null : Number(v) })}
              style={{ ...inputStyle, flex: 1, backgroundColor: '#fff' }}
            >
              <option value="">Sin activo</option>
              {activosFiltrados.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            <button
              type="button"
              title={clienteId ? 'Crear nuevo activo' : 'Seleccioná primero un cliente'}
              onClick={() => setShowQCActivo(true)}
              disabled={!clienteId}
              style={{ ...quickAddBtnStyle, opacity: clienteId ? 1 : 0.35, cursor: clienteId ? 'pointer' : 'not-allowed' }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Título <span style={{ color: theme.colors.error }}>*</span></label>
          <input {...form.register('titulo')} style={inputStyle} placeholder="Ej: Reparación placa madre, Desarrollo módulo facturación..." />
          {form.formState.errors.titulo && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.titulo.message}
            </p>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Descripción</label>
          <textarea
            {...form.register('descripcion')}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Detalles del trabajo a realizar..."
          />
        </div>

        <div>
          <label style={labelStyle}>Estado</label>
          <select {...form.register('estado')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Estado de pago</label>
          <select {...form.register('estado_pago')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
            {ESTADOS_PAGO.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Valor ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            {...form.register('valor', { valueAsNumber: true })}
            style={inputStyle}
            placeholder="0.00"
          />
        </div>

        <div>
          <label style={labelStyle}>Fecha <span style={{ color: theme.colors.error }}>*</span></label>
          <input
            type="date"
            {...form.register('fecha')}
            style={inputStyle}
          />
          {form.formState.errors.fecha && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.fecha.message}
            </p>
          )}
        </div>
      </div>
    </div>
    {showQCCliente && (
      <QuickCreateClienteModal onClose={() => setShowQCCliente(false)} onCreated={handleClienteCreado} />
    )}
    {showQCActivo && (
      <QuickCreateActivoModal
        onClose={() => setShowQCActivo(false)}
        onCreated={handleActivoCreado}
        clienteIdPreset={clienteId || undefined}
        clientes={clientes}
      />
    )}
    </>
  )
}

export default function ServiciosClient({
  initialServicios,
  clientes,
  activos,
  filtros,
  permisos,
}: {
  initialServicios: Servicio[]
  clientes: ClienteSimple[]
  activos: ActivoSimple[]
  filtros: { cliente_id: number | null; estado: string | null; estado_pago: string | null }
  permisos: ModulePermisos
}) {
  const router = useRouter()
  const [servicios, setServicios] = useState(initialServicios)
  useEffect(() => { setServicios(initialServicios) }, [initialServicios])
  const [localClientes, setLocalClientes] = useState(clientes)
  const [localActivos, setLocalActivos] = useState(activos)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Servicio | null>(null)
  const [editTarget, setEditTarget] = useState<Servicio | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const createForm = useForm<ServicioForm>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      cliente_id: filtros.cliente_id ?? 0,
      activo_id: null,
      titulo: '',
      descripcion: '',
      estado: 'INGRESADO',
      estado_pago: 'PENDIENTE',
      valor: 0,
      fecha: new Date().toISOString().split('T')[0],
    },
  })
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { activo_id: null, titulo: '', descripcion: '', estado: 'INGRESADO', estado_pago: 'PENDIENTE', valor: 0, fecha: new Date().toISOString().split('T')[0] },
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const openCreate = () => {
    createForm.reset({
      cliente_id: filtros.cliente_id ?? 0,
      activo_id: null,
      titulo: '',
      descripcion: '',
      estado: 'INGRESADO',
      estado_pago: 'PENDIENTE',
      valor: 0,
      fecha: new Date().toISOString().split('T')[0],
    })
    setCreateError(null)
    setShowCreate(true)
  }

  const onCreateSubmit = async (data: ServicioForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    setServicios((prev) => sortByFecha([{ ...json, totalPagado: 0 }, ...prev]))
    setShowCreate(false)
  }

  const openEdit = (s: Servicio) => {
    editForm.reset({
      activo_id: s.activo_id,
      titulo: s.titulo,
      descripcion: s.descripcion ?? '',
      estado: s.estado,
      estado_pago: s.estado_pago,
      valor: Number(s.valor),
      fecha: s.fecha ?? new Date().toISOString().split('T')[0],
    })
    setEditError(null)
    setEditTarget(s)
  }

  const onEditSubmit = async (data: EditForm) => {
    if (!editTarget) return
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/servicios/${editTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setServicios((prev) => sortByFecha(prev.map((s) => {
      if (s.id !== editTarget.id) return s
      const nuevoActivo = data.activo_id
        ? (localActivos.find((a) => a.id === data.activo_id) ?? null)
        : null
      return { ...s, ...json, clientes: s.clientes, activos: nuevoActivo ? { nombre: nuevoActivo.nombre } : null, totalPagado: s.totalPagado }
    })))
    setEditTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/servicios/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setServicios((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const sortByFecha = (arr: Servicio[]) =>
    [...arr].sort((a, b) => (b.fecha ?? '0000-00-00').localeCompare(a.fecha ?? '0000-00-00'))

  const buildUrl = (overrides: Partial<typeof filtros>) => {
    const merged = { ...filtros, ...overrides }
    const params = new URLSearchParams()
    if (merged.cliente_id) params.set('cliente_id', String(merged.cliente_id))
    if (merged.estado) params.set('estado', merged.estado)
    if (merged.estado_pago) params.set('estado_pago', merged.estado_pago)
    const qs = params.toString()
    return `/dashboard/servicios${qs ? `?${qs}` : ''}`
  }

  const filterSelect = (key: keyof typeof filtros, value: string) => {
    router.push(buildUrl({ [key]: value || null }))
  }

  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return '—'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y.slice(2)}`
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={filtros.cliente_id ?? ''}
            onChange={(e) => filterSelect('cliente_id', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <select
            value={filtros.estado ?? ''}
            onChange={(e) => filterSelect('estado', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          <select
            value={filtros.estado_pago ?? ''}
            onChange={(e) => filterSelect('estado_pago', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todo estado pago</option>
            {ESTADOS_PAGO.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            {servicios.length} servicio{servicios.length !== 1 ? 's' : ''}
          </p>
        </div>

        {permisos.can_create && (
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
          >
            <Plus size={15} /> Agregar servicio
          </button>
        )}
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Título</th>
              <th style={thStyle}>Activo</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Pago</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Valor</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Pagado</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Saldo</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 && (
              <tr>
                <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay servicios registrados
                </td>
              </tr>
            )}
            {servicios.map((s) => {
              const totalPagado = s.totalPagado ?? 0
              const valor = Number(s.valor)
              const saldo = Math.max(0, valor - totalPagado)
              return (
              <tr key={s.id}>
                <td style={{ ...tdStyle, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>{formatFecha(s.fecha)}</td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{s.clientes?.nombre ?? '—'}</td>
                <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{s.titulo}</td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{s.activos?.nombre ?? '—'}</td>
                <td style={tdStyle}><EstadoBadge estado={s.estado} /></td>
                <td style={tdStyle}><PagoBadge estado={s.estado_pago} /></td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: theme.fontWeights.medium }}>
                  ${valor.toLocaleString('es-AR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: totalPagado > 0 ? theme.colors.success : theme.colors.textMuted }}>
                  ${totalPagado.toLocaleString('es-AR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: saldo > 0 ? '#B45309' : theme.colors.textMuted }}>
                  ${saldo.toLocaleString('es-AR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Link
                      href={`/dashboard/servicios/${s.id}`}
                      style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                    >
                      <Eye size={13} />
                    </Link>
                    {permisos.can_edit && (
                      <button
                        onClick={() => openEdit(s)}
                        style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {permisos.can_delete && (
                      <button
                        onClick={() => setDeleteTarget(s)}
                        style={{ background: 'none', border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <ModalOverlay onClose={() => setShowCreate(false)}>
          <ModalCard title="Nuevo servicio" onClose={() => setShowCreate(false)} formId="create-form">
            <form id="create-form" onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <ServicioFormFields form={createForm} clientes={localClientes} setClientes={setLocalClientes} activos={localActivos} setActivos={setLocalActivos} />
              {createError && <div style={{ marginTop: '14px' }}><ErrorBox message={createError} /></div>}
              <button
                type="submit"
                disabled={createLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: createLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: createLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {createLoading && <Loader2 size={15} className="animate-spin" />}
                {createLoading ? 'Guardando...' : 'Crear servicio'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <ModalCard title="Editar servicio" onClose={() => setEditTarget(null)} formId="edit-form">
            <form id="edit-form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Cliente</label>
                    <div style={{ padding: '10px 14px', backgroundColor: '#F8F9FB', borderRadius: theme.radii.sm, border: `1px solid ${theme.colors.border}`, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                      {editTarget.clientes?.nombre ?? '—'}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Activo (opcional)</label>
                    <select
                      {...editForm.register('activo_id', { setValueAs: (v) => (v === '' || v === '0' || v === 0) ? null : Number(v) })}
                      style={{ ...inputStyle, backgroundColor: '#fff' }}
                    >
                      <option value="">Sin activo</option>
                      {localActivos.filter((a) => a.cliente_id === editTarget.cliente_id).map((a) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Título <span style={{ color: theme.colors.error }}>*</span></label>
                    <input {...editForm.register('titulo')} style={inputStyle} />
                    {editForm.formState.errors.titulo && (
                      <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
                        {editForm.formState.errors.titulo.message}
                      </p>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea {...editForm.register('descripcion')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <div>
                    <label style={labelStyle}>Estado</label>
                    <select {...editForm.register('estado')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Estado de pago</label>
                    <select {...editForm.register('estado_pago')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                      {ESTADOS_PAGO.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Valor ($)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      {...editForm.register('valor', { valueAsNumber: true })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Fecha <span style={{ color: theme.colors.error }}>*</span></label>
                    <input
                      type="date"
                      {...editForm.register('fecha')}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {editError && <div style={{ marginTop: '14px' }}><ErrorBox message={editError} /></div>}
              <button
                type="submit"
                disabled={editLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: editLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: editLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {editLoading && <Loader2 size={15} className="animate-spin" />}
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <ModalCard title="Eliminar servicio" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás <strong>{deleteTarget.titulo}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Se eliminarán también todas las tareas y pagos asociados. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', fontSize: theme.fontSizes.sm }}>
                Cancelar
              </button>
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
    </>
  )
}
