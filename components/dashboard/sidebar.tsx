'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  HardDrive,
  Users,
  Shield,
  Lock,
  LogOut,
} from 'lucide-react'
import { theme } from '@/lib/theme'

interface SidebarProps {
  userName: string
  userRole: string
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { label: 'Clientes', href: '/dashboard/clientes', icon: Building2, adminOnly: false },
  { label: 'Activos', href: '/dashboard/activos', icon: HardDrive, adminOnly: false },
  { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: Users, adminOnly: true },
  { label: 'Roles', href: '/dashboard/admin/roles', icon: Shield, adminOnly: true },
  { label: 'Permisos', href: '/dashboard/admin/permisos', icon: Lock, adminOnly: true },
]

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = userRole === 'Administrador'

  const visible = navItems.filter((item) => !item.adminOnly || isAdmin)

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
        {isAdmin && (
          <p
            style={{
              fontSize: theme.fontSizes.xs,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: theme.fontWeights.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 20px 8px',
            }}
          >
            Administración
          </p>
        )}

        {visible.map(({ label, href, icon: Icon }) => {
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
                color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: theme.transitions.fast,
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
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
