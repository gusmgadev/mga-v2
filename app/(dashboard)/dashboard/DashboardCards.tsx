'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail, Wrench, FileText, HardDrive,
  Building2, Package2, ClipboardList, Banknote,
  Newspaper, Users, Shield, Lock, FileSpreadsheet,
  type LucideIcon,
} from 'lucide-react'
import { theme } from '@/lib/theme'

type CardDef = { label: string; href: string; Icon: LucideIcon; description: string; color: string }

const GROUPS: { label: string; cards: CardDef[] }[] = [
  {
    label: 'Servicios',
    cards: [
      { label: 'Oportunidades', href: '/dashboard/oportunidades', Icon: Mail,      description: 'Leads y contactos comerciales',      color: '#60B4FF' },
      { label: 'Servicios',     href: '/dashboard/servicios',     Icon: Wrench,    description: 'Órdenes de trabajo y seguimiento',   color: '#60B4FF' },
      { label: 'Presupuestos',  href: '/dashboard/presupuestos',  Icon: FileText,  description: 'Cotizaciones e ítems',               color: '#60B4FF' },
      { label: 'Activos',       href: '/dashboard/activos',       Icon: HardDrive, description: 'Equipos y dispositivos de clientes', color: '#60B4FF' },
    ],
  },
  {
    label: 'Altas',
    cards: [
      { label: 'Clientes',  href: '/dashboard/clientes',  Icon: Building2, description: 'Empresas, comercios y particulares', color: '#6EE7A0' },
      { label: 'Productos', href: '/dashboard/productos',  Icon: Package2,  description: 'Catálogo de productos y precios',   color: '#6EE7A0' },
    ],
  },
  {
    label: 'Stock',
    cards: [
      { label: 'Remitos', href: '/dashboard/remitos', Icon: ClipboardList, description: 'Entradas y salidas de stock', color: '#FFBA60' },
    ],
  },
  {
    label: 'Fondos',
    cards: [
      { label: 'Cobranzas', href: '/dashboard/cobranzas', Icon: Banknote, description: 'Pagos, cargos y saldos', color: '#D08EFF' },
    ],
  },
]

const ADMIN_CARDS: CardDef[] = [
  { label: 'Noticias', href: '/dashboard/noticias',        Icon: Newspaper,      description: 'Publicaciones y novedades',  color: '#FF8080' },
  { label: 'Usuarios', href: '/dashboard/admin/usuarios',  Icon: Users,          description: 'Gestión de cuentas',         color: '#FF8080' },
  { label: 'Roles',    href: '/dashboard/admin/roles',     Icon: Shield,         description: 'Configuración de roles',     color: '#FF8080' },
  { label: 'Permisos', href: '/dashboard/admin/permisos',  Icon: Lock,           description: 'Permisos por módulo',        color: '#FF8080' },
  { label: 'Importar', href: '/dashboard/admin/importar',  Icon: FileSpreadsheet,description: 'Importación desde Excel',    color: '#FF8080' },
]

function ModuleCard({ label, href, Icon, description, color }: CardDef) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '22px 20px',
        background: hovered
          ? 'rgba(255,255,255,0.18)'
          : 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.18)'}`,
        borderRadius: theme.radii.md,
        textDecoration: 'none',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? '0 20px 48px rgba(0,0,0,0.30)'
          : '0 4px 16px rgba(0,0,0,0.15)',
        transition: 'transform 0.22s ease, background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
        cursor: 'pointer',
        minHeight: '136px',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          backgroundColor: color + '28',
          border: `1px solid ${color}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ color: '#ffffff', fontWeight: theme.fontWeights.medium, fontSize: '15px', margin: 0, lineHeight: 1.3 }}>
          {label}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', margin: '5px 0 0', lineHeight: 1.45 }}>
          {description}
        </p>
      </div>
    </Link>
  )
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: '11px',
      fontWeight: theme.fontWeights.medium,
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      margin: '0 0 12px',
    }}>
      {children}
    </p>
  )
}

export default function DashboardCards({ userName, isAdmin }: { userName: string; isAdmin: boolean }) {
  return (
    <div
      style={{
        margin: '-32px',
        padding: '40px 32px',
        minHeight: 'calc(100vh - 60px)',
        background: 'linear-gradient(135deg, #0a1340 0%, #0D1B5E 45%, #1a3a8f 100%)',
      }}
    >
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: theme.fontWeights.bold, color: '#ffffff', margin: 0 }}>
          Bienvenido, {userName}
        </h1>
        <p style={{ fontSize: theme.fontSizes.sm, color: 'rgba(255,255,255,0.50)', marginTop: '4px' }}>
          Panel de gestión — MGA Informática
        </p>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: '32px' }}>
          <GroupLabel>{group.label}</GroupLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
            {group.cards.map((card) => <ModuleCard key={card.href} {...card} />)}
          </div>
        </div>
      ))}

      {isAdmin && (
        <div style={{ marginBottom: '32px' }}>
          <GroupLabel>Administración</GroupLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
            {ADMIN_CARDS.map((card) => <ModuleCard key={card.href} {...card} />)}
          </div>
        </div>
      )}
    </div>
  )
}
