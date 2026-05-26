import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardCards from './DashboardCards'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  return (
    <DashboardCards
      userName={session.user.name ?? ''}
      isAdmin={session.user.role === 'Administrador'}
    />
  )
}
