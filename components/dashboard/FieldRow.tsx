'use client'

import React from 'react'
import { theme } from '@/lib/theme'

interface FieldRowProps {
  label: string
  required?: boolean
  children: React.ReactNode
  labelWidth?: number
}

export default function FieldRow({ label, required, children, labelWidth = 130 }: FieldRowProps) {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text,
    width: labelWidth,
    flexShrink: 0,
    textAlign: 'right',
  }

  return (
    <div style={rowStyle}>
      <label style={labelStyle}>{label}{required ? ' *' : ''}</label>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
