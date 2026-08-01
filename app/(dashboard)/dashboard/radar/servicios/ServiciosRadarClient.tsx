'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import type { ProspectService } from '@/types/radar'
import RubroCombobox from '@/components/dashboard/RubroCombobox'
import FieldRow from '@/components/dashboard/FieldRow'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().default(''),
  target_keywords: z.string().optional().default(''),
  problems_solved: z.string().optional().default(''),
  is_active: z.boolean().optional().default(true),
})

type FormData = z.infer<typeof formSchema>

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.md,
  fontSize: theme.fontSizes.sm,
  outline: 'none',
  boxSizing: 'border-box',
}

const cellStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: theme.fontSizes.sm,
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'middle',
}

export default function ServiciosRadarClient({
  initialServicios,
  permisos,
}: {
  initialServicios: ProspectService[]
  permisos: ModulePermisos
}) {
  const [servicios, setServicios] = useState<ProspectService[]>(initialServicios)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ProspectService | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
  })

  function openCreate() {
    setEditing(null)
    setCategories([])
    reset({
      name: '',
      description: '',
      target_keywords: '',
      problems_solved: '',
      is_active: true,
    })
    setError(null)
    setShowModal(true)
  }

  function openEdit(s: ProspectService) {
    setEditing(s)
    setCategories(s.target_categories ?? [])
    reset({
      name: s.name,
      description: s.description ?? '',
      target_keywords: (s.target_keywords ?? []).join(', '),
      problems_solved: (s.problems_solved ?? []).join(', '),
      is_active: s.is_active,
    })
    setError(null)
    setShowModal(true)
  }

  async function onSubmit(data: FormData) {
    setSaving(true)
    setError(null)

    const payload = {
      ...data,
      target_categories: categories,
      target_keywords: data.target_keywords
        ? data.target_keywords.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      problems_solved: data.problems_solved
        ? data.problems_solved.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    }

    try {
      if (editing) {
        const res = await fetch(`/api/dashboard/radar/servicios/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(typeof err.error === 'string' ? err.error : 'Error al actualizar')
        }
        const updated = await res.json()
        setServicios((prev) => prev.map((s) => (s.id === editing.id ? updated : s)))
      } else {
        const res = await fetch('/api/dashboard/radar/servicios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(typeof err.error === 'string' ? err.error : 'Error al crear')
        }
        const created = await res.json()
        setServicios((prev) => [...prev, created])
      }
      setShowModal(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este servicio?')) return
    try {
      const res = await fetch(`/api/dashboard/radar/servicios/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setServicios((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  function arrayDisplay(arr: string[] | null | undefined): string {
    if (!arr || arr.length === 0) return '—'
    return arr.slice(0, 3).join(', ') + (arr.length > 3 ? '...' : '')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
          Servicios - Radar
        </h1>
        {permisos.can_create && (
          <button onClick={openCreate} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', backgroundColor: theme.colors.primary,
            color: '#fff', border: 'none', borderRadius: theme.radii.md,
            fontSize: theme.fontSizes.sm, cursor: 'pointer',
          }}>
            <Plus size={16} /> Nuevo servicio
          </button>
        )}
      </div>

      <div style={{
        backgroundColor: '#fff', borderRadius: theme.radii.lg,
        border: `1px solid ${theme.colors.border}`, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'left' }}>Nombre</th>
              <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'left' }}>Categorías target</th>
              <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'left' }}>Keywords</th>
              <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'center' }}>Activo</th>
              <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...cellStyle, textAlign: 'center', color: theme.colors.textMuted }}>
                  No hay servicios configurados. Crea tu primer servicio para comenzar.
                </td>
              </tr>
            ) : (
              servicios.map((s) => (
                <tr key={s.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}>
                  <td style={cellStyle}>{s.name}</td>
                  <td style={cellStyle}>{arrayDisplay(s.target_categories)}</td>
                  <td style={cellStyle}>{arrayDisplay(s.target_keywords)}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold,
                      backgroundColor: s.is_active ? '#DCFCE7' : '#F1F5F9',
                      color: s.is_active ? '#15803D' : '#64748B',
                    }}>
                      {s.is_active ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {permisos.can_edit && (
                        <button onClick={() => openEdit(s)} style={iconBtnStyle} title="Editar">
                          <Pencil size={14} />
                        </button>
                      )}
                      {permisos.can_delete && (
                        <button onClick={() => handleDelete(s.id)} style={{ ...iconBtnStyle, color: theme.colors.error }} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}`,
            }}>
              <h2 style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold }}>
                {editing ? 'Editar servicio' : 'Nuevo servicio'}
              </h2>
              <button onClick={() => setShowModal(false)} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} id="service-form" style={{ padding: 20 }}>
              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2', color: theme.colors.error,
                  padding: '10px 14px', borderRadius: theme.radii.md,
                  fontSize: theme.fontSizes.sm, marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <FieldRow label="Nombre" required>
                  <input {...register('name')} style={inputStyle} placeholder="Ej: Sistema de turnos" />
                  {errors.name && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, margin: '4px 0 0' }}>{errors.name.message}</p>}
                </FieldRow>

                <FieldRow label="Descripción">
                  <textarea {...register('description')} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Descripción del servicio" />
                </FieldRow>

                <FieldRow label="Categorías target">
                  <RubroCombobox
                    value={categories}
                    onChange={(v) => setCategories(v as string[])}
                    multiple
                    placeholder="Seleccioná rubros..."
                  />
                </FieldRow>

                <FieldRow label="Keywords target">
                  <input {...register('target_keywords')} style={inputStyle} placeholder="turnos, uñas, depilación (separado por coma)" />
                </FieldRow>

                <FieldRow label="Problemas que resuelve">
                  <input {...register('problems_solved')} style={inputStyle} placeholder="sin agenda online, sin stock online (separado por coma)" />
                </FieldRow>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: theme.fontSizes.sm, cursor: 'pointer' }}>
                <input type="checkbox" {...register('is_active')} />
                Servicio activo
              </label>
            </form>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8,
              padding: '14px 20px', borderTop: `1px solid ${theme.colors.border}`,
            }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '8px 16px', border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
                cursor: 'pointer', background: '#fff',
              }}>
                Cancelar
              </button>
              <button type="submit" form="service-form" disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', backgroundColor: theme.colors.primary,
                color: '#fff', border: 'none', borderRadius: theme.radii.md,
                fontSize: theme.fontSizes.sm, cursor: 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? <Loader2 size={16} /> : <Save size={16} />}
                {editing ? 'Guardar cambios' : 'Crear servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.md, background: '#fff', cursor: 'pointer',
  color: theme.colors.textMuted, transition: 'all 0.15s',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: theme.radii.lg,
  width: '90%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}

const closeBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, border: 'none', borderRadius: theme.radii.md,
  background: 'transparent', cursor: 'pointer', color: theme.colors.textMuted,
}
