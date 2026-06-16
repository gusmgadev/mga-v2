'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { theme } from '@/lib/theme'
import { useIsMobile } from '@/hooks/useIsMobile'

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

interface DashboardHeaderProps {
  onMenuToggle?: () => void
}

export default function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
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
        padding: isMobile ? '0 16px' : '0 32px',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      {isMobile && (
        <button
          onClick={onMenuToggle}
          aria-label="Abrir menú"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: theme.colors.text,
            flexShrink: 0,
          }}
        >
          <Menu size={22} />
        </button>
      )}
      <h1
        style={{
          fontSize: isMobile ? theme.fontSizes.base : theme.fontSizes.lg,
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
