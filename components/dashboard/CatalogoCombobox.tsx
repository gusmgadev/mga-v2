'use client'

import { useState, useRef, useEffect } from 'react'
import { theme } from '@/lib/theme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.sm,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.text,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

interface Props {
  value: string
  onChange: (v: string) => void
  opciones: string[]
  onNewOption: (v: string) => Promise<void>
  placeholder?: string
}

export default function CatalogoCombobox({ value, onChange, opciones, onNewOption, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(value)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setInput(value) }, [value])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = opciones.filter((o) => o.toLowerCase().includes(input.toLowerCase()))
  const isNew = input.trim().length > 0 && !opciones.some((o) => o.toLowerCase() === input.trim().toLowerCase())
  const showDropdown = open && (filtered.length > 0 || isNew)

  function select(o: string) {
    setInput(o)
    onChange(o)
    setOpen(false)
  }

  async function addNew() {
    const trimmed = input.trim()
    if (!trimmed || saving) return
    setSaving(true)
    await onNewOption(trimmed)
    onChange(trimmed)
    setSaving(false)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={input}
        onChange={(e) => { setInput(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        style={inputStyle}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
          backgroundColor: '#fff', border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.sm, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 200, maxHeight: '180px', overflowY: 'auto',
        }}>
          {filtered.map((o) => (
            <div
              key={o}
              onMouseDown={() => select(o)}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: theme.fontSizes.sm, color: theme.colors.text }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              {o}
            </div>
          ))}
          {isNew && (
            <div
              onMouseDown={addNew}
              style={{
                padding: '8px 12px', cursor: saving ? 'wait' : 'pointer',
                fontSize: theme.fontSizes.sm, color: theme.colors.primary,
                fontWeight: theme.fontWeights.medium,
                borderTop: filtered.length > 0 ? `1px solid ${theme.colors.border}` : 'none',
                opacity: saving ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = `${theme.colors.primary}0a` }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              {saving ? 'Guardando...' : `+ Agregar "${input.trim()}"`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
