'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MODULOS = ['ventas', 'inventario', 'caja', 'contactos', 'finanzas', 'administracion', 'optica']
const PLANES = ['basico', 'profesional', 'enterprise']
const ESTADOS_IMPL = ['en_progreso', 'activo', 'pausado', 'suspendido']

const sectionStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }

export default function NuevaEmpresaPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre: '', codigo: '', supabase_url: '', supabase_anon_key: '', supabase_service_key: '',
    razon_social: '', cuit: '', telefono: '', email: '', direccion: '', localidad: '',
    plan: '', fecha_inicio: '', fecha_vencimiento: '',
    estado_implementacion: 'en_progreso', notas: '',
  })
  const [modulos, setModulos] = useState<string[]>([...MODULOS])

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value })),
    }
  }

  function toggleModulo(m: string) {
    setModulos(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/superadmin/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, modulos }),
    })
    if (res.ok) {
      router.push('/superadmin/empresas')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.push('/superadmin/empresas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0 }}>
            ← Volver
          </button>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Nueva empresa</div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Sección Acceso */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Acceso</div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Nombre <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} placeholder="Farmacia del Centro" {...field('nombre')} required />
              </div>
              <div>
                <label style={labelStyle}>Código <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} placeholder="FARMACIA2025" {...field('codigo')}
                  onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))} required />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Identificador de login en mga-ptoventa</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Supabase URL <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} placeholder="https://xxx.supabase.co" {...field('supabase_url')} required />
              </div>
              <div>
                <label style={labelStyle}>Anon Key</label>
                <input style={inputStyle} placeholder="eyJh..." {...field('supabase_anon_key')} />
              </div>
              <div>
                <label style={labelStyle}>Service Role Key</label>
                <input style={inputStyle} placeholder="eyJh..." {...field('supabase_service_key')} />
              </div>
            </div>
          </div>

          {/* Sección Datos comerciales */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Datos comerciales</div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Razón social</label>
                <input style={inputStyle} {...field('razon_social')} />
              </div>
              <div>
                <label style={labelStyle}>CUIT</label>
                <input style={inputStyle} placeholder="20-12345678-9" {...field('cuit')} />
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

          {/* Sección Implementación */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Implementación</div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Estado</label>
              <select style={inputStyle} {...field('estado_implementacion')}>
                {ESTADOS_IMPL.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notas</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                {...field('notas')}
              />
            </div>
          </div>

          {/* Sección Módulos */}
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>Módulos habilitados</div>
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
              {saving ? 'Guardando...' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
