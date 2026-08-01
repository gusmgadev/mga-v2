'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, ExternalLink, MessageCircle, Mail, Phone, Star, ChevronUp, ChevronDown, Search, Loader2 } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import type { Prospect } from '@/types/radar'
import RubroCombobox from '@/components/dashboard/RubroCombobox'

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: theme.radii.lg,
  border: `1px solid ${theme.colors.border}`,
  padding: '20px 24px',
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: theme.fontSizes.xs,
  fontWeight: theme.fontWeights.medium, color: theme.colors.textMuted,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: `1px solid ${theme.colors.border}`,
  backgroundColor: '#F8F9FB', whiteSpace: 'nowrap',
  cursor: 'pointer', userSelect: 'none',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: theme.fontSizes.sm,
  color: theme.colors.text, borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'middle',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nueva', reviewed: 'Revisada', to_contact: 'Para contactar',
  contacted: 'Contactada', interested: 'Interesado', meeting: 'Reunión',
  proposal_sent: 'Presupuestado', won: 'Ganada', lost: 'Perdida',
  discarded: 'Descartada', do_not_contact: 'No contactar',
  existing_customer: 'Cliente propio',
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    new: { bg: '#E8F5E9', fg: '#2E7D32' },
    reviewed: { bg: '#E3F2FD', fg: '#1565C0' },
    to_contact: { bg: '#FFF3E0', fg: '#E65100' },
    contacted: { bg: '#F3E5F5', fg: '#7B1FA2' },
    interested: { bg: '#E8F5E9', fg: '#1B5E20' },
    meeting: { bg: '#E0F2F1', fg: '#00695C' },
    proposal_sent: { bg: '#FFF8E1', fg: '#F57F17' },
    won: { bg: '#E8F5E9', fg: '#1B5E20' },
    lost: { bg: '#FFEBEE', fg: '#C62828' },
    discarded: { bg: '#F5F5F5', fg: '#616161' },
    do_not_contact: { bg: '#FFEBEE', fg: '#B71C1C' },
    existing_customer: { bg: '#E0F2FE', fg: '#0369A1' },
  }
  const c = colors[status] ?? { bg: '#F5F5F5', fg: '#616161' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10,
      fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
      backgroundColor: c.bg, color: c.fg, whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

const SORT_COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'rubro', label: 'Rubro' },
  { key: 'city', label: 'Localidad' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'commercial_status', label: 'Estado' },
  { key: 'rating', label: 'Rating' },
  { key: 'opportunity_score', label: 'Score' },
  { key: 'created_at', label: 'Creado' },
]

export default function ProspectosClient({
  initialProspects, total, permisos,
}: {
  initialProspects: Prospect[]
  total: number
  permisos: ModulePermisos
}) {
  const router = useRouter()
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)
  const [totalCount, setTotalCount] = useState(total)
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterRubro, setFilterRubro] = useState('')
  const [filterMinRating, setFilterMinRating] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 30

  const fetchProspects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('sortDirection', sortDir)
      if (search) params.set('search', search)
      if (filterStatus) params.set('commercialStatus', filterStatus)
      if (filterCity) params.set('city', filterCity)
      if (filterRubro) params.set('rubro', filterRubro)
      if (filterMinRating) params.set('minRating', filterMinRating)

      const res = await fetch(`/api/dashboard/radar/prospects?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProspects(data.data ?? [])
        setTotalCount(data.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortDir, search, filterStatus, filterCity, filterRubro, filterMinRating])

  useEffect(() => {
    fetchProspects()
  }, [fetchProspects])

  function toggleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function SortIcon({ column }: { column: string }) {
    if (sortBy !== column) return <ChevronUp size={12} style={{ opacity: 0.2, marginLeft: 4 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ marginLeft: 4 }} />
      : <ChevronDown size={12} style={{ marginLeft: 4 }} />
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const filterRowStyle: React.CSSProperties = {
    padding: '6px 10px', border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.md, fontSize: theme.fontSizes.xs,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
          Prospectos
        </h1>
        <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
          {totalCount} prospectos
        </span>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>
              Buscar
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: theme.colors.textMuted }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Nombre, rubro, ciudad..."
                style={{ ...filterRowStyle, paddingLeft: 28 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>Estado</label>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} style={filterRowStyle}>
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>Ciudad</label>
            <input value={filterCity} onChange={(e) => { setFilterCity(e.target.value); setPage(1) }} placeholder="Filtrar ciudad..." style={filterRowStyle} />
          </div>
          <div>
            <RubroCombobox
              value={filterRubro}
              onChange={(v) => { setFilterRubro(v as string); setPage(1) }}
              placeholder="Filtrar rubro..."
              label="Rubro"
              allowCreate={false}
            />
          </div>
          <div>
            <label style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: 4, display: 'block' }}>Rating mín.</label>
            <select value={filterMinRating} onChange={(e) => { setFilterMinRating(e.target.value); setPage(1) }} style={filterRowStyle}>
              <option value="">Cualquiera</option>
              <option value="4">4+</option>
              <option value="3">3+</option>
              <option value="2">2+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          </div>
        ) : prospects.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 20, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, margin: 0 }}>
            No se encontraron prospectos.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {SORT_COLUMNS.map((col) => (
                    <th key={col.key} style={thStyle} onClick={() => toggleSort(col.key)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {col.label}
                        <SortIcon column={col.key} />
                      </span>
                    </th>
                  ))}
                  <th style={{ ...thStyle, cursor: 'default', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p) => (
                  <tr key={p.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}>
                    <td style={{ ...tdStyle, fontWeight: theme.fontWeights.medium }}>
                      {p.name}
                    </td>
                    <td style={tdStyle}>{p.rubro || '—'}</td>
                    <td style={tdStyle}>{p.city || (p.province ?? '—')}</td>
                    <td style={tdStyle}>
                      {(p.whatsapp || p.normalized_phone) ? (
                        <a href={`https://wa.me/${(p.whatsapp || p.normalized_phone || '').replace(/\D/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: '#15803D', textDecoration: 'none', fontSize: theme.fontSizes.xs, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MessageCircle size={13} />
                          {p.whatsapp || p.normalized_phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      {p.phone ? (
                        <a href={`tel:${p.phone}`} style={{ color: theme.colors.accent, textDecoration: 'none', fontSize: theme.fontSizes.xs }}>
                          {p.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      {p.email ? (
                        <span style={{ fontSize: theme.fontSizes.xs }}>{p.email}</span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}><StatusBadge status={p.commercial_status} /></td>
                    <td style={tdStyle}>
                      {p.rating ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: theme.fontSizes.xs }}>
                          <Star size={12} fill="#EF9F27" color="#EF9F27" />
                          {p.rating}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                        fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold,
                        backgroundColor: p.opportunity_score >= 80 ? '#DCFCE7' : p.opportunity_score >= 65 ? '#E8F5E9' : p.opportunity_score >= 45 ? '#FFF3E0' : '#F5F5F5',
                        color: p.opportunity_score >= 80 ? '#15803D' : p.opportunity_score >= 65 ? '#1D9E75' : p.opportunity_score >= 45 ? '#EF9F27' : '#9E9E9E',
                      }}>
                        {p.opportunity_score}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>
                      {new Date(p.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => router.push(`/dashboard/radar/prospectos/${p.id}`)}
                          title="Ver detalle"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '4px 8px', border: `1px solid ${theme.colors.border}`,
                            borderRadius: theme.radii.md, background: '#fff',
                            cursor: 'pointer', fontSize: theme.fontSizes.xs,
                            color: theme.colors.textMuted,
                          }}>
                          <Eye size={13} /> Ver
                        </button>
                        {(p.whatsapp || p.normalized_phone) && (
                          <a href={`https://wa.me/${(p.whatsapp || p.normalized_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, ¿cómo estás? Te contactamos de MGA Informática para ofrecerte nuestros servicios.')}`}
                            target="_blank" rel="noopener noreferrer"
                            title="Contactar por WhatsApp"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '4px 8px', backgroundColor: '#25D366',
                              color: '#fff', border: 'none', borderRadius: theme.radii.md,
                              fontSize: theme.fontSizes.xs, textDecoration: 'none',
                            }}>
                            <MessageCircle size={13} /> Contactar
                          </a>
                        )}
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer"
                            title="Abrir sitio web"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '4px 8px', border: `1px solid ${theme.colors.border}`,
                              borderRadius: theme.radii.md, background: '#fff',
                              fontSize: theme.fontSizes.xs, textDecoration: 'none',
                              color: theme.colors.textMuted,
                            }}>
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '6px 12px', border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.md, background: '#fff', cursor: page <= 1 ? 'default' : 'pointer',
                fontSize: theme.fontSizes.sm, opacity: page <= 1 ? 0.5 : 1,
              }}>
              Anterior
            </button>
            <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              Pág. {page} de {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              style={{
                padding: '6px 12px', border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.md, background: '#fff', cursor: page >= totalPages ? 'default' : 'pointer',
                fontSize: theme.fontSizes.sm, opacity: page >= totalPages ? 0.5 : 1,
              }}>
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
