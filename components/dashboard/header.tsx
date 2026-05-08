'use client'

import { usePathname } from 'next/navigation'
import { theme } from '@/lib/theme'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/activos': 'Activos',
  '/dashboard/admin/usuarios': 'Usuarios',
  '/dashboard/admin/roles': 'Roles',
  '/dashboard/admin/permisos': 'Permisos',
}

export default function DashboardHeader() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'Dashboard'

  return (
    <header
      style={{
        height: theme.dashboard.headerHeight,
        backgroundColor: '#ffffff',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        flexShrink: 0,
      }}
    >
      <h1
        style={{
          fontSize: theme.fontSizes.lg,
          fontWeight: theme.fontWeights.bold,
          color: theme.colors.text,
          margin: 0,
        }}
      >
        {title}
      </h1>
    </header>
  )
}
