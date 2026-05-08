'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

type Activo = {
  id: number
  cliente_id: number
  nombre: string
  tipo: 'PC' | 'NOTEBOOK' | 'SERVIDOR' | 'IMPRESORA' | 'SISTEMA' | 'DESARROLLO' | 'SERVICIO' | 'DISPOSITIVO' | 'OTRO'
  numero_serie: string | null
  notas: string | null
  activo: boolean
  created_at: string
}

type ClienteSimple = { id: number; name: string }

const TIPOS = ['PC', 'NOTEBOOK', 'SERVIDOR', 'IMPRESORA', 'SISTEMA', 'DESARROLLO', 'SERVICIO', 'DISPOSITIVO', 'OTRO'] as const

const activoSchema = z.object({
  cliente_id: z.number().int().positive('Seleccioná un cliente'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  tipo: z.enum(TIPOS),
  numero_serie: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean(),
})
type ActivoForm = z.infer<typeof activoSchema>

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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>{children}</div>
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

function ActivoFormFields({
  form,
  clientes,
}: {
  form: ReturnType<typeof useForm<ActivoForm>>
  clientes: ClienteSimple[]
}) {
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
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {form.formState.errors.cliente_id && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.cliente_id.message}
            </p>
          )}
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nombre <span style={{ color: theme.colors.error }}>*</span></label>
          <input {...form.register('nombre')} style={inputStyle} placeholder="Ej: PC Recepción, Sistema de facturación..." />
          {form.formState.errors.nombre && (
            <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>
              {form.formState.errors.nombre.message}
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Tipo <span style={{ color: theme.colors.error }}>*</span></label>
          <select {...form.register('tipo')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>N° Serie / ID</label>
          <input {...form.register('numero_serie')} style={inputStyle} placeholder="SN-12345..." />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notas</label>
          <textarea
            {...form.register('notas')}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Observaciones, configuración, historial..."
          />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="activo-check"
            {...form.register('activo')}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.primary }}
          />
          <label htmlFor="activo-check" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            Activo (desmarcar = De baja)
          </label>
        </div>
      </div>
    </div>
  )
}

export default function ActivosClient({
  initialActivos,
  clientes,
  clienteIdFilter,
}: {
  initialActivos: Activo[]
  clientes: ClienteSimple[]
  clienteIdFilter: number | null
}) {
  const router = useRouter()
  const [activos, setActivos] = useState(initialActivos)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Activo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Activo | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const clienteMap = Object.fromEntries(clientes.map((c) => [c.id, c.name]))

  const createForm = useForm<ActivoForm>({
    resolver: zodResolver(activoSchema),
    defaultValues: { cliente_id: clienteIdFilter ?? 0, tipo: 'PC', activo: true },
  })
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const editForm = useForm<ActivoForm>({
    resolver: zodResolver(activoSchema),
    defaultValues: { tipo: 'PC', activo: true },
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const openCreate = () => {
    createForm.reset({ cliente_id: clienteIdFilter ?? 0, tipo: 'PC', activo: true, nombre: '', numero_serie: '', notas: '' })
    setCreateError(null)
    setShowCreate(true)
  }

  const openEdit = (a: Activo) => {
    setEditTarget(a)
    editForm.reset({
      cliente_id: a.cliente_id,
      nombre: a.nombre,
      tipo: a.tipo,
      numero_serie: a.numero_serie ?? '',
      notas: a.notas ?? '',
      activo: a.activo,
    })
    setEditError(null)
  }

  const onCreateSubmit = async (data: ActivoForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/activos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    setActivos((prev) => [json, ...prev].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    setShowCreate(false)
  }

  const onEditSubmit = async (data: ActivoForm) => {
    if (!editTarget) return
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/activos/${editTarget.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setActivos((prev) => prev.map((a) => (a.id === editTarget.id ? json : a)))
    setEditTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/activos/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setActivos((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleFilterChange = (value: string) => {
    if (value) {
      router.push(`/dashboard/activos?cliente_id=${value}`)
    } else {
      router.push('/dashboard/activos')
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            defaultValue={clienteIdFilter ?? ''}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit', color: theme.colors.text }}
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            {activos.length} activo{activos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
        >
          <Plus size={15} /> Agregar activo
        </button>
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>N° Serie</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay activos registrados
                </td>
              </tr>
            )}
            {activos.map((a) => (
              <tr key={a.id}>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{clienteMap[a.cliente_id] ?? '—'}</td>
                <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{a.nombre}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', backgroundColor: `${theme.colors.primary}14`, color: theme.colors.primary, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium }}>
                    {a.tipo}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{a.numero_serie || '—'}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '3px 10px', borderRadius: theme.radii.full,
                    fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
                    backgroundColor: a.activo ? `${theme.colors.success}18` : `${theme.colors.textMuted}18`,
                    color: a.activo ? theme.colors.success : theme.colors.textMuted,
                  }}>
                    {a.activo ? 'Activo' : 'De baja'}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => openEdit(a)} style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(a)} style={{ background: 'none', border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <ModalOverlay onClose={() => setShowCreate(false)}>
          <ModalCard title="Nuevo activo" onClose={() => setShowCreate(false)}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <ActivoFormFields form={createForm} clientes={clientes} />
              {createError && <div style={{ marginTop: '14px' }}><ErrorBox message={createError} /></div>}
              <button
                type="submit"
                disabled={createLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: createLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: createLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {createLoading && <Loader2 size={15} className="animate-spin" />}
                {createLoading ? 'Guardando...' : 'Crear activo'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <ModalCard title="Editar activo" onClose={() => setEditTarget(null)}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <ActivoFormFields form={editForm} clientes={clientes} />
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
          <ModalCard title="Eliminar activo" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás <strong>{deleteTarget.nombre}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Esta acción no se puede deshacer.
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
