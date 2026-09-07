import { supabaseAdmin } from '@/services/supabase-admin'

async function fetchAll<T extends Record<string, unknown>>(
  table: string,
  select: string,
  filters: Array<{ column: string; value: unknown }> = [],
  orderColumn = 'nombre',
): Promise<T[]> {
  const PAGE = 1000
  const all: T[] = []
  let from = 0

  while (true) {
    let q = supabaseAdmin.from(table).select(select).order(orderColumn).range(from, from + PAGE - 1)
    for (const f of filters) q = q.eq(f.column, f.value)
    const { data, error } = await q
    if (error || !data || data.length === 0) break
    all.push(...(data as unknown as T[]))
    if (data.length < PAGE) break
    from += PAGE
  }

  return all
}

export function fetchAllClientes() {
  return fetchAll<{ id: number; nombre: string }>(
    'clientes', 'id, nombre', [{ column: 'activo', value: true }],
  )
}

export function fetchAllClientesCompletos() {
  return fetchAll<Record<string, unknown>>('clientes', '*', []) as Promise<
    {
      id: number
      nombre: string
      tipo: 'PARTICULAR' | 'EMPRESA' | 'COMERCIO'
      email: string | null
      telefono: string | null
      direccion: string | null
      localidad: string | null
      cuit: string | null
      rubro: string | null
      notas: string | null
      activo: boolean
      imagen: string | null
      pagina_web: string | null
      mostrar_en_landing: boolean
      created_at: string
    }[]
  >
}

export function fetchAllActivos() {
  return fetchAll<{ id: number; nombre: string; cliente_id: number }>(
    'activos', 'id, nombre, cliente_id', [{ column: 'activo', value: true }],
  )
}

export function fetchAllServicios() {
  return fetchAll<{ id: number; titulo: string; cliente_id: number }>(
    'servicios', 'id, titulo, cliente_id', [], 'created_at',
  )
}
