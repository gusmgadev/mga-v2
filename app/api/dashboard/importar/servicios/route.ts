import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/services/supabase-admin'
import { read, utils } from 'xlsx'
import type { WorkBook } from 'xlsx'

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

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'Administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el formulario' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }

  let wb: WorkBook
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    wb = read(buffer, { cellDates: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el archivo Excel. Verificá que sea un .xlsx válido.' }, { status: 400 })
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

    const valor = Number(row.Valor) || 0
    const pagos = Number(row.Pagos) || 0
    const fecha = toFecha(row.FechaIngreso)

    const { error: errServicio } = await supabaseAdmin.from('servicios').upsert(
      {
        id:          nroServicio,
        cliente_id:  clienteId,
        titulo:      row.Problema       ? String(row.Problema).trim()       : '(sin título)',
        descripcion: row.DetalleTrabajo ? String(row.DetalleTrabajo).trim() : null,
        estado:      ESTADO_MAP[row.Estado]          ?? 'INGRESADO',
        estado_pago: ESTADO_PAGO_MAP[row.EstadoPago] ?? 'PENDIENTE',
        valor,
        fecha,
      },
      { onConflict: 'id' }
    )

    if (errServicio) {
      errores.push({ id: nroServicio, error: errServicio.message })
      continue
    }

    if (pagos > 0) {
      await supabaseAdmin
        .from('cobranzas')
        .delete()
        .eq('servicio_id', nroServicio)
        .eq('concepto', 'Pago importado desde Excel')

      await supabaseAdmin.from('cobranzas').insert({
        cliente_id:  clienteId,
        servicio_id: nroServicio,
        tipo:        'PAGO',
        concepto:    'Pago importado desde Excel',
        monto:       pagos,
        fecha:       fecha ?? new Date().toISOString().split('T')[0],
        metodo_pago: 'OTRO',
      })
    }

    importados++
  }

  return NextResponse.json({
    total: servicios.length,
    importados,
    sinCliente,
    errores,
  })
}
