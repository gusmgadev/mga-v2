'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Phone, Globe, MapPin, Star, MessageCircle, Mail, Edit3, Save, X, Check, Loader2, UserCheck, CalendarClock, Trash2, Plus } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ModulePermisos } from '@/lib/permisos'
import type { Prospect, WebsiteAnalysis, ProspectInteraction, ScoreReason } from '@/types/radar'
import ConvertirClienteModal from '@/components/dashboard/radar/ConvertirClienteModal'
import FieldRow from '@/components/dashboard/FieldRow'

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: theme.radii.lg,
  border: `1px solid ${theme.colors.border}`, padding: 20, marginBottom: 16,
}

const labelStyle: React.CSSProperties = {
  fontSize: theme.fontSizes.xs, color: theme.colors.textMuted,
  marginBottom: 2, fontWeight: theme.fontWeights.medium,
}

const valueStyle: React.CSSProperties = {
  fontSize: theme.fontSizes.sm, color: theme.colors.text,
  fontWeight: theme.fontWeights.medium,
}

const COMMERCIAL_STATUS_LABELS: Record<string, string> = {
  new: 'Nueva', reviewed: 'Revisada', to_contact: 'Para contactar',
  contacted: 'Contactada', interested: 'Interesado', meeting: 'Reunión',
  proposal_sent: 'Presupuestado', won: 'Ganada', lost: 'Perdida',
  discarded: 'Descartada', do_not_contact: 'No contactar',
  existing_customer: 'Cliente propio',
}

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  telefono: 'Teléfono', whatsapp: 'WhatsApp', mail: 'Mail',
  presencial: 'Presencial', otro: 'Otro',
}
const INTERACTION_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  telefono:   { bg: '#E3F2FD', text: '#1565C0' },
  whatsapp:   { bg: '#E8F5E9', text: '#2E7D32' },
  mail:       { bg: '#FFF3E0', text: '#E65100' },
  presencial: { bg: '#F3E8FF', text: '#7C3AED' },
  otro:       { bg: '#F1F5F9', text: '#475569' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', fontSize: theme.fontSizes.sm,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: '#fff',
}

export default function ProspectoDetalleClient({
  prospect, websiteAnalysis, interactions, permisos,
}: {
  prospect: Prospect
  websiteAnalysis: WebsiteAnalysis | null
  interactions: ProspectInteraction[]
  permisos: ModulePermisos
}) {
  const router = useRouter()
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailDraft, setEmailDraft] = useState(prospect.email ?? '')
  const [savingEmail, setSavingEmail] = useState(false)
  const [editingWhatsapp, setEditingWhatsapp] = useState(false)
  const [whatsappDraft, setWhatsappDraft] = useState(prospect.whatsapp ?? prospect.normalized_phone ?? '')
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [showConvert, setShowConvert] = useState(false)

  const [items, setItems] = useState<ProspectInteraction[]>(interactions)
  const [addingInt, setAddingInt] = useState(false)
  const [intType, setIntType] = useState('telefono')
  const [intChannel, setIntChannel] = useState('')
  const [intDate, setIntDate] = useState(new Date().toISOString().split('T')[0])
  const [intNotes, setIntNotes] = useState('')
  const [intNext, setIntNext] = useState('')
  const [intSaving, setIntSaving] = useState(false)
  const [intError, setIntError] = useState<string | null>(null)

  const reasons: ScoreReason[] = Array.isArray(prospect.opportunity_reasons)
    ? prospect.opportunity_reasons
    : (typeof prospect.opportunity_reasons === 'string' ? JSON.parse(prospect.opportunity_reasons) : [])

  async function handleSaveEmail() {
    setSavingEmail(true)
    try {
      const res = await fetch(`/api/dashboard/radar/prospects/${prospect.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailDraft.trim() || null }),
      })
      if (res.ok) {
        prospect.email = emailDraft.trim() || null
        setEditingEmail(false)
      }
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleSaveWhatsapp() {
    setSavingWhatsapp(true)
    try {
      const val = whatsappDraft.trim()
      const res = await fetch(`/api/dashboard/radar/prospects/${prospect.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: val || null }),
      })
      if (res.ok) {
        prospect.whatsapp = val || null
        setEditingWhatsapp(false)
      }
    } finally {
      setSavingWhatsapp(false)
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/dashboard/radar/prospects/${prospect.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commercial_status: e.target.value }),
      })
      if (res.ok) {
        const updated = await res.json()
        Object.assign(prospect, updated)
      }
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleAddInteraction(e: React.FormEvent) {
    e.preventDefault()
    if (!intDate) return
    setIntSaving(true)
    setIntError(null)
    const res = await fetch(`/api/dashboard/radar/prospects/${prospect.id}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interaction_type: intType,
        channel: intChannel,
        interaction_date: intDate,
        notes: intNotes,
        next_follow_up_at: intNext || null,
      }),
    })
    const json = await res.json()
    setIntSaving(false)
    if (!res.ok) { setIntError(json.error ?? 'No se pudo registrar el contacto'); return }
    setItems((prev) => [json, ...prev])
    setAddingInt(false)
    setIntChannel('')
    setIntNotes('')
    setIntNext('')
  }

  async function handleDeleteInteraction(id: number) {
    const res = await fetch(`/api/dashboard/radar/interactions/${id}`, { method: 'DELETE' })
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id))
  }

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

  const scoreBlocks = [
    { label: 'Actividad comercial', key: 'commercial_activity_score' as const },
    { label: 'Necesidad digital', key: 'digital_need_score' as const },
    { label: 'Facilidad contacto', key: 'contactability_score' as const },
    { label: 'Compatibilidad', key: 'service_fit_score' as const },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push('/dashboard/radar')} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 12px', border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.md, background: '#fff', cursor: 'pointer',
          fontSize: theme.fontSizes.sm, color: theme.colors.textMuted,
        }}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0, flex: 1 }}>
          {prospect.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={prospect.commercial_status}
            onChange={handleStatusChange}
            disabled={statusUpdating}
            style={{
              padding: '6px 12px', border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
              outline: 'none', background: '#fff',
            }}
          >
            {Object.entries(COMMERCIAL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {prospect.existing_client_id ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', backgroundColor: '#DCFCE7', color: '#15803D',
              borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
            }}>
              <UserCheck size={16} /> Cliente propio
            </span>
          ) : (
            <button
              onClick={() => setShowConvert(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', backgroundColor: theme.colors.primary, color: '#fff',
                border: 'none', borderRadius: theme.radii.md,
                fontSize: theme.fontSizes.sm, cursor: 'pointer',
              }}
            >
              <UserCheck size={16} /> Convertir a cliente
            </button>
          )}
          {prospect.phone && (
            <a
              href={`https://wa.me/${prospect.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, ¿cómo estás? Te contactamos de MGA Informática para ofrecerte nuestros servicios.')}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', backgroundColor: '#25D366', color: '#fff',
                border: 'none', borderRadius: theme.radii.md,
                fontSize: theme.fontSizes.sm, cursor: 'pointer', textDecoration: 'none',
              }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={sectionStyle}>
          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            Información general
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={labelStyle}>Nombre</p>
              <p style={valueStyle}>{prospect.name}</p>
            </div>
            {prospect.rubro && (
              <div>
                <p style={labelStyle}>Rubro</p>
                <p style={valueStyle}>{prospect.rubro}</p>
              </div>
            )}
            {prospect.city && (
              <div>
                <p style={labelStyle}>Ciudad</p>
                <p style={valueStyle}>{[prospect.city, prospect.province].filter(Boolean).join(', ')}</p>
              </div>
            )}
            {prospect.address && (
              <div>
                <p style={labelStyle}>Dirección</p>
                <p style={valueStyle}>{prospect.address}</p>
              </div>
            )}
            {prospect.business_status && (
              <div>
                <p style={labelStyle}>Estado</p>
                <p style={valueStyle}>{prospect.business_status === 'OPERATIONAL' ? 'Operativo' : prospect.business_status}</p>
              </div>
            )}
            {prospect.rating && (
              <div>
                <p style={labelStyle}>Calificación</p>
                <p style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill="#EF9F27" color="#EF9F27" />
                  {prospect.rating} {prospect.review_count ? `(${prospect.review_count} reseñas)` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            Datos de contacto
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prospect.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                <a href={`tel:${prospect.phone}`} style={{ color: theme.colors.accent, textDecoration: 'none', fontSize: theme.fontSizes.sm }}>
                  {prospect.phone}
                </a>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
              {editingEmail ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    placeholder="email@ejemplo.com"
                    autoFocus
                    style={{
                      flex: 1, padding: '4px 8px', border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
                      outline: 'none', minWidth: 0,
                    }}
                  />
                  <button onClick={handleSaveEmail} disabled={savingEmail}
                    style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#15803D' }}>
                    {savingEmail ? <Loader2 size={14} /> : <Check size={14} />}
                  </button>
                  <button onClick={() => { setEditingEmail(false); setEmailDraft(prospect.email ?? '') }}
                    style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: theme.colors.textMuted }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingEmail(true); setEmailDraft(prospect.email ?? '') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, flex: 1,
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: theme.fontSizes.sm, color: prospect.email ? theme.colors.text : theme.colors.textMuted,
                    textAlign: 'left', padding: 0,
                  }}>
                  <span>{prospect.email || 'Sin email — agregar'}</span>
                  <Edit3 size={12} style={{ opacity: 0.5 }} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={14} style={{ color: '#25D366', flexShrink: 0 }} />
              {editingWhatsapp ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                  <input
                    type="tel"
                    value={whatsappDraft}
                    onChange={(e) => setWhatsappDraft(e.target.value)}
                    placeholder="+5491122334455"
                    autoFocus
                    style={{
                      flex: 1, padding: '4px 8px', border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
                      outline: 'none', minWidth: 0,
                    }}
                  />
                  <button onClick={handleSaveWhatsapp} disabled={savingWhatsapp}
                    style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#15803D' }}>
                    {savingWhatsapp ? <Loader2 size={14} /> : <Check size={14} />}
                  </button>
                  <button onClick={() => { setEditingWhatsapp(false); setWhatsappDraft(prospect.whatsapp ?? prospect.normalized_phone ?? '') }}
                    style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: theme.colors.textMuted }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingWhatsapp(true); setWhatsappDraft(prospect.whatsapp ?? prospect.normalized_phone ?? '') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, flex: 1,
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: theme.fontSizes.sm, color: (prospect.whatsapp || prospect.normalized_phone) ? '#15803D' : theme.colors.textMuted,
                    textAlign: 'left', padding: 0,
                  }}>
                  <span>{prospect.whatsapp || prospect.normalized_phone || 'Sin WhatsApp — agregar'}</span>
                  <Edit3 size={12} style={{ opacity: 0.5 }} />
                </button>
              )}
              {(prospect.whatsapp || prospect.normalized_phone) && (
                <a
                  href={`https://wa.me/${(prospect.whatsapp || prospect.normalized_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, ¿cómo estás? Te contactamos de MGA Informática para ofrecerte nuestros servicios.')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', backgroundColor: '#25D366', color: '#fff',
                    border: 'none', borderRadius: theme.radii.md,
                    fontSize: theme.fontSizes.xs, cursor: 'pointer', textDecoration: 'none',
                    flexShrink: 0, fontWeight: theme.fontWeights.medium,
                  }}>
                  <MessageCircle size={12} /> WA
                </a>
              )}
            </div>
            {prospect.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={14} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                <a href={prospect.website} target="_blank" rel="noopener noreferrer"
                  style={{ color: theme.colors.accent, textDecoration: 'none', fontSize: theme.fontSizes.sm, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {prospect.website_domain || prospect.website} <ExternalLink size={12} />
                </a>
              </div>
            )}
            {prospect.google_maps_url && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                <a href={prospect.google_maps_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: theme.colors.accent, textDecoration: 'none', fontSize: theme.fontSizes.sm, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Ver en Google Maps <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
          Puntajes de oportunidad
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: getScoreBg(prospect.opportunity_score),
            color: getScoreColor(prospect.opportunity_score),
            fontSize: '28px', fontWeight: theme.fontWeights.bold,
          }}>
            {prospect.opportunity_score}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold }}>Oportunidad final</p>
            <p style={{ margin: '2px 0 0', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              {prospect.opportunity_level === 'very_high' ? 'Muy alta' :
               prospect.opportunity_level === 'high' ? 'Alta' :
               prospect.opportunity_level === 'medium' ? 'Media' :
               prospect.opportunity_level === 'low' ? 'Baja' : 'Muy baja'}
              {prospect.recommended_service_name ? ` · Recomendado: ${prospect.recommended_service_name}` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {scoreBlocks.map((block) => (
            <div key={block.key} style={{
              padding: 14, borderRadius: theme.radii.md,
              backgroundColor: getScoreBg(prospect[block.key]),
              border: `1px solid ${getScoreColor(prospect[block.key])}20`,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{block.label}</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: theme.fontWeights.bold, color: getScoreColor(prospect[block.key]) }}>
                {prospect[block.key]}
              </p>
            </div>
          ))}
        </div>

        {reasons.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold, margin: '0 0 8px' }}>
              Motivos del puntaje
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reasons.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', backgroundColor: '#FAFAFA',
                  borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
                }}>
                  <span style={{ color: theme.colors.text }}>{r.label}</span>
                  <span style={{
                    fontWeight: theme.fontWeights.bold,
                    color: r.impact > 0 ? '#15803D' : theme.colors.textMuted,
                  }}>
                    {r.impact > 0 ? `+${r.impact}` : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: 0 }}>
            Historial de seguimiento
          </h3>
          {!addingInt && (
            <button onClick={() => setAddingInt(true)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md, background: '#fff', cursor: 'pointer',
              fontSize: theme.fontSizes.sm, color: theme.colors.primary,
              fontWeight: theme.fontWeights.medium,
            }}>
              <Plus size={14} /> Registrar contacto
            </button>
          )}
        </div>

        {items.length === 0 && !addingInt && (
          <p style={{ margin: 0, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            Sin contactos registrados todavía.
          </p>
        )}

        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {items.map((it) => {
              const { bg, text } = INTERACTION_TYPE_COLORS[it.interaction_type] ?? INTERACTION_TYPE_COLORS.otro
              return (
                <div key={it.id} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, padding: '12px 14px', backgroundColor: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 9px', backgroundColor: bg, color: text, borderRadius: theme.radii.full, fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, whiteSpace: 'nowrap' }}>
                        {INTERACTION_TYPE_LABELS[it.interaction_type] ?? it.interaction_type}
                      </span>
                      <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, whiteSpace: 'nowrap' }}>
                        {new Date(it.interaction_date).toLocaleDateString('es-AR')}
                      </span>
                      {it.channel && (
                        <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.text, fontWeight: theme.fontWeights.medium }}>
                          {it.channel}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDeleteInteraction(it.id)} title="Eliminar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, padding: 2, display: 'flex', flexShrink: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {it.notes && (
                    <p style={{ margin: '8px 0 0', fontSize: theme.fontSizes.sm, color: theme.colors.text, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {it.notes}
                    </p>
                  )}
                  {it.next_follow_up_at && (
                    <p style={{ margin: '8px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarClock size={12} /> Próximo seguimiento: {new Date(it.next_follow_up_at).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {addingInt && (
          <form onSubmit={handleAddInteraction} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: `1px solid ${theme.colors.border}`, paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <FieldRow label="Tipo">
                <select value={intType} onChange={(e) => setIntType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {Object.entries(INTERACTION_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Fecha">
                <input type="date" value={intDate} onChange={(e) => setIntDate(e.target.value)} style={inputStyle} />
              </FieldRow>
              <FieldRow label="Canal">
                <input type="text" value={intChannel} onChange={(e) => setIntChannel(e.target.value)} placeholder="ej: +54 9 11..." style={inputStyle} />
              </FieldRow>
            </div>
            <FieldRow label="Notas">
              <textarea value={intNotes} onChange={(e) => setIntNotes(e.target.value)} rows={2}
                placeholder="Resultado del contacto, próximos pasos..." style={{ ...inputStyle, resize: 'vertical' }} />
            </FieldRow>
            <FieldRow label="Próximo seguimiento">
              <input type="date" value={intNext} onChange={(e) => setIntNext(e.target.value)} style={inputStyle} />
            </FieldRow>
            {intError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, color: theme.colors.error }}>
                {intError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={intSaving} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', backgroundColor: intSaving ? `${theme.colors.primary}99` : theme.colors.primary,
                color: '#fff', border: 'none', borderRadius: theme.radii.md, cursor: intSaving ? 'not-allowed' : 'pointer',
                fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              }}>
                {intSaving && <Loader2 size={14} className="animate-spin" />}
                {intSaving ? 'Guardando...' : 'Guardar contacto'}
              </button>
              <button type="button" onClick={() => { setAddingInt(false); setIntError(null) }} style={{
                padding: '9px 16px', border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.md, background: '#fff', cursor: 'pointer',
                fontSize: theme.fontSizes.sm, color: theme.colors.textMuted,
              }}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {websiteAnalysis && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            Análisis del sitio web
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <p style={labelStyle}>Estado</p>
              <p style={valueStyle}>{websiteAnalysis.reachable ? 'Accesible' : 'No accesible'}</p>
            </div>
            {websiteAnalysis.http_status && (
              <div>
                <p style={labelStyle}>HTTP Status</p>
                <p style={valueStyle}>{websiteAnalysis.http_status}</p>
              </div>
            )}
            <div>
              <p style={labelStyle}>SSL</p>
              <p style={valueStyle}>{websiteAnalysis.has_ssl ? 'Sí' : 'No'}</p>
            </div>
            {websiteAnalysis.detected_emails && websiteAnalysis.detected_emails.length > 0 && (
              <div>
                <p style={labelStyle}>Emails detectados</p>
                <p style={valueStyle}>{websiteAnalysis.detected_emails.join(', ')}</p>
              </div>
            )}
            {websiteAnalysis.detected_phones && websiteAnalysis.detected_phones.length > 0 && (
              <div>
                <p style={labelStyle}>Teléfonos detectados</p>
                <p style={valueStyle}>{websiteAnalysis.detected_phones.join(', ')}</p>
              </div>
            )}
            {websiteAnalysis.detected_technologies && websiteAnalysis.detected_technologies.length > 0 && (
              <div>
                <p style={labelStyle}>Tecnologías</p>
                <p style={valueStyle}>{websiteAnalysis.detected_technologies.join(', ')}</p>
              </div>
            )}
          </div>
          {websiteAnalysis.performance_score != null && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
              <div>
                <p style={labelStyle}>Rendimiento</p>
                <p style={valueStyle}>{websiteAnalysis.performance_score ?? '—'}</p>
              </div>
              <div>
                <p style={labelStyle}>Accesibilidad</p>
                <p style={valueStyle}>{websiteAnalysis.accessibility_score ?? '—'}</p>
              </div>
              <div>
                <p style={labelStyle}>SEO</p>
                <p style={valueStyle}>{websiteAnalysis.seo_score ?? '—'}</p>
              </div>
              <div>
                <p style={labelStyle}>Prácticas</p>
                <p style={valueStyle}>{websiteAnalysis.best_practices_score ?? '—'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={sectionStyle}>
        <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
          Información de fuente
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <p style={labelStyle}>Fuente</p>
            <p style={valueStyle}>{prospect.source}</p>
          </div>
          {prospect.last_verified_at && (
            <div>
              <p style={labelStyle}>Última verificación</p>
              <p style={valueStyle}>{new Date(prospect.last_verified_at).toLocaleDateString('es-AR')}</p>
            </div>
          )}
          {prospect.analyzed_at && (
            <div>
              <p style={labelStyle}>Analizado</p>
              <p style={valueStyle}>{new Date(prospect.analyzed_at).toLocaleDateString('es-AR')}</p>
            </div>
          )}
          <div>
            <p style={labelStyle}>Estado comercial</p>
            <p style={valueStyle}>{COMMERCIAL_STATUS_LABELS[prospect.commercial_status] ?? prospect.commercial_status}</p>
          </div>
        </div>
      </div>

      {showConvert && (
        <ConvertirClienteModal
          prospect={prospect}
          onClose={() => setShowConvert(false)}
          onConverted={(updated) => {
            Object.assign(prospect, updated)
            setShowConvert(false)
          }}
        />
      )}
    </div>
  )
}
