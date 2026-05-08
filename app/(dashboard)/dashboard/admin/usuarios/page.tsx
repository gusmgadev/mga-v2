import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')
  if (session.user.role !== 'Administrador') redirect('/dashboard')

  const [{ data: usuarios }, { data: roles }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, email, name, role_id, created_at, roles(name)')
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('roles').select('id, name').order('id'),
  ])

  return <UsuariosClient initialUsuarios={usuarios ?? []} roles={roles ?? []} />
}
