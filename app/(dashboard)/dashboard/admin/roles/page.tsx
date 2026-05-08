import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import RolesClient from './RolesClient'

export default async function RolesPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')
  if (session.user.role !== 'Administrador') redirect('/dashboard')

  const { data: roles } = await supabaseAdmin
    .from('roles')
    .select('id, name, description, is_default, created_at')
    .order('id')

  return <RolesClient initialRoles={roles ?? []} />
}
