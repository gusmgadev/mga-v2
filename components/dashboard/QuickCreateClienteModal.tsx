'use client'

import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { theme } from '@/lib/theme'

interface Props {
  onClose: () => void
  onCreated: (c: { id: number; nombre: string }) => void
}

const clienteSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  tipo: z.enum(['PARTICULAR', 'EMPRESA', 'COMERCIO']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  cuit: z.string().optional(),
  rubro: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean(),
  imagen: z.string().optional(),
  pagina_web: z.string().url('URL inválida').optional().or(z.literal('')),
  mostrar_en_landing: z.boolean(),
})
type ClienteForm = z.infer<typeof clienteSchema>

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: theme.fontSizes.sm,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginBottom: '5px',
}

export default function QuickCreateClienteModal({ onClose, onCreated }: Props) {
  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipo: 'PARTICULAR', activo: true, mostrar_en_landing: false,
      nombre: '', email: '', telefono: '', direccion: '', cuit: '', rubro: '', notas: '', imagen: '', pagina_web: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const rootError = form.formState.errors.root?.message

  const handleSubmit = form.handleSubmit(async (data) => {
    const res = await fetch('/api/dashboard/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      form.setError('root', { message: json.error ?? 'Error al crear el cliente' })
      return
    }
    onCreated(json)
  })

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: theme.radii.md, boxShadow: '0 12px 40px rgba(0,0,0,0.22)' }}
      >
        {/* Header fijo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}`, flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
            Nuevo cliente
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 0 }}>
            <X size={17} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nombre <span style={{ color: theme.colors.error }}>*</span></label>
              <input {...form.register('nombre')} autoFocus style={inputStyle} placeholder="Nombre completo o razón social" />
              {form.formState.errors.nombre && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Tipo <span style={{ color: theme.colors.error }}>*</span></label>
              <select {...form.register('tipo')} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                <option value="PARTICULAR">Particular</option>
                <option value="EMPRESA">Empresa</option>
                <option value="COMERCIO">Comercio</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>CUIT / DNI</label>
              <input {...form.register('cuit')} style={inputStyle} placeholder="20-12345678-9" />
            </div>

            <div>
              <label style={labelStyle}>Rubro</label>
              <input {...form.register('rubro')} style={inputStyle} placeholder="Ej: Indumentaria, Óptica..." />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input {...form.register('email')} type="email" style={inputStyle} placeholder="cliente@email.com" />
              {form.formState.errors.email && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{form.formState.errors.email.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Teléfono</label>
              <input {...form.register('telefono')} style={inputStyle} placeholder="2664-123456" />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Dirección</label>
              <input {...form.register('direccion')} style={inputStyle} placeholder="Calle, número, localidad" />
            </div>

            <div>
              <label style={labelStyle}>Imagen (URL del logo)</label>
              <input {...form.register('imagen')} style={inputStyle} placeholder="https://..." />
            </div>

            <div>
              <label style={labelStyle}>Página web</label>
              <input {...form.register('pagina_web')} type="url" style={inputStyle} placeholder="https://www.ejemplo.com" />
              {form.formState.errors.pagina_web && <p style={{ color: theme.colors.error, fontSize: theme.fontSizes.xs, marginTop: '4px' }}>{form.formState.errors.pagina_web.message}</p>}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notas internas</label>
              <textarea
                {...form.register('notas')}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Observaciones, condiciones especiales..."
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: theme.fontSizes.sm, color: theme.colors.text }}>
                <input type="checkbox" {...form.register('activo')} style={{ width: '15px', height: '15px', accentColor: theme.colors.primary }} />
                Cliente activo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: theme.fontSizes.sm, color: theme.colors.text }}>
                <input type="checkbox" {...form.register('mostrar_en_landing')} style={{ width: '15px', height: '15px', accentColor: theme.colors.primary }} />
                Mostrar en landing
              </label>
            </div>
          </div>

          {rootError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />{rootError}
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
              disabled={isSubmitting}
              style={{ flex: 1, padding: '9px', backgroundColor: isSubmitting ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: theme.fontSizes.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              {isSubmitting ? 'Creando...' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
