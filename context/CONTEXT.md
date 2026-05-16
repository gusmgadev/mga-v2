# CONTEXT.md — MGA Informática

> Resumen general del proyecto para referencia humana.
> Para sesiones de IA: el contexto técnico completo está en **`CLAUDE.md`** (raíz del repo), que importa los archivos por módulo de `context/modulos/`.

---

## Descripción general

- **Proyecto:** MGA Informática (sitio web + sistema de gestión interno)
- **Cliente:** MGA Informática
- **Rubro:** Servicios IT — desarrollo web, mantenimiento de equipos, sistemas de gestión (Zoologic), consultoría IT, soporte técnico
- **URL producción:** https://mgadigital.com.ar
- **Repo GitHub:** https://github.com/gusmgadev/mga-v2
- **Deploy:** Vercel (rama `master`)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.4 — App Router |
| Lenguaje | TypeScript strict |
| Estilos landing | Tailwind CSS v4 + Framer Motion |
| Estilos dashboard | Inline styles con `theme.*` (sin Tailwind) |
| Auth | NextAuth.js v5 beta — CredentialsProvider + JWT |
| Base de datos | Supabase PostgreSQL |
| Formularios | React Hook Form + Zod |
| IA / voz | Groq Whisper (STT) + Llama 3.3 |
| Rich text | TipTap (solo dashboard noticias) |
| Email | Resend |
| Instagram | Graph API v21.0 |
| Íconos | Lucide React |

---

## Módulos implementados

| Módulo | Grupo sidebar | Estado |
|--------|--------------|--------|
| Oportunidades | Servicios | ✅ Lista + extracción IMAP/Groq |
| Servicios | Servicios | ✅ Lista + detalle + tareas + pagos |
| Presupuestos | Servicios | ✅ Lista + detalle + ítems |
| Activos | Servicios | ✅ Lista + crear + editar |
| Clientes | Altas | ✅ Lista + crear + editar + logo upload |
| Productos | Altas | ✅ Lista + crear + editar + stock |
| Remitos | Stock | ✅ Lista + detalle + ítems + ingreso por voz |
| Cobranzas | Fondos | ✅ Lista + crear + imputar pagos a cuenta |
| Noticias | Administración | ✅ CRUD + rich text + imágenes + Instagram |
| Usuarios | Administración | ✅ Lista + crear + editar |
| Roles | Administración | ✅ Lista + crear |
| Permisos | Administración | ✅ Edición por rol y módulo |

---

## Contexto técnico por módulo

| Módulo operativo | Archivo de contexto |
|-----------------|---------------------|
| Servicios (OPs, Servicios, Presupuestos, Activos) | [context/modulos/servicios.md](modulos/servicios.md) |
| Altas (Clientes, Productos) | [context/modulos/altas.md](modulos/altas.md) |
| Stock (Remitos) | [context/modulos/stock.md](modulos/stock.md) |
| Fondos (Cobranzas) | [context/modulos/fondos.md](modulos/fondos.md) |
| Administración (Auth, Noticias, Admin) | [context/modulos/administracion.md](modulos/administracion.md) |

---

## Pendientes

- Cobranzas sin edición (solo DELETE) — si hay error hay que borrar y recrear
- Google Search Console — enviar sitemap
- OG image dedicada — actualmente usa hero-1.jpg
- Sección Nosotros — link en navbar apunta a `#`
- SQL `buscar_productos_por_nombre` — pendiente búsqueda por `codigo` en pg_trgm

---

**Última actualización:** 2026-05-16
**Actualizado por:** Claude Code
