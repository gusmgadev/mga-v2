import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import NoticiasAdminClient from './NoticiasAdminClient'

export default async function NoticiasPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'noticias')
  if (!permisos.can_view) redirect('/dashboard')

  const { data: noticias } = await supabaseAdmin
    .from('noticias')
    .select('*')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <NoticiasAdminClient
      initialNoticias={noticias ?? []}
      permisos={permisos}
    />
  )
}
