'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Plus, Check, UserCheck } from 'lucide-react'
import { theme } from '@/lib/theme'
import FieldRow from '@/components/dashboard/FieldRow'
import { ClienteFormCombobox } from '@/components/dashboard/ClienteCombobox'
import QuickCreateClienteModal from '@/components/dashboard/QuickCreateClienteModal'
import type { Prospect } from '@/types/radar'

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: theme.fontSizes.base,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
  backgroundColor: '#fff',
}

function buildQcData(p: Prospect) {
  return {
    nombre: p.name ?? '',
    tipo: 'COMERCIO' as const,
    contacto: '',
    email: p.email ?? '',
    telefono: p.phone ?? '',
    localidad: p.city ?? '',
    direccion: p.address ?? '',
    rubro: p.rubro ?? p.category ?? '',
    pagina_web: p.website ?? '',
  }
}

export default function ConvertirClienteModal({
  prospect,
  onClose,
  onConverted,
}: {
  prospect: Prospect
  onClose: () => void
  onConverted: (updated: Prospect) => void
}) {
  const [clientes, setClientes] = useState<{ id: number; nombre: string }[]>([])
  const [clienteId, setClienteId] = useState(0)
  const [showQc, setShowQc] = useState(false)
  const [notas, setNotas] = useState('')

  const [crearServicio, setCrearServicio] = useState(false)
  const [servicioTitulo, setServicioTitulo] = useState('')
  const [servicioDescripcion, setServicioDescripcion] = useState('')
  const [servicioValor, setServicioValor] = useState('0')
  const [servicioFecha, setServicioFecha] = useState(new Date().toISOString().split('T')[0])

  const [crearPresupuesto, setCrearPresupuesto] = useState(false)
  const [presupuestoTitulo, setPresupuestoTitulo] = useState('')
  const [presupuestoDescripcion, setPresupuestoDescripcion] = useState('')
  const [presupuestoVencimiento, setPresupuestoVencimiento] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/clientes')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClientes(Array.isArray(data) ? data : []))
  }, [])

  const handleClienteCreado = (c: { id: number; nombre: string }) => {
    setClientes((prev) => [...prev, c].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    setClienteId(c.id)
    setShowQc(false)
  }

  const handleSubmit = async () => {
    if (!clienteId) {
      setError('Seleccioná un cliente o crealo con el botón +')
      return
    }
    if (crearServicio && servicioTitulo.trim().length < 2) {
      setError('El título del servicio es requerido')
      return
    }
    if (crearPresupuesto && presupuestoTitulo.trim().length < 2) {
      setError('El título del presupuesto es requerido')
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/dashboard/radar/prospects/${prospect.id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_id: clienteId,
        notas,
        servicio: crearServicio
          ? {
              titulo: servicioTitulo.trim(),
              descripcion: servicioDescripcion,
              valor: Number(servicioValor) || 0,
              fecha: servicioFecha,
            }
          : null,
        presupuesto: crearPresupuesto
          ? {
              titulo: presupuestoTitulo.trim(),
              descripcion: presupuestoDescripcion,
              fecha_vencimiento: presupuestoVencimiento || null,
            }
          : null,
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(json.error ?? 'No se pudo convertir el prospecto')
      return
    }
    onConverted(json.prospect)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.colors.border}` }}>
            <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
              Convertir a cliente
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}><X size={18} /></button>
          </div>
          <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              El prospecto <strong style={{ color: theme.colors.text }}>{prospect.name}</strong> quedará vinculado a un cliente de la cartera y su estado pasará a <em>Cliente propio</em>.
            </p>

            <FieldRow label="Cliente" required>
              <div style={{ display: 'flex', gap: '6px' }}>
                <ClienteFormCombobox clientes={clientes} value={clienteId} onChange={setClienteId} />
                <button type="button" onClick={() => setShowQc(true)}
                  style={{ padding: '9px 10px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, background: '#fff', cursor: 'pointer', color: theme.colors.primary, display: 'flex', alignItems: 'center' }}>
                  <Plus size={16} />
                </button>
              </div>
            </FieldRow>

            <FieldRow label="Notas">
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
                placeholder="Notas del cierre o contexto del vínculo..."
                style={{ ...inputStyle, resize: 'vertical' }} />
            </FieldRow>

            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: theme.fontSizes.sm, cursor: 'pointer', color: theme.colors.text }}>
                <input type="checkbox" checked={crearServicio} onChange={(e) => {
                  setCrearServicio(e.target.checked)
                  if (e.target.checked && !servicioTitulo) setServicioTitulo(`Desarrollo web — ${prospect.name}`)
                }} />
                Crear servicio
              </label>
              {crearServicio && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '24px' }}>
                  <FieldRow label="Título" required>
                    <input value={servicioTitulo} onChange={(e) => setServicioTitulo(e.target.value)} style={inputStyle} />
                  </FieldRow>
                  <FieldRow label="Descripción">
                    <textarea value={servicioDescripcion} onChange={(e) => setServicioDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  </FieldRow>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <FieldRow label="Valor ($)">
                      <input type="number" min={0} step="0.01" value={servicioValor} onChange={(e) => setServicioValor(e.target.value)} style={inputStyle} />
                    </FieldRow>
                    <FieldRow label="Fecha">
                      <input type="date" value={servicioFecha} onChange={(e) => setServicioFecha(e.target.value)} style={inputStyle} />
                    </FieldRow>
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: theme.fontSizes.sm, cursor: 'pointer', color: theme.colors.text }}>
                <input type="checkbox" checked={crearPresupuesto} onChange={(e) => {
                  setCrearPresupuesto(e.target.checked)
                  if (e.target.checked && !presupuestoTitulo) setPresupuestoTitulo(`Presupuesto — ${prospect.name}`)
                }} />
                Crear presupuesto
              </label>
              {crearPresupuesto && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '24px' }}>
                  <FieldRow label="Título" required>
                    <input value={presupuestoTitulo} onChange={(e) => setPresupuestoTitulo(e.target.value)} style={inputStyle} />
                  </FieldRow>
                  <FieldRow label="Descripción">
                    <textarea value={presupuestoDescripcion} onChange={(e) => setPresupuestoDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  </FieldRow>
                  <FieldRow label="Vencimiento">
                    <input type="date" value={presupuestoVencimiento} onChange={(e) => setPresupuestoVencimiento(e.target.value)} style={inputStyle} />
                  </FieldRow>
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: `1px solid #FECACA`, borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, color: theme.colors.error }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: '11px', backgroundColor: loading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: loading ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              {loading ? 'Convirtiendo...' : 'Convertir a cliente'}
            </button>
          </div>
        </div>
      </div>

      {showQc && (
        <QuickCreateClienteModal
          onClose={() => setShowQc(false)}
          onCreated={handleClienteCreado}
          initialData={buildQcData(prospect)}
        />
      )}
    </div>
  )
}
