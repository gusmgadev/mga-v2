'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  HardDrive,
  Wrench,
  FileText,
  Banknote,
  Package2,
  ClipboardList,
  Newspaper,
  Mail,
  Users,
  Shield,
  Lock,
  FileSpreadsheet,
  LogOut,
  ChevronDown,
  Receipt,
  type LucideIcon,
} from 'lucide-react'
import { theme } from '@/lib/theme'

interface SidebarProps {
  userName: string
  userRole: string
}

type NavItem = { label: string; href: string; Icon: LucideIcon }
type NavGroup = { label: string | null; adminOnly?: boolean; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Servicios',
    items: [
      { label: 'Oportunidades', href: '/dashboard/oportunidades', Icon: Mail },
      { label: 'Servicios', href: '/dashboard/servicios', Icon: Wrench },
      { label: 'Presupuestos', href: '/dashboard/presupuestos', Icon: FileText },
      { label: 'Activos', href: '/dashboard/activos', Icon: HardDrive },
    ],
  },
  {
    label: 'Altas',
    items: [
      { label: 'Clientes', href: '/dashboard/clientes', Icon: Building2 },
      { label: 'Productos', href: '/dashboard/productos', Icon: Package2 },
    ],
  },
  {
    label: 'Stock',
    items: [
      { label: 'Remitos', href: '/dashboard/remitos', Icon: ClipboardList },
    ],
  },
  {
    label: 'Fondos',
    items: [
      { label: 'Cobranzas', href: '/dashboard/cobranzas', Icon: Banknote },
      { label: 'Gastos', href: '/dashboard/gastos', Icon: Receipt },
    ],
  },
  {
    label: 'Administración',
    adminOnly: true,
    items: [
      { label: 'Noticias', href: '/dashboard/noticias', Icon: Newspaper },
      { label: 'Usuarios', href: '/dashboard/admin/usuarios', Icon: Users },
      { label: 'Roles', href: '/dashboard/admin/roles', Icon: Shield },
      { label: 'Permisos', href: '/dashboard/admin/permisos', Icon: Lock },
      { label: 'Importar', href: '/dashboard/admin/importar', Icon: FileSpreadsheet },
    ],
  },
]

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = userRole === 'Administrador'

  const visibleGroups = navGroups
    .filter((g) => !g.adminOnly || isAdmin)
    .filter((g) => g.items.length > 0)

  const initialCollapsed = Object.fromEntries(
    visibleGroups
      .filter((g) => g.label !== null)
      .map((g) => [
        g.label!,
        // Collapsed by default unless the active route is inside this group
        !g.items.some((item) => pathname === item.href),
      ])
  )
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(initialCollapsed)

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside
      style={{
        width: theme.dashboard.sidebarWidth,
        backgroundColor: theme.colors.dark,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: '100vh',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Image
          src={theme.logo.path}
          alt={theme.site.name}
          width={120}
          height={32}
          style={{ display: 'block', filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {visibleGroups.map((group, gi) => {
          const isCollapsed = group.label ? (collapsed[group.label] ?? false) : false
          return (
            <div key={group.label ?? '__home'} style={{ marginTop: gi === 0 ? 0 : 4 }}>
              {group.label && (
                <button
                  onClick={() => toggle(group.label!)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 'calc(100% - 16px)',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: theme.radii.sm,
                    cursor: 'pointer',
                    padding: '7px 12px',
                    margin: '0 8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: theme.fontSizes.xs,
                      color: '#ffffff',
                      fontWeight: theme.fontWeights.medium,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {group.label}
                  </span>
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'rgba(255,255,255,0.70)',
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
              )}
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: isCollapsed ? '0px' : '600px',
                  transition: 'max-height 0.22s ease',
                }}
              >
                {group.items.map(({ label, href, Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 20px',
                        margin: '2px 8px',
                        borderRadius: theme.radii.sm,
                        textDecoration: 'none',
                        fontSize: theme.fontSizes.sm,
                        fontWeight: active ? theme.fontWeights.medium : theme.fontWeights.regular,
                        color: '#ffffff',
                        backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                        transition: theme.transitions.fast,
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User + logout */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p style={{ fontSize: theme.fontSizes.sm, color: '#ffffff', fontWeight: theme.fontWeights.medium, marginBottom: '2px' }}>
          {userName}
        </p>
        <p style={{ fontSize: theme.fontSizes.xs, color: 'rgba(255,255,255,0.45)', marginBottom: '12px' }}>
          {userRole}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: theme.auth.redirectAfterLogout })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            fontSize: theme.fontSizes.sm,
            padding: 0,
            transition: theme.transitions.fast,
          }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
