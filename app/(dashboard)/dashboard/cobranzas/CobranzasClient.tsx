'use client'

import { useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Loader2, AlertCircle, TrendingUp, TrendingDown, Wallet, CreditCard, Save } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'

type CobranzaTipo = 'CARGO' | 'PAGO' | 'NOTA_CREDITO'
type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE' | 'OTRO'

type Cobranza = {
  id: number
  cliente_id: number
  servicio_id: number | null
  tipo: CobranzaTipo
  concepto: string
  monto: number
  fecha: string
  metodo_pago: MetodoPago | null
  notas: string | null
  created_at: string
  clientes: { nombre: string } | null
  servicios: { titulo: string } | null
}

type ClienteSimple = { id: number; nombre: string }
type ServicioSimple = { id: number; titulo: string; cliente_id: number }

const TIPOS: { value: CobranzaTipo; label: string }[] = [
  { value: 'CARGO', label: 'Cargo' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'NOTA_CREDITO', label: 'Nota de crédito' },
]
const METODOS: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']

const cobranzaSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  servicio_id: z.number().int().positive().nullable().optional(),
  tipo: z.enum(['CARGO', 'PAGO', 'NOTA_CREDITO']),
  concepto: z.string().min(2, 'Mínimo 2 caracteres'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'Ingresá una fecha'),
  metodo_pago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']).nullable().optional(),
  notas: z.string().optional(),
})
type CobranzaForm = z.infer<typeof cobranzaSchema>

const TIPO_COLORS: Record<CobranzaTipo, { bg: string; text: string }> = {
  CARGO:        { bg: `${theme.colors.error}14`, text: theme.colors.error },
  PAGO:         { bg: `${theme.colors.success}18`, text: theme.colors.success },
  NOTA_CREDITO: { bg: '#E3F2FD', text: '#1565C0' },
}
const TIPO_LABELS: Record<CobranzaTipo, string> = {
  CARGO: 'Cargo',
  PAGO: 'Pago',
  NOTA_CREDITO: 'Nota de crédito',
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
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}>
            <X size={18} />
          </button>
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

function TipoBadge({ tipo }: { tipo: CobranzaTipo }) {
  const { bg, text } = TIPO_COLORS[tipo]
  return (
    <span style={{ padding: '3px 10px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
      {TIPO_LABELS[tipo]}
    </span>
  )
}

function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: '160px', backgroundColor: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.md, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <span style={{ fontSize: '1.35rem', fontWeight: theme.fontWeights.bold, color }}>${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  )
}

function CobranzaFormFields({
  form,
  clientes,
  servicios,
}: {
  form: ReturnType<typeof useForm<CobranzaForm>>
  clientes: ClienteSimple[]
  servicios: ServicioSimple[]
}) {
  const tipo = useWatch({ control: form.control, name: 'tipo' })
  const clienteId = useWatch({ control: form.control, name: 'cliente_id' })
  const serviciosFiltrados = servicios.filter((s) => s.cliente_id === clienteId)
  const mostrarMetodo = tipo === 'PAGO' || tipo === 'NOTA_CREDITO'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Cliente <span style={{ color: theme.colors.error }}>*</span></label>
          <select
            {...form.register('cliente_id', { valueAsNumber: true })}
            style={{ ...inputStyle, backgroundColor: '#fff' }}
          >
            <option value={0}>Seleccioná un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {form.formState.errors.cliente_id && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.cliente_id.message}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Tipo <span style={{ color: theme.colors.error }}>*</span></label>
          <select {...form.register('tipo')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Fecha <span style={{ color: theme.colors.error }}>*</span></label>
          <input type="date" {...form.register('fecha')} style={inputStyle} />
          {form.formState.errors.fecha && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.fecha.message}
            </p>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Concepto <span style={{ color: theme.colors.error }}>*</span></label>
          <input
            {...form.register('concepto')}
            style={inputStyle}
            placeholder="Ej: Servicio de mantenimiento, Pago a cuenta, Descuento..."
          />
          {form.formState.errors.concepto && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.concepto.message}
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Monto ($) <span style={{ color: theme.colors.error }}>*</span></label>
          <input
            type="number" min={0.01} step="0.01"
            {...form.register('monto', { valueAsNumber: true })}
            style={inputStyle} placeholder="0.00"
          />
          {form.formState.errors.monto && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.monto.message}
            </p>
          )}
        </div>

        {mostrarMetodo && (
          <div>
            <label style={labelStyle}>Método de pago</label>
            <select {...form.register('metodo_pago')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
              <option value="">Sin especificar</option>
              {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {serviciosFiltrados.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Servicio vinculado (opcional)</label>
            <select
              {...form.register('servicio_id', { setValueAs: (v) => (v === '' || v === '0' || v === 0) ? null : Number(v) })}
              style={{ ...inputStyle, backgroundColor: '#fff' }}
            >
              <option value="">Sin servicio — pago a cuenta</option>
              {serviciosFiltrados.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
            </select>
          </div>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notas (opcional)</label>
          <textarea
            {...form.register('notas')}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Observaciones adicionales..."
          />
        </div>

      </div>
    </div>
  )
}

export default function CobranzasClient({
  initialCobranzas,
  clientes,
  servicios,
  filtros,
  permisos,
}: {
  initialCobranzas: Cobranza[]
  clientes: ClienteSimple[]
  servicios: ServicioSimple[]
  filtros: { cliente_id: number | null; tipo: string | null }
  permisos: ModulePermisos
}) {
  const router = useRouter()
  const [cobranzas, setCobranzas] = useState(initialCobranzas)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cobranza | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  // Filtros de fecha (client-side)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  // Imputar pago a cuenta
  const [imputarTarget, setImputarTarget] = useState<Cobranza | null>(null)
  const [imputarServicioId, setImputarServicioId] = useState<string>('')
  const [imputarMonto, setImputarMonto] = useState('')
  const [imputarLoading, setImputarLoading] = useState(false)
  const [imputarError, setImputarError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const createForm = useForm<CobranzaForm>({
    resolver: zodResolver(cobranzaSchema),
    defaultValues: {
      cliente_id: filtros.cliente_id ?? 0,
      servicio_id: null,
      tipo: 'CARGO',
      concepto: '',
      monto: 0,
      fecha: today,
      metodo_pago: null,
      notas: '',
    },
  })

  const openCreate = () => {
    createForm.reset({
      cliente_id: filtros.cliente_id ?? 0,
      servicio_id: null,
      tipo: 'CARGO',
      concepto: '',
      monto: 0,
      fecha: today,
      metodo_pago: null,
      notas: '',
    })
    setCreateError(null)
    setShowCreate(true)
  }

  const onCreateSubmit = async (data: CobranzaForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/cobranzas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    setCobranzas((prev) => [json, ...prev])
    setShowCreate(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/cobranzas/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setCobranzas((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const abrirImputar = (c: Cobranza) => {
    setImputarTarget(c)
    setImputarServicioId('')
    setImputarMonto(String(Number(c.monto)))
    setImputarError(null)
  }

  const confirmarImputar = async () => {
    if (!imputarTarget) return
    const monto = parseFloat(imputarMonto)
    const servicioId = Number(imputarServicioId)
    if (!servicioId) { setImputarError('Seleccioná un servicio'); return }
    if (!monto || monto <= 0) { setImputarError('El monto debe ser mayor a 0'); return }
    if (monto > Number(imputarTarget.monto) + 0.01) { setImputarError('El monto supera el saldo disponible'); return }
    setImputarLoading(true)
    setImputarError(null)
    const res = await fetch(`/api/dashboard/cobranzas/${imputarTarget.id}/imputar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicio_id: servicioId, monto }),
    })
    const json = await res.json()
    setImputarLoading(false)
    if (!res.ok) { setImputarError(json.error); return }

    setCobranzas((prev) => {
      const sin = prev.filter((c) => c.id !== imputarTarget.id)
      const items: Cobranza[] = [json.pago_imputado]
      if (json.pago_restante) items.push(json.pago_restante)
      return [...items, ...sin]
    })
    setImputarTarget(null)
  }

  const buildUrl = (overrides: Partial<typeof filtros>) => {
    const merged = { ...filtros, ...overrides }
    const params = new URLSearchParams()
    if (merged.cliente_id) params.set('cliente_id', String(merged.cliente_id))
    if (merged.tipo) params.set('tipo', merged.tipo)
    const qs = params.toString()
    return `/dashboard/cobranzas${qs ? `?${qs}` : ''}`
  }

  const filterSelect = (key: keyof typeof filtros, value: string) => {
    router.push(buildUrl({ [key]: value || null }))
  }

  const formatFecha = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  // Filtrado por fecha client-side
  const cobranzasFiltradas = useMemo(() => {
    return cobranzas.filter((c) => {
      if (desde && c.fecha < desde) return false
      if (hasta && c.fecha > hasta) return false
      return true
    })
  }, [cobranzas, desde, hasta])

  const totalCargos = cobranzasFiltradas.filter((c) => c.tipo === 'CARGO').reduce((s, c) => s + Number(c.monto), 0)
  const totalPagado = cobranzasFiltradas.filter((c) => c.tipo !== 'CARGO').reduce((s, c) => s + Number(c.monto), 0)
  const saldo = totalCargos - totalPagado

  const clienteNombre = filtros.cliente_id
    ? clientes.find((c) => c.id === filtros.cliente_id)?.nombre
    : null

  const serviciosDelImputar = imputarTarget
    ? servicios.filter((s) => s.cliente_id === imputarTarget.cliente_id)
    : []

  return (
    <>
      {/* Resumen */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <SummaryCard
          label={clienteNombre ? `Cargos — ${clienteNombre}` : 'Total cargos'}
          value={totalCargos}
          color={theme.colors.error}
          icon={<TrendingUp size={16} />}
        />
        <SummaryCard
          label={clienteNombre ? `Pagado — ${clienteNombre}` : 'Total pagado'}
          value={totalPagado}
          color={theme.colors.success}
          icon={<TrendingDown size={16} />}
        />
        <SummaryCard
          label={clienteNombre ? `Saldo — ${clienteNombre}` : 'Saldo pendiente'}
          value={Math.abs(saldo)}
          color={saldo > 0 ? theme.colors.error : saldo < 0 ? theme.colors.success : theme.colors.textMuted}
          icon={<Wallet size={16} />}
        />
      </div>

      {saldo < 0 && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: `${theme.colors.success}14`, border: `1px solid ${theme.colors.success}`, borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, color: theme.colors.success }}>
          {clienteNombre ? `${clienteNombre} tiene` : 'Saldo'} a favor: ${Math.abs(saldo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}

      {/* Barra de filtros y acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={filtros.cliente_id ?? ''}
            onChange={(e) => filterSelect('cliente_id', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <select
            value={filtros.tipo ?? ''}
            onChange={(e) => filterSelect('tipo', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            title="Desde"
            style={{ padding: '8px 10px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', fontFamily: 'inherit', color: theme.colors.text }}
          />
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            title="Hasta"
            style={{ padding: '8px 10px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', fontFamily: 'inherit', color: theme.colors.text }}
          />
          {(desde || hasta) && (
            <button
              onClick={() => { setDesde(''); setHasta('') }}
              style={{ padding: '7px 10px', fontSize: theme.fontSizes.xs, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={11} /> Limpiar fechas
            </button>
          )}

          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            {cobranzasFiltradas.length} movimiento{cobranzasFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {permisos.can_create && (
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
          >
            <Plus size={15} /> Agregar movimiento
          </button>
        )}
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      {/* Tabla */}
      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Concepto</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Método</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
              <th style={thStyle}>Servicio</th>
              {permisos.can_delete && <th style={{ ...thStyle, textAlign: 'right' }}>Acción</th>}
            </tr>
          </thead>
          <tbody>
            {cobranzasFiltradas.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay movimientos registrados
                </td>
              </tr>
            )}
            {cobranzasFiltradas.map((c) => {
              const esPagoACuenta = c.tipo === 'PAGO' && c.servicio_id === null
              return (
                <tr key={c.id}>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>{formatFecha(c.fecha)}</td>
                  <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{c.clientes?.nombre ?? '—'}</td>
                  <td style={tdStyle}>{c.concepto}</td>
                  <td style={tdStyle}><TipoBadge tipo={c.tipo} /></td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{c.metodo_pago ?? '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: theme.fontWeights.medium, color: c.tipo === 'CARGO' ? theme.colors.error : theme.colors.success }}>
                    {c.tipo === 'CARGO' ? '+' : '-'}${Number(c.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted, fontSize: theme.fontSizes.xs }}>
                    {esPagoACuenta ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 8px', backgroundColor: '#FFF7ED', color: '#C2410C', borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CreditCard size={10} /> A cuenta
                        </span>
                        {permisos.can_create && (
                          <button
                            onClick={() => abrirImputar(c)}
                            style={{ padding: '2px 8px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.xs, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Imputar
                          </button>
                        )}
                      </div>
                    ) : (
                      c.servicios?.titulo ?? '—'
                    )}
                  </td>
                  {permisos.can_delete && (
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        style={{ background: 'none', border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal crear */}
      {showCreate && (
        <ModalOverlay onClose={() => setShowCreate(false)}>
          <ModalCard title="Nuevo movimiento" onClose={() => setShowCreate(false)} formId="create-form">
            <form id="create-form" onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <CobranzaFormFields form={createForm} clientes={clientes} servicios={servicios} />
              {createError && <div style={{ marginTop: '14px' }}><ErrorBox message={createError} /></div>}
              <button
                type="submit"
                disabled={createLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: createLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: createLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {createLoading && <Loader2 size={15} className="animate-spin" />}
                {createLoading ? 'Guardando...' : 'Guardar movimiento'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Modal imputar pago a cuenta */}
      {imputarTarget && (
        <ModalOverlay onClose={() => setImputarTarget(null)}>
          <ModalCard title="Imputar pago a cuenta" onClose={() => setImputarTarget(null)}>
            <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              Pago disponible: <strong style={{ color: theme.colors.text }}>${Number(imputarTarget.monto).toLocaleString('es-AR')}</strong>
              {imputarTarget.metodo_pago && ` · ${imputarTarget.metodo_pago}`}
              {` · ${formatFecha(imputarTarget.fecha)}`}
            </p>
            <p style={{ margin: '0 0 16px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
              {imputarTarget.clientes?.nombre}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Servicio <span style={{ color: theme.colors.error }}>*</span></label>
                <select
                  value={imputarServicioId}
                  onChange={(e) => setImputarServicioId(e.target.value)}
                  style={{ ...inputStyle, backgroundColor: '#fff' }}
                >
                  <option value="">Seleccioná un servicio...</option>
                  {serviciosDelImputar.map((s) => (
                    <option key={s.id} value={s.id}>{s.titulo}</option>
                  ))}
                </select>
                {serviciosDelImputar.length === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                    Este cliente no tiene servicios registrados.
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Monto a imputar ($) <span style={{ color: theme.colors.error }}>*</span></label>
                <input
                  type="number"
                  min={0.01}
                  max={Number(imputarTarget.monto)}
                  step="0.01"
                  value={imputarMonto}
                  onChange={(e) => setImputarMonto(e.target.value)}
                  style={inputStyle}
                />
                <p style={{ margin: '4px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                  Máx: ${Number(imputarTarget.monto).toLocaleString('es-AR')}. Si imputás menos, el resto queda como saldo a cuenta.
                </p>
              </div>
            </div>
            {imputarError && <div style={{ marginTop: '12px' }}><ErrorBox message={imputarError} /></div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => setImputarTarget(null)}
                style={{ flex: 1, padding: '10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', fontSize: theme.fontSizes.sm }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarImputar}
                disabled={imputarLoading}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', backgroundColor: imputarLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, cursor: imputarLoading ? 'not-allowed' : 'pointer' }}
              >
                {imputarLoading && <Loader2 size={13} className="animate-spin" />}
                Confirmar imputación
              </button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Modal confirmar eliminación */}
      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <ModalCard title="Eliminar movimiento" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás <strong>{deleteTarget.concepto}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, padding: '10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', fontSize: theme.fontSizes.sm }}
              >
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
