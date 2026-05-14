'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, X, Loader2, AlertCircle, Package, Save } from 'lucide-react'
import { theme } from '@/lib/theme'
import CatalogoCombobox from '@/components/dashboard/CatalogoCombobox'
import type { Producto } from '@/types/stock'
import type { ModulePermisos } from '@/lib/permisos'

function generarCodigo(): string {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const D = '0123456789'
  let c = ''
  for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * 26)]
  for (let i = 0; i < 4; i++) c += D[Math.floor(Math.random() * 10)]
  return c
}

const productoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  codigo: z.string().nullable().optional(),
  marca: z.string().nullable().optional(),
  unidad: z.string().min(1, 'Requerido'),
  rubro: z.string().nullable().optional(),
  stock_actual: z.number(),
  costo: z.number().positive('Debe ser positivo').nullable().optional(),
  precio_venta: z.number().positive('Debe ser positivo').nullable().optional(),
  activo: z.boolean(),
})
type ProductoForm = z.infer<typeof productoSchema>

interface Props {
  initialProductos: Producto[]
  permisos: ModulePermisos
  initialMarcas: string[]
  initialRubros: string[]
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.sm,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.text,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.textMuted,
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: `1px solid ${theme.colors.border}`,
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: theme.fontSizes.sm,
  color: theme.colors.text,
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'middle',
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
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

function ModalCard({ title, onClose, children, formId }: { title: string; onClose: () => void; children: React.ReactNode; formId?: string }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: theme.radii.md,
      padding: '24px', width: '100%', maxWidth: '540px',
      boxShadow: theme.shadows.md, maxHeight: '90vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>{title}</h2>
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

function StockBadge({ value }: { value: number }) {
  const color = value <= 0 ? theme.colors.error : value < 5 ? theme.colors.warning : theme.colors.success
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: theme.radii.full,
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium,
      backgroundColor: `${color}18`,
      color,
    }}>
      {value}
    </span>
  )
}


export default function ProductosClient({ initialProductos, permisos, initialMarcas, initialRubros }: Props) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos)
  const [localMarcas, setLocalMarcas] = useState<string[]>(initialMarcas)
  const [localRubros, setLocalRubros] = useState<string[]>(initialRubros)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'activos' | 'inactivos'>('activos')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductoForm>({ resolver: zodResolver(productoSchema) })

  const marcaValue = watch('marca') ?? ''
  const rubroValue = watch('rubro') ?? ''

  const productosFiltrados = productos.filter((p) => {
    if (filtro === 'activos') return p.activo
    if (filtro === 'inactivos') return !p.activo
    return true
  })

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

  function openCreate() {
    setEditTarget(null)
    reset({ nombre: '', codigo: generarCodigo(), marca: '', unidad: 'unidad', rubro: '', stock_actual: 0, costo: null, precio_venta: null, activo: true })
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(p: Producto) {
    setEditTarget(p)
    reset({
      nombre: p.nombre,
      codigo: p.codigo ?? '',
      marca: p.marca ?? '',
      unidad: p.unidad,
      rubro: p.rubro ?? '',
      stock_actual: p.stock_actual,
      costo: p.costo ?? undefined,
      precio_venta: p.precio_venta ?? undefined,
      activo: p.activo,
    })
    setFormError(null)
    setShowModal(true)
  }

  async function onSubmit(values: ProductoForm) {
    setLoading(true)
    setFormError(null)
    try {
      const payload = {
        ...values,
        codigo: values.codigo || null,
        marca: values.marca || null,
        rubro: values.rubro || null,
        costo: values.costo ?? null,
        precio_venta: values.precio_venta ?? null,
      }

      if (editTarget) {
        const res = await fetch(`/api/dashboard/productos/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) { setFormError(json.error); return }
        setProductos((prev) => prev.map((p) => (p.id === editTarget.id ? json : p)))
        if (payload.marca) setLocalMarcas((prev) => prev.includes(payload.marca!) ? prev : [...prev, payload.marca!].sort())
        if (payload.rubro) setLocalRubros((prev) => prev.includes(payload.rubro!) ? prev : [...prev, payload.rubro!].sort())
      } else {
        const res = await fetch('/api/dashboard/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) { setFormError(json.error); return }
        setProductos((prev) => [json, ...prev])
        if (payload.marca) setLocalMarcas((prev) => prev.includes(payload.marca!) ? prev : [...prev, payload.marca!].sort())
        if (payload.rubro) setLocalRubros((prev) => prev.includes(payload.rubro!) ? prev : [...prev, payload.rubro!].sort())
      }
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActivo(p: Producto) {
    const res = await fetch(`/api/dashboard/productos/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !p.activo }),
    })
    if (res.ok) {
      const json = await res.json()
      setProductos((prev) => prev.map((x) => (x.id === p.id ? json : x)))
    }
  }

  return (
    <div style={{ padding: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.lg }}>
        <div>
          <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
            Productos
          </h1>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginTop: '4px' }}>
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        {permisos.can_create && (
          <button
            onClick={openCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: theme.colors.primary, color: '#fff',
              border: 'none', borderRadius: theme.radii.sm, padding: '10px 18px',
              fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Nuevo producto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: theme.spacing.md }}>
        {(['activos', 'inactivos', 'todos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '6px 14px', borderRadius: theme.radii.full,
              fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
              border: `1px solid ${filtro === f ? theme.colors.primary : theme.colors.border}`,
              backgroundColor: filtro === f ? theme.colors.primary : '#fff',
              color: filtro === f ? '#fff' : theme.colors.textMuted,
              cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        {productosFiltrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: theme.colors.textMuted }}>
            <Package size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: theme.fontSizes.sm, margin: 0 }}>No hay productos</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nombre / Rubro</th>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Marca</th>
                <th style={thStyle}>Unidad</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Stock</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Costo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Precio venta</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>
                    {p.nombre}
                    {p.rubro && <span style={{ display: 'block', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: 'normal', marginTop: '1px' }}>{p.rubro}</span>}
                  </td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted, fontFamily: 'monospace', fontSize: theme.fontSizes.xs }}>{p.codigo ?? '—'}</td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{p.marca ?? '—'}</td>
                  <td style={tdStyle}>{p.unidad}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}><StockBadge value={p.stock_actual} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {p.costo != null ? `$${p.costo.toLocaleString('es-AR')}` : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {p.precio_venta != null ? `$${p.precio_venta.toLocaleString('es-AR')}` : '—'}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: theme.radii.full,
                      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
                      backgroundColor: p.activo ? `${theme.colors.success}18` : `${theme.colors.error}18`,
                      color: p.activo ? theme.colors.success : theme.colors.error,
                    }}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {permisos.can_edit && (
                        <button
                          onClick={() => openEdit(p)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: '4px' }}
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {permisos.can_edit && (
                        <button
                          onClick={() => toggleActivo(p)}
                          style={{
                            background: 'none', border: `1px solid ${theme.colors.border}`,
                            cursor: 'pointer', color: theme.colors.textMuted,
                            padding: '2px 8px', borderRadius: theme.radii.sm,
                            fontSize: theme.fontSizes.xs,
                          }}
                        >
                          {p.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <ModalCard title={editTarget ? 'Editar producto' : 'Nuevo producto'} onClose={() => setShowModal(false)} formId="producto-form">
            <form id="producto-form" onSubmit={handleSubmit(onSubmit)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Nombre *</label>
                  <input {...register('nombre')} style={inputStyle} placeholder="Ej: Alimento Excellent cachorro 20kg" />
                  {errors.nombre && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{errors.nombre.message}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Código</label>
                  <input {...register('codigo')} style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="Ej: ABCD1234" />
                  <p style={{ fontSize: '11px', color: theme.colors.textMuted, marginTop: '3px' }}>
                    Auto-generado, editable
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>Unidad *</label>
                  <select {...register('unidad')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
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
                    value={marcaValue}
                    onChange={(v) => setValue('marca', v || null, { shouldDirty: true })}
                    opciones={localMarcas}
                    onNewOption={handleNewMarca}
                    placeholder="Ej: Excellent, Royal Canin..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Rubro</label>
                  <CatalogoCombobox
                    value={rubroValue}
                    onChange={(v) => setValue('rubro', v || null, { shouldDirty: true })}
                    opciones={localRubros}
                    onNewOption={handleNewRubro}
                    placeholder="Ej: Alimentos, Accesorios..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Stock actual</label>
                  <input type="number" {...register('stock_actual', { valueAsNumber: true })} style={inputStyle} step="any" />
                  {errors.stock_actual && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{errors.stock_actual.message}</p>}
                </div>

                <div />

                <div>
                  <label style={labelStyle}>Costo</label>
                  <input type="number" {...register('costo', { valueAsNumber: true, setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) })} style={inputStyle} step="any" placeholder="0.00" />
                </div>

                <div>
                  <label style={labelStyle}>Precio venta</label>
                  <input type="number" {...register('precio_venta', { valueAsNumber: true, setValueAs: (v) => (v === '' || isNaN(v) ? null : Number(v)) })} style={inputStyle} step="any" placeholder="0.00" />
                </div>

              </div>

              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}12`, borderRadius: theme.radii.sm, marginBottom: '16px' }}>
                  <AlertCircle size={16} color={theme.colors.error} />
                  <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{formError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  padding: '9px 18px', border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii.sm, background: '#fff',
                  color: theme.colors.text, fontSize: theme.fontSizes.sm, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 18px', backgroundColor: theme.colors.primary,
                  border: 'none', borderRadius: theme.radii.sm, color: '#fff',
                  fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  {editTarget ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
