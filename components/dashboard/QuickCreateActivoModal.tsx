'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

const TIPOS = ['PC', 'NOTEBOOK', 'SERVIDOR', 'IMPRESORA', 'SISTEMA', 'DESARROLLO', 'SERVICIO', 'DISPOSITIVO', 'OTRO'] as const
type Tipo = typeof TIPOS[number]

interface Props {
  onClose: () => void
  onCreated: (a: { id: number; nombre: string; cliente_id: number }) => void
  clienteIdPreset?: number
  clientes: { id: number; name: string }[]
}

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: theme.fontSizes.sm,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: '5px',
}

export default function QuickCreateActivoModal({ onClose, onCreated, clienteIdPreset, clientes }: Props) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<Tipo>('PC')
  const [clienteId, setClienteId] = useState(clienteIdPreset ?? 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es requerido'); return }
    if (!clienteId) { setError('Seleccioná un cliente'); return }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/dashboard/activos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), tipo, cliente_id: clienteId, activo: true }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? 'Error al crear el activo'); return }
    onCreated(json)
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 12px 40px rgba(0,0,0,0.22)', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}` }}>
          <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
            Nuevo activo
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}>
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!clienteIdPreset && (
            <div>
              <label style={labelStyle}>Cliente <span style={{ color: theme.colors.error }}>*</span></label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(Number(e.target.value))}
                style={{ ...inputStyle, backgroundColor: '#fff' }}
              >
                <option value={0}>Seleccioná un cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Nombre <span style={{ color: theme.colors.error }}>*</span></label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: PC Recepción, Notebook Directorio..."
              style={inputStyle}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
              style={{ ...inputStyle, backgroundColor: '#fff' }}
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '9px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', fontSize: theme.fontSizes.sm }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '9px', backgroundColor: loading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: loading ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Creando...' : 'Crear activo'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
