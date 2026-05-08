import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import PermisosClient from './PermisosClient'

export default async function PermisosPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')
  if (session.user.role !== 'Administrador') redirect('/dashboard')

  const [{ data: roles }, { data: permisos }] = await Promise.all([
    supabaseAdmin.from('roles').select('id, name').order('id'),
    supabaseAdmin.from('role_permissions').select('*').order('role_id'),
  ])

  return <PermisosClient initialRoles={roles ?? []} initialPermisos={permisos ?? []} />
}
