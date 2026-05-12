# CONTEXT-TIENDA.md — Módulo E-Commerce

> **Cómo usar este archivo:**
> Este archivo es un **módulo opcional** que se adjunta junto a `CONTEXT.md`
> cuando el proyecto incluye una tienda online.
>
> - Si el proyecto NO tiene tienda → solo usar `CONTEXT.md`
> - Si el proyecto SÍ tiene tienda → adjuntar `CONTEXT.md` + este archivo
>
> **Al iniciar una sesión:** adjuntar `CONTEXT.md` + `CONTEXT-TIENDA.md` + `lib/theme.ts`
> **Regla:** las URLs, credenciales y configuración de WooCommerce van en `.env` y en `lib/theme.ts`,
> no hardcodeadas en componentes ni servicios.

---

## Tipo de tienda

- **Plataforma:** WooCommerce (WordPress)
- **Hosting:** [DonWeb / SiteGround AR / otro] — PHP + MySQL
- **URL tienda:** [https://tienda.dominio.com]
- **Relación con el proyecto principal:** Opción B — landing + app interna en Next.js, tienda en WooCommerce como dominio/subdominio separado

---

## Arquitectura de integración

### Opción B — separada (la más común al arrancar)

```
dominio.com          → Next.js (landing + app interna) — Vercel / Railway
tienda.dominio.com   → WooCommerce — hosting PHP
```

- La landing linkea a WooCommerce para comprar
- La sección de ofertas muestra productos y al hacer click abre el producto en WooCommerce
- El stock se sincroniza entre PostgreSQL (fuente de verdad) y WooCommerce (vía REST API + webhooks)

### Opción A — headless (evolución futura)
Next.js consume la WooCommerce REST API y renderiza el catálogo y checkout dentro del mismo sitio.
No implementar hasta que la Opción B esté estable y se justifique.

**Estado actual:** [ ] Opción B activa / [ ] Migrando a Opción A

---

## Stack de la tienda

- **CMS:** WordPress [versión]
- **Plugin e-commerce:** WooCommerce [versión]
- **Pagos:** Plugin oficial MercadoPago
- **Envíos:** [ ] OCA · [ ] Andreani · [ ] Correo Argentino
- **REST API:** habilitada (requiere pretty permalinks activados en WordPress)
- **Webhooks:** habilitados hacia el backend Node.js

---

## Variables de entorno necesarias

Agregar en `.env.local` (Next.js) y en el backend Node.js:

```env
# WooCommerce REST API
WC_BASE_URL=https://tienda.dominio.com
WC_CONSUMER_KEY=ck_xxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxx
WC_WEBHOOK_SECRET=xxxxxxxxxxxx
```

Agregar en `lib/theme.ts`:

```ts
woocommerce: {
  baseUrl: process.env.WC_BASE_URL,
  urlTienda: "https://tienda.dominio.com",
  urlCarrito: "https://tienda.dominio.com/carrito",
},
```

---

## Sección de ofertas en la landing

Productos destacados visibles en la landing que linkean a WooCommerce.

### Opción A — hardcodeada (arranque rápido, sin API)
Definir en `lib/theme.ts`:

```ts
ofertas: [
  {
    nombre: "Producto X",
    precio: "$5.000",
    imagen: "/images/ofertas/prod1.jpg",
    urlWoo: "https://tienda.dominio.com/producto/producto-x",
  },
]
```

Componente: `components/landing/ofertas.tsx`
Al hacer click → abre la URL del producto en WooCommerce.

### Opción B — desde API (cuando el cliente rota ofertas frecuentemente)
El backend consume WooCommerce REST API filtrando por tag `oferta-landing`.
Next.js llama al backend (no directamente a WooCommerce, para no exponer credenciales).

```ts
// services/woocommerce.ts
export async function getOfertas() {
  const res = await fetch(`${WC_BASE_URL}/wp-json/wc/v3/products?tag=oferta-landing`, {
    headers: { Authorization: 'Basic ' + btoa(`${WC_KEY}:${WC_SECRET}`) }
  })
  return res.json()
}
```

**Estado actual:** [ ] Opción A — hardcodeada / [ ] Opción B — desde API

---

## Stock unificado

### Fuente de verdad: PostgreSQL (no WooCommerce)

```
App interna (venta) → backend Node.js → PostgreSQL → WooCommerce REST API
WooCommerce (venta) → webhook → backend Node.js → PostgreSQL
```

### Webhooks que el backend recibe desde WooCommerce

| Evento WooCommerce     | Acción en backend                          |
|------------------------|--------------------------------------------|
| `order.created`        | Reserva stock temporalmente                |
| `order.completed`      | Descuenta stock definitivamente            |
| `order.cancelled`      | Devuelve stock                             |
| `order.refunded`       | Devuelve stock                             |

### Endpoints del backend que actualizan WooCommerce

```
PUT /wc/v3/products/:id   → actualiza stock en WooCommerce tras venta interna
GET /wc/v3/products       → sincronización inicial de catálogo
GET /wc/v3/orders         → importar pedidos online al sistema interno
```

### Archivo de servicios

`services/woocommerce.ts` — todas las llamadas a WooCommerce REST API
`services/stock.ts` — lógica de descuento y sincronización de stock

---

## Módulos relacionados en la app interna

Estos módulos del dashboard dependen de este archivo:

- `app/(dashboard)/dashboard/stock/` — gestión de stock unificado
- `app/(dashboard)/dashboard/pedidos/` — pedidos de ambos canales (app + WooCommerce)

Ver `CONTEXT.md` para la estructura completa del dashboard.

---

## Rutas agregadas por este módulo

| Ruta                                  | Descripción                            |
|---------------------------------------|----------------------------------------|
| `dominio.com/#ofertas`                | Sección de productos destacados        |
| `tienda.dominio.com`                  | Tienda WooCommerce (dominio separado)  |
| `tienda.dominio.com/producto/[slug]`  | Página de producto individual          |
| `tienda.dominio.com/carrito`          | Carrito de compras                     |
| `app.dominio.com/dashboard/stock`     | Gestión de stock unificado             |
| `app.dominio.com/dashboard/pedidos`   | Pedidos de todos los canales           |

---

## Funcionalidades implementadas

- [ ] WooCommerce instalado y configurado
- [ ] Plugin MercadoPago activo y probado en sandbox
- [ ] Plugins de envío configurados (OCA / Andreani / Correo)
- [ ] WooCommerce REST API habilitada y testeada
- [ ] Webhooks configurados y apuntando al backend
- [ ] Sección de ofertas en landing (Opción A o B)
- [ ] Sincronización de stock bidireccional
- [ ] Módulo stock en app interna
- [ ] Módulo pedidos unificados en app interna

---

## Pendientes y próximos pasos

### Etapa 1 — WooCommerce operativo
1. Contratar hosting PHP (DonWeb/SiteGround)
2. Instalar WordPress + WooCommerce
3. Activar pretty permalinks (necesario para REST API)
4. Cargar productos y configurar categorías
5. Configurar plugin MercadoPago (modo sandbox primero)
6. Configurar plugins de envío

### Etapa 2 — Integración con backend
1. Habilitar WooCommerce REST API → generar Consumer Key y Secret
2. Crear `services/woocommerce.ts` en el backend
3. Implementar endpoints de sincronización de stock
4. Configurar webhooks en WooCommerce → URL del backend (requiere HTTPS)
5. Testear flujo completo: venta en Woo → descuento en PostgreSQL

### Etapa 3 — Sección de ofertas en landing
1. Crear componente `components/landing/ofertas.tsx`
2. Definir productos en `lib/theme.ts` (Opción A)
3. Al crecer: migrar a Opción B con API

### Backlog
- Migración a headless (Opción A): Next.js consume WooCommerce REST API directo
- Reportes de ventas por canal (online vs. interna)
- Notificaciones por email al cliente tras compra (Resend)
- Sistema de cupones y descuentos cruzados

---

## Notas especiales

- WooCommerce necesita **pretty permalinks** activados para que funcione la REST API (`/wp-admin → Ajustes → Enlaces permanentes → Nombre de la entrada`)
- Los **webhooks requieren HTTPS** en el endpoint del backend. En desarrollo local usar ngrok.
- **No exponer** `WC_CONSUMER_KEY` ni `WC_CONSUMER_SECRET` en el frontend. Las llamadas a WooCommerce van siempre desde el backend.
- WooCommerce es el canal de venta público pero **no es la fuente de verdad del stock**. Toda modificación de stock pasa primero por PostgreSQL.
- Si DonWeb no soporta Node.js, ese hosting es exclusivamente para WooCommerce (PHP). Next.js y Node.js van en Vercel/Railway.

---

**Última actualización:** [DD/MM/AAAA]
**Actualizado por:** [nombre]
