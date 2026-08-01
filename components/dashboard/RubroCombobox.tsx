'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { theme } from '@/lib/theme'

export interface RubroOption {
  id: number
  nombre: string
}

interface RubroComboboxProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  allowCreate?: boolean
  label?: string
}

export default function RubroCombobox({
  value, onChange, placeholder = 'Buscar rubro...',
  multiple = false, allowCreate = true, label,
}: RubroComboboxProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [rubros, setRubros] = useState<RubroOption[]>([])
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/dashboard/rubros')
      .then((r) => r.json())
      .then(setRubros)
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = rubros.filter((r) =>
    r.nombre.toLowerCase().includes(input.toLowerCase())
  )

  const isNew = allowCreate && input.trim().length > 0 &&
    !rubros.some((r) => r.nombre.toLowerCase() === input.trim().toLowerCase())

  const selectedArray = multiple ? (Array.isArray(value) ? value : []) : []

  function select(nombre: string) {
    if (multiple) {
      const arr = selectedArray.includes(nombre)
        ? selectedArray.filter((v) => v !== nombre)
        : [...selectedArray, nombre]
      onChange(arr)
    } else {
      onChange(nombre)
      setOpen(false)
      setInput('')
    }
  }

  const addNew = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setCreating(true)
    try {
      const res = await fetch('/api/dashboard/rubros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: trimmed }),
      })
      if (res.ok) {
        const created = await res.json()
        setRubros((prev) => {
          if (prev.some((r) => r.id === created.id)) return prev
          return [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre))
        })
        select(created.nombre)
      }
    } finally {
      setCreating(false)
    }
  }, [input, rubros])

  const inputStyle: React.CSSProperties = {
    flex: 1, border: 'none', outline: 'none', fontSize: theme.fontSizes.sm,
    padding: 0, background: 'transparent', minWidth: 0,
    fontFamily: 'inherit', color: theme.colors.text,
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label style={{
          display: 'block', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted,
          marginBottom: 4, fontWeight: theme.fontWeights.medium,
        }}>
          {label}
        </label>
      )}
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
          padding: multiple ? '6px 10px' : '10px 14px',
          border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
          cursor: 'pointer', minHeight: 40,
          backgroundColor: '#fff',
        }}
      >
        {multiple && selectedArray.map((s) => (
          <span key={s} style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            padding: '1px 6px', backgroundColor: '#EEF2FF',
            borderRadius: theme.radii.sm, fontSize: theme.fontSizes.xs,
            color: theme.colors.accent,
          }}>
            {s}
            <button onClick={(e) => { e.stopPropagation(); select(s) }}
              style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={multiple ? input : (open ? input : (value as string || ''))}
          onChange={(e) => { setInput(e.target.value); if (!open) setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={multiple && selectedArray.length > 0 ? '' : placeholder}
          style={inputStyle}
        />
        <ChevronDown size={14} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          marginTop: 2, backgroundColor: '#fff',
          border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.md,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxHeight: 240, overflowY: 'auto',
        }}>
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => { select(r.nombre); if (!multiple) setInput('') }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 14px', border: 'none', background: selectedArray.includes(r.nombre) ? '#EEF2FF' : 'transparent',
                cursor: 'pointer', fontSize: theme.fontSizes.sm, color: theme.colors.text,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedArray.includes(r.nombre) ? '#EEF2FF' : '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedArray.includes(r.nombre) ? '#EEF2FF' : 'transparent'}
            >
              {r.nombre}
            </button>
          ))}
          {filtered.length === 0 && !isNew && (
            <div style={{ padding: '8px 14px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              Sin resultados
            </div>
          )}
          {isNew && (
            <button
              onClick={addNew} disabled={creating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left',
                padding: '8px 14px', border: 'none', borderTop: `1px solid ${theme.colors.border}`,
                background: '#FFFBEB', cursor: 'pointer',
                fontSize: theme.fontSizes.sm, color: theme.colors.text,
              }}
            >
              <Plus size={14} />
              {creating ? 'Agregando...' : `Agregar "${input.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
