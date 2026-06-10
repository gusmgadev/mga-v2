'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const MODULOS = ['ventas', 'inventario', 'caja', 'contactos', 'finanzas', 'administracion', 'optica']
const PLANES = ['basico', 'profesional', 'enterprise']
const ESTADOS_IMPL = ['en_progreso', 'activo', 'pausado', 'suspendido']

const sectionStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }

type EmpresaModulo = { id: number; empresa_id: number; modulo: string; activo: boolean }
type Empresa = {
  id: number; nombre: string; codigo: string; activo: boolean
  supabase_url: string | null; supabase_anon_key: string | null; supabase_service_key: string | null
  razon_social: string | null; cuit: string | null; telefono: string | null; email: string | null
  direccion: string | null; localidad: string | null; plan: string | null
  fecha_inicio: string | null; fecha_vencimiento: string | null
  estado_implementacion: string | null; notas: string | null
  empresa_modulos: EmpresaModulo[]
}

export default function EditarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    nombre: '', codigo: '', activo: true,
    supabase_url: '', supabase_anon_key: '', supabase_service_key: '',
    razon_social: '', cuit: '', telefono: '', email: '', direccion: '', localidad: '',
    plan: '', fecha_inicio: '', fecha_vencimiento: '',
    estado_implementacion: '', notas: '',
  })
  const [modulos, setModulos] = useState<string[]>([])
  const [modulosOriginales, setModulosOriginales] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/superadmin/empresas/${id}`)
      .then(r => {
        if (r.status === 401) { router.push('/superadmin/login'); return null }
        if (!r.ok) { router.push('/superadmin/empresas'); return null }
        return r.json()
      })
      .then((d: Empresa | null) => {
        if (!d) return
        setForm({
          nombre: d.nombre ?? '',
          codigo: d.codigo ?? '',
          activo: d.activo ?? true,
          supabase_url: d.supabase_url ?? '',
          supabase_anon_key: d.supabase_anon_key ?? '',
          supabase_service_key: d.supabase_service_key ?? '',
          razon_social: d.razon_social ?? '',
          cuit: d.cuit ?? '',
          telefono: d.telefono ?? '',
          email: d.email ?? '',
          direccion: d.direccion ?? '',
          localidad: d.localidad ?? '',
          plan: d.plan ?? '',
          fecha_inicio: d.fecha_inicio ?? '',
          fecha_vencimiento: d.fecha_vencimiento ?? '',
          estado_implementacion: d.estado_implementacion ?? '',
          notas: d.notas ?? '',
        })
        const activos = d.empresa_modulos?.filter(m => m.activo).map(m => m.modulo) ?? []
        setModulos(activos)
        setModulosOriginales(activos)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  function field(key: keyof typeof form) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value })),
    }
  }

  function toggleModulo(m: string) {
    setModulos(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const modulosCambiaron = JSON.stringify([...modulos].sort()) !== JSON.stringify([...modulosOriginales].sort())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const res = await fetch(`/api/superadmin/empresas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    if (modulosCambiaron) {
      const resMod = await fetch(`/api/superadmin/empresas/${id}/modulos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulos }),
      })
      if (!resMod.ok) {
        const data = await resMod.json()
        setError(data.error ?? 'Error al actualizar módulos')
        setSaving(false)
        return
      }
      setModulosOriginales([...modulos])
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ color: '#888' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.push('/superadmin/empresas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0 }}>
            ← Volver
          </button>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Editar empresa</div>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#9ca3af', background: '#f3f4f6', borderRadius: 6, padding: '2px 8px' }}>{form.codigo}</span>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Acceso */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Acceso</div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input style={inputStyle} {...field('nombre')} required />
              </div>
              <div>
                <label style={labelStyle}>Código</label>
                <input style={inputStyle} {...field('codigo')}
                  onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                  required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Supabase URL</label>
                <input style={inputStyle} {...field('supabase_url')} />
              </div>
              <div>
                <label style={labelStyle}>Anon Key</label>
                <input style={inputStyle} {...field('supabase_anon_key')} />
              </div>
              <div>
                <label style={labelStyle}>Service Role Key</label>
                <input style={inputStyle} {...field('supabase_service_key')} />
              </div>
              <div>
                <label style={labelStyle}>Activo</label>
                <select style={inputStyle} value={form.activo ? 'true' : 'false'}
                  onChange={e => setForm(p => ({ ...p, activo: e.target.value === 'true' }))}>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datos comerciales */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Datos comerciales</div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Razón social</label>
                <input style={inputStyle} {...field('razon_social')} />
              </div>
              <div>
                <label style={labelStyle}>CUIT</label>
                <input style={inputStyle} {...field('cuit')} />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input style={inputStyle} {...field('telefono')} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" {...field('email')} />
              </div>
              <div>
                <label style={labelStyle}>Dirección</label>
                <input style={inputStyle} {...field('direccion')} />
              </div>
              <div>
                <label style={labelStyle}>Localidad</label>
                <input style={inputStyle} {...field('localidad')} />
              </div>
              <div>
                <label style={labelStyle}>Plan</label>
                <select style={inputStyle} {...field('plan')}>
                  <option value="">Seleccionar</option>
                  {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div></div>
              <div>
                <label style={labelStyle}>Fecha inicio</label>
                <input style={inputStyle} type="date" {...field('fecha_inicio')} />
              </div>
              <div>
                <label style={labelStyle}>Fecha vencimiento</label>
                <input style={inputStyle} type="date" {...field('fecha_vencimiento')} />
              </div>
            </div>
          </div>

          {/* Implementación */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Implementación</div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Estado</label>
              <select style={inputStyle} {...field('estado_implementacion')}>
                <option value="">Seleccionar</option>
                {ESTADOS_IMPL.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notas</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} {...field('notas')} />
            </div>
          </div>

          {/* Módulos */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
              Módulos habilitados
              {modulosCambiaron && <span style={{ fontSize: 12, color: '#f59e0b', marginLeft: 10, fontWeight: 400 }}>Modificado</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {MODULOS.map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={modulos.includes(m)}
                    onChange={() => toggleModulo(m)}
                    style={{ width: 16, height: 16 }}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
              Guardado correctamente
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => router.push('/superadmin/empresas')}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', color: '#374151' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
