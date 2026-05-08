import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import ClientesClient from './ClientesClient'

export default async function ClientesPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'clientes')
  if (!permisos.can_view) redirect('/dashboard')

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .order('name')

  return <ClientesClient initialClientes={clientes ?? []} permisos={permisos} />
}
