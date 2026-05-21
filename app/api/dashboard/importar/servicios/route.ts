import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { readFile, utils } from 'xlsx'
import type { WorkBook } from 'xlsx'
import path from 'path'

const EXCEL_PATH = path.join(process.cwd(), 'recursos', 'migracion', 'importacion.xlsx')

const ESTADO_MAP: Record<string, string> = {
  'TERMINADO':     'TERMINADO',
  'EN PROCESO':    'EN PROCESO',
  'CANCELADO':     'CANCELADO',
  'RECHAZADO':     'RECHAZADO',
  'INGRESADO':     'INGRESADO',
  'PRESUPUESTADO': 'PRESUPUESTADO',
}
const ESTADO_PAGO_MAP: Record<string, string> = {
  'PAGADO':       'PAGADO',
  'NO PAGADO':    'PENDIENTE',
  'SIN CARGO':    'SIN CARGO',
  'PAGO PARCIAL': 'PAGO PARCIAL',
  'GARANTIA':     'GARANTIA',
}

function toFecha(val: unknown): string | null {
  if (!val) return null
  if (val instanceof Date) return val.toISOString().split('T')[0]
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10)
  return null
}

export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== 'Administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let wb: WorkBook
  try {
    wb = readFile(EXCEL_PATH, { cellDates: true })
  } catch {
    return NextResponse.json({ error: `No se encontró el archivo Excel en: ${EXCEL_PATH}` }, { status: 404 })
  }

  type ClienteRow = { Cod_Cliente: number; Razon_Social: string }
  type ServicioRow = {
    'Nro Servicio': number
    CodCliente: number
    Problema: string
    DetalleTrabajo: string
    Estado: string
    EstadoPago: string
    Valor: number
    Pagos: number
    FechaIngreso: Date | string | null
  }

  const clientesRaw = utils.sheet_to_json<ClienteRow>(wb.Sheets['clientes'], { defval: null })
  const serviciosRaw = utils.sheet_to_json<ServicioRow>(wb.Sheets['servicios'], { defval: null })

  const clientes = clientesRaw.filter((r) => r.Cod_Cliente != null && r.Razon_Social)
  const servicios = serviciosRaw.filter((r) => r['Nro Servicio'] != null)

  // Mapa: Cod_Cliente → nombre del cliente en el Excel
  const codToNombre = new Map<number, string>()
  for (const row of clientes) {
    codToNombre.set(row.Cod_Cliente, String(row.Razon_Social).trim())
  }

  const errores: { id: number; error: string }[] = []
  const sinCliente: number[] = []
  let importados = 0

  for (const row of servicios) {
    const nroServicio = row['Nro Servicio']
    const nombreCliente = codToNombre.get(row.CodCliente)

    if (!nombreCliente) {
      sinCliente.push(nroServicio)
      continue
    }

    // Buscar cliente en DB por nombre (case-insensitive)
    const { data: match } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .ilike('nombre', nombreCliente)
      .limit(1)

    const clienteId = match?.[0]?.id
    if (!clienteId) {
      sinCliente.push(nroServicio)
      continue
    }

    const valor = Math.max(0, (Number(row.Valor) || 0) - (Number(row.Pagos) || 0))

    const { error } = await supabaseAdmin.from('servicios').upsert(
      {
        id:          nroServicio,
        cliente_id:  clienteId,
        titulo:      row.Problema       ? String(row.Problema).trim()       : '(sin título)',
        descripcion: row.DetalleTrabajo ? String(row.DetalleTrabajo).trim() : null,
        estado:      ESTADO_MAP[row.Estado]          ?? 'INGRESADO',
        estado_pago: ESTADO_PAGO_MAP[row.EstadoPago] ?? 'PENDIENTE',
        valor,
        fecha:       toFecha(row.FechaIngreso),
      },
      { onConflict: 'id' }
    )

    if (error) {
      errores.push({ id: nroServicio, error: error.message })
    } else {
      importados++
    }
  }

  return NextResponse.json({
    total: servicios.length,
    importados,
    sinCliente,
    errores,
  })
}
