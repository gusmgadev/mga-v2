export type TipoMovimiento = 'entrada' | 'salida'
export type EstadoRemito = 'borrador' | 'confirmado' | 'anulado'
export type TipoOrigenDestino = 'proveedor' | 'sucursal' | 'deposito' | 'cliente' | 'otro'
export type TipoNumeracion = 'automatico' | 'manual' | 'proveedor'

export interface Producto {
  id: string
  codigo?: string | null
  nombre: string
  marca?: string | null
  unidad: string
  rubro?: string | null
  subrubro?: string | null
  stock_actual: number
  costo?: number | null
  precio_venta?: number | null
  activo: boolean
  created_at: string
}

export interface OrigenDestino {
  id: string
  tipo: TipoOrigenDestino
  nombre: string
  activo: boolean
  created_at: string
}

export interface Remito {
  id: string
  usuario_id?: string | null
  numero_tipo: TipoNumeracion
  numero: string
  tipo: TipoMovimiento
  fecha: string
  origen_destino_id?: string | null
  origen_destino_texto?: string | null
  observaciones?: string | null
  audio_url?: string | null
  transcripcion?: string | null
  estado: EstadoRemito
  confirmado_at?: string | null
  created_at: string
  origenes_destinos?: OrigenDestino | null
  remito_items?: RemitoItem[]
}

export interface RemitoItem {
  id: string
  remito_id: string
  producto_id?: string | null
  nombre_detectado?: string | null
  cantidad: number
  cantidad_asumida: boolean
  unidad?: string | null
  costo?: number | null
  precio_venta?: number | null
  confianza?: number | null
  es_producto_nuevo: boolean
  orden: number
  productos?: Producto | null
}

export interface MovimientoStock {
  id: string
  producto_id: string
  remito_id: string
  remito_item_id: string
  tipo: TipoMovimiento | 'ajuste'
  cantidad: number
  costo?: number | null
  stock_antes: number
  stock_despues: number
  created_at: string
}

export interface ProductoDetectado {
  nombre_detectado: string
  cantidad: number
  cantidad_asumida: boolean
  unidad: string | null
  costo: number | null
  precio_venta: number | null
}

export interface ProductoConMatch extends ProductoDetectado {
  producto_match?: {
    id: string
    nombre: string
    codigo?: string | null
    marca?: string | null
    unidad: string
    stock_actual: number
    costo?: number | null
    precio_venta?: number | null
  }
  confianza: number
  es_producto_nuevo: boolean
}
