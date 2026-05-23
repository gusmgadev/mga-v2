'use client'

import { useState } from 'react'
import { theme } from '@/lib/theme'

type ClienteSimple = { id: number; nombre: string }

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, zIndex: 9999,
  marginTop: '2px', backgroundColor: '#fff',
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
  maxHeight: '260px', overflowY: 'auto',
}

const itemBase: React.CSSProperties = {
  padding: '8px 12px', fontSize: theme.fontSizes.sm,
  cursor: 'pointer', userSelect: 'none',
}

function DropdownItem({
  label, isSelected, onPick,
}: { label: string; isSelected: boolean; onPick: () => void }) {
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      onClick={onPick}
      style={{
        ...itemBase,
        color: isSelected ? theme.colors.primary : theme.colors.text,
        backgroundColor: isSelected ? `${theme.colors.primary}12` : 'transparent',
        fontWeight: isSelected ? theme.fontWeights.medium : theme.fontWeights.normal,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.colors.primary}12`)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? `${theme.colors.primary}12` : 'transparent')}
    >
      {label}
    </div>
  )
}

/** Para formularios: muestra el nombre seleccionado; al enfocar, permite buscar. */
export function ClienteFormCombobox({
  clientes,
  value,
  onChange,
}: {
  clientes: ClienteSimple[]
  value: number
  onChange: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = clientes.find((c) => c.id === value)

  const filtered = search.trim()
    ? clientes.filter((c) => c.nombre.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 60)
    : []

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <input
        type="text"
        value={open ? search : (selected?.nombre ?? '')}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => { setOpen(true); setSearch('') }}
        onBlur={() => { setOpen(false); setSearch('') }}
        placeholder="Seleccioná un cliente..."
        autoComplete="off"
        style={{
          width: '100%', padding: '10px 14px', fontSize: theme.fontSizes.base,
          border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          backgroundColor: '#fff',
        }}
      />
      {open && (
        <div style={{ ...dropdownStyle, width: '100%' }}>
          {!search.trim() ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              Escribí para buscar clientes...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>Sin resultados</div>
          ) : (
            filtered.map((c) => (
              <DropdownItem
                key={c.id}
                label={c.nombre}
                isSelected={c.id === value}
                onPick={() => { onChange(c.id); setOpen(false); setSearch('') }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/** Para barras de filtro: valor vacío = todos los clientes. */
export function ClienteFilterCombobox({
  clientes,
  value,
  onChange,
}: {
  clientes: ClienteSimple[]
  value: string | number
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = clientes.find((c) => String(c.id) === String(value))

  const filtered = search.trim()
    ? clientes.filter((c) => c.nombre.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 60)
    : []

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={open ? search : (selected?.nombre ?? '')}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => { setOpen(true); setSearch('') }}
        onBlur={() => { setOpen(false); setSearch('') }}
        placeholder="Todos los clientes"
        autoComplete="off"
        style={{
          padding: '8px 14px', fontSize: theme.fontSizes.sm,
          border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
          outline: 'none', backgroundColor: '#fff', fontFamily: 'inherit',
          color: theme.colors.text, minWidth: '180px',
        }}
      />
      {open && (
        <div style={{ ...dropdownStyle, minWidth: '240px' }}>
          <DropdownItem
            label="Todos los clientes"
            isSelected={!value}
            onPick={() => { onChange(''); setOpen(false); setSearch('') }}
          />
          <div style={{ borderTop: `1px solid ${theme.colors.border}` }} />
          {!search.trim() ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
              Escribí para buscar clientes...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>Sin resultados</div>
          ) : (
            filtered.map((c) => (
              <DropdownItem
                key={c.id}
                label={c.nombre}
                isSelected={String(value) === String(c.id)}
                onPick={() => { onChange(String(c.id)); setOpen(false); setSearch('') }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
