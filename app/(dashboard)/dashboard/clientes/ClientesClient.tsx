'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle, HardDrive } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'

type Cliente = {
  id: number
  name: string
  type: 'PARTICULAR' | 'EMPRESA' | 'COMERCIO'
  email: string | null
  phone: string | null
  address: string | null
  localidad: string | null
  cuit: string | null
  rubro: string | null
  notes: string | null
  active: boolean
  imagen: string | null
  pagina_web: string | null
  mostrar_en_landing: boolean
  created_at: string
}

const clienteSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  type: z.enum(['PARTICULAR', 'EMPRESA', 'COMERCIO']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  localidad: z.string().optional(),
  cuit: z.string().optional(),
  rubro: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean(),
  imagen: z.string().optional(),
  pagina_web: z.string().url('URL inválida').optional().or(z.literal('')),
  mostrar_en_landing: z.boolean(),
})
type ClienteForm = z.infer<typeof clienteSchema>

const TYPE_LABELS: Record<string, string> = {
  PARTICULAR: 'Particular',
  EMPRESA: 'Empresa',
  COMERCIO: 'Comercio',
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

function RubroCombobox({
  value,
  onChange,
  rubros,
  onNewRubro,
}: {
  value: string
  onChange: (v: string) => void
  rubros: string[]
  onNewRubro: (r: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setInput(value) }, [value])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = rubros.filter((r) => r.toLowerCase().includes(input.toLowerCase()))
  const isNew = input.trim().length > 0 && !rubros.some((r) => r.toLowerCase() === input.trim().toLowerCase())
  const showDropdown = open && (filtered.length > 0 || isNew)

  function select(rubro: string) {
    setInput(rubro)
    onChange(rubro)
    setOpen(false)
  }

  function addNew() {
    const trimmed = input.trim()
    if (!trimmed) return
    onNewRubro(trimmed)
    onChange(trimmed)
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        value={input}
        onChange={(e) => { setInput(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        style={inputStyle}
        placeholder="Ej: Indumentaria, Óptica..."
        autoComplete="off"
      />
      {showDropdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
          backgroundColor: '#fff', border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.sm, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 200, maxHeight: '200px', overflowY: 'auto',
        }}>
          {filtered.map((r) => (
            <div
              key={r}
              onMouseDown={() => select(r)}
              style={{ padding: '8px 14px', cursor: 'pointer', fontSize: theme.fontSizes.sm, color: theme.colors.text }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              {r}
            </div>
          ))}
          {isNew && (
            <div
              onMouseDown={addNew}
              style={{
                padding: '8px 14px', cursor: 'pointer', fontSize: theme.fontSizes.sm,
                color: theme.colors.primary, fontWeight: theme.fontWeights.medium,
                borderTop: filtered.length > 0 ? `1px solid ${theme.colors.border}` : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.colors.primary}0a`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              + Agregar &quot;{input.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ClienteFormFields({
  form,
  rubros,
  onNewRubro,
}: {
  form: ReturnType<typeof useForm<ClienteForm>>
  rubros: string[]
  onNewRubro: (r: string) => void
}) {
  const rubroValue = form.watch('rubro') ?? ''
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nombre <span style={{ color: theme.colors.error }}>*</span></label>
          <input {...form.register('name')} style={inputStyle} placeholder="Nombre completo o razón social" />
          {form.formState.errors.name && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Tipo <span style={{ color: theme.colors.error }}>*</span></label>
          <select {...form.register('type')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
            <option value="PARTICULAR">Particular</option>
            <option value="EMPRESA">Empresa</option>
            <option value="COMERCIO">Comercio</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>CUIT / DNI</label>
          <input {...form.register('cuit')} style={inputStyle} placeholder="20-12345678-9" />
        </div>
        <div>
          <label style={labelStyle}>Rubro</label>
          <RubroCombobox
            value={rubroValue}
            onChange={(v) => form.setValue('rubro', v, { shouldDirty: true })}
            rubros={rubros}
            onNewRubro={onNewRubro}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input {...form.register('email')} type="email" style={inputStyle} placeholder="cliente@email.com" />
          {form.formState.errors.email && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Teléfono</label>
          <input {...form.register('phone')} style={inputStyle} placeholder="2664-123456" />
        </div>
        <div>
          <label style={labelStyle}>Localidad</label>
          <input {...form.register('localidad')} style={inputStyle} placeholder="San Luis, Villa Mercedes..." />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Dirección</label>
          <input {...form.register('address')} style={inputStyle} placeholder="Calle y número" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notas internas</label>
          <textarea
            {...form.register('notes')}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Observaciones, condiciones especiales..."
          />
        </div>
        <div>
          <label style={labelStyle}>Imagen (URL del logo)</label>
          <input {...form.register('imagen')} style={inputStyle} placeholder="https://..." />
        </div>
        <div>
          <label style={labelStyle}>Página web</label>
          <input {...form.register('pagina_web')} type="url" style={inputStyle} placeholder="https://www.ejemplo.com" />
          {form.formState.errors.pagina_web && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.pagina_web.message}</p>}
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="active-check"
              {...form.register('active')}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.primary }}
            />
            <label htmlFor="active-check" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
              Cliente activo
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="landing-check"
              {...form.register('mostrar_en_landing')}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.primary }}
            />
            <label htmlFor="landing-check" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
              Mostrar en landing
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientesClient({
  initialClientes,
  permisos,
  initialRubros,
}: {
  initialClientes: Cliente[]
  permisos: ModulePermisos
  initialRubros: string[]
}) {
  const [clientes, setClientes] = useState(initialClientes)
  const [rubros, setRubros] = useState(initialRubros)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Cliente | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function handleNewRubro(rubro: string) {
    setRubros((prev) => prev.includes(rubro) ? prev : [...prev, rubro].sort())
  }

  const createForm = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { type: 'PARTICULAR', active: true },
  })
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const editForm = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { type: 'PARTICULAR', active: true },
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const openCreate = () => {
    createForm.reset({ type: 'PARTICULAR', active: true, mostrar_en_landing: false, name: '', email: '', phone: '', address: '', localidad: '', cuit: '', rubro: '', notes: '', imagen: '', pagina_web: '' })
    setCreateError(null)
    setShowCreate(true)
  }

  const openEdit = (c: Cliente) => {
    setEditTarget(c)
    editForm.reset({
      name: c.name,
      type: c.type,
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      localidad: c.localidad ?? '',
      cuit: c.cuit ?? '',
      rubro: c.rubro ?? '',
      notes: c.notes ?? '',
      active: c.active,
      imagen: c.imagen ?? '',
      pagina_web: c.pagina_web ?? '',
      mostrar_en_landing: c.mostrar_en_landing,
    })
    setEditError(null)
  }

  const onCreateSubmit = async (data: ClienteForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/clientes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    setClientes((prev) => [json, ...prev].sort((a, b) => a.name.localeCompare(b.name)))
    if (data.rubro) handleNewRubro(data.rubro)
    setShowCreate(false)
  }

  const onEditSubmit = async (data: ClienteForm) => {
    if (!editTarget) return
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/clientes/${editTarget.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    setClientes((prev) => prev.map((c) => (c.id === editTarget.id ? json : c)))
    if (data.rubro) handleNewRubro(data.rubro)
    setEditTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/clientes/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setClientes((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </p>
        {permisos.can_create && (
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
          >
            <Plus size={15} /> Agregar cliente
          </button>
        )}
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Rubro</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Landing</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay clientes registrados
                </td>
              </tr>
            )}
            {clientes.map((c) => (
              <tr key={c.id}>
                <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>
                  <span style={{ display: 'block' }}>{c.name}</span>
                  {c.localidad && (
                    <span style={{ display: 'block', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.regular, marginTop: '1px' }}>
                      {c.localidad}
                    </span>
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', backgroundColor: `${theme.colors.primary}14`, color: theme.colors.primary, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium }}>
                    {TYPE_LABELS[c.type] ?? c.type}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{c.rubro || '—'}</td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted }}>{c.phone || '—'}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '3px 10px', borderRadius: theme.radii.full,
                    fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
                    backgroundColor: c.active ? `${theme.colors.success}18` : `${theme.colors.textMuted}18`,
                    color: c.active ? theme.colors.success : theme.colors.textMuted,
                  }}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {c.mostrar_en_landing ? (
                    <span style={{ padding: '3px 10px', borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, backgroundColor: `${theme.colors.primary}14`, color: theme.colors.primary }}>
                      Sí
                    </span>
                  ) : <span style={{ color: theme.colors.textMuted }}>—</span>}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Link href={`/dashboard/activos?cliente_id=${c.id}`} style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Ver activos">
                      <HardDrive size={13} />
                    </Link>
                    {permisos.can_edit && (
                      <button onClick={() => openEdit(c)} style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
                        <Pencil size={13} />
                      </button>
                    )}
                    {permisos.can_delete && (
                      <button onClick={() => setDeleteTarget(c)} style={{ background: 'none', border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
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
          <ModalCard title="Nuevo cliente" onClose={() => setShowCreate(false)}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <ClienteFormFields form={createForm} rubros={rubros} onNewRubro={handleNewRubro} />
              {createError && <div style={{ marginTop: '14px' }}><ErrorBox message={createError} /></div>}
              <button
                type="submit"
                disabled={createLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: createLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: createLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {createLoading && <Loader2 size={15} className="animate-spin" />}
                {createLoading ? 'Guardando...' : 'Crear cliente'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <ModalCard title="Editar cliente" onClose={() => setEditTarget(null)}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <ClienteFormFields form={editForm} rubros={rubros} onNewRubro={handleNewRubro} />
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
          <ModalCard title="Eliminar cliente" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás a <strong>{deleteTarget.name}</strong>?
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
