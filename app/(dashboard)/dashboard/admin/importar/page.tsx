import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ImportarClient from './ImportarClient'

export default async function ImportarPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')
  if (session.user.role !== 'Administrador') redirect('/dashboard')

  return <ImportarClient />
}
