import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar userName={session.user.name ?? ''} userRole={session.user.role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DashboardHeader />
        <main style={{ flex: 1, backgroundColor: '#F5F7FA', padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
