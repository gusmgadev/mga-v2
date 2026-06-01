'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperadminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/superadmin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/superadmin/empresas')
    } else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ width: 320, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Panel MGA</div>
          <div style={{ color: '#666', fontSize: 14 }}>Gestión de empresas</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Contraseña</label>
          <input
            type="password"
            placeholder="Contraseña de acceso"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
