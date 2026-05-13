'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, AlertCircle, Loader2, Check, Mic, Search, X } from 'lucide-react'
import { theme } from '@/lib/theme'
import VoiceRecorder from '@/components/dashboard/VoiceRecorder'
import CatalogoCombobox from '@/components/dashboard/CatalogoCombobox'
import type { Remito, RemitoItem, OrigenDestino, Producto, ProductoConMatch } from '@/types/stock'
import type { ModulePermisos } from '@/lib/permisos'

function generarCodigo(): string {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const D = '0123456789'
  let c = ''
  for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * 26)]
  for (let i = 0; i < 4; i++) c += D[Math.floor(Math.random() * 10)]
  return c
}

const encabezadoSchema = z.object({
  tipo: z.enum(['entrada', 'salida']),
  numero_tipo: z.enum(['automatico', 'manual', 'proveedor']),
  numero: z.string().min(1, 'Requerido'),
  fecha: z.string().min(1, 'Requerido'),
  origen_destino_id: z.string().uuid().nullable().optional(),
  observaciones: z.string().nullable().optional(),
})
type EncabezadoForm = z.infer<typeof encabezadoSchema>

const origenSchema = z.object({
  tipo: z.enum(['proveedor', 'sucursal', 'deposito', 'cliente', 'otro']),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
})
type OrigenForm = z.infer<typeof origenSchema>

interface Props {
  remito: Remito
  origenes: OrigenDestino[]
  productos: Producto[]
  permisos: ModulePermisos
  initialMarcas: string[]
  initialRubros: string[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm,
  color: theme.colors.text, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted,
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em',
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '16px',
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: theme.radii.md,
      border: `1px solid ${theme.colors.border}`,
      marginBottom: theme.spacing.md, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: '#fafafa',
      }}>
        <h2 style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function formatFecha(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function ConfianzaBadge({ confianza }: { confianza?: number | null }) {
  if (confianza == null) return null
  const pct = Math.round(confianza * 100)
  const color = pct >= 70 ? theme.colors.success : pct >= 40 ? theme.colors.warning : theme.colors.error
  return (
    <span style={{
      padding: '2px 7px', borderRadius: theme.radii.full,
      fontSize: '11px', fontWeight: theme.fontWeights.medium,
      backgroundColor: `${color}18`, color,
    }}>
      {pct}%
    </span>
  )
}

function ProductoSearchPanel({
  productos,
  onSelect,
  onCrearNuevo,
  onClose,
}: {
  productos: Producto[]
  onSelect: (p: Producto) => Promise<void>
  onCrearNuevo: () => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [selecting, setSelecting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = query.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (p.codigo ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (p.marca ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : productos.slice(0, 12)

  async function handleSelect(p: Producto) {
    setSelecting(p.id)
    await onSelect(p)
    setSelecting(null)
  }

  return (
    <div style={{ marginBottom: '16px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: '#fafafa' }}>
        <Search size={15} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto por nombre, código o marca..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: theme.fontSizes.sm, color: theme.colors.text, background: 'transparent' }}
        />
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: '2px', display: 'flex' }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>
            Sin resultados
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => selecting ? undefined : handleSelect(p)}
              style={{
                padding: '10px 14px', cursor: selecting ? 'wait' : 'pointer',
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: selecting && selecting !== p.id ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!selecting) e.currentTarget.style.backgroundColor = '#f3f4f6' }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <div>
                <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text }}>
                  {p.nombre}
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  {p.marca && <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{p.marca}</span>}
                  {p.codigo && <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontFamily: 'monospace' }}>[{p.codigo}]</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                  Stock: {p.stock_actual} {p.unidad}
                </span>
                {selecting === p.id && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.colors.border}`, backgroundColor: '#fafafa' }}>
        <button
          onClick={onCrearNuevo}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: theme.colors.primary, fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.medium, padding: 0,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <Plus size={14} />
          Crear nuevo producto
        </button>
      </div>
    </div>
  )
}

type CrearProductoData = {
  nombre: string
  codigo: string
  marca: string
  rubro: string
  unidad: string
  costo: string
  precio_venta: string
}

export default function RemitoDetalleClient({
  remito: initialRemito,
  origenes: initialOrigenes,
  productos: initialProductos,
  permisos,
  initialMarcas,
  initialRubros,
}: Props) {
  const router = useRouter()
  const [remito, setRemito] = useState(initialRemito)
  const [items, setItems] = useState<RemitoItem[]>((initialRemito.remito_items as RemitoItem[]) ?? [])
  const [origenes, setOrigenes] = useState<OrigenDestino[]>(initialOrigenes)
  const [localProductos, setLocalProductos] = useState<Producto[]>(initialProductos)
  const [localMarcas, setLocalMarcas] = useState<string[]>(initialMarcas)
  const [localRubros, setLocalRubros] = useState<string[]>(initialRubros)

  const [savingEncabezado, setSavingEncabezado] = useState(false)
  const [encabezadoError, setEncabezadoError] = useState<string | null>(null)

  const [showConfirmar, setShowConfirmar] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const [showNuevoOrigen, setShowNuevoOrigen] = useState(false)
  const [creandoOrigen, setCreandoOrigen] = useState(false)
  const [origenError, setOrigenError] = useState<string | null>(null)

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [showVoice, setShowVoice] = useState(false)
  const [showProductSearch, setShowProductSearch] = useState(false)

  // Items detectados por voz con baja confianza, esperando decisión del usuario
  const [pendingVoiceItems, setPendingVoiceItems] = useState<ProductoConMatch[]>([])

  const [showCrearProducto, setShowCrearProducto] = useState(false)
  const [crearProductoData, setCrearProductoData] = useState<CrearProductoData>({
    nombre: '', codigo: generarCodigo(), marca: '', rubro: '', unidad: 'unidad', costo: '', precio_venta: '',
  })
  const [creandoProducto, setCreandoProducto] = useState(false)
  const [crearProductoError, setCrearProductoError] = useState<string | null>(null)

  const esBorrador = remito.estado === 'borrador'
  const canEdit = permisos.can_edit && esBorrador

  const {
    register: regEnc,
    handleSubmit: handleEnc,
    watch: watchEnc,
    formState: { errors: errEnc },
  } = useForm<EncabezadoForm>({
    resolver: zodResolver(encabezadoSchema),
    defaultValues: {
      tipo: remito.tipo,
      numero_tipo: remito.numero_tipo,
      numero: remito.numero,
      fecha: remito.fecha,
      origen_destino_id: remito.origen_destino_id ?? null,
      observaciones: remito.observaciones ?? '',
    },
  })

  const {
    register: regOrigen,
    handleSubmit: handleOrigen,
    reset: resetOrigen,
    formState: { errors: errOrigen },
  } = useForm<OrigenForm>({ resolver: zodResolver(origenSchema) })

  const tipoActual = watchEnc('tipo')
  const numeroTipoActual = watchEnc('numero_tipo')

  async function saveEncabezado(values: EncabezadoForm) {
    if (!canEdit) return
    setSavingEncabezado(true)
    setEncabezadoError(null)
    try {
      const res = await fetch(`/api/dashboard/remitos/${remito.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) { setEncabezadoError(json.error); return }
      setRemito(json)
    } finally {
      setSavingEncabezado(false)
    }
  }

  async function crearOrigen(values: OrigenForm) {
    setCreandoOrigen(true)
    setOrigenError(null)
    try {
      const res = await fetch('/api/dashboard/origenes-destinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) { setOrigenError(json.error); return }
      setOrigenes((prev) => [...prev, json].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setShowNuevoOrigen(false)
      resetOrigen()
    } finally {
      setCreandoOrigen(false)
    }
  }

  const handleVoiceItems = useCallback(async (voiceItems: ProductoConMatch[]) => {
    if (voiceItems.length === 0) return

    // Auto-insertar coincidencias con confianza >= 70% (exactas por código o por nombre con alta certeza)
    // Por debajo de 0.7 va al panel de confirmación para que el usuario decida
    const codeMatches = voiceItems.filter((vi) => !vi.es_producto_nuevo && vi.confianza >= 0.7)
    const pending = voiceItems.filter((vi) => vi.es_producto_nuevo || vi.confianza < 0.7)

    if (codeMatches.length > 0) {
      const payload = codeMatches.map((vi, i) => ({
        producto_id: vi.producto_match?.id ?? null,
        nombre_detectado: vi.nombre_detectado,
        cantidad: vi.cantidad,
        cantidad_asumida: vi.cantidad_asumida,
        unidad: vi.unidad ?? vi.producto_match?.unidad ?? 'unidad',
        costo: vi.costo ?? vi.producto_match?.costo ?? null,
        precio_venta: vi.precio_venta ?? vi.producto_match?.precio_venta ?? null,
        confianza: vi.confianza,
        es_producto_nuevo: false,
        orden: items.length + i,
      }))
      const res = await fetch(`/api/dashboard/remitos/${remito.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const json = await res.json()
        setItems((prev) => [...prev, ...(Array.isArray(json) ? json : [json])])
      }
    }

    if (pending.length > 0) {
      setPendingVoiceItems((prev) => [...prev, ...pending])
    }

    setShowVoice(false)
  }, [items.length, remito.id])

  async function selectProductoParaItem(p: Producto) {
    const res = await fetch(`/api/dashboard/remitos/${remito.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: p.id,
        nombre_detectado: p.nombre,
        cantidad: 1,
        cantidad_asumida: false,
        unidad: p.unidad,
        costo: p.costo ?? null,
        precio_venta: p.precio_venta ?? null,
        confianza: null,
        es_producto_nuevo: false,
        orden: items.length,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      const item = Array.isArray(json) ? json[0] : json
      setItems((prev) => [...prev, { ...item, productos: p }])
      setShowProductSearch(false)
    }
  }

  async function handleNewMarca(nombre: string) {
    await fetch('/api/dashboard/marcas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    })
    setLocalMarcas((prev) => prev.includes(nombre) ? prev : [...prev, nombre].sort())
  }

  async function handleNewRubro(nombre: string) {
    await fetch('/api/dashboard/rubros-productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    })
    setLocalRubros((prev) => prev.includes(nombre) ? prev : [...prev, nombre].sort())
  }

  async function handleCrearProducto() {
    if (!crearProductoData.nombre.trim()) return
    setCreandoProducto(true)
    setCrearProductoError(null)
    try {
      const res = await fetch('/api/dashboard/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: crearProductoData.nombre,
          codigo: crearProductoData.codigo || null,
          marca: crearProductoData.marca || null,
          rubro: crearProductoData.rubro || null,
          unidad: crearProductoData.unidad,
          costo: crearProductoData.costo ? parseFloat(crearProductoData.costo) : null,
          precio_venta: crearProductoData.precio_venta ? parseFloat(crearProductoData.precio_venta) : null,
          stock_actual: 0,
          activo: true,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setCrearProductoError(json.error); return }
      const newProduct: Producto = json
      setLocalProductos((prev) => [...prev, newProduct].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      if (crearProductoData.marca) setLocalMarcas((prev) => prev.includes(crearProductoData.marca) ? prev : [...prev, crearProductoData.marca].sort())
      if (crearProductoData.rubro) setLocalRubros((prev) => prev.includes(crearProductoData.rubro) ? prev : [...prev, crearProductoData.rubro].sort())
      await selectProductoParaItem(newProduct)
      setShowCrearProducto(false)
      setShowProductSearch(false)
    } finally {
      setCreandoProducto(false)
    }
  }

  function openCrearProducto(nombreInicial = '') {
    setCrearProductoData({ nombre: nombreInicial, codigo: generarCodigo(), marca: '', rubro: '', unidad: 'unidad', costo: '', precio_venta: '' })
    setCrearProductoError(null)
    setShowCrearProducto(true)
  }

  function descartarPendiente(index: number) {
    setPendingVoiceItems((prev) => prev.filter((_, i) => i !== index))
  }

  function crearDesddePendiente(vi: ProductoConMatch, index: number) {
    setPendingVoiceItems((prev) => prev.filter((_, i) => i !== index))
    openCrearProducto(vi.nombre_detectado)
  }

  async function usarCoincidenciaPendiente(vi: ProductoConMatch, index: number) {
    if (!vi.producto_match) return
    const res = await fetch(`/api/dashboard/remitos/${remito.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: vi.producto_match.id,
        nombre_detectado: vi.nombre_detectado,
        cantidad: vi.cantidad,
        cantidad_asumida: vi.cantidad_asumida,
        unidad: vi.unidad ?? vi.producto_match.unidad ?? 'unidad',
        costo: vi.costo ?? vi.producto_match.costo ?? null,
        precio_venta: vi.precio_venta ?? vi.producto_match.precio_venta ?? null,
        confianza: vi.confianza,
        es_producto_nuevo: false,
        orden: items.length,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      const item = Array.isArray(json) ? json[0] : json
      setItems((prev) => [...prev, { ...item, productos: vi.producto_match as Producto }])
      setPendingVoiceItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  async function updateItem(itemId: string, field: string, value: string | number | null) {
    const res = await fetch(`/api/dashboard/remitos/${remito.id}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      const json = await res.json()
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...json } : it)))
    }
  }

  async function deleteItem(itemId: string) {
    setDeletingItemId(itemId)
    try {
      const res = await fetch(`/api/dashboard/remitos/${remito.id}/items/${itemId}`, { method: 'DELETE' })
      if (res.ok) setItems((prev) => prev.filter((it) => it.id !== itemId))
    } finally {
      setDeletingItemId(null)
    }
  }

  async function confirmarRemito() {
    setConfirming(true)
    setConfirmError(null)
    try {
      const res = await fetch(`/api/dashboard/remitos/${remito.id}/confirmar`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) { setConfirmError(json.error); return }
      router.push('/dashboard/remitos')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div style={{ padding: theme.spacing.lg, maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: theme.spacing.lg }}>
        <button
          onClick={() => router.push('/dashboard/remitos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: '4px', display: 'flex' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
              {remito.numero}
            </h1>
            <span style={{
              padding: '3px 10px', borderRadius: theme.radii.full,
              fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
              backgroundColor: remito.estado === 'borrador' ? `${theme.colors.warning}18` : remito.estado === 'confirmado' ? `${theme.colors.success}18` : `${theme.colors.textMuted}18`,
              color: remito.estado === 'borrador' ? theme.colors.warning : remito.estado === 'confirmado' ? theme.colors.success : theme.colors.textMuted,
              textTransform: 'capitalize',
            }}>
              {remito.estado}
            </span>
          </div>
          {remito.confirmado_at && (
            <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: '2px 0 0' }}>
              Confirmado el {formatFecha(remito.confirmado_at.split('T')[0])}
            </p>
          )}
        </div>
      </div>

      {/* Encabezado */}
      <SectionCard title="Encabezado">
        <form onBlur={handleEnc(saveEncabezado)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Tipo *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['entrada', 'salida'] as const).map((t) => (
                  <label
                    key={t}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: theme.radii.sm, cursor: canEdit ? 'pointer' : 'default',
                      border: `2px solid ${tipoActual === t ? (t === 'entrada' ? theme.colors.success : theme.colors.error) : theme.colors.border}`,
                      backgroundColor: tipoActual === t ? (t === 'entrada' ? `${theme.colors.success}10` : `${theme.colors.error}10`) : '#fff',
                      fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
                      color: tipoActual === t ? (t === 'entrada' ? theme.colors.success : theme.colors.error) : theme.colors.textMuted,
                      flex: 1, justifyContent: 'center',
                    }}
                  >
                    <input type="radio" {...regEnc('tipo')} value={t} disabled={!canEdit} style={{ display: 'none' }} />
                    {t === 'entrada' ? '↓ Entrada de stock' : '↑ Salida de stock'}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Tipo de número</label>
              <select {...regEnc('numero_tipo')} disabled={!canEdit} style={inputStyle}>
                <option value="automatico">Automático</option>
                <option value="manual">Manual</option>
                <option value="proveedor">Número de proveedor</option>
              </select>
            </div>

            {(numeroTipoActual === 'manual' || numeroTipoActual === 'proveedor') && (
              <div>
                <label style={labelStyle}>{numeroTipoActual === 'proveedor' ? 'Nº de proveedor' : 'Número'}</label>
                <input {...regEnc('numero')} disabled={!canEdit} style={inputStyle} />
                {errEnc.numero && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{errEnc.numero.message}</p>}
              </div>
            )}

            <div>
              <label style={labelStyle}>Fecha *</label>
              <input type="date" {...regEnc('fecha')} disabled={!canEdit} style={inputStyle} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Origen / Destino</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select {...regEnc('origen_destino_id')} disabled={!canEdit} style={{ ...inputStyle, flex: 1 }}>
                  <option value="">Sin especificar</option>
                  {origenes.map((o) => (
                    <option key={o.id} value={o.id}>{o.nombre} ({o.tipo})</option>
                  ))}
                </select>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setShowNuevoOrigen(true)}
                    style={{
                      padding: '8px 12px', border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer',
                      color: theme.colors.textMuted, fontSize: theme.fontSizes.sm, whiteSpace: 'nowrap',
                    }}
                  >
                    + Nuevo
                  </button>
                )}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea
                {...regEnc('observaciones')}
                disabled={!canEdit}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          {encabezadoError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px 14px', backgroundColor: `${theme.colors.error}12`, borderRadius: theme.radii.sm }}>
              <AlertCircle size={15} color={theme.colors.error} />
              <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{encabezadoError}</span>
            </div>
          )}
          {savingEncabezado && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
              Guardando...
            </div>
          )}
        </form>
      </SectionCard>

      {/* Ítems */}
      <SectionCard title={`Ítems (${items.length})`}>
        {canEdit && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setShowVoice(!showVoice); setShowProductSearch(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                backgroundColor: showVoice ? `${theme.colors.primary}12` : '#fff',
                border: `1px solid ${showVoice ? theme.colors.primary : theme.colors.border}`,
                borderRadius: theme.radii.sm, cursor: 'pointer',
                fontSize: theme.fontSizes.sm, color: showVoice ? theme.colors.primary : theme.colors.text,
                fontWeight: theme.fontWeights.medium,
              }}
            >
              <Mic size={15} />
              Carga por voz
            </button>
            <button
              onClick={() => { setShowProductSearch(!showProductSearch); setShowVoice(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                backgroundColor: showProductSearch ? `${theme.colors.primary}12` : '#fff',
                border: `1px solid ${showProductSearch ? theme.colors.primary : theme.colors.border}`,
                borderRadius: theme.radii.sm, cursor: 'pointer',
                fontSize: theme.fontSizes.sm, color: showProductSearch ? theme.colors.primary : theme.colors.text,
              }}
            >
              <Plus size={15} />
              Agregar manualmente
            </button>
          </div>
        )}

        {showVoice && canEdit && (
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: theme.radii.sm }}>
            <VoiceRecorder remitoId={remito.id} onItemsDetected={handleVoiceItems} disabled={!esBorrador} />
          </div>
        )}

        {/* Panel de items pendientes de confirmación */}
        {pendingVoiceItems.length > 0 && canEdit && (
          <div style={{ marginBottom: '16px', border: `1px solid ${theme.colors.warning}`, borderRadius: theme.radii.sm, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', backgroundColor: `${theme.colors.warning}10`, borderBottom: `1px solid ${theme.colors.warning}` }}>
              <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.warning }}>
                Productos detectados — pendientes de confirmación ({pendingVoiceItems.length})
              </span>
            </div>
            {pendingVoiceItems.map((vi, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 14px',
                  borderBottom: index < pendingVoiceItems.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text }}>
                    &ldquo;{vi.nombre_detectado}&rdquo;
                  </span>
                  {vi.cantidad !== 1 && (
                    <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginLeft: '8px' }}>
                      × {vi.cantidad} {vi.unidad ?? ''}
                    </span>
                  )}
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {vi.producto_match ? (
                      <>
                        <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Posible coincidencia:</span>
                        <ConfianzaBadge confianza={vi.confianza} />
                        <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.text, fontWeight: theme.fontWeights.medium }}>
                          {vi.producto_match.nombre}
                          {vi.producto_match.codigo && (
                            <span style={{ fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '1px 4px', borderRadius: '2px', marginLeft: '4px', fontWeight: 'normal' }}>
                              [{vi.producto_match.codigo}]
                            </span>
                          )}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Sin coincidencia en catálogo</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {vi.producto_match && (
                    <button
                      onClick={() => usarCoincidenciaPendiente(vi, index)}
                      style={{
                        padding: '6px 12px', backgroundColor: theme.colors.success,
                        color: '#fff', border: 'none', borderRadius: theme.radii.sm,
                        fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, cursor: 'pointer',
                      }}
                    >
                      Usar esta coincidencia
                    </button>
                  )}
                  <button
                    onClick={() => crearDesddePendiente(vi, index)}
                    style={{
                      padding: '6px 12px', backgroundColor: theme.colors.primary,
                      color: '#fff', border: 'none', borderRadius: theme.radii.sm,
                      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, cursor: 'pointer',
                    }}
                  >
                    Crear producto
                  </button>
                  <button
                    onClick={() => descartarPendiente(index)}
                    style={{
                      padding: '6px 12px', backgroundColor: '#fff',
                      color: theme.colors.textMuted, border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.sm, fontSize: theme.fontSizes.xs, cursor: 'pointer',
                    }}
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showProductSearch && canEdit && (
          <ProductoSearchPanel
            productos={localProductos}
            onSelect={selectProductoParaItem}
            onCrearNuevo={() => openCrearProducto()}
            onClose={() => setShowProductSearch(false)}
          />
        )}

        {items.length === 0 ? (
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, textAlign: 'center', padding: '24px 0', margin: 0 }}>
            Sin ítems. Agregá productos por voz o manualmente.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.colors.border}` }}>Producto</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.colors.border}` }}>Cantidad</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.colors.border}` }}>Costo</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.colors.border}` }}>Precio venta</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.colors.border}` }}>Conf.</th>
                  {canEdit && <th style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}` }}></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: item.cantidad_asumida ? '#fffbeb' : undefined,
                      borderLeft: item.cantidad_asumida ? `3px solid ${theme.colors.warning}` : undefined,
                    }}
                  >
                    <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, verticalAlign: 'middle' }}>
                      {canEdit ? (
                        <div>
                          <input
                            defaultValue={item.productos?.nombre ?? item.nombre_detectado ?? ''}
                            onBlur={(e) => updateItem(item.id, 'nombre_detectado', e.target.value)}
                            style={{ ...inputStyle, fontSize: theme.fontSizes.sm, padding: '4px 8px' }}
                          />
                          {item.productos?.codigo && (
                            <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '11px', color: theme.colors.textMuted, fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>
                              {item.productos.codigo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium }}>
                              {item.productos?.nombre ?? item.nombre_detectado ?? '—'}
                            </span>
                            {item.productos?.codigo && (
                              <span style={{ fontSize: '11px', color: theme.colors.textMuted, fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                                {item.productos.codigo}
                              </span>
                            )}
                          </div>
                          {item.productos?.marca && (
                            <span style={{ display: 'block', fontSize: '11px', color: theme.colors.textMuted }}>
                              {item.productos.marca}
                            </span>
                          )}
                        </div>
                      )}
                      {item.cantidad_asumida && (
                        <span style={{ display: 'block', fontSize: '11px', color: theme.colors.warning, marginTop: '2px' }}>
                          ⚠ Cantidad asumida — verificar
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'right', verticalAlign: 'middle' }}>
                      {canEdit ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <input
                            type="number"
                            defaultValue={item.cantidad}
                            onBlur={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value))}
                            style={{ ...inputStyle, width: '80px', textAlign: 'right', padding: '4px 8px', fontSize: theme.fontSizes.sm }}
                            step="any" min="0"
                          />
                          <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{item.unidad}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: theme.fontSizes.sm }}>{item.cantidad} {item.unidad}</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'right', verticalAlign: 'middle' }}>
                      {canEdit ? (
                        <input
                          type="number"
                          defaultValue={item.costo ?? ''}
                          onBlur={(e) => updateItem(item.id, 'costo', e.target.value ? parseFloat(e.target.value) : null)}
                          style={{ ...inputStyle, width: '90px', textAlign: 'right', padding: '4px 8px', fontSize: theme.fontSizes.sm }}
                          step="any" min="0" placeholder="0.00"
                        />
                      ) : (
                        <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                          {item.costo != null ? `$${item.costo.toLocaleString('es-AR')}` : '—'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'right', verticalAlign: 'middle' }}>
                      {canEdit ? (
                        <input
                          type="number"
                          defaultValue={item.precio_venta ?? ''}
                          onBlur={(e) => updateItem(item.id, 'precio_venta', e.target.value ? parseFloat(e.target.value) : null)}
                          style={{ ...inputStyle, width: '90px', textAlign: 'right', padding: '4px 8px', fontSize: theme.fontSizes.sm }}
                          step="any" min="0" placeholder="0.00"
                        />
                      ) : (
                        <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                          {item.precio_venta != null ? `$${item.precio_venta.toLocaleString('es-AR')}` : '—'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'center', verticalAlign: 'middle' }}>
                      <ConfianzaBadge confianza={item.confianza} />
                    </td>
                    {canEdit && (
                      <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => deleteItem(item.id)}
                          disabled={deletingItemId === item.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.error, padding: '4px', opacity: deletingItemId === item.id ? 0.5 : 1 }}
                        >
                          {deletingItemId === item.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Confirmar */}
      {canEdit && items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowConfirmar(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px',
              backgroundColor: theme.colors.success, color: '#fff',
              border: 'none', borderRadius: theme.radii.sm,
              fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              cursor: 'pointer',
            }}
          >
            <Check size={16} />
            Confirmar remito
          </button>
        </div>
      )}

      {/* Modal confirmar */}
      {showConfirmar && (
        <ModalOverlay onClose={() => !confirming && setShowConfirmar(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, padding: '28px', width: '100%', maxWidth: '440px', boxShadow: theme.shadows.md }}>
            <h2 style={{ fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, margin: '0 0 12px' }}>
              Confirmar remito
            </h2>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, margin: '0 0 16px' }}>
              Esta acción es irreversible. Se actualizará el stock de los siguientes productos:
            </p>
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: theme.radii.sm, marginBottom: '16px' }}>
              <p style={{ fontSize: theme.fontSizes.sm, margin: '0 0 6px', fontWeight: theme.fontWeights.medium }}>
                {remito.numero} — {remito.tipo === 'entrada' ? 'Entrada' : 'Salida'} de {items.length} ítem{items.length !== 1 ? 's' : ''}
              </p>
              {(remito.origenes_destinos as OrigenDestino | null) && (
                <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: 0 }}>
                  {(remito.origenes_destinos as OrigenDestino).nombre}
                </p>
              )}
            </div>
            {confirmError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}12`, borderRadius: theme.radii.sm, marginBottom: '16px' }}>
                <AlertCircle size={15} color={theme.colors.error} />
                <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{confirmError}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmar(false)} disabled={confirming} style={{ padding: '9px 18px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', color: theme.colors.text, fontSize: theme.fontSizes.sm, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={confirmarRemito}
                disabled={confirming}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', backgroundColor: theme.colors.success, border: 'none', borderRadius: theme.radii.sm, color: '#fff', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: confirming ? 'not-allowed' : 'pointer', opacity: confirming ? 0.7 : 1 }}
              >
                {confirming && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                Confirmar y actualizar stock
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Modal nuevo origen/destino */}
      {showNuevoOrigen && (
        <ModalOverlay onClose={() => !creandoOrigen && setShowNuevoOrigen(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, padding: '24px', width: '100%', maxWidth: '400px', boxShadow: theme.shadows.md }}>
            <h2 style={{ fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, margin: '0 0 20px' }}>
              Nuevo origen / destino
            </h2>
            <form onSubmit={handleOrigen(crearOrigen)}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Tipo *</label>
                <select {...regOrigen('tipo')} style={inputStyle}>
                  <option value="proveedor">Proveedor</option>
                  <option value="sucursal">Sucursal</option>
                  <option value="deposito">Depósito</option>
                  <option value="cliente">Cliente</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Nombre *</label>
                <input {...regOrigen('nombre')} style={inputStyle} placeholder="Ej: Proveedor Central" />
                {errOrigen.nombre && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{errOrigen.nombre.message}</p>}
              </div>
              {origenError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}12`, borderRadius: theme.radii.sm, marginBottom: '16px' }}>
                  <AlertCircle size={15} color={theme.colors.error} />
                  <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{origenError}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNuevoOrigen(false)} style={{ padding: '9px 18px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', color: theme.colors.text, fontSize: theme.fontSizes.sm, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creandoOrigen} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', backgroundColor: theme.colors.primary, border: 'none', borderRadius: theme.radii.sm, color: '#fff', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: creandoOrigen ? 'not-allowed' : 'pointer', opacity: creandoOrigen ? 0.7 : 1 }}>
                  {creandoOrigen && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Crear
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* Modal crear producto nuevo */}
      {showCrearProducto && (
        <ModalOverlay onClose={() => !creandoProducto && setShowCrearProducto(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, padding: '24px', width: '100%', maxWidth: '480px', boxShadow: theme.shadows.md }}>
            <h2 style={{ fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, margin: '0 0 20px' }}>
              Nuevo producto
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nombre *</label>
                <input
                  value={crearProductoData.nombre}
                  onChange={(e) => setCrearProductoData((d) => ({ ...d, nombre: e.target.value }))}
                  style={inputStyle}
                  placeholder="Nombre del producto"
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Código</label>
                <input
                  value={crearProductoData.codigo}
                  onChange={(e) => setCrearProductoData((d) => ({ ...d, codigo: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  placeholder="ABCD1234"
                />
              </div>
              <div>
                <label style={labelStyle}>Unidad</label>
                <select
                  value={crearProductoData.unidad}
                  onChange={(e) => setCrearProductoData((d) => ({ ...d, unidad: e.target.value }))}
                  style={{ ...inputStyle, backgroundColor: '#fff' }}
                >
                  <option value="unidad">unidad</option>
                  <option value="kg">kg</option>
                  <option value="bolsa">bolsa</option>
                  <option value="caja">caja</option>
                  <option value="litro">litro</option>
                  <option value="metro">metro</option>
                  <option value="par">par</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Marca</label>
                <CatalogoCombobox
                  value={crearProductoData.marca}
                  onChange={(v) => setCrearProductoData((d) => ({ ...d, marca: v }))}
                  opciones={localMarcas}
                  onNewOption={handleNewMarca}
                  placeholder="Ej: Kingston, Logitech..."
                />
              </div>
              <div>
                <label style={labelStyle}>Rubro</label>
                <CatalogoCombobox
                  value={crearProductoData.rubro}
                  onChange={(v) => setCrearProductoData((d) => ({ ...d, rubro: v }))}
                  opciones={localRubros}
                  onNewOption={handleNewRubro}
                  placeholder="Ej: Periféricos, Almacenamiento..."
                />
              </div>
              <div>
                <label style={labelStyle}>Costo</label>
                <input
                  type="number"
                  value={crearProductoData.costo}
                  onChange={(e) => setCrearProductoData((d) => ({ ...d, costo: e.target.value }))}
                  style={inputStyle}
                  step="any" min="0" placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Precio venta</label>
                <input
                  type="number"
                  value={crearProductoData.precio_venta}
                  onChange={(e) => setCrearProductoData((d) => ({ ...d, precio_venta: e.target.value }))}
                  style={inputStyle}
                  step="any" min="0" placeholder="0.00"
                />
              </div>
            </div>

            {crearProductoError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}12`, borderRadius: theme.radii.sm, marginBottom: '16px' }}>
                <AlertCircle size={15} color={theme.colors.error} />
                <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{crearProductoError}</span>
              </div>
            )}

            <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: '0 0 16px' }}>
              El stock inicial será 0. Podés ajustarlo desde el módulo Productos.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCrearProducto(false)} disabled={creandoProducto} style={{ padding: '9px 18px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', color: theme.colors.text, fontSize: theme.fontSizes.sm, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={handleCrearProducto}
                disabled={creandoProducto || !crearProductoData.nombre.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', backgroundColor: theme.colors.primary, border: 'none', borderRadius: theme.radii.sm, color: '#fff', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: (creandoProducto || !crearProductoData.nombre.trim()) ? 'not-allowed' : 'pointer', opacity: (creandoProducto || !crearProductoData.nombre.trim()) ? 0.6 : 1 }}
              >
                {creandoProducto && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                Crear y agregar
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
