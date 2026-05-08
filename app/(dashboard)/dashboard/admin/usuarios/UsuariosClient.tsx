'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

type Role = { id: number; name: string }
type Usuario = {
  id: string
  email: string
  name: string | null
  role_id: number
  created_at: string
  roles: { name: string }[] | null
}

const createSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role_id: z.number().int().positive('Seleccioná un rol'),
})

const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  role_id: z.number().int().positive('Seleccioná un rol'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
})

type CreateForm = z.infer<typeof createSchema>
type EditForm = z.infer<typeof editSchema>

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: theme.fontSizes.base,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.sm,
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  color: theme.colors.text,
  marginBottom: '6px',
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
        {children}
      </div>
    </div>
  )
}

function ModalCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm }}>
      <AlertCircle size={14} style={{ flexShrink: 0 }} />
      {message}
    </div>
  )
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', padding: '11px', marginTop: '8px',
        backgroundColor: loading ? `${theme.colors.primary}99` : theme.colors.primary,
        color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium,
        border: 'none', borderRadius: theme.radii.sm,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {loading ? 'Guardando...' : label}
    </button>
  )
}

export default function UsuariosClient({
  initialUsuarios,
  roles,
}: {
  initialUsuarios: Usuario[]
  roles: Role[]
}) {
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Usuario | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Create form
  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) })
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  // Edit form
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) })
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const openEdit = (u: Usuario) => {
    setEditTarget(u)
    editForm.reset({ name: u.name ?? '', email: u.email, role_id: u.role_id, password: '' })
    setEditError(null)
  }

  const onCreateSubmit = async (data: CreateForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/usuarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    setUsuarios((prev) => [json, ...prev])
    setShowCreate(false)
    createForm.reset()
  }

  const onEditSubmit = async (data: EditForm) => {
    if (!editTarget) return
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/usuarios/${editTarget.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, password: data.password || undefined }),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setUsuarios((prev) => prev.map((u) => (u.id === editTarget.id ? json : u)))
    setEditTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/usuarios/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setUsuarios((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '12px 16px',
    fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
    color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `1px solid ${theme.colors.border}`,
    backgroundColor: '#F8F9FB',
  }
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: theme.fontSizes.sm, color: theme.colors.text,
    borderBottom: `1px solid ${theme.colors.border}`,
  }

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
          {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { setShowCreate(true); setCreateError(null); createForm.reset() }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', backgroundColor: theme.colors.primary,
            color: '#fff', border: 'none', borderRadius: theme.radii.sm,
            fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Agregar usuario
        </button>
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Creado</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay usuarios registrados
                </td>
              </tr>
            )}
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.name ?? '—'}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', backgroundColor: `${theme.colors.primary}14`, color: theme.colors.primary, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium }}>
                    {u.roles?.[0]?.name ?? '—'}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>
                  {new Date(u.created_at).toLocaleDateString('es-AR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => openEdit(u)}
                      style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      style={{ background: 'none', border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                    >
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
          <ModalCard title="Nuevo usuario" onClose={() => setShowCreate(false)}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input {...createForm.register('name')} style={inputStyle} placeholder="Juan García" />
                {createForm.formState.errors.name && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{createForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input {...createForm.register('email')} type="email" style={inputStyle} placeholder="tu@email.com" />
                {createForm.formState.errors.email && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{createForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input {...createForm.register('password')} type="password" style={inputStyle} placeholder="Mínimo 8 caracteres" />
                {createForm.formState.errors.password && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{createForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select {...createForm.register('role_id', { valueAsNumber: true })} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                  <option value="">Seleccioná un rol</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {createForm.formState.errors.role_id && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{createForm.formState.errors.role_id.message}</p>}
              </div>
              {createError && <ErrorBox message={createError} />}
              <SubmitBtn loading={createLoading} label="Crear usuario" />
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <ModalCard title="Editar usuario" onClose={() => setEditTarget(null)}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input {...editForm.register('name')} style={inputStyle} />
                {editForm.formState.errors.name && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{editForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input {...editForm.register('email')} type="email" style={inputStyle} />
                {editForm.formState.errors.email && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{editForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Nueva contraseña <span style={{ color: theme.colors.textMuted, fontWeight: 400 }}>(dejar vacío para no cambiar)</span></label>
                <input {...editForm.register('password')} type="password" style={inputStyle} placeholder="Mínimo 8 caracteres" />
                {editForm.formState.errors.password && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{editForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select {...editForm.register('role_id', { valueAsNumber: true })} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              {editError && <ErrorBox message={editError} />}
              <SubmitBtn loading={editLoading} label="Guardar cambios" />
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <ModalCard title="Eliminar usuario" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás a <strong>{deleteTarget.name ?? deleteTarget.email}</strong>?
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
