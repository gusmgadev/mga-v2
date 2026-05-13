'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Loader2, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import QuickCreateClienteModal from '@/components/dashboard/QuickCreateClienteModal'
import QuickCreateActivoModal from '@/components/dashboard/QuickCreateActivoModal'

type PresupuestoEstado = 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO'
type ItemSimple = { id: number; cantidad: number; precio_unitario: number }

type Presupuesto = {
  id: number
  cliente_id: number
  activo_id: number | null
  titulo: string
  descripcion: string | null
  estado: PresupuestoEstado
  fecha: string
  fecha_vencimiento: string | null
  created_at: string
  clientes: { nombre: string } | null
  activos: { nombre: string } | null
  presupuesto_items: ItemSimple[]
}
type ClienteSimple = { id: number; nombre: string }
type ActivoSimple = { id: number; nombre: string; cliente_id: number }

const ESTADOS: PresupuestoEstado[] = ['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'VENCIDO']

const presupuestoSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'VENCIDO']),
  fecha: z.string().min(1, 'La fecha es requerida'),
  fecha_vencimiento: z.string().nullable().optional(),
})
type PresupuestoForm = z.infer<typeof presupuestoSchema>

const ESTADO_COLORS: Record<PresupuestoEstado, { bg: string; text: string }> = {
  BORRADOR:  { bg: '#F3F4F6', text: '#6B7280' },
  ENVIADO:   { bg: '#E3F2FD', text: '#1565C0' },
  APROBADO:  { bg: `${theme.colors.success}18`, text: theme.colors.success },
  RECHAZADO: { bg: `${theme.colors.error}14`, text: theme.colors.error },
  VENCIDO:   { bg: '#FFF3E0', text: '#E65100' },
}

const calcTotal = (items: ItemSimple[]) =>
  items.reduce((sum, i) => sum + Number(i.cantidad) * Number(i.precio_unitario), 0)

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

function EstadoBadge({ estado }: { estado: PresupuestoEstado }) {
  const { bg, text } = ESTADO_COLORS[estado]
  return (
    <span style={{ padding: '3px 10px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
      {estado}
    </span>
  )
}

function PresupuestoFormFields({
  form,
  clientes,
  setClientes,
  activos,
  setActivos,
}: {
  form: ReturnType<typeof useForm<PresupuestoForm>>
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
              <option value="">Sin activo asociado</option>
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
          <input
            {...form.register('titulo')}
            style={inputStyle}
            placeholder="Ej: Presupuesto instalación red, Desarrollo sistema de gestión..."
          />
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
            placeholder="Descripción general del presupuesto..."
          />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Estado</label>
            <select {...form.register('estado')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha del presupuesto <span style={{ color: theme.colors.error }}>*</span></label>
            <input
              type="date"
              {...form.register('fecha')}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Vencimiento</label>
            <input
              type="date"
              {...form.register('fecha_vencimiento', { setValueAs: (v) => v || null })}
              style={inputStyle}
            />
          </div>
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

export default function PresupuestosClient({
  initialPresupuestos,
  clientes,
  activos,
  filtros,
  permisos,
}: {
  initialPresupuestos: Presupuesto[]
  clientes: ClienteSimple[]
  activos: ActivoSimple[]
  filtros: { cliente_id: number | null; estado: string | null }
  permisos: ModulePermisos
}) {
  const router = useRouter()
  const [presupuestos, setPresupuestos] = useState(initialPresupuestos)
  const [localClientes, setLocalClientes] = useState(clientes)
  const [localActivos, setLocalActivos] = useState(activos)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Presupuesto | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const todayISO = () => new Date().toISOString().split('T')[0]

  const createForm = useForm<PresupuestoForm>({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: {
      cliente_id: filtros.cliente_id ?? 0,
      activo_id: null,
      titulo: '',
      descripcion: '',
      estado: 'BORRADOR',
      fecha: todayISO(),
      fecha_vencimiento: null,
    },
  })

  const openCreate = () => {
    createForm.reset({
      cliente_id: filtros.cliente_id ?? 0,
      activo_id: null,
      titulo: '',
      descripcion: '',
      estado: 'BORRADOR',
      fecha: todayISO(),
      fecha_vencimiento: null,
    })
    setCreateError(null)
    setShowCreate(true)
  }

  const onCreateSubmit = async (data: PresupuestoForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/presupuestos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    router.push(`/dashboard/presupuestos/${json.id}`)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/presupuestos/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setPresupuestos((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const buildUrl = (overrides: Partial<typeof filtros>) => {
    const merged = { ...filtros, ...overrides }
    const params = new URLSearchParams()
    if (merged.cliente_id) params.set('cliente_id', String(merged.cliente_id))
    if (merged.estado) params.set('estado', merged.estado)
    const qs = params.toString()
    return `/dashboard/presupuestos${qs ? `?${qs}` : ''}`
  }

  const filterSelect = (key: keyof typeof filtros, value: string) => {
    router.push(buildUrl({ [key]: value || null }))
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  const formatVencimiento = (fecha: string | null) => {
    if (!fecha) return '—'
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            defaultValue={filtros.cliente_id ?? ''}
            onChange={(e) => filterSelect('cliente_id', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <select
            defaultValue={filtros.estado ?? ''}
            onChange={(e) => filterSelect('estado', e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>

          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            {presupuestos.length} presupuesto{presupuestos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {permisos.can_create && (
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
          >
            <Plus size={15} /> Nuevo presupuesto
          </button>
        )}
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Título</th>
              <th style={thStyle}>Activo</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Ítems</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              <th style={thStyle}>Vencimiento</th>
              <th style={thStyle}>Fecha</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay presupuestos registrados
                </td>
              </tr>
            )}
            {presupuestos.map((p) => {
              const total = calcTotal(p.presupuesto_items)
              return (
                <tr key={p.id}>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{p.clientes?.nombre ?? '—'}</td>
                  <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{p.titulo}</td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{p.activos?.nombre ?? '—'}</td>
                  <td style={tdStyle}><EstadoBadge estado={p.estado} /></td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                    {p.presupuesto_items.length}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: theme.fontWeights.medium }}>
                    ${total.toLocaleString('es-AR')}
                  </td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{formatVencimiento(p.fecha_vencimiento)}</td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{formatVencimiento(p.fecha)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link
                        href={`/dashboard/presupuestos/${p.id}`}
                        style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        <Eye size={13} />
                      </Link>
                      {permisos.can_delete && (
                        <button
                          onClick={() => setDeleteTarget(p)}
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
          <ModalCard title="Nuevo presupuesto" onClose={() => setShowCreate(false)}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <PresupuestoFormFields form={createForm} clientes={localClientes} setClientes={setLocalClientes} activos={localActivos} setActivos={setLocalActivos} />
              {createError && <div style={{ marginTop: '14px' }}><ErrorBox message={createError} /></div>}
              <button
                type="submit"
                disabled={createLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: createLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: createLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {createLoading && <Loader2 size={15} className="animate-spin" />}
                {createLoading ? 'Creando...' : 'Crear y agregar ítems'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <ModalCard title="Eliminar presupuesto" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás <strong>{deleteTarget.titulo}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Se eliminarán también todos los ítems. Esta acción no se puede deshacer.
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
