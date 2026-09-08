'use client'
import { useState, useMemo, useRef } from 'react'
import { theme } from '@/lib/theme'
import { useIsMobile } from '@/hooks/useIsMobile'
import FieldRow from '@/components/dashboard/FieldRow'
import { Plus, ChevronLeft, ChevronRight, CheckCircle, Pencil, Trash2, Settings, X, CreditCard, ReceiptText } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tarjeta = {
  id: number
  nombre: string
  tipo: string
  banco: string | null
  activo: boolean
}

type Gasto = {
  id: number
  plantilla_id: number | null
  mes: number
  anio: number
  categoria: string
  descripcion: string
  monto_estimado: number | null
  monto_real: number | null
  monto_pagado: number | null
  pagado: boolean
  fecha_pago: string | null
  metodo_pago: string | null
  tarjeta_id: number | null
  tarjetas: { id: number; nombre: string; tipo: string; banco: string | null } | null
  notas: string | null
  created_at: string
  gastos_pagos?: GastoPago[] | null
}

type GastoPago = {
  id: number
  gasto_id: number
  monto: number | null
  fecha_pago: string | null
  metodo_pago: string | null
  tarjeta_id: number | null
  tarjetas: { id: number; nombre: string; tipo: string; banco: string | null } | null
  notas: string | null
  created_at: string
}

type Plantilla = {
  id: number
  categoria: string
  descripcion: string
  monto_estimado: number | null
  activo: boolean
  orden: number
}

type ModulePermisos = { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }

interface Props {
  initialGastos: Gasto[]
  initialPlantillas: Plantilla[]
  initialTarjetas: Tarjeta[]
  initialMes: number
  initialAnio: number
  permisos: ModulePermisos
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const METODOS = ['EFECTIVO','TRANSFERENCIA','TARJETA','CHEQUE','OTRO']
const TIPOS_TARJETA = ['VISA','MASTERCARD','NARANJA','AMEX','MAESTRO','CABAL','LA ANONIMA','DEBITO']
const BANCOS = ['SANTANDER','MACRO','GALICIA','BBVA','NACION','PROVINCIA','ICBC','HSBC','SUPERVIELLE','BRUBANK','UALA']

function fmt(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtFecha(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function saldoDe(g: Gasto): number {
  const total = g.monto_real ?? g.monto_estimado ?? 0
  const pagado = g.monto_pagado ?? 0
  return Math.max(0, total - pagado)
}

function estaPagado(g: Gasto): boolean {
  const total = g.monto_real ?? g.monto_estimado ?? 0
  const pagado = g.monto_pagado ?? 0
  return total > 0 && pagado >= total
}

function estadoDe(g: Gasto): 'PAGADO' | 'PAGO PARCIAL' | 'PENDIENTE' {
  if (estaPagado(g)) return 'PAGADO'
  if ((g.monto_pagado ?? 0) > 0) return 'PAGO PARCIAL'
  return 'PENDIENTE'
}

// ─── Shared style constants ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm,
  padding: '8px 10px', fontSize: theme.fontSizes.sm, boxSizing: 'border-box', outline: 'none',
  color: theme.colors.text,
}
const btnPrimary: React.CSSProperties = {
  background: theme.colors.primary, color: '#fff', border: 'none', borderRadius: theme.radii.sm,
  padding: '8px 16px', fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium,
  cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  background: '#fff', color: theme.colors.text, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radii.sm, padding: '8px 16px', fontSize: theme.fontSizes.sm, cursor: 'pointer',
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, width = 440 }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: number
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: theme.radii.md, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: `1px solid ${theme.colors.border}` }}>
          <span style={{ fontWeight: theme.fontWeights.medium, fontSize: theme.fontSizes.base }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: theme.radii.sm, padding: '10px 12px', fontSize: theme.fontSizes.sm, marginBottom: 12 }}>
      {msg}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GastosClient({ initialGastos, initialPlantillas, initialTarjetas, initialMes, initialAnio, permisos }: Props) {
  const isMobile = useIsMobile()
  const [gastos, setGastos] = useState<Gasto[]>(initialGastos)
  const [plantillas, setPlantillas] = useState<Plantilla[]>(initialPlantillas)
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>(initialTarjetas)
  const [mes, setMes] = useState(initialMes)
  const [anio, setAnio] = useState(initialAnio)
  const [loadingMes, setLoadingMes] = useState(false)
  const [inicializando, setInicializando] = useState(false)

  // Modals
  const [modalPagar, setModalPagar] = useState<{ gasto: Gasto; pago: GastoPago | null } | null>(null)
  const [modalPagos, setModalPagos] = useState<Gasto | null>(null)
  const fromPagos = useRef(false)
  const [modalGasto, setModalGasto] = useState<Gasto | 'nueva' | null>(null)
  const [modalPlantilla, setModalPlantilla] = useState(false)
  const [modalTarjetas, setModalTarjetas] = useState(false)
  const [modalDeleteGasto, setModalDeleteGasto] = useState<Gasto | null>(null)

  // ── Month navigation ──────────────────────────────────────────────────────

  async function cambiarMes(delta: number) {
    let nm = mes + delta, na = anio
    if (nm < 1) { nm = 12; na-- }
    if (nm > 12) { nm = 1; na++ }
    setLoadingMes(true)
    const r = await fetch(`/api/dashboard/gastos?mes=${nm}&anio=${na}`)
    const data: Gasto[] = await r.json()
    setGastos(data)
    setMes(nm)
    setAnio(na)
    setLoadingMes(false)
  }

  // ── Initializar mes ───────────────────────────────────────────────────────

  async function inicializar() {
    setInicializando(true)
    const r = await fetch('/api/dashboard/gastos/inicializar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, anio }),
    })
    if (r.ok) {
      const r2 = await fetch(`/api/dashboard/gastos?mes=${mes}&anio=${anio}`)
      setGastos(await r2.json())
    }
    setInicializando(false)
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const totalEst = gastos.reduce((s, g) => s + (g.monto_estimado ?? 0), 0)
  const totalPagado = gastos.reduce((s, g) => s + (g.monto_pagado ?? 0), 0)
  const totalPendiente = gastos.reduce((s, g) => s + saldoDe(g), 0)
  const nPendientes = gastos.filter(g => !estaPagado(g)).length

  // ── Categorías únicas ─────────────────────────────────────────────────────

  const categorias = useMemo(() => {
    const set = new Set<string>()
    gastos.forEach(g => set.add(g.categoria))
    plantillas.forEach(p => set.add(p.categoria))
    return Array.from(set).sort()
  }, [gastos, plantillas])

  // ── Gastos agrupados ──────────────────────────────────────────────────────

  const grouped = useMemo(() => {
    const map: Record<string, Gasto[]> = {}
    for (const g of gastos) {
      if (!map[g.categoria]) map[g.categoria] = []
      map[g.categoria].push(g)
    }
    return map
  }, [gastos])

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL PAGAR
  // ─────────────────────────────────────────────────────────────────────────

  function ModalPagar() {
    const { gasto: g, pago } = modalPagar!
    const editing = pago != null
    const [montoTotal, setMontoTotal] = useState(String(g.monto_real ?? g.monto_estimado ?? ''))
    const [montoPagar, setMontoPagar] = useState(
      editing ? String(pago.monto ?? '') : String(saldoDe(g) || '')
    )
    const [fechaPago, setFechaPago] = useState(
      editing ? (pago.fecha_pago ?? today()) : (g.fecha_pago ?? today())
    )
    const [metodo, setMetodo] = useState(
      editing ? (pago.metodo_pago ?? 'TRANSFERENCIA') : (g.metodo_pago ?? 'TRANSFERENCIA')
    )
    const [tarjetaId, setTarjetaId] = useState<number | null>(
      editing ? pago.tarjeta_id : (g.tarjeta_id ?? null)
    )
    const [showNueva, setShowNueva] = useState(false)
    const [ntNombre, setNtNombre] = useState('')
    const [ntTipo, setNtTipo] = useState('')
    const [ntBanco, setNtBanco] = useState('')
    const [ntSaving, setNtSaving] = useState(false)
    const [ntErr, setNtErr] = useState('')
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState('')

    function handleMetodoChange(v: string) {
      setMetodo(v)
      if (v !== 'TARJETA') { setTarjetaId(null); setShowNueva(false) }
    }

    async function crearTarjeta() {
      if (!ntNombre.trim() || !ntTipo.trim()) { setNtErr('Nombre y tipo son requeridos'); return }
      setNtSaving(true); setNtErr('')
      const r = await fetch('/api/dashboard/gastos/tarjetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: ntNombre, tipo: ntTipo, banco: ntBanco || null }),
      })
      if (r.ok) {
        const t: Tarjeta = await r.json()
        setTarjetas(prev => [...prev, t].sort((a, b) => a.nombre.localeCompare(b.nombre)))
        setTarjetaId(t.id)
        setShowNueva(false)
      } else {
        const d = await r.json(); setNtErr(d.error ?? 'Error')
      }
      setNtSaving(false)
    }

    async function save() {
      setSaving(true); setErr('')
      const total = editing ? (g.monto_real ?? g.monto_estimado ?? 0) : (montoTotal ? Number(montoTotal) : 0)
      const montoNuevo = montoPagar ? Number(montoPagar) : 0
      if ((!editing && total <= 0)) { setErr('El monto total debe ser mayor a 0'); setSaving(false); return }
      if (montoNuevo <= 0) { setErr('El monto a pagar debe ser mayor a 0'); setSaving(false); return }
      if (!editing) {
        const saldoActual = total - (g.monto_pagado ?? 0)
        if (montoNuevo > saldoActual) { setErr(`No puede pagar más que el saldo pendiente (${fmt(saldoActual)})`); setSaving(false); return }
      }
      const payload = {
        monto: montoNuevo,
        fecha_pago: fechaPago || null,
        metodo_pago: metodo,
        tarjeta_id: metodo === 'TARJETA' ? tarjetaId : null,
      }
      const url = editing && pago
        ? `/api/dashboard/gastos/pagos/${pago.id}`
        : '/api/dashboard/gastos/pagos'
      const body = editing && pago
        ? payload
        : { ...payload, gasto_id: g.id, monto_total: total }
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok) {
        const updated: Gasto = await r.json()
        setGastos(prev => prev.map(x => x.id === updated.id ? updated : x))
        setModalPagar(null)
        if (fromPagos.current) { fromPagos.current = false; setModalPagos(updated) }
      } else {
        const d = await r.json(); setErr(d.error ?? 'Error al guardar'); setSaving(false)
      }
    }

    return (
      <Modal title={editing ? 'Editar pago' : `Pagar — ${g.descripcion}`} onClose={() => setModalPagar(null)}>
        {err && <ErrorBox msg={err} />}
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 10, background: '#f9fafb', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, padding: '12px 14px' }}>
            <div>
              <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Total real</div>
              <div style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: theme.colors.text }}>${fmt(g.monto_real ?? g.monto_estimado)}</div>
            </div>
            <div>
              <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Ya pagado</div>
              <div style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: '#15803d' }}>${fmt(g.monto_pagado ?? 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>Saldo pendiente</div>
              <div style={{ fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold, color: '#d97706' }}>${fmt(saldoDe(g))}</div>
            </div>
          </div>
          {!editing && (
            <FieldRow label="Monto total del gasto">
              <input style={inputStyle} type="number" value={montoTotal} onChange={e => setMontoTotal(e.target.value)} />
            </FieldRow>
          )}
          <FieldRow label={editing ? 'Monto del pago' : 'Monto a pagar ahora'}>
            <input style={inputStyle} type="number" value={montoPagar} onChange={e => setMontoPagar(e.target.value)} />
          </FieldRow>
          <FieldRow label="Fecha de pago">
            <input style={inputStyle} type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
          </FieldRow>
          <FieldRow label="Método de pago">
            <select style={inputStyle} value={metodo} onChange={e => handleMetodoChange(e.target.value)}>
              {METODOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </FieldRow>

          {metodo === 'TARJETA' && (
            <FieldRow label="Tarjeta">
              <select
                style={inputStyle}
                value={tarjetaId ?? ''}
                onChange={e => {
                  const v = e.target.value
                  if (v === '__nueva__') { setShowNueva(true); setTarjetaId(null) }
                  else { setTarjetaId(v ? Number(v) : null); setShowNueva(false) }
                }}
              >
                <option value="">— Seleccionar tarjeta —</option>
                {tarjetas.filter(t => t.activo).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}{t.banco ? ` — ${t.banco}` : ''}
                  </option>
                ))}
                <option value="__nueva__">+ Nueva tarjeta...</option>
              </select>

              {showNueva && (
                <div style={{ marginTop: 10, padding: 14, background: '#f9fafb', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm }}>
                  {ntErr && <ErrorBox msg={ntErr} />}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, marginBottom: 5, color: theme.colors.textMuted }}>Nombre</label>
                      <input style={inputStyle} placeholder="VISA SANTANDER" value={ntNombre} onChange={e => setNtNombre(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, marginBottom: 5, color: theme.colors.textMuted }}>Tipo</label>
                      <input style={inputStyle} list="tipos-tarjeta" placeholder="VISA, MASTERCARD..." value={ntTipo} onChange={e => setNtTipo(e.target.value)} />
                      <datalist id="tipos-tarjeta">
                        {TIPOS_TARJETA.map(t => <option key={t} value={t} />)}
                      </datalist>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, marginBottom: 5, color: theme.colors.textMuted }}>Banco (opcional)</label>
                      <input style={inputStyle} list="lista-bancos" placeholder="SANTANDER, MACRO..." value={ntBanco} onChange={e => setNtBanco(e.target.value)} />
                      <datalist id="lista-bancos">
                        {BANCOS.map(b => <option key={b} value={b} />)}
                      </datalist>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button style={btnSecondary} onClick={() => setShowNueva(false)}>Cancelar</button>
                    <button style={btnPrimary} onClick={crearTarjeta} disabled={ntSaving}>
                      {ntSaving ? 'Guardando...' : 'Crear tarjeta'}
                    </button>
                  </div>
                </div>
              )}
            </FieldRow>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button style={btnSecondary} onClick={() => setModalPagar(null)}>Cancelar</button>
          <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar pago' : 'Registrar pago'}</button>
        </div>
      </Modal>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL VER / EDITAR / ELIMINAR PAGOS
  // ─────────────────────────────────────────────────────────────────────────

  function ModalPagosView() {
    const g = modalPagos!
    const pagos = (g.gastos_pagos ?? []).slice().sort((a, b) =>
      (a.fecha_pago ?? a.created_at).localeCompare(b.fecha_pago ?? b.created_at)
    )
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [err, setErr] = useState('')

    async function eliminarPago(id: number) {
      setDeletingId(id); setErr('')
      const r = await fetch(`/api/dashboard/gastos/pagos/${id}`, { method: 'DELETE' })
      if (r.ok) {
        const updated: Gasto = await r.json()
        setGastos(prev => prev.map(x => x.id === updated.id ? updated : x))
        setModalPagos(updated)
      } else {
        const d = await r.json(); setErr(d.error ?? 'Error'); setDeletingId(null)
      }
    }

    return (
      <Modal title={`Pagos — ${g.descripcion}`} onClose={() => setModalPagos(null)} width={560}>
        {err && <ErrorBox msg={err} />}
        {pagos.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm, marginBottom: 16 }}>
            No hay pagos registrados para este gasto.
          </p>
        ) : (
          <div>
            {pagos.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: '#15803d' }}>${fmt(p.monto)}</span>
                  {p.fecha_pago && <span style={{ marginLeft: 8, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{fmtFecha(p.fecha_pago)}</span>}
                  {p.metodo_pago && (
                    <span style={{ marginLeft: 6, fontSize: theme.fontSizes.xs, background: '#f3f4f6', borderRadius: 4, padding: '1px 6px', color: theme.colors.textMuted }}>
                      {p.tarjetas ? p.tarjetas.nombre : p.metodo_pago}
                    </span>
                  )}
                  {p.notas && <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{p.notas}</div>}
                </div>
                {permisos.can_edit && (
                  <button
                    title="Editar pago"
                    onClick={() => { fromPagos.current = true; setModalPagar({ gasto: g, pago: p }); setModalPagos(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 4 }}
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {permisos.can_delete && deletingId === p.id ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => eliminarPago(p.id)} style={{ ...btnSecondary, padding: '4px 8px', fontSize: theme.fontSizes.xs, color: '#dc2626', borderColor: '#fecaca' }}>
                      Eliminar
                    </button>
                    <button onClick={() => setDeletingId(null)} style={{ ...btnSecondary, padding: '4px 8px', fontSize: theme.fontSizes.xs }}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  permisos.can_delete && (
                    <button
                      title="Eliminar pago"
                      onClick={() => setDeletingId(p.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
        {!estaPagado(g) && permisos.can_edit && (
          <button
            style={{ ...btnPrimary, marginTop: 16 }}
            onClick={() => { fromPagos.current = true; setModalPagar({ gasto: g, pago: null }); setModalPagos(null) }}
          >
            + Registrar pago
          </button>
        )}
      </Modal>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL AGREGAR / EDITAR GASTO
  // ─────────────────────────────────────────────────────────────────────────

  function ModalGasto() {
    const isNew = modalGasto === 'nueva'
    const g = isNew ? null : modalGasto as Gasto
    const [cat, setCat] = useState(g?.categoria ?? '')
    const [desc, setDesc] = useState(g?.descripcion ?? '')
    const [monto, setMonto] = useState(String(g?.monto_estimado ?? ''))
    const [notas, setNotas] = useState(g?.notas ?? '')
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState('')

    async function save() {
      if (!cat.trim() || !desc.trim()) { setErr('Categoría y descripción son requeridas'); return }
      setSaving(true); setErr('')
      const payload = {
        categoria: cat.trim(),
        descripcion: desc.trim(),
        monto_estimado: monto ? Number(monto) : null,
        notas: notas || null,
        ...(isNew ? { mes, anio } : {}),
      }
      const r = await fetch(
        isNew ? '/api/dashboard/gastos' : `/api/dashboard/gastos/${g!.id}`,
        { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )
      if (r.ok) {
        const saved: Gasto = await r.json()
        setGastos(prev => isNew ? [...prev, saved] : prev.map(x => x.id === saved.id ? saved : x))
        setModalGasto(null)
      } else {
        const d = await r.json(); setErr(d.error ?? 'Error'); setSaving(false)
      }
    }

    return (
      <Modal title={isNew ? 'Agregar gasto' : 'Editar gasto'} onClose={() => setModalGasto(null)}>
        {err && <ErrorBox msg={err} />}
        <div style={{ display: 'grid', gap: 14 }}>
          <FieldRow label="Categoría">
            <input style={inputStyle} list="cats" value={cat} onChange={e => setCat(e.target.value)} placeholder="CASA, SERVICIOS..." />
            <datalist id="cats">{categorias.map(c => <option key={c} value={c} />)}</datalist>
          </FieldRow>
          <FieldRow label="Descripción">
            <input style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} />
          </FieldRow>
          <FieldRow label="Monto estimado">
            <input style={inputStyle} type="number" value={monto} onChange={e => setMonto(e.target.value)} />
          </FieldRow>
          <FieldRow label="Notas">
            <input style={inputStyle} value={notas} onChange={e => setNotas(e.target.value)} />
          </FieldRow>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button style={btnSecondary} onClick={() => setModalGasto(null)}>Cancelar</button>
          <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </Modal>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL CONFIRMAR ELIMINAR GASTO
  // ─────────────────────────────────────────────────────────────────────────

  function ModalDelete() {
    const g = modalDeleteGasto!
    const [loading, setLoading] = useState(false)
    async function confirm() {
      setLoading(true)
      const r = await fetch(`/api/dashboard/gastos/${g.id}`, { method: 'DELETE' })
      if (r.ok) {
        setGastos(prev => prev.filter(x => x.id !== g.id))
        setModalDeleteGasto(null)
      }
      setLoading(false)
    }
    return (
      <Modal title="Eliminar gasto" onClose={() => setModalDeleteGasto(null)} width={380}>
        <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.text, marginBottom: 20 }}>
          ¿Eliminar <strong>{g.descripcion}</strong>? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button style={btnSecondary} onClick={() => setModalDeleteGasto(null)}>Cancelar</button>
          <button style={{ ...btnPrimary, background: '#dc2626' }} onClick={confirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL GESTIONAR TARJETAS
  // ─────────────────────────────────────────────────────────────────────────

  function ModalTarjetasPanel() {
    const [editando, setEditando] = useState<Tarjeta | 'nueva' | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    async function deleteTarjeta(id: number) {
      setDeletingId(id)
      const r = await fetch(`/api/dashboard/gastos/tarjetas/${id}`, { method: 'DELETE' })
      if (r.ok) setTarjetas(prev => prev.filter(t => t.id !== id))
      setDeletingId(null)
    }

    function FormTarjeta({ t }: { t: Tarjeta | null }) {
      const isNew = t === null
      const [nombre, setNombre] = useState(t?.nombre ?? '')
      const [tipo, setTipo] = useState(t?.tipo ?? '')
      const [banco, setBanco] = useState(t?.banco ?? '')
      const [activo, setActivo] = useState(t?.activo ?? true)
      const [saving, setSaving] = useState(false)
      const [err, setErr] = useState('')

      async function save() {
        if (!nombre.trim() || !tipo.trim()) { setErr('Nombre y tipo son requeridos'); return }
        setSaving(true); setErr('')
        const r = await fetch(
          isNew ? '/api/dashboard/gastos/tarjetas' : `/api/dashboard/gastos/tarjetas/${t!.id}`,
          {
            method: isNew ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, tipo, banco: banco || null, activo }),
          }
        )
        if (r.ok) {
          const saved: Tarjeta = await r.json()
          setTarjetas(prev =>
            isNew
              ? [...prev, saved].sort((a, b) => a.nombre.localeCompare(b.nombre))
              : prev.map(x => x.id === saved.id ? saved : x)
          )
          setEditando(null)
        } else {
          const d = await r.json(); setErr(d.error ?? 'Error'); setSaving(false)
        }
      }

      return (
        <div style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, padding: 16, marginBottom: 12, background: '#f9fafb' }}>
          {err && <ErrorBox msg={err} />}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldRow label="Nombre (visible en listados)">
                <input style={inputStyle} placeholder="VISA SANTANDER" value={nombre} onChange={e => setNombre(e.target.value)} />
              </FieldRow>
            </div>
            <div>
              <FieldRow label="Tipo de tarjeta">
                <input style={inputStyle} list="tipos-t" placeholder="VISA, MASTERCARD..." value={tipo} onChange={e => setTipo(e.target.value)} />
                <datalist id="tipos-t">{TIPOS_TARJETA.map(x => <option key={x} value={x} />)}</datalist>
              </FieldRow>
            </div>
            <div>
              <FieldRow label="Banco (opcional)">
                <input style={inputStyle} list="bancos-t" placeholder="SANTANDER, MACRO..." value={banco} onChange={e => setBanco(e.target.value)} />
                <datalist id="bancos-t">{BANCOS.map(b => <option key={b} value={b} />)}</datalist>
              </FieldRow>
            </div>
          </div>
          {!isNew && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: theme.fontSizes.sm, cursor: 'pointer', marginBottom: 10 }}>
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} /> Activo
            </label>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={btnSecondary} onClick={() => setEditando(null)}>Cancelar</button>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      )
    }

    return (
      <Modal title="Gestionar tarjetas" onClose={() => setModalTarjetas(false)} width={560}>
        {editando === 'nueva' && <FormTarjeta t={null} />}

        {tarjetas.length === 0 && editando !== 'nueva' && (
          <p style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm, marginBottom: 16 }}>
            No hay tarjetas cargadas.
          </p>
        )}

        <div>
          {tarjetas.map(t => (
            <div key={t.id}>
              {editando !== 'nueva' && (editando as Tarjeta | null)?.id === t.id
                ? <FormTarjeta t={t} />
                : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: t.activo ? theme.colors.text : theme.colors.textMuted }}>
                        {t.nombre}
                      </span>
                      <span style={{ marginLeft: 8, fontSize: theme.fontSizes.xs, background: '#f3f4f6', borderRadius: 4, padding: '1px 6px', color: theme.colors.textMuted }}>
                        {t.tipo}
                      </span>
                      {t.banco && (
                        <span style={{ marginLeft: 4, fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{t.banco}</span>
                      )}
                      {!t.activo && <span style={{ fontSize: theme.fontSizes.xs, color: '#9ca3af', marginLeft: 6 }}>(inactivo)</span>}
                    </div>
                    <button onClick={() => setEditando(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 4 }}><Pencil size={14} /></button>
                    <button onClick={() => deleteTarjeta(t.id)} disabled={deletingId === t.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4, opacity: deletingId === t.id ? 0.5 : 1 }}><Trash2 size={14} /></button>
                  </div>
                )
              }
            </div>
          ))}
        </div>

        {editando !== 'nueva' && (
          <button style={{ ...btnPrimary, marginTop: 16 }} onClick={() => setEditando('nueva')}>
            + Agregar tarjeta
          </button>
        )}
      </Modal>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL GESTIONAR PLANTILLA
  // ─────────────────────────────────────────────────────────────────────────

  function ModalPlantilla() {
    const [editando, setEditando] = useState<Plantilla | 'nueva' | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    async function deletePlantilla(id: number) {
      setDeletingId(id)
      const r = await fetch(`/api/dashboard/gastos/plantilla/${id}`, { method: 'DELETE' })
      if (r.ok) setPlantillas(prev => prev.filter(p => p.id !== id))
      setDeletingId(null)
    }

    function FormPlantilla({ p }: { p: Plantilla | null }) {
      const isNew = p === null
      const [cat, setCat] = useState(p?.categoria ?? '')
      const [desc, setDesc] = useState(p?.descripcion ?? '')
      const [monto, setMonto] = useState(String(p?.monto_estimado ?? ''))
      const [orden, setOrden] = useState(String(p?.orden ?? '0'))
      const [activo, setActivo] = useState(p?.activo ?? true)
      const [saving, setSaving] = useState(false)
      const [err, setErr] = useState('')

      async function save() {
        if (!cat.trim() || !desc.trim()) { setErr('Categoría y descripción son requeridas'); return }
        setSaving(true); setErr('')
        const payload = {
          categoria: cat.trim(),
          descripcion: desc.trim(),
          monto_estimado: monto ? Number(monto) : null,
          orden: Number(orden) || 0,
          activo,
        }
        const r = await fetch(
          isNew ? '/api/dashboard/gastos/plantilla' : `/api/dashboard/gastos/plantilla/${p!.id}`,
          { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        )
        if (r.ok) {
          const saved: Plantilla = await r.json()
          setPlantillas(prev => isNew ? [...prev, saved] : prev.map(x => x.id === saved.id ? saved : x))
          setEditando(null)
        } else {
          const d = await r.json(); setErr(d.error ?? 'Error'); setSaving(false)
        }
      }

      return (
        <div style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.sm, padding: 16, marginBottom: 12, background: '#f9fafb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <FieldRow label="Categoría">
                <input style={inputStyle} list="cats-p" value={cat} onChange={e => setCat(e.target.value)} />
                <datalist id="cats-p">{categorias.map(c => <option key={c} value={c} />)}</datalist>
              </FieldRow>
            </div>
            <div>
              <FieldRow label="Descripción">
                <input style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} />
              </FieldRow>
            </div>
            <div>
              <FieldRow label="Monto estimado">
                <input style={inputStyle} type="number" value={monto} onChange={e => setMonto(e.target.value)} />
              </FieldRow>
            </div>
            <div>
              <FieldRow label="Orden">
                <input style={inputStyle} type="number" value={orden} onChange={e => setOrden(e.target.value)} />
              </FieldRow>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: theme.fontSizes.sm, cursor: 'pointer' }}>
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} /> Activo
            </label>
          </div>
          {err && <ErrorBox msg={err} />}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={btnSecondary} onClick={() => setEditando(null)}>Cancelar</button>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      )
    }

    return (
      <Modal title="Gestionar plantilla de gastos fijos" onClose={() => setModalPlantilla(false)} width={600}>
        {editando === 'nueva' && <FormPlantilla p={null} />}

        {plantillas.length === 0 && editando !== 'nueva' && (
          <p style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.sm, marginBottom: 16 }}>
            No hay plantillas. Agrega gastos fijos que se copiarán cada mes.
          </p>
        )}

        <div>
          {plantillas.map(p => (
            <div key={p.id}>
              {editando !== 'nueva' && (editando as Plantilla | null)?.id === p.id
                ? <FormPlantilla p={p} />
                : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, textTransform: 'uppercase', marginRight: 8 }}>{p.categoria}</span>
                      <span style={{ fontSize: theme.fontSizes.sm, fontWeight: p.activo ? theme.fontWeights.medium : theme.fontWeights.regular, color: p.activo ? theme.colors.text : theme.colors.textMuted }}>
                        {p.descripcion}
                      </span>
                      {!p.activo && <span style={{ fontSize: theme.fontSizes.xs, color: '#9ca3af', marginLeft: 6 }}>(inactivo)</span>}
                    </div>
                    {p.monto_estimado != null && (
                      <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>${fmt(p.monto_estimado)}</span>
                    )}
                    <button onClick={() => setEditando(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 4 }}><Pencil size={14} /></button>
                    <button onClick={() => deletePlantilla(p.id)} disabled={deletingId === p.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4, opacity: deletingId === p.id ? 0.5 : 1 }}><Trash2 size={14} /></button>
                  </div>
                )
              }
            </div>
          ))}
        </div>

        {editando !== 'nueva' && (
          <button style={{ ...btnPrimary, marginTop: 16 }} onClick={() => setEditando('nueva')}>
            + Agregar gasto fijo
          </button>
        )}
      </Modal>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────

  const hayPlantillasActivas = plantillas.some(p => p.activo)
  const mesVacio = gastos.length === 0

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>

        {/* Selector de mes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => cambiarMes(-1)} disabled={loadingMes} style={{ ...btnSecondary, padding: '6px 10px', display: 'flex' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ minWidth: 150, textAlign: 'center' }}>
            <div style={{ fontWeight: theme.fontWeights.bold, fontSize: theme.fontSizes.lg, color: theme.colors.text }}>
              {loadingMes ? '...' : MESES[mes - 1]}
            </div>
            <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{anio}</div>
          </div>
          <button onClick={() => cambiarMes(1)} disabled={loadingMes} style={{ ...btnSecondary, padding: '6px 10px', display: 'flex' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btnSecondary} onClick={() => setModalTarjetas(true)}>
            <CreditCard size={14} style={{ display: 'inline', marginRight: 6 }} />
            Tarjetas
          </button>
          <button style={btnSecondary} onClick={() => setModalPlantilla(true)}>
            <Settings size={14} style={{ display: 'inline', marginRight: 6 }} />
            Plantilla fija
          </button>
          {permisos.can_create && (
            <button style={btnPrimary} onClick={() => setModalGasto('nueva')}>
              <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />
              Agregar gasto
            </button>
          )}
        </div>
      </div>

      {/* ── KPI cards ── */}
      {!mesVacio && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total estimado', value: `$${fmt(totalEst)}`, color: theme.colors.primary },
            { label: 'Pagado', value: `$${fmt(totalPagado)}`, color: '#15803d' },
            { label: 'Pendiente', value: `$${fmt(totalPendiente)}`, color: '#d97706' },
            { label: 'Sin pagar', value: `${nPendientes} gasto${nPendientes !== 1 ? 's' : ''}`, color: '#dc2626' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.md, padding: '14px 16px', boxShadow: theme.shadows.sm }}>
              <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Banner inicializar ── */}
      {mesVacio && hayPlantillasActivas && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: theme.radii.md, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: theme.fontWeights.medium, fontSize: theme.fontSizes.sm, color: '#1e40af' }}>
              {MESES[mes-1]} {anio} no tiene gastos cargados.
            </div>
            <div style={{ fontSize: theme.fontSizes.xs, color: '#3b82f6', marginTop: 2 }}>
              Podés inicializar el mes con los gastos fijos de la plantilla.
            </div>
          </div>
          <button style={{ ...btnPrimary, background: '#2563eb', whiteSpace: 'nowrap' }} onClick={inicializar} disabled={inicializando}>
            {inicializando ? 'Inicializando...' : 'Inicializar con gastos fijos'}
          </button>
        </div>
      )}

      {/* ── Tabla ── */}
      {!mesVacio ? (
        <div style={{ background: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.md, overflow: 'hidden', boxShadow: theme.shadows.sm }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.colors.border}`, background: '#f9fafb' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est.</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pagado</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, fontWeight: theme.fontWeights.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha / Método</th>
                <th style={{ padding: '10px 14px', width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([cat, items]) => (
                <>
                  {/* Fila de categoría */}
                  <tr key={`cat-${cat}`} style={{ background: '#f3f4f6' }}>
                    <td colSpan={8} style={{ padding: '6px 14px', fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {cat}
                    </td>
                  </tr>
                  {/* Filas de gastos */}
                  {items.map(g => {
                    const estado = estadoDe(g)
                    const saldo = saldoDe(g)
                    return (
                    <tr key={g.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '11px 14px', fontSize: theme.fontSizes.sm, color: theme.colors.text }}>
                        {g.descripcion}
                        {g.notas && <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>{g.notas}</div>}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                        {g.monto_estimado != null ? `$${fmt(g.monto_estimado)}` : '—'}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: theme.fontSizes.sm, fontWeight: g.monto_real != null ? theme.fontWeights.medium : theme.fontWeights.regular, color: g.monto_real != null ? theme.colors.text : theme.colors.textMuted }}>
                        {g.monto_real != null ? `$${fmt(g.monto_real)}` : '—'}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: theme.fontSizes.sm, color: (g.monto_pagado ?? 0) > 0 ? '#15803d' : theme.colors.textMuted }}>
                        ${fmt(g.monto_pagado ?? 0)}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontSize: theme.fontSizes.sm, fontWeight: saldo > 0 ? theme.fontWeights.medium : theme.fontWeights.regular, color: saldo > 0 ? '#d97706' : '#15803d' }}>
                        {saldo > 0 ? `$${fmt(saldo)}` : '—'}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', borderRadius: 20, padding: '3px 10px',
                          fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium,
                          background: estado === 'PAGADO' ? '#dcfce7' : estado === 'PAGO PARCIAL' ? '#fef3c7' : '#fef9c3',
                          color: estado === 'PAGADO' ? '#15803d' : estado === 'PAGO PARCIAL' ? '#b45309' : '#92400e',
                        }}>
                          {estado}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
                        {g.fecha_pago ? (
                          <>
                            {fmtFecha(g.fecha_pago)}
                            {g.metodo_pago && (
                              <span style={{ marginLeft: 6, background: '#f3f4f6', borderRadius: 4, padding: '1px 6px' }}>
                                {g.tarjetas ? g.tarjetas.nombre : g.metodo_pago}
                              </span>
                            )}
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {!estaPagado(g) && permisos.can_edit && (
                            <button title="Registrar pago" onClick={() => setModalPagar({ gasto: g, pago: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', display: 'flex', padding: 4 }}>
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button title="Ver pagos" onClick={() => setModalPagos(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 4 }}>
                            <ReceiptText size={14} />
                          </button>
                          {permisos.can_edit && (
                            <button title="Editar" onClick={() => setModalGasto(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex', padding: 4 }}>
                              <Pencil size={14} />
                            </button>
                          )}
                          {permisos.can_delete && (
                            <button title="Eliminar" onClick={() => setModalDeleteGasto(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', padding: 4 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        !hayPlantillasActivas && (
          <div style={{ background: '#fff', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radii.md, padding: '40px 20px', textAlign: 'center', color: theme.colors.textMuted, boxShadow: theme.shadows.sm }}>
            <div style={{ marginBottom: 8 }}>No hay gastos para este mes.</div>
            <div style={{ fontSize: theme.fontSizes.xs }}>
              Configurá la <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.primary, fontSize: theme.fontSizes.xs, textDecoration: 'underline', padding: 0 }} onClick={() => setModalPlantilla(true)}>plantilla de gastos fijos</button> o agregá un gasto manualmente.
            </div>
          </div>
        )
      )}

      {/* ── Modales ── */}
      {modalPagar && <ModalPagar />}
      {modalPagos && <ModalPagosView />}
      {modalGasto && <ModalGasto />}
      {modalDeleteGasto && <ModalDelete />}
      {modalTarjetas && <ModalTarjetasPanel />}
      {modalPlantilla && <ModalPlantilla />}
    </div>
  )
}
