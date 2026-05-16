'use client'

import { usePathname } from 'next/navigation'
import { theme } from '@/lib/theme'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/clientes': 'Clientes',
  '/dashboard/activos': 'Activos',
  '/dashboard/servicios': 'Servicios',
  '/dashboard/presupuestos': 'Presupuestos',
  '/dashboard/cobranzas': 'Cobranzas',
  '/dashboard/productos': 'Productos',
  '/dashboard/remitos': 'Remitos',
  '/dashboard/noticias': 'Noticias',
  '/dashboard/oportunidades': 'Oportunidades',
  '/dashboard/admin/usuarios': 'Usuarios',
  '/dashboard/admin/roles': 'Roles',
  '/dashboard/admin/permisos': 'Permisos',
}

const prefixes: [string, string][] = [
  ['/dashboard/servicios/', 'Servicios'],
  ['/dashboard/presupuestos/', 'Presupuestos'],
  ['/dashboard/remitos/', 'Remitos'],
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const title =
    titles[pathname] ??
    prefixes.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    'Dashboard'

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
