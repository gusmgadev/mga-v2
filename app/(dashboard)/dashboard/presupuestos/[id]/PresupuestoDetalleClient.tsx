'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Pencil, X, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'

type PresupuestoEstado = 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO' | 'VENCIDO'

type Item = {
  id: number
  presupuesto_id: number
  descripcion: string
  cantidad: number
  precio_unitario: number
  orden: number
  created_at: string
}

type Presupuesto = {
  id: number
  cliente_id: number
  activo_id: number | null
  titulo: string
  descripcion: string | null
  estado: PresupuestoEstado
  fecha_vencimiento: string | null
  created_at: string
  clientes: { name: string } | null
  activos: { nombre: string } | null
  presupuesto_items: Item[]
}

type ActivoSimple = { id: number; nombre: string; cliente_id: number }

const ESTADOS: PresupuestoEstado[] = ['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'VENCIDO']

const ESTADO_COLORS: Record<PresupuestoEstado, { bg: string; text: string }> = {
  BORRADOR:  { bg: '#F3F4F6', text: '#6B7280' },
  ENVIADO:   { bg: '#E3F2FD', text: '#1565C0' },
  APROBADO:  { bg: `${theme.colors.success}18`, text: theme.colors.success },
  RECHAZADO: { bg: `${theme.colors.error}14`, text: theme.colors.error },
  VENCIDO:   { bg: '#FFF3E0', text: '#E65100' },
}

const editSchema = z.object({
  activo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().nullable().optional(),
  estado: z.enum(['BORRADOR', 'ENVIADO', 'APROBADO', 'RECHAZADO', 'VENCIDO']),
  fecha_vencimiento: z.string().nullable().optional(),
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
const cardStyle = {
  backgroundColor: '#fff', borderRadius: theme.radii.md,
  border: `1px solid ${theme.colors.border}`, overflow: 'hidden', marginBottom: '20px',
}
const cardHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}`,
  backgroundColor: '#F8F9FB',
}
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '10px 16px', fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${theme.colors.border}`,
}
const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: theme.fontSizes.sm, color: theme.colors.text,
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

export default function PresupuestoDetalleClient({
  initialPresupuesto,
  activos,
  permisos,
}: {
  initialPresupuesto: Presupuesto
  activos: ActivoSimple[]
  permisos: ModulePermisos
}) {
  const [presupuesto, setPresupuesto] = useState(initialPresupuesto)
  const [items, setItems] = useState<Item[]>(
    [...initialPresupuesto.presupuesto_items].sort((a, b) => a.id - b.id)
  )
  const [showEdit, setShowEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // New item form state
  const [newDesc, setNewDesc] = useState('')
  const [newQty, setNewQty] = useState('1')
  const [newPrice, setNewPrice] = useState('0')
  const [itemLoading, setItemLoading] = useState(false)
  const [itemError, setItemError] = useState<string | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)

  const activosFiltrados = activos.filter((a) => a.cliente_id === presupuesto.cliente_id)
  const total = items.reduce((sum, i) => sum + Number(i.cantidad) * Number(i.precio_unitario), 0)
  const newSubtotal = Number(newQty) * Number(newPrice)

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      activo_id: presupuesto.activo_id,
      titulo: presupuesto.titulo,
      descripcion: presupuesto.descripcion ?? '',
      estado: presupuesto.estado,
      fecha_vencimiento: presupuesto.fecha_vencimiento ?? '',
    },
  })

  const openEdit = () => {
    editForm.reset({
      activo_id: presupuesto.activo_id,
      titulo: presupuesto.titulo,
      descripcion: presupuesto.descripcion ?? '',
      estado: presupuesto.estado,
      fecha_vencimiento: presupuesto.fecha_vencimiento ?? '',
    })
    setEditError(null)
    setShowEdit(true)
  }

  const onEditSubmit = async (data: EditForm) => {
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/presupuestos/${presupuesto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setPresupuesto((prev) => ({ ...prev, ...json }))
    setShowEdit(false)
  }

  const agregarItem = async () => {
    const cantidad = parseFloat(newQty)
    const precio = parseFloat(newPrice)
    if (!newDesc.trim()) { setItemError('La descripción es requerida'); return }
    if (!cantidad || cantidad <= 0) { setItemError('La cantidad debe ser mayor a 0'); return }
    if (precio < 0) { setItemError('El precio no puede ser negativo'); return }
    setItemLoading(true)
    setItemError(null)
    const res = await fetch(`/api/dashboard/presupuestos/${presupuesto.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion: newDesc.trim(), cantidad, precio_unitario: precio }),
    })
    const json = await res.json()
    setItemLoading(false)
    if (!res.ok) { setItemError(json.error); return }
    setItems((prev) => [...prev, json])
    setNewDesc('')
    setNewQty('1')
    setNewPrice('0')
  }

  const eliminarItem = async (itemId: number) => {
    setDeletingItemId(itemId)
    const res = await fetch(`/api/dashboard/presupuestos/${presupuesto.id}/items/${itemId}`, {
      method: 'DELETE',
    })
    setDeletingItemId(null)
    if (!res.ok) return
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  const formatVencimiento = (fecha: string | null) => {
    if (!fecha) return null
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  const { bg, text: textColor } = ESTADO_COLORS[presupuesto.estado]

  return (
    <>
      {/* Back + edit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link
          href="/dashboard/presupuestos"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textMuted, textDecoration: 'none', fontSize: theme.fontSizes.sm }}
        >
          <ArrowLeft size={15} /> Volver a Presupuestos
        </Link>
        {permisos.can_edit && (
          <button
            onClick={openEdit}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer', color: theme.colors.text }}
          >
            <Pencil size={13} /> Editar presupuesto
          </button>
        )}
      </div>

      {/* Info card */}
      <div style={cardStyle}>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
                {presupuesto.titulo}
              </h2>
              <p style={{ margin: '0 0 12px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                {presupuesto.clientes?.name ?? '—'}
                {presupuesto.activos ? ` · ${presupuesto.activos.nombre}` : ''}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ padding: '3px 10px', backgroundColor: bg, color: textColor, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium }}>
                  {presupuesto.estado}
                </span>
                {formatVencimiento(presupuesto.fecha_vencimiento) && (
                  <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                    Vence: {formatVencimiento(presupuesto.fecha_vencimiento)}
                  </span>
                )}
                <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                  Creado: {formatFecha(presupuesto.created_at)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Total</p>
              <p style={{ margin: 0, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
                ${total.toLocaleString('es-AR')}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                {items.length} ítem{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {presupuesto.descripcion && (
            <p style={{ margin: '16px 0 0', fontSize: theme.fontSizes.sm, color: theme.colors.text, lineHeight: '1.6', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '16px' }}>
              {presupuesto.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Items card */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
            Ítems {items.length > 0 && <span style={{ color: theme.colors.textMuted, fontWeight: theme.fontWeights.regular }}>({items.length})</span>}
          </h3>
        </div>

        {items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Descripción</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '90px' }}>Cantidad</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '130px' }}>Precio unit.</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '130px' }}>Subtotal</th>
                {permisos.can_delete && <th style={{ ...thStyle, width: '44px' }} />}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const subtotal = Number(item.cantidad) * Number(item.precio_unitario)
                return (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.descripcion}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: theme.colors.textMuted }}>
                      {Number(item.cantidad).toLocaleString('es-AR')}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: theme.colors.textMuted }}>
                      ${Number(item.precio_unitario).toLocaleString('es-AR')}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: theme.fontWeights.medium }}>
                      ${subtotal.toLocaleString('es-AR')}
                    </td>
                    {permisos.can_delete && (
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => eliminarItem(item.id)}
                          disabled={deletingItemId === item.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: '4px' }}
                        >
                          {deletingItemId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Total row */}
        {items.length > 0 && (
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', backgroundColor: '#F8F9FB', borderTop: `1px solid ${theme.colors.border}` }}>
            <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total
            </span>
            <span style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
              ${total.toLocaleString('es-AR')}
            </span>
          </div>
        )}

        {/* Add item form */}
        {permisos.can_create && (
          <div style={{ padding: '16px 20px', borderTop: items.length > 0 ? `1px solid ${theme.colors.border}` : undefined }}>
            {itemError && <div style={{ marginBottom: '10px' }}><ErrorBox message={itemError} /></div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px auto', gap: '8px', alignItems: 'end' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: theme.fontSizes.xs }}>Descripción</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarItem() } }}
                  placeholder="Descripción del ítem..."
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: theme.fontSizes.xs }}>Cantidad</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: theme.fontSizes.xs }}>
                  Precio unit. {newSubtotal > 0 && (
                    <span style={{ color: theme.colors.textMuted, fontWeight: theme.fontWeights.regular }}>
                      → ${newSubtotal.toLocaleString('es-AR')}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px', fontSize: theme.fontSizes.sm }}
                />
              </div>
              <button
                onClick={agregarItem}
                disabled={itemLoading || !newDesc.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', backgroundColor: itemLoading || !newDesc.trim() ? `${theme.colors.primary}66` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, cursor: itemLoading || !newDesc.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                {itemLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Agregar
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && !permisos.can_create && (
          <p style={{ padding: '20px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, textAlign: 'center' }}>
            Sin ítems registrados
          </p>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <ModalOverlay onClose={() => setShowEdit(false)}>
          <ModalCard title="Editar presupuesto" onClose={() => setShowEdit(false)}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Activo (opcional)</label>
                    <select
                      {...editForm.register('activo_id', { setValueAs: (v) => (v === '' || v === '0' || v === 0) ? null : Number(v) })}
                      style={{ ...inputStyle, backgroundColor: '#fff' }}
                    >
                      <option value="">Sin activo asociado</option>
                      {activosFiltrados.map((a) => (
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
                    <label style={labelStyle}>Vencimiento</label>
                    <input
                      type="date"
                      {...editForm.register('fecha_vencimiento', { setValueAs: (v) => v || null })}
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
    </>
  )
}
