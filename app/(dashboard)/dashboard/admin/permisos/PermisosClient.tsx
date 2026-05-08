'use client'

import { useState } from 'react'
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

type Role = { id: number; name: string }
type Permiso = {
  id?: number
  role_id: number
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

const MODULES = [
  { key: 'clientes', label: 'Clientes' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'cobranzas', label: 'Cobranzas' },
  { key: 'admin', label: 'Administración' },
]

const PERMS: Array<{ key: keyof Omit<Permiso, 'id' | 'role_id' | 'module'>; label: string }> = [
  { key: 'can_view', label: 'Ver' },
  { key: 'can_create', label: 'Crear' },
  { key: 'can_edit', label: 'Editar' },
  { key: 'can_delete', label: 'Eliminar' },
]

type PermMatrix = Record<number, Record<string, Permiso>>

function buildMatrix(roles: Role[], permisos: Permiso[]): PermMatrix {
  const matrix: PermMatrix = {}
  for (const r of roles) {
    matrix[r.id] = {}
    for (const m of MODULES) {
      matrix[r.id][m.key] = {
        role_id: r.id, module: m.key,
        can_view: false, can_create: false, can_edit: false, can_delete: false,
      }
    }
  }
  for (const p of permisos) {
    if (matrix[p.role_id]) matrix[p.role_id][p.module] = p
  }
  return matrix
}

export default function PermisosClient({
  initialRoles,
  initialPermisos,
}: {
  initialRoles: Role[]
  initialPermisos: Permiso[]
}) {
  const [matrix, setMatrix] = useState(() => buildMatrix(initialRoles, initialPermisos))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (roleId: number, module: string, perm: keyof Omit<Permiso, 'id' | 'role_id' | 'module'>) => {
    setMatrix((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [module]: { ...prev[roleId][module], [perm]: !prev[roleId][module][perm] },
      },
    }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const rows = Object.values(matrix).flatMap((byModule) => Object.values(byModule))
    const res = await fetch('/api/dashboard/permisos', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: '#F8F9FB',
    textAlign: 'center',
  }
  const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: theme.fontSizes.sm,
    color: theme.colors.text, borderBottom: `1px solid ${theme.colors.border}`,
    textAlign: 'center',
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
          Configurá qué puede hacer cada rol en cada módulo
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.success, fontSize: theme.fontSizes.sm }}>
              <CheckCircle size={14} /> Guardado
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', backgroundColor: saving ? `${theme.colors.primary}99` : theme.colors.primary,
              color: '#fff', border: 'none', borderRadius: theme.radii.sm,
              fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
        </div>
      )}

      {initialRoles.map((role) => (
        <div key={role.id} style={{ marginBottom: '24px', backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', backgroundColor: '#F8F9FB', borderBottom: `1px solid ${theme.colors.border}` }}>
            <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
              {role.name}
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left' }}>Módulo</th>
                {PERMS.map((p) => <th key={p.key} style={thStyle}>{p.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => {
                const row = matrix[role.id]?.[mod.key]
                if (!row) return null
                return (
                  <tr key={mod.key}>
                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: theme.fontWeights.medium }}>{mod.label}</td>
                    {PERMS.map((p) => (
                      <td key={p.key} style={tdStyle}>
                        <input
                          type="checkbox"
                          checked={row[p.key]}
                          onChange={() => toggle(role.id, mod.key, p.key)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.primary }}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </>
  )
}
