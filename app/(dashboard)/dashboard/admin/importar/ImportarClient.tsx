'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { theme } from '@/lib/theme'

type ImportResult = {
  total: number
  importados: number
  sinCliente: number[]
  errores: { id: number; error: string }[]
}

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: theme.radii.md,
  border: `1px solid ${theme.colors.border}`,
  overflow: 'hidden',
  marginBottom: '20px',
}
const cardHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '16px 20px', borderBottom: `1px solid ${theme.colors.border}`,
  backgroundColor: '#F8F9FB',
}

export default function ImportarClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file?.name ?? null)
    setResult(null)
    setError(null)
  }

  const importarServicios = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Seleccioná un archivo Excel antes de importar.')
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/dashboard/importar/servicios', { method: 'POST', body: formData })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error ?? 'Error al importar')
      return
    }
    setResult(json)
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
        Importación desde Excel
      </h1>

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <FileSpreadsheet size={18} color={theme.colors.primary} />
          <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
            Importar Servicios
          </h2>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <p style={{ margin: '0 0 16px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
            Importa la hoja <strong>servicios</strong>. El valor del servicio es el campo <strong>Valor</strong> del Excel. Si hay pagos registrados, se importan como cobranza para que el saldo quede en <strong>Valor − Pagos</strong>. Si el servicio ya existe, se actualiza.
          </p>

          {/* File picker */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="excel-upload"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii.sm, cursor: 'pointer',
                fontSize: theme.fontSizes.sm, color: theme.colors.text,
                backgroundColor: '#F8F9FB',
              }}
            >
              <FileSpreadsheet size={14} color={theme.colors.primary} />
              {fileName ?? 'Seleccionar archivo .xlsx'}
            </label>
            <input
              id="excel-upload"
              ref={fileRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: `${theme.colors.error}14`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm, color: theme.colors.error, fontSize: theme.fontSizes.sm, marginBottom: '16px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            onClick={importarServicios}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: loading ? `${theme.colors.primary}99` : theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {loading ? 'Importando...' : 'Importar servicios'}
          </button>
        </div>
      </div>

      {result && (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <CheckCircle2 size={18} color={theme.colors.success} />
            <h2 style={{ margin: 0, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>
              Resultado
            </h2>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Total en Excel</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>{result.total}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Importados/actualizados</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.success }}>{result.importados}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Sin cliente</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: result.sinCliente.length > 0 ? '#B45309' : theme.colors.textMuted }}>{result.sinCliente.length}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Errores</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: result.errores.length > 0 ? theme.colors.error : theme.colors.textMuted }}>{result.errores.length}</p>
              </div>
            </div>

            {result.sinCliente.length > 0 && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FFFBEB', border: `1px solid #FCD34D`, borderRadius: theme.radii.sm }}>
                <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: '#92400E' }}>Servicios sin cliente encontrado:</p>
                <p style={{ margin: 0, fontSize: theme.fontSizes.xs, color: '#92400E' }}>{result.sinCliente.join(', ')}</p>
              </div>
            )}

            {result.errores.length > 0 && (
              <div style={{ padding: '10px 14px', backgroundColor: `${theme.colors.error}08`, border: `1px solid ${theme.colors.error}`, borderRadius: theme.radii.sm }}>
                <p style={{ margin: '0 0 4px', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.error }}>Errores:</p>
                {result.errores.map((e) => (
                  <p key={e.id} style={{ margin: '2px 0 0', fontSize: theme.fontSizes.xs, color: theme.colors.error }}>
                    Servicio {e.id}: {e.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
