import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getModulePermisos } from '@/lib/permisos'
import { fetchAllClientesCompletos } from '@/lib/fetchAllClientes'
import ClientesClient from './ClientesClient'

export default async function ClientesPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'clientes')
  if (!permisos.can_view) redirect('/dashboard')

  const clientes = await fetchAllClientesCompletos()

  return <ClientesClient initialClientes={clientes} permisos={permisos} />
}
