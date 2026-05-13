'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Pencil, X, Loader2, AlertCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import QuickCreateActivoModal from '@/components/dashboard/QuickCreateActivoModal'

type ServicioEstado = 'INGRESADO' | 'EN PROCESO' | 'CANCELADO' | 'RECHAZADO' | 'TERMINADO' | 'PRESUPUESTADO'
type EstadoPago = 'PENDIENTE' | 'SIN CARGO' | 'GARANTIA' | 'PAGO PARCIAL' | 'PAGADO'
type TareaEstado = 'INICIADA' | 'EN PROCESO' | 'PAUSADA' | 'CANCELADA' | 'TERMINADA'
type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE' | 'OTRO'

type Tarea = {
  id: number
  servicio_id: number
  descripcion: string
  estado: TareaEstado
  created_at: string
}

type Pago = {
  id: number
  servicio_id: number
  monto: number
  fecha: string
  metodo: MetodoPago
  notas: string | null
  created_at: string
}

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
  clientes: { name: string } | null
  activos: { nombre: string } | null
  servicio_tareas: Tarea[]
  servicio_pagos: Pago[]
}

type ClienteSimple = { id: number; name: string }
type ActivoSimple = { id: number; nombre: string; cliente_id: number }

const ESTADOS: ServicioEstado[] = ['INGRESADO', 'EN PROCESO', 'CANCELADO', 'RECHAZADO', 'TERMINADO', 'PRESUPUESTADO']
const ESTADOS_PAGO: EstadoPago[] = ['PENDIENTE', 'SIN CARGO', 'GARANTIA', 'PAGO PARCIAL', 'PAGADO']
const TAREA_ESTADOS: TareaEstado[] = ['INICIADA', 'EN PROCESO', 'PAUSADA', 'CANCELADA', 'TERMINADA']
const METODOS: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']

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

const TAREA_COLORS: Record<TareaEstado, { bg: string; text: string }> = {
  INICIADA:     { bg: '#E3F2FD', text: '#1565C0' },
  'EN PROCESO': { bg: '#FFF3E0', text: '#E65100' },
  PAUSADA:      { bg: '#F3E8FF', text: '#7C3AED' },
  CANCELADA:    { bg: `${theme.colors.error}14`, text: theme.colors.error },
  TERMINADA:    { bg: `${theme.colors.success}18`, text: theme.colors.success },
}

const editSchema = z.object({
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().nullable().optional(),
  estado: z.enum(['INGRESADO', 'EN PROCESO', 'CANCELADO', 'RECHAZADO', 'TERMINADO', 'PRESUPUESTADO']),
  estado_pago: z.enum(['PENDIENTE', 'SIN CARGO', 'GARANTIA', 'PAGO PARCIAL', 'PAGADO']),
  valor: z.number().min(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
})
type EditForm = z.infer<typeof editSchema>

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: theme.fontSizes.sm,
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
const cardStyle = {
  backgroundColor: '#fff', borderRadius: theme.radii.md,
  border: `1px solid ${theme.colors.border}`, overflow: 'hidden', marginBottom: '20px',
}
const cardHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}`,
  backgroundColor: '#F8F9FB',
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>{children}</div>
    </div>
  )
}

function ModalCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}><X size={18} /></button>
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

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ padding: '3px 10px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export default function ServicioDetalleClient({
  initialServicio,
  clientes,
  activos,
  permisos,
}: {
  initialServicio: Servicio
  clientes: ClienteSimple[]
  activos: ActivoSimple[]
  permisos: ModulePermisos
}) {
  const [servicio, setServicio] = useState(initialServicio)
  const [tareas, setTareas] = useState<Tarea[]>(initialServicio.servicio_tareas ?? [])
  const [pagos, setPagos] = useState<Pago[]>(initialServicio.servicio_pagos ?? [])
  const [localActivos, setLocalActivos] = useState(activos)
  const [showEdit, setShowEdit] = useState(false)
  const [showQCActivo, setShowQCActivo] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // Tareas state
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [tareaLoading, setTareaLoading] = useState(false)
  const [tareaError, setTareaError] = useState<string | null>(null)
  const [deletingTareaId, setDeletingTareaId] = useState<number | null>(null)
  const [updatingTareaId, setUpdatingTareaId] = useState<number | null>(null)

  // Pagos state
  const [showAddPago, setShowAddPago] = useState(false)
  const [pagoMonto, setPagoMonto] = useState('')
  const [pagoFecha, setPagoFecha] = useState(new Date().toISOString().split('T')[0])
  const [pagoMetodo, setPagoMetodo] = useState<MetodoPago>('EFECTIVO')
  const [pagoNotas, setPagoNotas] = useState('')
  const [pagoLoading, setPagoLoading] = useState(false)
  const [pagoError, setPagoError] = useState<string | null>(null)
  const [deletingPagoId, setDeletingPagoId] = useState<number | null>(null)

  const activosFiltrados = localActivos.filter((a) => a.cliente_id === servicio.cliente_id)

  const handleActivoCreado = (a: { id: number; nombre: string; cliente_id: number }) => {
    setLocalActivos((prev) => [...prev, a].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    editForm.setValue('activo_id', a.id)
    setShowQCActivo(false)
  }

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      activo_id: servicio.activo_id,
      titulo: servicio.titulo,
      descripcion: servicio.descripcion ?? '',
      estado: servicio.estado,
      estado_pago: servicio.estado_pago,
      valor: Number(servicio.valor),
      fecha: servicio.fecha ?? new Date().toISOString().split('T')[0],
    },
  })

  const openEdit = () => {
    editForm.reset({
      activo_id: servicio.activo_id,
      titulo: servicio.titulo,
      descripcion: servicio.descripcion ?? '',
      estado: servicio.estado,
      estado_pago: servicio.estado_pago,
      valor: Number(servicio.valor),
      fecha: servicio.fecha ?? new Date().toISOString().split('T')[0],
    })
    setEditError(null)
    setShowEdit(true)
  }

  const onEditSubmit = async (data: EditForm) => {
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/servicios/${servicio.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setServicio((prev) => ({ ...prev, ...json }))
    setShowEdit(false)
  }

  // Tareas
  const agregarTarea = async () => {
    if (!nuevaTarea.trim()) return
    setTareaLoading(true)
    setTareaError(null)
    const res = await fetch(`/api/dashboard/servicios/${servicio.id}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion: nuevaTarea.trim() }),
    })
    const json = await res.json()
    setTareaLoading(false)
    if (!res.ok) { setTareaError(json.error); return }
    // If service was TERMINADO, backend reset it to EN PROCESO
    if (servicio.estado === 'TERMINADO') {
      setServicio((prev) => ({ ...prev, estado: 'EN PROCESO' as ServicioEstado }))
    }
    setTareas((prev) => [...prev, json])
    setNuevaTarea('')
  }

  const cambiarEstadoTarea = async (tarea: Tarea, estado: TareaEstado) => {
    setUpdatingTareaId(tarea.id)
    const res = await fetch(`/api/dashboard/servicios/${servicio.id}/tareas/${tarea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    const json = await res.json()
    setUpdatingTareaId(null)
    if (!res.ok) return
    const updatedTareas = tareas.map((t) => (t.id === tarea.id ? json : t))
    setTareas(updatedTareas)
    // Check if all are TERMINADA to update servicio estado locally
    if (updatedTareas.every((t) => t.estado === 'TERMINADA')) {
      setServicio((prev) => ({ ...prev, estado: 'TERMINADO' as ServicioEstado }))
    }
  }

  const eliminarTarea = async (tareaId: number) => {
    setDeletingTareaId(tareaId)
    const res = await fetch(`/api/dashboard/servicios/${servicio.id}/tareas/${tareaId}`, { method: 'DELETE' })
    setDeletingTareaId(null)
    if (!res.ok) return
    setTareas((prev) => prev.filter((t) => t.id !== tareaId))
  }

  // Pagos
  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
  const valor = Number(servicio.valor)
  const saldo = Math.max(0, valor - totalPagado)

  const agregarPago = async () => {
    const monto = parseFloat(pagoMonto)
    if (!monto || monto <= 0) { setPagoError('El monto debe ser mayor a 0'); return }
    setPagoLoading(true)
    setPagoError(null)
    const res = await fetch(`/api/dashboard/servicios/${servicio.id}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto, fecha: pagoFecha, metodo: pagoMetodo, notas: pagoNotas || undefined }),
    })
    const json = await res.json()
    setPagoLoading(false)
    if (!res.ok) { setPagoError(json.error); return }
    const nuevoPagos = [...pagos, json]
    setPagos(nuevoPagos)
    // Recalculate estado_pago locally (mirrors backend logic)
    if (servicio.estado_pago !== 'SIN CARGO' && servicio.estado_pago !== 'GARANTIA') {
      const nuevoTotal = nuevoPagos.reduce((s, p) => s + Number(p.monto), 0)
      const ep: EstadoPago = nuevoTotal === 0 ? 'PENDIENTE' : nuevoTotal >= valor ? 'PAGADO' : 'PAGO PARCIAL'
      setServicio((prev) => ({ ...prev, estado_pago: ep }))
    }
    setPagoMonto('')
    setPagoNotas('')
    setShowAddPago(false)
  }

  const eliminarPago = async (pagoId: number) => {
    setDeletingPagoId(pagoId)
    const res = await fetch(`/api/dashboard/servicios/${servicio.id}/pagos/${pagoId}`, { method: 'DELETE' })
    setDeletingPagoId(null)
    if (!res.ok) return
    const nuevosPagos = pagos.filter((p) => p.id !== pagoId)
    setPagos(nuevosPagos)
    if (servicio.estado_pago !== 'SIN CARGO' && servicio.estado_pago !== 'GARANTIA') {
      const nuevoTotal = nuevosPagos.reduce((s, p) => s + Number(p.monto), 0)
      const ep: EstadoPago = nuevoTotal === 0 ? 'PENDIENTE' : nuevoTotal >= valor ? 'PAGADO' : 'PAGO PARCIAL'
      setServicio((prev) => ({ ...prev, estado_pago: ep }))
    }
  }

  const todasTerminadas = tareas.length > 0 && tareas.every((t) => t.estado === 'TERMINADA')

  return (
    <>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link
          href="/dashboard/servicios"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textMuted, textDecoration: 'none', fontSize: theme.fontSizes.sm }}
        >
          <ArrowLeft size={15} /> Volver a Servicios
        </Link>
        {permisos.can_edit && (
          <button
            onClick={openEdit}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer', color: theme.colors.text }}
          >
            <Pencil size={13} /> Editar servicio
          </button>
        )}
      </div>

      {/* Info card */}
      <div style={cardStyle}>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
                {servicio.titulo}
              </h2>
              <p style={{ margin: '0 0 12px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                {servicio.clientes?.name ?? '—'}
                {servicio.activos ? ` · ${servicio.activos.nombre}` : ''}
                {servicio.fecha && ` · ${servicio.fecha.split('-').reverse().join('/')}`}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge label={servicio.estado} {...ESTADO_COLORS[servicio.estado]} />
                <Badge label={servicio.estado_pago} {...PAGO_COLORS[servicio.estado_pago]} />
                {todasTerminadas && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: theme.fontSizes.xs, color: theme.colors.success }}>
                    <CheckCircle2 size={13} /> Todas las tareas completadas
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', textAlign: 'right' }}>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Valor</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
                  ${valor.toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Pagado</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: totalPagado > 0 ? theme.colors.success : theme.colors.textMuted }}>
                  ${totalPagado.toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Saldo</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: saldo > 0 ? '#B45309' : theme.colors.success }}>
                  ${saldo.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>
          {servicio.descripcion && (
            <p style={{ margin: '16px 0 0', fontSize: theme.fontSizes.sm, color: theme.colors.text, lineHeight: '1.6', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '16px' }}>
              {servicio.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Tareas */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
            Tareas {tareas.length > 0 && <span style={{ color: theme.colors.textMuted, fontWeight: theme.fontWeights.regular }}>({tareas.length})</span>}
          </h3>
        </div>

        {tareas.length > 0 && (
          <div>
            {tareas.map((tarea) => (
              <div
                key={tarea.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${theme.colors.border}` }}
              >
                {permisos.can_edit ? (
                  <select
                    value={tarea.estado}
                    disabled={updatingTareaId === tarea.id}
                    onChange={(e) => cambiarEstadoTarea(tarea, e.target.value as TareaEstado)}
                    style={{ padding: '4px 8px', fontSize: theme.fontSizes.xs, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', cursor: 'pointer', color: TAREA_COLORS[tarea.estado].text }}
                  >
                    {TAREA_ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                ) : (
                  <span style={{ padding: '4px 8px', fontSize: theme.fontSizes.xs, borderRadius: theme.radii.sm, backgroundColor: TAREA_COLORS[tarea.estado].bg, color: TAREA_COLORS[tarea.estado].text }}>
                    {tarea.estado}
                  </span>
                )}
                <span style={{ flex: 1, fontSize: theme.fontSizes.sm, color: theme.colors.text }}>
                  {tarea.descripcion}
                </span>
                {permisos.can_delete && (
                  <button
                    onClick={() => eliminarTarea(tarea.id)}
                    disabled={deletingTareaId === tarea.id}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: '4px' }}
                  >
                    {deletingTareaId === tarea.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add task */}
        {permisos.can_create && (
          <div style={{ padding: '16px 20px' }}>
            {tareaError && <div style={{ marginBottom: '10px' }}><ErrorBox message={tareaError} /></div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarTarea() } }}
                placeholder="Descripción de la tarea..."
                style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
              />
              <button
                onClick={agregarTarea}
                disabled={tareaLoading || !nuevaTarea.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: tareaLoading || !nuevaTarea.trim() ? `${theme.colors.primary}66` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, cursor: tareaLoading || !nuevaTarea.trim() ? 'not-allowed' : 'pointer' }}
              >
                {tareaLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagos */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
            Pagos
          </h3>
          {permisos.can_create && (
            <button
              onClick={() => {
                if (!showAddPago) {
                  const saldo = Math.max(0, valor - totalPagado)
                  setPagoMonto(valor > 0 && saldo > 0 ? String(saldo) : '')
                }
                setShowAddPago((v) => !v)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, cursor: 'pointer' }}
            >
              <Plus size={13} /> Agregar pago
            </button>
          )}
        </div>

        {showAddPago && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: '#FAFAFA' }}>
            {pagoError && <div style={{ marginBottom: '10px' }}><ErrorBox message={pagoError} /></div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Monto <span style={{ color: theme.colors.error }}>*</span></label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pagoMonto}
                  onChange={(e) => setPagoMonto(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
                />
                {valor > 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                    Saldo: ${Math.max(0, valor - totalPagado).toLocaleString('es-AR')}
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Fecha</label>
                <input
                  type="date"
                  value={pagoFecha}
                  onChange={(e) => setPagoFecha(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
                />
              </div>
              <div>
                <label style={labelStyle}>Método</label>
                <select
                  value={pagoMetodo}
                  onChange={(e) => setPagoMetodo(e.target.value as MetodoPago)}
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm, backgroundColor: '#fff' }}
                >
                  {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notas (opcional)</label>
                <input
                  value={pagoNotas}
                  onChange={(e) => setPagoNotas(e.target.value)}
                  placeholder="Observaciones..."
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => { setShowAddPago(false); setPagoError(null) }}
                style={{ padding: '8px 16px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', fontSize: theme.fontSizes.sm }}
              >
                Cancelar
              </button>
              <button
                onClick={agregarPago}
                disabled={pagoLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', backgroundColor: pagoLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, cursor: pagoLoading ? 'not-allowed' : 'pointer' }}
              >
                {pagoLoading && <Loader2 size={13} className="animate-spin" />}
                Confirmar pago
              </button>
            </div>
          </div>
        )}

        {pagos.length === 0 && !showAddPago && (
          <p style={{ padding: '20px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, textAlign: 'center' }}>
            Sin pagos registrados
          </p>
        )}

        {pagos.length > 0 && (
          <>
            {pagos.map((pago) => (
              <div
                key={pago.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: `1px solid ${theme.colors.border}` }}
              >
                <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, minWidth: '80px' }}>
                  {pago.fecha}
                </span>
                <span style={{ padding: '2px 8px', backgroundColor: '#F3F4F6', color: theme.colors.text, borderRadius: theme.radii.sm, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium }}>
                  {pago.metodo}
                </span>
                <span style={{ fontWeight: theme.fontWeights.bold, color: theme.colors.text, fontSize: theme.fontSizes.sm, minWidth: '80px' }}>
                  ${Number(pago.monto).toLocaleString('es-AR')}
                </span>
                {pago.notas && (
                  <span style={{ flex: 1, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>{pago.notas}</span>
                )}
                {permisos.can_delete && (
                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      onClick={() => eliminarPago(pago.id)}
                      disabled={deletingPagoId === pago.id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: '4px' }}
                    >
                      {deletingPagoId === pago.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Total */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FB' }}>
              <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                Total pagado: <strong style={{ color: theme.colors.text }}>${totalPagado.toLocaleString('es-AR')}</strong> de ${valor.toLocaleString('es-AR')}
              </span>
              <Badge label={servicio.estado_pago} {...PAGO_COLORS[servicio.estado_pago]} />
            </div>
          </>
        )}
      </div>

      {showQCActivo && (
        <QuickCreateActivoModal
          onClose={() => setShowQCActivo(false)}
          onCreated={handleActivoCreado}
          clienteIdPreset={servicio.cliente_id}
          clientes={[]}
        />
      )}

      {/* Edit modal */}
      {showEdit && (
        <ModalOverlay onClose={() => setShowEdit(false)}>
          <ModalCard title="Editar servicio" onClose={() => setShowEdit(false)}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Activo (opcional)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        {...editForm.register('activo_id', { setValueAs: (v) => (v === '' || v === '0' || v === 0) ? null : Number(v) })}
                        style={{ ...inputStyle, flex: 1, backgroundColor: '#fff' }}
                      >
                        <option value="">Sin activo</option>
                        {activosFiltrados.map((a) => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                      <button type="button" title="Crear nuevo activo" onClick={() => setShowQCActivo(true)} style={quickAddBtnStyle}>
                        <Plus size={14} />
                      </button>
                    </div>
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
                    <textarea
                      {...editForm.register('descripcion')}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
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
                    {editForm.formState.errors.fecha && (
                      <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
                        {editForm.formState.errors.fecha.message}
                      </p>
                    )}
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
    </>
  )
}
