# Radar de Oportunidades Comerciales

## Especificación funcional y técnica para agente IA

## 1. Objetivo

Desarrollar una funcionalidad dentro de una aplicación existente construida con **Next.js** y **Supabase** que permita buscar, almacenar, analizar y calificar potenciales clientes para ofrecer servicios de desarrollo de software, automatizaciones y sistemas enlatados.

El módulo debe permitir localizar comercios, emprendimientos y empresas por ubicación y rubro, obtener la mayor cantidad de información pública posible, analizar su presencia digital y asignar un puntaje de oportunidad comercial.

El nombre sugerido para el módulo es:

> **Radar de Oportunidades**

La funcionalidad no debe incluir inicialmente búsquedas directas en Facebook ni Instagram.

---

## 2. Resultado esperado

El usuario podrá realizar búsquedas utilizando filtros como:

- Provincia.
- Localidad.
- Radio de búsqueda.
- Rubro.
- Palabras clave.
- Cantidad máxima de resultados.
- Presencia o ausencia de sitio web.
- Presencia de teléfono.
- Presencia de correo electrónico.
- Cantidad mínima de reseñas.
- Calificación mínima.
- Servicio o producto que se desea ofrecer.

El sistema deberá devolver un listado de prospectos con información como:

- Nombre del comercio o empresa.
- Rubro.
- Provincia.
- Localidad.
- Domicilio.
- Coordenadas.
- Teléfono.
- Correo electrónico.
- WhatsApp, si puede identificarse públicamente.
- Sitio web.
- URL de Google Maps.
- Calificación.
- Cantidad de reseñas.
- Estado del negocio.
- Puntaje de actividad comercial.
- Puntaje de necesidad digital.
- Puntaje de facilidad de contacto.
- Puntaje de compatibilidad con los servicios ofrecidos.
- Puntaje final de oportunidad.
- Motivos del puntaje.
- Servicio recomendado.
- Estado comercial del prospecto.

---

## 3. Alcance del MVP

La primera versión debe incluir:

1. Búsqueda por provincia.
2. Búsqueda por localidad.
3. Búsqueda por rubro.
4. Búsqueda por palabras clave.
5. Búsqueda por radio geográfico.
6. Integración con Google Places API.
7. Obtención de datos básicos del comercio.
8. Eliminación de registros duplicados.
9. Guardado de búsquedas.
10. Guardado de prospectos.
11. Análisis básico del sitio web.
12. Detección de datos de contacto públicos.
13. Análisis de rendimiento web mediante PageSpeed Insights.
14. Cálculo de puntajes.
15. Ordenamiento por oportunidad.
16. Filtros sobre los resultados.
17. Vista de detalle del prospecto.
18. Estados comerciales básicos.
19. Exportación a CSV.
20. Procesamiento asíncrono mediante trabajos o colas.
21. Actualización de progreso en tiempo real.

---

## 4. Fuera de alcance del MVP

No incluir inicialmente:

- Scraping de Facebook.
- Scraping de Instagram.
- Envío masivo de correos.
- Envío masivo de mensajes por WhatsApp.
- Automatización de campañas.
- Compra de bases de datos.
- Extracción de datos privados.
- Estimaciones falsas de tráfico web.
- Integraciones con CRM externos.
- Automatización completa del contacto comercial.

Estas funciones podrán evaluarse en etapas posteriores.

---

## 5. Tecnologías existentes

La aplicación ya está desarrollada con:

- Next.js.
- Supabase.

La implementación debe priorizar:

- Next.js App Router.
- TypeScript.
- Server Actions o Route Handlers.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Row Level Security.
- Supabase Edge Functions cuando sea conveniente.
- Supabase Realtime.
- Supabase Cron o un sistema de trabajos.
- Supabase Queues, si están disponibles en el proyecto.

No asumir versiones específicas sin revisar primero el proyecto existente.

---

## 6. Principios de diseño

La solución debe cumplir los siguientes principios:

### 6.1 Datos verificables

Todos los datos obtenidos deben conservar su fuente.

No se debe presentar una estimación como si fuera un dato real.

Ejemplo correcto:

```text
Datos CrUX disponibles: sí
Actividad web estimada: media
```

Ejemplo incorrecto:

```text
El sitio recibe 15.000 visitas mensuales
```

salvo que exista un proveedor confiable que entregue esa cifra y se indique expresamente que es una estimación.

### 6.2 Procesamiento progresivo

Los resultados deben aparecer a medida que se procesan.

No esperar a que finalice el análisis completo de todos los prospectos para mostrarlos.

### 6.3 Revisión humana

El sistema debe ayudar a descubrir y priorizar oportunidades, pero no debe contactar automáticamente a prospectos en el MVP.

### 6.4 Trazabilidad

Cada dato debe registrar:

- Fuente.
- Fecha de obtención.
- Fecha de última verificación.
- URL de origen cuando corresponda.

### 6.5 Privacidad y cumplimiento

Trabajar únicamente con información comercial pública.

Incluir campos para:

- No contactar.
- Bloqueado.
- Solicitud de eliminación.
- Fecha de exclusión.
- Motivo de exclusión.

---

## 7. Flujo funcional principal

### 7.1 Crear búsqueda

El usuario completa un formulario con:

- Provincia.
- Localidad.
- Radio.
- Rubro.
- Palabras clave.
- Cantidad máxima de resultados.
- Servicio a ofrecer.
- Filtros adicionales.

### 7.2 Generar consultas

El sistema debe generar una o varias consultas para mejorar la cobertura.

Ejemplo:

```text
Provincia: Chubut
Localidad: Comodoro Rivadavia
Rubro: Centros de estética
Palabras clave: turnos, uñas, depilación
```

Consultas generadas:

```text
centros de estética en Comodoro Rivadavia
salón de uñas en Comodoro Rivadavia
depilación en Comodoro Rivadavia
estética y belleza en Comodoro Rivadavia
```

### 7.3 Consultar Google Places

Consultar Google Places API utilizando los filtros disponibles.

Solicitar únicamente los campos necesarios para controlar costos.

Guardar la respuesta original en formato JSON para auditoría y reprocesamiento.

### 7.4 Normalizar y deduplicar

Los resultados deben normalizarse y deduplicarse.

Prioridad de deduplicación:

1. `google_place_id`.
2. Teléfono normalizado.
3. Dominio del sitio web.
4. Nombre normalizado más localidad.
5. Dirección normalizada.

### 7.5 Guardar resultados básicos

Guardar los prospectos inmediatamente con estado `pending_analysis`.

### 7.6 Enriquecer información

Para cada prospecto:

1. Obtener detalles adicionales de Google Places.
2. Consultar el sitio web, si existe.
3. Detectar correos electrónicos públicos.
4. Detectar teléfonos públicos.
5. Detectar WhatsApp.
6. Detectar formularios.
7. Detectar catálogo.
8. Detectar e-commerce.
9. Detectar sistema de turnos.
10. Detectar enlaces a redes sociales.
11. Detectar tecnologías del sitio.
12. Ejecutar PageSpeed Insights.
13. Consultar CrUX cuando exista disponibilidad.
14. Calcular puntajes.
15. Generar un resumen comercial.

### 7.7 Mostrar resultados

Mostrar los prospectos ordenados por `opportunity_score` descendente.

---

## 8. Filtros de búsqueda

El formulario debe soportar:

```ts
interface ProspectSearchFilters {
  province?: string;
  city?: string;
  radiusKm?: number;
  category?: string;
  keywords?: string[];
  maxResults?: number;
  serviceId?: string;
  websiteFilter?: "all" | "with_website" | "without_website";
  phoneRequired?: boolean;
  emailRequired?: boolean;
  minRating?: number;
  minReviewCount?: number;
  businessStatus?: "all" | "operational";
}
```

Valores sugeridos:

- `radiusKm`: 5, 10, 20, 50, 100.
- `maxResults`: 20, 50, 100, 200.

---

## 9. Fuentes de información

### 9.1 Google Places

Fuente principal del MVP.

Posibles datos:

- Nombre.
- Tipo de negocio.
- Dirección.
- Provincia.
- Localidad.
- Coordenadas.
- Teléfono.
- Sitio web.
- URL de Google Maps.
- Calificación.
- Cantidad de reseñas.
- Horarios.
- Estado del negocio.
- Identificador único.

### 9.2 Sitio web del prospecto

Analizar únicamente sitios públicos.

Buscar:

- Correos.
- Teléfonos.
- WhatsApp.
- Formularios.
- E-commerce.
- Catálogo.
- Reservas.
- Turnos.
- Área de clientes.
- Chat.
- Enlaces sociales.
- Tecnologías.
- Texto relevante.

### 9.3 PageSpeed Insights

Obtener:

- Performance.
- Accessibility.
- SEO.
- Best Practices.
- Métricas principales.
- Resultado móvil.

### 9.4 CrUX

Cuando exista información:

- Indicar disponibilidad.
- Guardar métricas disponibles.
- No inferir visitas exactas.

---

## 10. Estados del proceso

### 10.1 Estado de búsqueda

```text
pending
searching
saving_results
enriching
scoring
completed
partial
failed
cancelled
```

### 10.2 Estado de prospecto

```text
pending_analysis
analyzing
ready
analysis_failed
excluded
```

### 10.3 Estado comercial

```text
new
reviewed
to_contact
contacted
interested
meeting
proposal_sent
won
lost
discarded
do_not_contact
```

---

## 11. Sistema de puntajes

El sistema debe manejar puntajes separados.

### 11.1 Puntaje de actividad comercial

Rango: 0 a 100.

Posibles señales:

- Cantidad de reseñas.
- Calificación.
- Estado operativo.
- Información completa.
- Sitio web.
- Horarios cargados.
- Varias ubicaciones.
- Datos CrUX disponibles.

Ejemplo de reglas iniciales:

```ts
function calculateCommercialActivityScore(input: {
  reviewCount?: number;
  rating?: number;
  isOperational?: boolean;
  hasPhone?: boolean;
  hasWebsite?: boolean;
  hasOpeningHours?: boolean;
  cruxAvailable?: boolean;
}): number {
  let score = 0;

  if ((input.reviewCount ?? 0) >= 100) score += 30;
  else if ((input.reviewCount ?? 0) >= 30) score += 22;
  else if ((input.reviewCount ?? 0) >= 5) score += 12;

  if ((input.rating ?? 0) >= 4.5) score += 15;
  else if ((input.rating ?? 0) >= 4) score += 10;

  if (input.isOperational) score += 15;
  if (input.hasPhone) score += 10;
  if (input.hasWebsite) score += 10;
  if (input.hasOpeningHours) score += 10;
  if (input.cruxAvailable) score += 10;

  return Math.min(score, 100);
}
```

### 11.2 Puntaje de necesidad digital

Rango: 0 a 100.

El puntaje debe aumentar cuando existan problemas que los servicios ofrecidos puedan resolver.

Señales:

- No tiene sitio web.
- Sitio inaccesible.
- Sitio sin SSL.
- Sitio no responsive.
- Bajo rendimiento móvil.
- Sin catálogo.
- Sin e-commerce.
- Sin sistema de turnos.
- Sin formulario.
- Solo contacto manual.
- Correo genérico.
- Web desactualizada.

Ejemplo de reglas:

```ts
function calculateDigitalNeedScore(input: {
  hasWebsite: boolean;
  websiteReachable?: boolean;
  hasSsl?: boolean;
  isMobileFriendly?: boolean;
  performanceScore?: number;
  hasCatalog?: boolean;
  hasEcommerce?: boolean;
  hasBookingSystem?: boolean;
  hasContactForm?: boolean;
}): number {
  let score = 0;

  if (!input.hasWebsite) return 90;

  if (input.websiteReachable === false) score += 30;
  if (input.hasSsl === false) score += 15;
  if (input.isMobileFriendly === false) score += 20;
  if ((input.performanceScore ?? 100) < 40) score += 20;
  else if ((input.performanceScore ?? 100) < 60) score += 12;
  if (!input.hasCatalog) score += 5;
  if (!input.hasEcommerce) score += 5;
  if (!input.hasBookingSystem) score += 5;
  if (!input.hasContactForm) score += 5;

  return Math.min(score, 100);
}
```

### 11.3 Puntaje de facilidad de contacto

Rango: 0 a 100.

Señales:

- Teléfono.
- WhatsApp.
- Correo.
- Formulario.
- Dirección.

Ejemplo:

```ts
function calculateContactabilityScore(input: {
  hasPhone?: boolean;
  hasWhatsapp?: boolean;
  hasEmail?: boolean;
  hasContactForm?: boolean;
  hasAddress?: boolean;
}): number {
  let score = 0;

  if (input.hasWhatsapp) score += 30;
  if (input.hasPhone) score += 25;
  if (input.hasEmail) score += 25;
  if (input.hasContactForm) score += 10;
  if (input.hasAddress) score += 10;

  return Math.min(score, 100);
}
```

### 11.4 Puntaje de compatibilidad

Rango: 0 a 100.

Debe comparar el prospecto con los servicios disponibles.

Ejemplos:

- Inmobiliaria + CRM inmobiliario.
- Centro de estética + sistema de turnos.
- Comercio minorista + sistema de stock y ventas.
- Restaurante + pedidos online.
- Empresa de servicios + sistema de gestión.

El cálculo inicial puede ser basado en reglas.

En una etapa posterior puede complementarse con IA o embeddings.

### 11.5 Puntaje final

Fórmula inicial sugerida:

```ts
const opportunityScore = Math.round(
  commercialActivityScore * 0.30 +
  digitalNeedScore * 0.35 +
  contactabilityScore * 0.15 +
  serviceFitScore * 0.20
);
```

Clasificación:

```ts
function getOpportunityLevel(score: number) {
  if (score >= 80) return "very_high";
  if (score >= 65) return "high";
  if (score >= 45) return "medium";
  if (score >= 25) return "low";
  return "very_low";
}
```

Los pesos deben almacenarse en configuración para poder modificarse sin cambiar código.

---

## 12. Motivos del puntaje

El sistema debe guardar razones explicables.

Ejemplo:

```json
[
  {
    "code": "HIGH_REVIEW_COUNT",
    "label": "Tiene más de 100 reseñas",
    "impact": 20,
    "category": "commercial_activity"
  },
  {
    "code": "NO_WEBSITE",
    "label": "No se encontró sitio web",
    "impact": 30,
    "category": "digital_need"
  },
  {
    "code": "HAS_PHONE",
    "label": "Tiene teléfono público",
    "impact": 15,
    "category": "contactability"
  }
]
```

Nunca mostrar solamente un número sin explicar por qué se obtuvo.

---

## 13. Modelo de datos

### 13.1 Tabla `services`

```sql
create table public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  target_categories text[] default '{}',
  target_keywords text[] default '{}',
  problems_solved text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 13.2 Tabla `prospect_searches`

```sql
create table public.prospect_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,

  province text,
  city text,
  category text,
  keywords text[] default '{}',
  radius_km integer,
  max_results integer not null default 50,

  website_filter text not null default 'all',
  phone_required boolean not null default false,
  email_required boolean not null default false,
  min_rating numeric,
  min_review_count integer,
  business_status_filter text not null default 'all',

  status text not null default 'pending',
  total_found integer not null default 0,
  total_saved integer not null default 0,
  total_analyzed integer not null default 0,
  progress integer not null default 0,
  error_message text,

  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 13.3 Tabla `prospects`

```sql
create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  google_place_id text,
  name text not null,
  normalized_name text,
  category text,
  categories text[] default '{}',
  description text,

  country text,
  province text,
  city text,
  address text,
  postal_code text,
  latitude numeric,
  longitude numeric,

  phone text,
  normalized_phone text,
  email text,
  whatsapp text,
  website text,
  website_domain text,
  google_maps_url text,

  rating numeric,
  review_count integer,
  business_status text,
  opening_hours jsonb,

  commercial_activity_score integer not null default 0,
  digital_need_score integer not null default 0,
  contactability_score integer not null default 0,
  service_fit_score integer not null default 0,
  opportunity_score integer not null default 0,
  opportunity_level text,

  recommended_service_id uuid references public.services(id) on delete set null,
  recommended_service_name text,
  opportunity_summary text,
  opportunity_reasons jsonb not null default '[]'::jsonb,

  analysis_status text not null default 'pending_analysis',
  commercial_status text not null default 'new',

  do_not_contact boolean not null default false,
  exclusion_reason text,
  excluded_at timestamptz,

  source text not null default 'google_places',
  source_url text,
  source_data jsonb,
  last_verified_at timestamptz,
  analyzed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Índices recomendados:

```sql
create unique index prospects_user_google_place_unique
on public.prospects(user_id, google_place_id)
where google_place_id is not null;

create index prospects_user_city_idx
on public.prospects(user_id, city);

create index prospects_user_category_idx
on public.prospects(user_id, category);

create index prospects_opportunity_score_idx
on public.prospects(user_id, opportunity_score desc);

create index prospects_commercial_status_idx
on public.prospects(user_id, commercial_status);
```

### 13.4 Tabla `prospect_search_results`

Relaciona búsquedas con prospectos.

```sql
create table public.prospect_search_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references public.prospect_searches(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  position integer,
  matched_query text,
  created_at timestamptz not null default now(),
  unique(search_id, prospect_id)
);
```

### 13.5 Tabla `website_analyses`

```sql
create table public.website_analyses (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,

  url text not null,
  final_url text,
  reachable boolean,
  http_status integer,
  has_ssl boolean,
  is_mobile_friendly boolean,

  has_ecommerce boolean,
  has_catalog boolean,
  has_booking_system boolean,
  has_contact_form boolean,
  has_whatsapp boolean,
  has_customer_portal boolean,
  has_live_chat boolean,

  detected_emails text[] default '{}',
  detected_phones text[] default '{}',
  detected_social_links jsonb not null default '{}'::jsonb,
  detected_technologies text[] default '{}',
  detected_keywords text[] default '{}',

  performance_score integer,
  accessibility_score integer,
  seo_score integer,
  best_practices_score integer,

  crux_available boolean not null default false,
  crux_data jsonb,

  analysis_summary text,
  raw_data jsonb,
  analyzed_at timestamptz not null default now()
);
```

### 13.6 Tabla `prospect_interactions`

```sql
create table public.prospect_interactions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  interaction_type text not null,
  channel text,
  notes text,
  interaction_date timestamptz not null default now(),
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now()
);
```

### 13.7 Tabla `prospect_jobs`

```sql
create table public.prospect_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  search_id uuid references public.prospect_searches(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete cascade,
  job_type text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
```

Tipos de trabajo:

```text
places_search
place_details
website_analysis
pagespeed_analysis
crux_analysis
score_calculation
summary_generation
csv_export
```

---

## 14. Seguridad y RLS

Todas las tablas deben tener Row Level Security.

Cada usuario solamente debe poder acceder a sus propios:

- Servicios.
- Búsquedas.
- Prospectos.
- Resultados.
- Análisis.
- Interacciones.
- Trabajos.

Ejemplo:

```sql
alter table public.prospects enable row level security;

create policy "Users can read own prospects"
on public.prospects
for select
using (auth.uid() = user_id);

create policy "Users can insert own prospects"
on public.prospects
for insert
with check (auth.uid() = user_id);

create policy "Users can update own prospects"
on public.prospects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

No exponer claves privadas en el cliente.

Las llamadas a Google Places, PageSpeed y servicios externos deben ejecutarse en servidor.

---

## 15. Arquitectura sugerida

```text
Next.js
├── app
│   ├── radar
│   │   ├── page.tsx
│   │   ├── searches
│   │   ├── prospects
│   │   └── services
│   └── api
│       └── radar
│           ├── searches
│           ├── prospects
│           ├── jobs
│           └── export
├── components
│   └── radar
├── lib
│   ├── radar
│   │   ├── google-places.ts
│   │   ├── website-analyzer.ts
│   │   ├── pagespeed.ts
│   │   ├── crux.ts
│   │   ├── scoring.ts
│   │   ├── deduplication.ts
│   │   ├── normalization.ts
│   │   └── validations.ts
│   └── supabase
└── types
    └── radar.ts
```

Procesamiento:

```text
Formulario Next.js
    ↓
Crear prospect_search
    ↓
Crear job places_search
    ↓
Worker o Edge Function
    ↓
Google Places
    ↓
Normalizar y guardar prospectos
    ↓
Crear jobs de enriquecimiento
    ↓
Analizar sitios y PageSpeed
    ↓
Calcular puntajes
    ↓
Supabase Realtime
    ↓
Actualizar interfaz
```

---

## 16. API interna sugerida

### Crear búsqueda

```http
POST /api/radar/searches
```

Body:

```json
{
  "province": "Chubut",
  "city": "Comodoro Rivadavia",
  "category": "centros de estética",
  "keywords": ["turnos", "uñas", "depilación"],
  "radiusKm": 20,
  "maxResults": 100,
  "serviceId": "uuid",
  "websiteFilter": "all",
  "phoneRequired": false,
  "emailRequired": false,
  "minRating": 3.5,
  "minReviewCount": 5
}
```

Respuesta:

```json
{
  "searchId": "uuid",
  "status": "pending"
}
```

### Obtener búsqueda

```http
GET /api/radar/searches/:id
```

### Listar prospectos

```http
GET /api/radar/prospects
```

Query params:

```text
searchId
city
category
minOpportunityScore
commercialStatus
hasWebsite
hasPhone
page
pageSize
sortBy
sortDirection
```

### Obtener prospecto

```http
GET /api/radar/prospects/:id
```

### Actualizar estado comercial

```http
PATCH /api/radar/prospects/:id/status
```

### Reanalizar prospecto

```http
POST /api/radar/prospects/:id/reanalyze
```

### Exportar CSV

```http
POST /api/radar/exports/csv
```

---

## 17. Interfaz de usuario

### 17.1 Pantalla principal

Debe incluir:

- Botón `Nueva búsqueda`.
- Resumen de búsquedas recientes.
- Cantidad de prospectos encontrados.
- Cantidad de oportunidades altas.
- Cantidad de prospectos pendientes de análisis.
- Acceso a servicios configurados.

### 17.2 Formulario de búsqueda

Secciones:

1. Ubicación.
2. Rubro y palabras clave.
3. Servicio a ofrecer.
4. Filtros adicionales.
5. Límites de búsqueda.

### 17.3 Vista de resultados

Columnas sugeridas:

- Nombre.
- Rubro.
- Localidad.
- Calificación.
- Reseñas.
- Sitio web.
- Teléfono.
- Actividad.
- Necesidad digital.
- Oportunidad.
- Servicio recomendado.
- Estado.
- Acciones.

Filtros rápidos:

- Oportunidad alta.
- Sin sitio web.
- Con teléfono.
- Con correo.
- Pendientes de revisar.
- Para contactar.

### 17.4 Vista de detalle

Secciones:

1. Información general.
2. Datos de contacto.
3. Ubicación.
4. Indicadores comerciales.
5. Análisis digital.
6. Puntajes.
7. Motivos del puntaje.
8. Servicio recomendado.
9. Historial de interacciones.
10. Fuentes.

---

## 18. Análisis del sitio web

El analizador debe:

1. Validar URL.
2. Seguir redirecciones con límite.
3. Definir timeout.
4. Respetar tamaño máximo de respuesta.
5. Procesar solamente HTML.
6. No descargar archivos pesados.
7. Limitar profundidad de navegación.
8. Analizar inicialmente la página principal.
9. Opcionalmente analizar páginas como contacto, servicios y productos.

Detectar mediante HTML:

- Correos con `mailto:`.
- Teléfonos con `tel:`.
- WhatsApp mediante `wa.me`, `api.whatsapp.com` o enlaces equivalentes.
- Formularios.
- Enlaces a tienda.
- Palabras clave.
- Tecnologías.
- Meta etiquetas.
- Título y descripción.
- Indicadores de e-commerce.
- Indicadores de reservas o turnos.

No usar un navegador headless en la primera implementación salvo que sea necesario.

Comenzar con `fetch`, parser HTML y reglas simples.

---

## 19. Detección de oportunidades

Reglas iniciales sugeridas:

### Centro de estética

Señales:

- No tiene agenda online.
- Solicita turnos por WhatsApp.
- No tiene recordatorios.
- No tiene ficha de clientes.

Servicio recomendado:

```text
Sistema de turnos + clientes + recordatorios
```

### Inmobiliaria

Señales:

- Publica propiedades manualmente.
- No tiene buscador.
- No tiene CRM.
- No tiene seguimiento de consultas.

Servicio recomendado:

```text
CRM inmobiliario + portal de propiedades
```

### Comercio minorista

Señales:

- No tiene catálogo.
- No tiene stock online.
- Pedidos por WhatsApp.
- Sin integración de ventas.

Servicio recomendado:

```text
Sistema de stock, ventas y catálogo online
```

### Restaurante o rotisería

Señales:

- Menú en PDF.
- Pedidos por teléfono.
- Sin pedidos online.
- Sin control de delivery.

Servicio recomendado:

```text
Pedidos online + gestión de cocina y delivery
```

### Empresa de servicios

Señales:

- Formularios manuales.
- Solicitudes por teléfono.
- Seguimiento en planillas.
- Sin portal de clientes.

Servicio recomendado:

```text
Sistema de gestión y seguimiento de servicios
```

Estas reglas deben estar desacopladas y ser configurables.

---

## 20. Normalización

Crear utilidades para:

- Quitar espacios duplicados.
- Convertir nombres a minúsculas para comparar.
- Quitar caracteres especiales en teléfonos.
- Normalizar prefijos de Argentina.
- Extraer dominio principal.
- Normalizar URLs.
- Normalizar provincia y localidad.

Ejemplo:

```ts
export function normalizePhone(value?: string | null): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  return digits || null;
}
```

---

## 21. Manejo de errores

Cada integración externa debe manejar:

- Timeout.
- Rate limit.
- API key inválida.
- Cuota agotada.
- Resultado vacío.
- Sitio inaccesible.
- SSL inválido.
- HTML mal formado.
- Respuesta demasiado grande.
- Error temporal.

Los trabajos deben permitir reintentos.

Usar backoff progresivo.

No bloquear toda la búsqueda por un error individual.

Una búsqueda puede finalizar como `partial` si algunos prospectos no pudieron analizarse.

---

## 22. Control de costos

Implementar:

- Límite de resultados por búsqueda.
- Límite diario por usuario.
- Cache de detalles de Google Places.
- No repetir análisis recientes.
- Guardar `last_verified_at`.
- Solicitar solamente campos necesarios.
- PageSpeed solamente para prospectos con sitio web.
- CrUX solamente después de validar el dominio.
- Reutilizar prospectos existentes.

Regla sugerida:

```text
No volver a consultar un prospecto analizado dentro de los últimos 30 días,
salvo que el usuario solicite reanalizarlo manualmente.
```

---

## 23. Variables de entorno

```env
GOOGLE_MAPS_API_KEY=
GOOGLE_PAGESPEED_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

No exponer `SUPABASE_SERVICE_ROLE_KEY` ni claves externas en componentes cliente.

---

## 24. Tipos TypeScript sugeridos

```ts
export type SearchStatus =
  | "pending"
  | "searching"
  | "saving_results"
  | "enriching"
  | "scoring"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled";

export type ProspectAnalysisStatus =
  | "pending_analysis"
  | "analyzing"
  | "ready"
  | "analysis_failed"
  | "excluded";

export type ProspectCommercialStatus =
  | "new"
  | "reviewed"
  | "to_contact"
  | "contacted"
  | "interested"
  | "meeting"
  | "proposal_sent"
  | "won"
  | "lost"
  | "discarded"
  | "do_not_contact";

export type OpportunityLevel =
  | "very_low"
  | "low"
  | "medium"
  | "high"
  | "very_high";
```

---

## 25. Realtime

La interfaz debe actualizarse cuando cambien:

- Estado de búsqueda.
- Progreso.
- Cantidad de resultados.
- Prospectos analizados.
- Puntajes.
- Errores.

Suscribirse a cambios en:

- `prospect_searches`.
- `prospects`.
- `prospect_jobs`.

---

## 26. Exportación CSV

Campos sugeridos:

```text
Nombre
Rubro
Provincia
Localidad
Dirección
Teléfono
WhatsApp
Correo
Sitio web
Google Maps
Calificación
Reseñas
Actividad comercial
Necesidad digital
Facilidad de contacto
Compatibilidad
Oportunidad final
Nivel de oportunidad
Servicio recomendado
Estado comercial
Motivos
Última verificación
```

La exportación debe respetar los filtros activos.

---

## 27. Criterios de aceptación del MVP

La funcionalidad se considera terminada cuando:

1. El usuario puede crear una búsqueda con provincia, localidad, rubro y palabras clave.
2. La búsqueda se guarda en Supabase.
3. El sistema consulta Google Places desde el servidor.
4. Los prospectos se guardan sin duplicados.
5. Los resultados aparecen progresivamente.
6. Cada prospecto muestra nombre, ubicación, calificación y reseñas cuando existen.
7. Se guarda teléfono y sitio web cuando están disponibles.
8. Los sitios web se analizan de forma básica.
9. Se detectan correos y teléfonos públicos en el sitio.
10. Se ejecuta PageSpeed para sitios válidos.
11. Se calculan los cuatro puntajes.
12. Se calcula un puntaje final.
13. Se muestran los motivos del puntaje.
14. Se recomienda un servicio.
15. El usuario puede cambiar el estado comercial.
16. El usuario puede filtrar y ordenar resultados.
17. El usuario puede exportar a CSV.
18. Todas las tablas tienen RLS.
19. Las claves privadas no se exponen al cliente.
20. Los errores individuales no detienen toda la búsqueda.

---

## 28. Plan de implementación por etapas

### Etapa 1: base de datos

- Crear migraciones.
- Crear enums o validaciones.
- Crear índices.
- Crear políticas RLS.
- Crear tipos TypeScript.

### Etapa 2: servicios configurables

- CRUD de servicios.
- Reglas iniciales por rubro.

### Etapa 3: creación de búsquedas

- Formulario.
- Validaciones.
- Persistencia.
- Estados.

### Etapa 4: Google Places

- Cliente servidor.
- Generación de consultas.
- Normalización.
- Deduplicación.
- Guardado.

### Etapa 5: trabajos asíncronos

- Tabla de trabajos o Supabase Queues.
- Worker.
- Reintentos.
- Progreso.

### Etapa 6: análisis web

- Fetch seguro.
- Extracción de contacto.
- Detección de funcionalidades.
- Tecnologías.

### Etapa 7: PageSpeed y CrUX

- Integraciones.
- Guardado.
- Manejo de ausencia de datos.

### Etapa 8: puntajes

- Reglas.
- Motivos.
- Configuración de pesos.
- Pruebas unitarias.

### Etapa 9: interfaz de resultados

- Tabla.
- Filtros.
- Ordenamiento.
- Realtime.
- Vista de detalle.

### Etapa 10: pipeline comercial

- Estados.
- Notas.
- Interacciones.

### Etapa 11: exportación

- CSV.
- Filtros activos.

### Etapa 12: pruebas y optimización

- Pruebas unitarias.
- Pruebas de integración.
- Rate limits.
- Cache.
- Auditoría de seguridad.

---

## 29. Pruebas mínimas

### Unitarias

- Normalización de teléfonos.
- Normalización de dominios.
- Deduplicación.
- Cálculo de puntajes.
- Clasificación de oportunidad.
- Generación de consultas.

### Integración

- Crear búsqueda.
- Guardar prospectos.
- Procesar trabajo.
- Actualizar progreso.
- Analizar sitio válido.
- Manejar sitio inválido.
- Manejar API sin resultados.
- Manejar cuota agotada.

### Seguridad

- Usuario A no puede ver datos del usuario B.
- Cliente no accede a claves privadas.
- URLs internas o privadas no deben consultarse desde el analizador.

---

## 30. Protección SSRF

El analizador de sitios debe bloquear:

- `localhost`.
- `127.0.0.1`.
- Rangos privados.
- Metadata de servicios cloud.
- Protocolos distintos de HTTP y HTTPS.
- Redirecciones hacia direcciones privadas.

Validar DNS e IP antes de realizar la consulta.

Esta protección es obligatoria.

---

## 31. Instrucciones para el agente IA

Antes de implementar:

1. Inspeccionar la estructura del proyecto existente.
2. Identificar versión de Next.js.
3. Identificar configuración de Supabase.
4. Revisar sistema de autenticación.
5. Revisar patrones de componentes existentes.
6. Revisar librerías instaladas.
7. No reemplazar arquitectura existente sin necesidad.
8. Crear migraciones reversibles.
9. Implementar en etapas pequeñas.
10. Mantener TypeScript estricto.
11. Evitar `any` salvo justificación.
12. Agregar manejo de errores.
13. Agregar logs útiles sin exponer secretos.
14. Crear pruebas para cálculos y normalización.
15. Documentar las variables de entorno.

El agente debe priorizar primero una implementación funcional sin IA generativa.

La IA generativa puede agregarse después para:

- Resumir la oportunidad.
- Explicar los motivos.
- Recomendar un servicio.
- Redactar mensajes comerciales.

Los puntajes principales deben calcularse con reglas determinísticas y auditables.

---

## 32. Entregables esperados

El agente debe entregar:

1. Migraciones SQL.
2. Tipos TypeScript.
3. Integración con Google Places.
4. Servicios de normalización y deduplicación.
5. Sistema de trabajos.
6. Analizador web básico.
7. Integración con PageSpeed.
8. Motor de puntajes.
9. Pantalla de búsqueda.
10. Pantalla de resultados.
11. Vista de detalle.
12. Filtros.
13. Realtime.
14. Exportación CSV.
15. Pruebas.
16. Documentación de configuración.
17. Archivo `.env.example`.
18. Instrucciones de despliegue.

---

## 33. Definición final del producto

El módulo debe ayudar a encontrar:

> Negocios activos, con señales verificables de actividad comercial, que presenten una necesidad tecnológica concreta y que puedan ser atendidos mediante alguno de los productos o servicios ofrecidos.

No debe limitarse a buscar negocios populares.

Debe priorizar negocios que combinen:

- Actividad real.
- Necesidad digital.
- Facilidad de contacto.
- Compatibilidad con una solución disponible.

