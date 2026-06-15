'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Modulo = {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
  orden: number
}

type EditForm = { nombre: string; descripcion: string; orden: number; activo: boolean }

const EMPTY: EditForm = { nombre: '', descripcion: '', orden: 0, activo: true }

const inp: React.CSSProperties = {
  border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 9px',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
}
const th: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em',
}
const td: React.CSSProperties = { padding: '12px 16px', fontSize: 14 }

function Btn({ onClick, disabled, variant = 'ghost', children }: {
  onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'ghost' | 'danger'; children: React.ReactNode
}) {
  const s: React.CSSProperties = {
    border: variant === 'primary' ? 'none' : variant === 'danger' ? '1px solid #fecaca' : '1px solid #e5e7eb',
    background: variant === 'primary' ? '#111' : 'transparent',
    color: variant === 'primary' ? '#fff' : variant === 'danger' ? '#dc2626' : '#374151',
    borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, opacity: disabled ? 0.6 : 1,
  }
  return <button onClick={onClick} disabled={disabled} style={s}>{children}</button>
}

export default function ModulosPage() {
  const router = useRouter()
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(EMPTY)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState<EditForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/superadmin/modulos')
      .then(r => { if (r.status === 401) { router.push('/superadmin/login'); return null } return r.json() })
      .then(d => { if (d) setModulos(d) })
      .finally(() => setLoading(false))
  }, [router])

  function startEdit(m: Modulo) {
    setEditingId(m.id)
    setEditForm({ nombre: m.nombre, descripcion: m.descripcion ?? '', orden: m.orden, activo: m.activo })
    setShowNew(false)
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true); setError('')
    const res = await fetch(`/api/superadmin/modulos/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const u = await res.json()
      setModulos(prev => prev.map(m => m.id === u.id ? u : m).sort((a, b) => a.orden - b.orden))
      setEditingId(null)
    } else {
      const d = await res.json(); setError(d.error ?? 'Error al guardar')
    }
    setSaving(false)
  }

  async function toggleActivo(mod: Modulo) {
    const res = await fetch(`/api/superadmin/modulos/${mod.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: mod.nombre, descripcion: mod.descripcion, orden: mod.orden, activo: !mod.activo }),
    })
    if (res.ok) {
      const u = await res.json()
      setModulos(prev => prev.map(m => m.id === u.id ? u : m))
    }
  }

  async function handleCreate() {
    if (!newForm.nombre.trim()) return
    setSaving(true); setError('')
    const res = await fetch('/api/superadmin/modulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    if (res.ok) {
      const created = await res.json()
      setModulos(prev => [...prev, created].sort((a, b) => a.orden - b.orden))
      setNewForm(EMPTY); setShowNew(false)
    } else {
      const d = await res.json(); setError(d.error ?? 'Error al crear')
    }
    setSaving(false)
  }

  async function handleDelete(id: number, nombre: string) {
    if (!window.confirm(`¿Eliminar el módulo "${nombre}"? Las empresas que lo tengan asignado conservan su configuración actual.`)) return
    const res = await fetch(`/api/superadmin/modulos/${id}`, { method: 'DELETE' })
    if (res.ok) setModulos(prev => prev.filter(m => m.id !== id))
    else { const d = await res.json(); setError(d.error ?? 'Error al eliminar') }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <button onClick={() => router.push('/superadmin/empresas')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0 }}>
                ← Empresas
              </button>
              <div style={{ fontWeight: 700, fontSize: 22 }}>Módulos POS</div>
            </div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>Catálogo de módulos disponibles para los tenants</div>
          </div>
          <button
            onClick={() => { setShowNew(true); setEditingId(null) }}
            style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Nuevo módulo
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 16px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Cargando...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Nombre', 'Descripción', 'Orden', 'Estado', ''].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulos.map(m => editingId === m.id ? (
                  <tr key={m.id} style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    <td style={td}>
                      <input style={inp} value={editForm.nombre}
                        onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} />
                    </td>
                    <td style={td}>
                      <input style={inp} value={editForm.descripcion} placeholder="(opcional)"
                        onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))} />
                    </td>
                    <td style={td}>
                      <input style={{ ...inp, width: 64 }} type="number" value={editForm.orden}
                        onChange={e => setEditForm(p => ({ ...p, orden: Number(e.target.value) }))} />
                    </td>
                    <td style={td}>
                      <select style={{ ...inp, width: 90 }} value={editForm.activo ? 'true' : 'false'}
                        onChange={e => setEditForm(p => ({ ...p, activo: e.target.value === 'true' }))}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Btn onClick={() => setEditingId(null)}>Cancelar</Btn>
                        <Btn variant="primary" onClick={saveEdit} disabled={saving}>{saving ? '...' : 'Guardar'}</Btn>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={td}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{m.nombre}</span>
                    </td>
                    <td style={{ ...td, color: m.descripcion ? '#374151' : '#d1d5db' }}>
                      {m.descripcion ?? '—'}
                    </td>
                    <td style={{ ...td, color: '#9ca3af' }}>{m.orden}</td>
                    <td style={td}>
                      <button onClick={() => toggleActivo(m)} style={{
                        background: m.activo ? '#dcfce7' : '#f3f4f6',
                        color: m.activo ? '#15803d' : '#9ca3af',
                        border: 'none', borderRadius: 6, padding: '3px 10px',
                        fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      }}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Btn onClick={() => startEdit(m)}>Editar</Btn>
                        <Btn variant="danger" onClick={() => handleDelete(m.id, m.nombre)}>Eliminar</Btn>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* New module form row */}
                {showNew && (
                  <tr style={{ background: '#fffbeb', borderBottom: '1px solid #f3f4f6' }}>
                    <td style={td}>
                      <input style={inp} value={newForm.nombre} placeholder="nombre-modulo" autoFocus
                        onChange={e => setNewForm(p => ({ ...p, nombre: e.target.value.toLowerCase() }))} />
                    </td>
                    <td style={td}>
                      <input style={inp} value={newForm.descripcion} placeholder="(opcional)"
                        onChange={e => setNewForm(p => ({ ...p, descripcion: e.target.value }))} />
                    </td>
                    <td style={td}>
                      <input style={{ ...inp, width: 64 }} type="number" value={newForm.orden}
                        onChange={e => setNewForm(p => ({ ...p, orden: Number(e.target.value) }))} />
                    </td>
                    <td style={td}>
                      <select style={{ ...inp, width: 90 }} value={newForm.activo ? 'true' : 'false'}
                        onChange={e => setNewForm(p => ({ ...p, activo: e.target.value === 'true' }))}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Btn onClick={() => { setShowNew(false); setNewForm(EMPTY) }}>Cancelar</Btn>
                        <Btn variant="primary" onClick={handleCreate} disabled={saving || !newForm.nombre.trim()}>
                          {saving ? '...' : 'Crear'}
                        </Btn>
                      </div>
                    </td>
                  </tr>
                )}

                {modulos.length === 0 && !showNew && (
                  <tr>
                    <td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af' }}>
                      No hay módulos. Hacé clic en "Nuevo módulo" para agregar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
