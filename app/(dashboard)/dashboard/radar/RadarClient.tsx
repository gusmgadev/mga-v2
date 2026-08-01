'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Eye, Trash2, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import type { ProspectSearch, Prospect, ApiUsageSummary } from '@/types/radar'

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: theme.radii.lg,
  border: `1px solid ${theme.colors.border}`,
  padding: '20px 24px',
}

const cellStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: theme.fontSizes.sm,
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'middle',
}

export default function RadarClient({
  initialSearches, totalProspects, highOpportunities, permisos,
}: {
  initialSearches: ProspectSearch[]
  totalProspects: number
  highOpportunities: number
  permisos: ModulePermisos
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSearchId = searchParams.get('searchId')

  const [searches, setSearches] = useState<ProspectSearch[]>(initialSearches)
  const [prospects, setProspects] = useState<(Prospect & { position?: number; matched_query?: string })[]>([])
  const [loadingProspects, setLoadingProspects] = useState(false)
  const [filterScore, setFilterScore] = useState<string>('')
  const [filterWebsite, setFilterWebsite] = useState<string>('all')
  const [apiUsage, setApiUsage] = useState<ApiUsageSummary | null>(null)

  const activeSearch = searches.find((s) => String(s.id) === activeSearchId)

  const loadProspects = useCallback(async (searchId: string) => {
    setLoadingProspects(true)
    try {
      const params = new URLSearchParams({ searchId })
      if (filterScore) params.set('minOpportunityScore', filterScore)
      if (filterWebsite === 'with_website') params.set('hasWebsite', 'true')
      else if (filterWebsite === 'without_website') params.set('hasWebsite', 'false')

      const res = await fetch(`/api/dashboard/radar/prospects?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProspects(data.data ?? [])
      }
      const usageRes = await fetch(`/api/dashboard/radar/usage?searchId=${searchId}`)
      if (usageRes.ok) setApiUsage(await usageRes.json())
    } finally {
      setLoadingProspects(false)
    }
  }, [filterScore, filterWebsite])

  useEffect(() => {
    if (activeSearchId) loadProspects(activeSearchId)
    else setApiUsage(null)
  }, [activeSearchId, loadProspects])

  function getScoreColor(score: number): string {
    if (score >= 80) return '#15803D'
    if (score >= 65) return '#1D9E75'
    if (score >= 45) return '#EF9F27'
    if (score >= 25) return '#E65100'
    return '#9E9E9E'
  }

  function getScoreBg(score: number): string {
    if (score >= 80) return '#DCFCE7'
    if (score >= 65) return '#E8F5E9'
    if (score >= 45) return '#FFF3E0'
    if (score >= 25) return '#FBE9E7'
    return '#F5F5F5'
  }

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente', searching: 'Buscando', saving_results: 'Guardando',
      enriching: 'Enriqueciendo', scoring: 'Puntuando', completed: 'Completado',
      partial: 'Parcial', failed: 'Error', cancelled: 'Cancelado',
    }
    return labels[status] ?? status
  }

  function statusColor(status: string): string {
    if (status === 'completed') return '#15803D'
    if (status === 'partial') return '#EF9F27'
    if (status === 'failed') return '#E24B4A'
    if (status === 'searching' || status === 'saving_results' || status === 'enriching' || status === 'scoring') return '#1A237E'
    return '#64748B'
  }

  async function handleDeleteSearch(id: number) {
    if (!confirm('¿Eliminar esta búsqueda y todos sus prospectos?')) return
    try {
      const res = await fetch(`/api/dashboard/radar/searches/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setSearches((prev) => prev.filter((s) => s.id !== id))
      if (String(id) === activeSearchId) router.push('/dashboard/radar')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error')
    }
  }

  const totalPending = searches.filter((s) => s.status === 'pending' || s.status === 'searching').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
          Radar de Oportunidades
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {permisos.can_create && (
            <button onClick={() => router.push('/dashboard/radar/nueva-busqueda')} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', backgroundColor: theme.colors.primary,
              color: '#fff', border: 'none', borderRadius: theme.radii.md,
              fontSize: theme.fontSizes.sm, cursor: 'pointer',
            }}>
              <Plus size={16} /> Nueva búsqueda
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prospectos totales</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{totalProspects}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oportunidades altas</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: theme.fontWeights.bold, color: '#15803D' }}>{highOpportunities}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Búsquedas realizadas</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{searches.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pendientes</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: theme.fontWeights.bold, color: totalPending > 0 ? '#EF9F27' : theme.colors.text }}>{totalPending}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 12px', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold }}>
              Búsquedas recientes
            </h3>
            {searches.length === 0 ? (
              <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, margin: 0 }}>
                No hay búsquedas aún. Crea tu primera búsqueda para empezar.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {searches.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/dashboard/radar?searchId=${s.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 12px', border: 'none',
                      borderRadius: theme.radii.md,
                      backgroundColor: String(s.id) === activeSearchId ? '#EEF2FF' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', fontSize: theme.fontSizes.sm,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (String(s.id) !== activeSearchId) e.currentTarget.style.backgroundColor = '#F8FAFC' }}
                    onMouseLeave={(e) => { if (String(s.id) !== activeSearchId) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: theme.fontWeights.semibold, color: theme.colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.category || s.city || `Búsqueda #${s.id}`}
                      </div>
                      <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginTop: 2 }}>
                        {s.city && s.province ? `${s.city}, ${s.province}` : s.city || s.province || ''}
                        {s.total_saved > 0 && ` · ${s.total_saved} prospectos`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: theme.fontSizes.xs, padding: '2px 8px', borderRadius: 10,
                      backgroundColor: getScoreBg(s.status === 'completed' ? 80 : s.status === 'failed' ? 0 : 45),
                      color: statusColor(s.status), whiteSpace: 'nowrap', marginLeft: 8,
                    }}>
                      {statusLabel(s.status)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!activeSearchId ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 24px' }}>
              <Search size={48} style={{ color: theme.colors.border, marginBottom: 16 }} />
              <h3 style={{ margin: '0 0 8px', fontSize: theme.fontSizes.base, color: theme.colors.text, fontWeight: theme.fontWeights.semibold }}>
                Seleccioná una búsqueda
              </h3>
              <p style={{ margin: 0, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                Elegí una búsqueda de la lista o creá una nueva para ver resultados.
              </p>
            </div>
          ) : loadingProspects ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 24px' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12, color: theme.colors.primary }} />
              <p style={{ margin: 0, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>Cargando prospectos...</p>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold }}>
                    {activeSearch?.category || activeSearch?.city || `Búsqueda #${activeSearchId}`}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                    {activeSearch?.total_saved} prospectos encontrados
                    {activeSearch?.total_found ? ` de ${activeSearch.total_found} encontrados` : ''}
                    {apiUsage && ` · ${apiUsage.text_search_count} búsquedas, ${apiUsage.place_details_count} detalles, $${apiUsage.total_cost.toFixed(4)} USD`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={filterWebsite}
                    onChange={(e) => setFilterWebsite(e.target.value)}
                    style={{
                      padding: '6px 10px', border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.md, fontSize: theme.fontSizes.xs,
                      outline: 'none',
                    }}
                  >
                    <option value="all">Todos los sitios</option>
                    <option value="with_website">Con web</option>
                    <option value="without_website">Sin web</option>
                  </select>
                  <select
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                    style={{
                      padding: '6px 10px', border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.md, fontSize: theme.fontSizes.xs,
                      outline: 'none',
                    }}
                  >
                    <option value="">Toda oportunidad</option>
                    <option value="80">Muy alta (80+)</option>
                    <option value="65">Alta (65+)</option>
                    <option value="45">Media (45+)</option>
                  </select>
                  <button
                    onClick={() => loadProspects(activeSearchId!)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 10px', border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.md, background: '#fff',
                      cursor: 'pointer', fontSize: theme.fontSizes.xs,
                    }}
                    title="Refrescar"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {prospects.length === 0 ? (
                <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, margin: 0, textAlign: 'center', padding: 20 }}>
                  No se encontraron prospectos con los filtros seleccionados.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC' }}>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'left' }}>Nombre</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'left' }}>Rubro</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'left' }}>Ciudad</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'center' }}>Rating</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'center' }}>Web</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'center' }}>Tel</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'center' }}>Oportunidad</th>
                        <th style={{ ...cellStyle, fontWeight: theme.fontWeights.semibold, textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prospects.map((p) => (
                        <tr key={p.id} style={{ transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}>
                          <td style={cellStyle}>
                            <div style={{ fontWeight: theme.fontWeights.semibold }}>{p.name}</div>
                            {p.website && <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{p.website_domain || p.website}</div>}
                          </td>
                          <td style={cellStyle}>{p.rubro || '—'}</td>
                          <td style={cellStyle}>{p.city || '—'}</td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            {p.rating ? (
                              <span style={{ fontWeight: theme.fontWeights.semibold }}>
                                {p.rating} {p.review_count ? `(${p.review_count})` : ''}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            {p.website ? (
                              <a href={p.website} target="_blank" rel="noopener noreferrer"
                                style={{ color: theme.colors.accent }}
                                onClick={(e) => e.stopPropagation()}>
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              <span style={{ color: theme.colors.textMuted }}>—</span>
                            )}
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            {p.phone ? (
                              <a href={`https://wa.me/${p.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                style={{ color: '#15803D', textDecoration: 'none', fontSize: theme.fontSizes.xs }}>
                                WA
                              </a>
                            ) : '—'}
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '2px 10px', borderRadius: 12,
                              fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold,
                              backgroundColor: getScoreBg(p.opportunity_score),
                              color: getScoreColor(p.opportunity_score),
                            }}>
                              {p.opportunity_score}
                            </span>
                          </td>
                          <td style={{ ...cellStyle, textAlign: 'center' }}>
                            <button
                              onClick={() => router.push(`/dashboard/radar/prospectos/${p.id}`)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', border: `1px solid ${theme.colors.border}`,
                                borderRadius: theme.radii.md, background: '#fff',
                                cursor: 'pointer', fontSize: theme.fontSizes.xs,
                                color: theme.colors.textMuted,
                              }}
                            >
                              <Eye size={14} /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
