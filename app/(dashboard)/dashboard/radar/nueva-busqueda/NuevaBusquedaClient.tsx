'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { theme } from '@/lib/theme'
import RubroCombobox from '@/components/dashboard/RubroCombobox'
import FieldRow from '@/components/dashboard/FieldRow'

const formSchema = z.object({
  province: z.string().optional().default(''),
  city: z.string().min(1, 'La localidad es requerida'),
  keywords: z.string().optional().default(''),
  radiusKm: z.coerce.number().int().min(0).optional().default(0),
  maxResults: z.coerce.number().int().min(1).max(200).optional().default(50),
  serviceId: z.coerce.number().int().optional().default(0),
  websiteFilter: z.enum(['all', 'with_website', 'without_website']).optional().default('all'),
  phoneRequired: z.coerce.boolean().optional().default(false),
  emailRequired: z.coerce.boolean().optional().default(false),
  minRating: z.coerce.number().min(0).max(5).optional().default(0),
  minReviewCount: z.coerce.number().int().min(0).optional().default(0),
  businessStatus: z.enum(['all', 'operational']).optional().default('all'),
})

type FormData = z.infer<typeof formSchema>

const RADIUS_OPTIONS = [0, 5, 10, 20, 50, 100]
const MAX_RESULTS_OPTIONS = [20, 50, 100, 200]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm, outline: 'none',
  boxSizing: 'border-box',
}

export default function NuevaBusquedaClient({
  servicios,
}: {
  servicios: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rubro, setRubro] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      maxResults: 50,
      radiusKm: 0,
      websiteFilter: 'all',
      businessStatus: 'all',
    },
  })

  async function onSubmit(data: FormData) {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        province: data.province || undefined,
        city: data.city || undefined,
        category: rubro || undefined,
        keywords: data.keywords ? data.keywords.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        radiusKm: data.radiusKm || undefined,
        maxResults: data.maxResults || 50,
        serviceId: data.serviceId || undefined,
        websiteFilter: data.websiteFilter,
        phoneRequired: data.phoneRequired,
        emailRequired: data.emailRequired,
        minRating: data.minRating || undefined,
        minReviewCount: data.minReviewCount || undefined,
        businessStatus: data.businessStatus,
      }

      const res = await fetch('/api/dashboard/radar/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(typeof err.error === 'string' ? err.error : 'Error al crear la búsqueda')
      }

      const search = await res.json()
      router.push(`/dashboard/radar?searchId=${search.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

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
        <h1 style={{ fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text, margin: 0 }}>
          Nueva búsqueda
        </h1>
      </div>

      <div style={{
        backgroundColor: '#fff', borderRadius: theme.radii.lg,
        border: `1px solid ${theme.colors.border}`, padding: 24,
      }}>
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#FEF2F2', color: theme.colors.error,
            padding: '10px 14px', borderRadius: theme.radii.md,
            fontSize: theme.fontSizes.sm, marginBottom: 20,
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} id="search-form">
          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            1. Ubicación
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <FieldRow label="Provincia">
              <input {...register('province')} style={inputStyle} placeholder="Ej: Chubut" />
            </FieldRow>
            <FieldRow label="Localidad" required>
              <input {...register('city')} style={inputStyle} placeholder="Ej: Comodoro Rivadavia" />
              {errors.city && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, margin: '4px 0 0' }}>{errors.city.message}</p>}
            </FieldRow>
          </div>

          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            2. Rubro y palabras clave
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <FieldRow label="Rubro" required>
              <RubroCombobox
                value={rubro}
                onChange={(v) => setRubro(v as string)}
                placeholder="Ej: centros de estética"
                allowCreate={true}
              />
              {!rubro && errors.city && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, margin: '4px 0 0' }}>El rubro es requerido</p>}
            </FieldRow>
            <FieldRow label="Palabras clave">
              <input {...register('keywords')} style={inputStyle} placeholder="turnos, uñas, depilación (separado por coma)" />
            </FieldRow>
          </div>

          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            3. Servicio a ofrecer
          </h3>
          <div style={{ marginBottom: 20 }}>
            <FieldRow label="Servicio">
              <select {...register('serviceId')} style={inputStyle}>
                <option value={0}>Sin servicio específico</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </FieldRow>
          </div>

          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            4. Filtros adicionales
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            <FieldRow label="Web" labelWidth={70}>
              <select {...register('websiteFilter')} style={inputStyle}>
                <option value="all">Todos</option>
                <option value="with_website">Con sitio web</option>
                <option value="without_website">Sin sitio web</option>
              </select>
            </FieldRow>
            <FieldRow label="Calif." labelWidth={70}>
              <select {...register('minRating')} style={inputStyle}>
                <option value={0}>Sin mínimo</option>
                <option value={3}>3+ estrellas</option>
                <option value={3.5}>3.5+ estrellas</option>
                <option value={4}>4+ estrellas</option>
                <option value={4.5}>4.5+ estrellas</option>
              </select>
            </FieldRow>
            <FieldRow label="Reseñas" labelWidth={70}>
              <select {...register('minReviewCount')} style={inputStyle}>
                <option value={0}>Sin mínimo</option>
                <option value={5}>5+ reseñas</option>
                <option value={10}>10+ reseñas</option>
                <option value={30}>30+ reseñas</option>
                <option value={100}>100+ reseñas</option>
              </select>
            </FieldRow>
            <FieldRow label="Estado" labelWidth={70}>
              <select {...register('businessStatus')} style={inputStyle}>
                <option value="all">Todos</option>
                <option value="operational">Solo operativos</option>
              </select>
            </FieldRow>
            <FieldRow label="Teléfono" labelWidth={70}>
              <select {...register('phoneRequired')} style={inputStyle}>
                <option value="false">No requerido</option>
                <option value="true">Requerido</option>
              </select>
            </FieldRow>
            <FieldRow label="Email" labelWidth={70}>
              <select {...register('emailRequired')} style={inputStyle}>
                <option value="false">No requerido</option>
                <option value="true">Requerido</option>
              </select>
            </FieldRow>
          </div>

          <h3 style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold, margin: '0 0 14px' }}>
            5. Límites de búsqueda
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <FieldRow label="Radio">
              <select {...register('radiusKm')} style={inputStyle}>
                {RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>{km === 0 ? 'Sin radio' : `${km} km`}</option>
                ))}
              </select>
            </FieldRow>
            <FieldRow label="Máximo resultados">
              <select {...register('maxResults')} style={inputStyle}>
                {MAX_RESULTS_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} resultados</option>
                ))}
              </select>
            </FieldRow>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: `1px solid ${theme.colors.border}`, paddingTop: 16 }}>
            <button type="button" onClick={() => router.push('/dashboard/radar')} style={{
              padding: '8px 16px', border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii.md, fontSize: theme.fontSizes.sm,
              cursor: 'pointer', background: '#fff',
            }}>
              Cancelar
            </button>
            <button type="submit" form="search-form" disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', backgroundColor: theme.colors.primary,
              color: '#fff', border: 'none', borderRadius: theme.radii.md,
              fontSize: theme.fontSizes.sm, cursor: 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? <Loader2 size={16} /> : <Search size={16} />}
              {saving ? 'Buscando...' : 'Iniciar búsqueda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
