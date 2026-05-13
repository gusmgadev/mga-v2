import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/services/supabase-admin'
import { getModulePermisos } from '@/lib/permisos'
import ProductosClient from './ProductosClient'

export default async function ProductosPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const permisos = await getModulePermisos(session.user.role_id, session.user.role, 'productos')
  if (!permisos.can_view) redirect('/dashboard')

  const { data: productos } = await supabaseAdmin
    .from('productos')
    .select('*')
    .order('nombre')

  return <ProductosClient initialProductos={productos ?? []} permisos={permisos} />
}
