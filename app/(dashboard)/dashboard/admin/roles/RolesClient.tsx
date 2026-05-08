'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

type Role = {
  id: number
  name: string
  description: string | null
  is_default: boolean
  created_at: string
}

const roleSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
})
type RoleForm = z.infer<typeof roleSchema>

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: theme.fontSizes.base,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
  color: theme.colors.text, marginBottom: '6px',
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>{children}</div>
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

export default function RolesClient({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState(initialRoles)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const form = useForm<RoleForm>({ resolver: zodResolver(roleSchema) })

  const openCreate = () => {
    form.reset({ name: '', description: '' })
    setFormError(null)
    setShowCreate(true)
  }

  const openEdit = (r: Role) => {
    setEditTarget(r)
    form.reset({ name: r.name, description: r.description ?? '' })
    setFormError(null)
  }

  const onSubmit = async (data: RoleForm) => {
    setFormLoading(true)
    setFormError(null)

    const isEdit = !!editTarget
    const url = isEdit ? `/api/dashboard/roles/${editTarget.id}` : '/api/dashboard/roles'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setFormLoading(false)

    if (!res.ok) { setFormError(json.error); return }

    if (isEdit) {
      setRoles((prev) => prev.map((r) => (r.id === editTarget.id ? json : r)))
      setEditTarget(null)
    } else {
      setRoles((prev) => [...prev, json])
      setShowCreate(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/roles/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
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

  const RoleFormContent = () => (
    <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Nombre del rol</label>
        <input {...form.register('name')} style={inputStyle} placeholder="ej: Supervisor" />
        {form.formState.errors.name && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.name.message}</p>}
      </div>
      <div>
        <label style={labelStyle}>Descripción <span style={{ color: theme.colors.textMuted, fontWeight: 400 }}>(opcional)</span></label>
        <input {...form.register('description')} style={inputStyle} placeholder="Describe los permisos de este rol" />
      </div>
      {formError && <ErrorBox message={formError} />}
      <button
        type="submit"
        disabled={formLoading}
        style={{ width: '100%', padding: '11px', marginTop: '4px', backgroundColor: formLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: formLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        {formLoading && <Loader2 size={15} className="animate-spin" />}
        {formLoading ? 'Guardando...' : editTarget ? 'Guardar cambios' : 'Crear rol'}
      </button>
    </form>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>{roles.length} rol{roles.length !== 1 ? 'es' : ''}</p>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
        >
          <Plus size={15} /> Agregar rol
        </button>
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Descripción</th>
              <th style={thStyle}>Por defecto</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 && (
              <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>No hay roles</td></tr>
            )}
            {roles.map((r) => (
              <tr key={r.id}>
                <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{r.name}</td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{r.description ?? '—'}</td>
                <td style={tdStyle}>
                  {r.is_default
                    ? <CheckCircle size={15} style={{ color: theme.colors.success }} />
                    : <span style={{ color: theme.colors.textMuted }}>—</span>
                  }
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={() => openEdit(r)} style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      disabled={r.is_default}
                      title={r.is_default ? 'No se puede eliminar el rol por defecto' : ''}
                      style={{ background: 'none', border: `1px solid ${r.is_default ? theme.colors.border : `${theme.colors.error}44`}`, borderRadius: theme.radii.sm, cursor: r.is_default ? 'not-allowed' : 'pointer', color: r.is_default ? theme.colors.border : theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
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

      {showCreate && (
        <ModalOverlay onClose={() => setShowCreate(false)}>
          <ModalCard title="Nuevo rol" onClose={() => setShowCreate(false)}>
            <RoleFormContent />
          </ModalCard>
        </ModalOverlay>
      )}

      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <ModalCard title="Editar rol" onClose={() => setEditTarget(null)}>
            <RoleFormContent />
          </ModalCard>
        </ModalOverlay>
      )}

      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <ModalCard title="Eliminar rol" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás el rol <strong>{deleteTarget.name}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Solo se puede eliminar si ningún usuario lo tiene asignado.
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
