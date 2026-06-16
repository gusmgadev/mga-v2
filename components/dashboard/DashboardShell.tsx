'use client'

import { useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import Sidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/header'

interface DashboardShellProps {
  userName: string
  userRole: string
  children: React.ReactNode
}

export default function DashboardShell({ userName, userRole, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Backdrop en mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Sidebar: drawer en mobile, estática en desktop */}
      <div
        style={
          isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 100,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.25s ease',
              }
            : { flexShrink: 0 }
        }
      >
        <Sidebar
          userName={userName}
          userRole={userRole}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <DashboardHeader onMenuToggle={() => setSidebarOpen((s) => !s)} />
        <main
          style={{
            flex: 1,
            backgroundColor: '#F5F7FA',
            padding: isMobile ? '16px' : '32px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
