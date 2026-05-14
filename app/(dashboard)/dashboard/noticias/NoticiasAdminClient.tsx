'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, X, Loader2, AlertCircle, Pencil, Eye, EyeOff, Upload, ExternalLink, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'

type Noticia = {
  id: number
  titulo: string
  resumen: string
  contenido: string
  imagen_card: string | null
  imagen_portada: string | null
  publicada: boolean
  orden: number
  created_at: string
  updated_at: string
}

const noticiaSchema = z.object({
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  resumen: z.string().min(2, 'Mínimo 2 caracteres'),
  contenido: z.string().min(2, 'Mínimo 2 caracteres'),
  publicada: z.boolean(),
  orden: z.number().int().min(0),
})
type NoticiaForm = z.infer<typeof noticiaSchema>

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
  padding: '12px 16px', fontSize: theme.fontSizes.sm, color: theme.colors.text,
  borderBottom: `1px solid ${theme.colors.border}`, verticalAlign: 'middle',
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>{children}</div>
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

function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | null
  onChange: (url: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/dashboard/upload/imagen', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) { setUploadError(json.error); return }
    onChange(json.url)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {value && (
          <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: theme.radii.sm, overflow: 'hidden', border: `1px solid ${theme.colors.border}` }}>
            <Image src={value} alt={label} fill style={{ objectFit: 'cover' }} sizes="600px" />
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, backgroundColor: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.sm, color: theme.colors.text, opacity: uploading ? 0.6 : 1 }}
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? 'Subiendo...' : value ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          {value && (
            <a href={value} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: theme.fontSizes.xs, color: theme.colors.primary, textDecoration: 'none' }}>
              <ExternalLink size={11} /> Ver
            </a>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
        {uploadError && <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.error, margin: 0 }}>{uploadError}</p>}
        <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: 0 }}>JPG, PNG o WEBP · Máx 5MB</p>
      </div>
    </div>
  )
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function NoticiasAdminClient({
  initialNoticias,
  permisos,
}: {
  initialNoticias: Noticia[]
  permisos: ModulePermisos
}) {
  const [noticias, setNoticias] = useState(initialNoticias)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Noticia | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Noticia | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Imagen state for create/edit
  const [createImagenCard, setCreateImagenCard] = useState<string | null>(null)
  const [createImagenPortada, setCreateImagenPortada] = useState<string | null>(null)
  const [editImagenCard, setEditImagenCard] = useState<string | null>(null)
  const [editImagenPortada, setEditImagenPortada] = useState<string | null>(null)

  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [igToast, setIgToast] = useState<{ ok: boolean; message: string } | null>(null)

  const showIgToast = (ig: { posted: boolean; error?: string } | undefined) => {
    if (!ig) return
    const msg = ig.posted
      ? '✓ Publicado en Instagram correctamente'
      : `Instagram: ${ig.error ?? 'No se pudo publicar'}`
    setIgToast({ ok: ig.posted, message: msg })
    setTimeout(() => setIgToast(null), 6000)
  }

  const createForm = useForm<NoticiaForm>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: { titulo: '', resumen: '', contenido: '', publicada: false, orden: 0 },
  })

  const editForm = useForm<NoticiaForm>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: { titulo: '', resumen: '', contenido: '', publicada: false, orden: 0 },
  })

  const openCreate = () => {
    createForm.reset({ titulo: '', resumen: '', contenido: '', publicada: false, orden: noticias.length })
    setCreateImagenCard(null)
    setCreateImagenPortada(null)
    setCreateError(null)
    setShowCreate(true)
  }

  const onCreateSubmit = async (data: NoticiaForm) => {
    setCreateLoading(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, imagen_card: createImagenCard, imagen_portada: createImagenPortada }),
    })
    const json = await res.json()
    setCreateLoading(false)
    if (!res.ok) { setCreateError(json.error); return }
    const { _instagram, ...noticia } = json
    setNoticias((prev) => [noticia, ...prev])
    setShowCreate(false)
    showIgToast(_instagram)
  }

  const openEdit = (n: Noticia) => {
    editForm.reset({ titulo: n.titulo, resumen: n.resumen, contenido: n.contenido, publicada: n.publicada, orden: n.orden })
    setEditImagenCard(n.imagen_card)
    setEditImagenPortada(n.imagen_portada)
    setEditError(null)
    setEditTarget(n)
  }

  const onEditSubmit = async (data: NoticiaForm) => {
    if (!editTarget) return
    setEditLoading(true)
    setEditError(null)
    const res = await fetch(`/api/dashboard/noticias/${editTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, imagen_card: editImagenCard, imagen_portada: editImagenPortada }),
    })
    const json = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(json.error); return }
    const { _instagram, ...noticia } = json
    setNoticias((prev) => prev.map((n) => (n.id === editTarget.id ? noticia : n)))
    setEditTarget(null)
    showIgToast(_instagram)
  }

  const togglePublicada = async (n: Noticia) => {
    setTogglingId(n.id)
    const res = await fetch(`/api/dashboard/noticias/${n.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicada: !n.publicada }),
    })
    const json = await res.json()
    setTogglingId(null)
    if (!res.ok) { setGlobalError(json.error); return }
    const { _instagram, ...noticia } = json
    setNoticias((prev) => prev.map((item) => (item.id === n.id ? noticia : item)))
    showIgToast(_instagram)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setGlobalError(null)
    const res = await fetch(`/api/dashboard/noticias/${deleteTarget.id}`, { method: 'DELETE' })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setGlobalError(json.error); setDeleteTarget(null); return }
    setNoticias((prev) => prev.filter((n) => n.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const FormFields = ({ form, imagenCard, setImagenCard, imagenPortada, setImagenPortada }: {
    form: ReturnType<typeof useForm<NoticiaForm>>
    imagenCard: string | null
    setImagenCard: (v: string | null) => void
    imagenPortada: string | null
    setImagenPortada: (v: string | null) => void
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Título <span style={{ color: theme.colors.error }}>*</span></label>
        <input {...form.register('titulo')} style={inputStyle} placeholder="Título de la noticia" />
        {form.formState.errors.titulo && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.titulo.message}</p>}
      </div>

      <div>
        <label style={labelStyle}>Resumen <span style={{ color: theme.colors.error }}>*</span></label>
        <textarea
          {...form.register('resumen')}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Texto breve que aparece en la card de la landing"
        />
        {form.formState.errors.resumen && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.resumen.message}</p>}
      </div>

      <div>
        <label style={labelStyle}>Contenido completo <span style={{ color: theme.colors.error }}>*</span></label>
        <textarea
          {...form.register('contenido')}
          rows={8}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          placeholder="Texto completo de la noticia (se muestra en la página de detalle)"
        />
        {form.formState.errors.contenido && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.sm, marginTop: '4px' }}>{form.formState.errors.contenido.message}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <ImageUploader label="Imagen card (miniatura)" value={imagenCard} onChange={setImagenCard} />
        <ImageUploader label="Imagen portada (detalle)" value={imagenPortada} onChange={setImagenPortada} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Orden</label>
          <input
            type="number"
            min={0}
            {...form.register('orden', { valueAsNumber: true })}
            style={inputStyle}
          />
          <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginTop: '4px' }}>Menor número = aparece primero</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
          <input
            type="checkbox"
            id="publicada-check"
            {...form.register('publicada')}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="publicada-check" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            Publicada (visible en la landing)
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {igToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px', borderRadius: theme.radii.md,
          backgroundColor: igToast.ok ? theme.colors.success : theme.colors.error,
          color: '#fff', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        }}>
          {igToast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {igToast.message}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
          {noticias.length} noticia{noticias.length !== 1 ? 's' : ''}
        </p>
        {permisos.can_create && (
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: 'pointer' }}
          >
            <Plus size={15} /> Nueva noticia
          </button>
        )}
      </div>

      {globalError && <div style={{ marginBottom: '16px' }}><ErrorBox message={globalError} /></div>}

      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '48px' }}>Ord.</th>
              <th style={{ ...thStyle, width: '56px' }}>Img</th>
              <th style={thStyle}>Título</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Fecha</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {noticias.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay noticias. Creá la primera.
                </td>
              </tr>
            )}
            {noticias.map((n) => (
              <tr key={n.id}>
                <td style={{ ...tdStyle, color: theme.colors.textMuted, textAlign: 'center' }}>{n.orden}</td>
                <td style={tdStyle}>
                  {n.imagen_card ? (
                    <div style={{ width: '40px', height: '40px', borderRadius: theme.radii.sm, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Image src={n.imagen_card} alt={n.titulo} fill style={{ objectFit: 'cover' }} sizes="40px" />
                    </div>
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: theme.radii.sm, backgroundColor: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', color: theme.colors.textMuted }}>—</span>
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: theme.fontWeights.medium, marginBottom: '2px' }}>{n.titulo}</div>
                  <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>{n.resumen}</div>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => togglePublicada(n)}
                    disabled={!permisos.can_edit || togglingId === n.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '3px 10px', borderRadius: theme.radii.full, border: 'none',
                      cursor: permisos.can_edit ? 'pointer' : 'default',
                      backgroundColor: n.publicada ? `${theme.colors.success}18` : `${theme.colors.textMuted}14`,
                      color: n.publicada ? theme.colors.success : theme.colors.textMuted,
                      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
                      opacity: togglingId === n.id ? 0.5 : 1,
                    }}
                  >
                    {n.publicada ? <Eye size={11} /> : <EyeOff size={11} />}
                    {n.publicada ? 'Publicada' : 'Borrador'}
                  </button>
                </td>
                <td style={{ ...tdStyle, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>{formatFecha(n.created_at)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <Link
                      href={`/noticias/${n.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                    >
                      <ExternalLink size={13} />
                    </Link>
                    {permisos.can_edit && (
                      <button
                        onClick={() => openEdit(n)}
                        style={{ background: 'none', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.textMuted, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {permisos.can_delete && (
                      <button
                        onClick={() => setDeleteTarget(n)}
                        style={{ background: 'none', border: `1px solid ${theme.colors.error}44`, borderRadius: theme.radii.sm, cursor: 'pointer', color: theme.colors.error, padding: '5px 8px', display: 'flex', alignItems: 'center' }}
                      >
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
          <ModalCard title="Nueva noticia" onClose={() => setShowCreate(false)}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <FormFields
                form={createForm}
                imagenCard={createImagenCard}
                setImagenCard={setCreateImagenCard}
                imagenPortada={createImagenPortada}
                setImagenPortada={setCreateImagenPortada}
              />
              {createError && <div style={{ marginTop: '14px' }}><ErrorBox message={createError} /></div>}
              <button
                type="submit"
                disabled={createLoading}
                style={{ width: '100%', padding: '11px', marginTop: '20px', backgroundColor: createLoading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, border: 'none', borderRadius: theme.radii.sm, cursor: createLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {createLoading && <Loader2 size={15} className="animate-spin" />}
                {createLoading ? 'Guardando...' : 'Crear noticia'}
              </button>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <ModalCard title="Editar noticia" onClose={() => setEditTarget(null)}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <FormFields
                form={editForm}
                imagenCard={editImagenCard}
                setImagenCard={setEditImagenCard}
                imagenPortada={editImagenPortada}
                setImagenPortada={setEditImagenPortada}
              />
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
          <ModalCard title="Eliminar noticia" onClose={() => setDeleteTarget(null)}>
            <p style={{ fontSize: theme.fontSizes.base, color: theme.colors.text, marginBottom: '8px' }}>
              ¿Eliminás <strong>{deleteTarget.titulo}</strong>?
            </p>
            <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: '24px' }}>
              Se eliminarán también las imágenes asociadas. Esta acción no se puede deshacer.
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
