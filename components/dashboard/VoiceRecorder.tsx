'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'
import { theme } from '@/lib/theme'
import type { ProductoConMatch } from '@/types/stock'

interface Props {
  remitoId: string
  onItemsDetected: (items: ProductoConMatch[], transcripcion: string) => void
  disabled?: boolean
}

type Estado = 'idle' | 'grabando' | 'procesando' | 'error'

export default function VoiceRecorder({ remitoId, onItemsDetected, disabled }: Props) {
  const [estado, setEstado] = useState<Estado>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transcripcion, setTranscripcion] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    setTranscripcion(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        await processAudio(audioBlob)
      }

      mediaRecorder.start(250)
      setEstado('grabando')
    } catch {
      setError('No se pudo acceder al micrófono. Verificá los permisos del navegador.')
      setEstado('error')
    }
  }, [remitoId]) // eslint-disable-line react-hooks/exhaustive-deps

  function stopRecording() {
    if (mediaRecorderRef.current && estado === 'grabando') {
      mediaRecorderRef.current.stop()
      setEstado('procesando')
    }
  }

  async function processAudio(audioBlob: Blob) {
    setEstado('procesando')
    try {
      const fd = new FormData()
      fd.append('audio', audioBlob, 'grabacion.webm')
      fd.append('remito_id', remitoId)

      const res = await fetch('/api/dashboard/voz/transcribir', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al procesar el audio')
        setEstado('error')
        return
      }

      setTranscripcion(json.transcripcion)
      onItemsDetected(json.items ?? [], json.transcripcion)
      setEstado('idle')
    } catch {
      setError('Error de red al procesar el audio')
      setEstado('error')
    }
  }

  const isDisabled = disabled || estado === 'procesando'

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {estado === 'idle' || estado === 'error' ? (
          <button
            onClick={startRecording}
            disabled={isDisabled}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              backgroundColor: isDisabled ? theme.colors.border : theme.colors.primary,
              color: '#fff', border: 'none', borderRadius: theme.radii.sm,
              fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Mic size={16} />
            Grabar por voz
          </button>
        ) : null}

        {estado === 'grabando' && (
          <button
            onClick={stopRecording}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              backgroundColor: theme.colors.error,
              color: '#fff', border: 'none', borderRadius: theme.radii.sm,
              fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
              cursor: 'pointer',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <Square size={14} fill="#fff" />
            Detener grabación
          </button>
        )}

        {estado === 'procesando' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textMuted, fontSize: theme.fontSizes.sm }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Procesando audio con IA...
          </div>
        )}

        {estado === 'grabando' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.fontSizes.xs, color: theme.colors.error }}>
            <span style={{
              display: 'inline-block', width: '8px', height: '8px',
              borderRadius: '50%', backgroundColor: theme.colors.error,
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            Grabando...
          </div>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          marginTop: '10px', padding: '10px 14px',
          backgroundColor: `${theme.colors.error}12`,
          borderRadius: theme.radii.sm,
        }}>
          <AlertCircle size={15} color={theme.colors.error} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.error }}>{error}</span>
        </div>
      )}

      {transcripcion && (
        <div style={{
          marginTop: '10px', padding: '10px 14px',
          backgroundColor: `${theme.colors.accent}10`,
          borderRadius: theme.radii.sm, borderLeft: `3px solid ${theme.colors.accent}`,
        }}>
          <p style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Transcripción
          </p>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text, margin: 0 }}>{transcripcion}</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
