'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type EmpresaModulo = { id: number; empresa_id: number; modulo: string; activo: boolean }
type Empresa = {
  id: number
  nombre: string
  codigo: string
  activo: boolean
  plan: string | null
  estado_implementacion: string | null
  fecha_vencimiento: string | null
  empresa_modulos: EmpresaModulo[]
  created_at: string
}

const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  activo:       { bg: '#dcfce7', text: '#15803d' },
  en_progreso:  { bg: '#fef9c3', text: '#92400e' },
  pausado:      { bg: '#f3f4f6', text: '#374151' },
  suspendido:   { bg: '#fee2e2', text: '#dc2626' },
}

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  basico:      { bg: '#f3f4f6', text: '#374151' },
  profesional: { bg: '#ede9fe', text: '#6d28d9' },
  enterprise:  { bg: '#fef3c7', text: '#b45309' },
}

function badge(label: string, colors: { bg: string; text: string }) {
  return (
    <span style={{ background: colors.bg, color: colors.text, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 500 }}>
      {label}
    </span>
  )
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/superadmin/empresas')
      .then(r => {
        if (r.status === 401) { router.push('/superadmin/login'); return null }
        return r.json()
      })
      .then(d => { if (d) setEmpresas(d) })
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch('/api/superadmin/auth', { method: 'DELETE' })
    router.push('/superadmin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 22 }}>Panel MGA — Empresas</div>
            <div style={{ color: '#666', fontSize: 14 }}>Gestión de tenants</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleLogout}
              style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: '#374151' }}
            >
              Cerrar sesión
            </button>
            <button
              onClick={() => router.push('/superadmin/empresas/nueva')}
              style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              + Nueva empresa
            </button>
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Cargando...</div>
          ) : empresas.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No hay empresas registradas.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Empresa / Código', 'Plan', 'Estado impl.', 'Módulos', 'Vencimiento', 'Activo', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empresas.map(emp => {
                  const modulosActivos = emp.empresa_modulos?.filter(m => m.activo).length ?? 0
                  const estadoColors = emp.estado_implementacion ? (ESTADO_COLORS[emp.estado_implementacion] ?? ESTADO_COLORS.pausado) : ESTADO_COLORS.pausado
                  const planColors = emp.plan ? (PLAN_COLORS[emp.plan] ?? PLAN_COLORS.basico) : PLAN_COLORS.basico
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.nombre}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}>{emp.codigo}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {emp.plan ? badge(emp.plan, planColors) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {emp.estado_implementacion ? badge(emp.estado_implementacion.replace('_', ' '), estadoColors) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{modulosActivos} / 6</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                        {emp.fecha_vencimiento ? new Date(emp.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR') : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: emp.activo ? '#22c55e' : '#d1d5db', marginRight: 6 }} />
                        <span style={{ fontSize: 13, color: emp.activo ? '#15803d' : '#9ca3af' }}>{emp.activo ? 'Sí' : 'No'}</span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => router.push(`/superadmin/empresas/${emp.id}`)}
                          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#374151' }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
