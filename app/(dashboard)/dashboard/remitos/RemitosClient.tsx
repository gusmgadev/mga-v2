'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ClipboardList, Loader2 } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { Remito } from '@/types/stock'
import type { ModulePermisos } from '@/lib/permisos'

interface RemitosConItems extends Omit<Remito, 'remito_items'> {
  remito_items?: { id: string }[]
}

interface Props {
  initialRemitos: RemitosConItems[]
  filtros: { tipo: string | null; estado: string | null }
  permisos: ModulePermisos
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

function TipoBadge({ tipo }: { tipo: string }) {
  const isEntrada = tipo === 'entrada'
  return (
    <span style={{
      padding: '3px 10px', borderRadius: theme.radii.full,
      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
      backgroundColor: isEntrada ? `${theme.colors.success}18` : `${theme.colors.error}18`,
      color: isEntrada ? theme.colors.success : theme.colors.error,
    }}>
      {isEntrada ? '↓ Entrada' : '↑ Salida'}
    </span>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    borrador: theme.colors.warning,
    confirmado: theme.colors.success,
    anulado: theme.colors.textMuted,
  }
  const color = colors[estado] ?? theme.colors.textMuted
  return (
    <span style={{
      padding: '3px 10px', borderRadius: theme.radii.full,
      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
      backgroundColor: `${color}18`, color,
      textTransform: 'capitalize',
    }}>
      {estado}
    </span>
  )
}

function formatFecha(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function RemitosClient({ initialRemitos, filtros, permisos }: Props) {
  const router = useRouter()
  const [remitos] = useState<RemitosConItems[]>(initialRemitos)
  const [creatingNew, setCreatingNew] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState(filtros.tipo ?? '')
  const [filtroEstado, setFiltroEstado] = useState(filtros.estado ?? '')

  function applyFiltros(tipo: string, estado: string) {
    const params = new URLSearchParams()
    if (tipo) params.set('tipo', tipo)
    if (estado) params.set('estado', estado)
    router.push(`/dashboard/remitos?${params.toString()}`)
  }

  async function handleNuevoRemito() {
    setCreatingNew(true)
    try {
      const res = await fetch('/api/dashboard/remitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'entrada', numero_tipo: 'automatico', fecha: new Date().toISOString().split('T')[0] }),
      })
      const json = await res.json()
      if (!res.ok) return
      router.push(`/dashboard/remitos/${json.id}`)
    } finally {
      setCreatingNew(false)
    }
  }

  const remitosFiltrados = remitos.filter((r) => {
    if (filtroTipo && r.tipo !== filtroTipo) return false
    if (filtroEstado && r.estado !== filtroEstado) return false
    return true
  })

  return (
    <div style={{ padding: theme.spacing.lg }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.lg }}>
        <div>
          <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
            Remitos
          </h1>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginTop: '4px' }}>
            {remitosFiltrados.length} remito{remitosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        {permisos.can_create && (
          <button
            onClick={handleNuevoRemito}
            disabled={creatingNew}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: theme.colors.primary, color: '#fff',
              border: 'none', borderRadius: theme.radii.sm, padding: '10px 18px',
              fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              cursor: creatingNew ? 'not-allowed' : 'pointer', opacity: creatingNew ? 0.7 : 1,
            }}
          >
            {creatingNew ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
            Nuevo remito
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: theme.spacing.md, flexWrap: 'wrap' }}>
        <select
          value={filtroTipo}
          onChange={(e) => { setFiltroTipo(e.target.value); applyFiltros(e.target.value, filtroEstado) }}
          style={{
            padding: '7px 12px', border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm,
            color: theme.colors.text, background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); applyFiltros(filtroTipo, e.target.value) }}
          style={{
            padding: '7px 12px', border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm,
            color: theme.colors.text, background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="confirmado">Confirmado</option>
          <option value="anulado">Anulado</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
        {remitosFiltrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: theme.colors.textMuted }}>
            <ClipboardList size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: theme.fontSizes.sm, margin: 0 }}>No hay remitos</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Número</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Origen / Destino</th>
                <th style={thStyle}>Estado</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Ítems</th>
              </tr>
            </thead>
            <tbody>
              {remitosFiltrados.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/dashboard/remitos/${r.id}`)}
                  style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>{r.numero}</td>
                  <td style={tdStyle}>{formatFecha(r.fecha)}</td>
                  <td style={tdStyle}><TipoBadge tipo={r.tipo} /></td>
                  <td style={{ ...tdStyle, color: theme.colors.textMuted }}>
                    {r.origenes_destinos
                      ? `${r.origenes_destinos.nombre} (${r.origenes_destinos.tipo})`
                      : r.origen_destino_texto ?? '—'}
                  </td>
                  <td style={tdStyle}><EstadoBadge estado={r.estado} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: theme.colors.textMuted }}>
                    {r.remito_items?.length ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
