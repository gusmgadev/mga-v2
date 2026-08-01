-- Radar de Oportunidades — Estructura de Base de Datos
-- Tablas para prospección comercial con Google Places, análisis web y scoring

-- 1. Servicios configurables (qué ofrecemos)
CREATE TABLE IF NOT EXISTS prospect_services (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_categories TEXT[] DEFAULT '{}',
  target_keywords TEXT[] DEFAULT '{}',
  problems_solved TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Búsquedas realizadas
CREATE TABLE IF NOT EXISTS prospect_searches (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES prospect_services(id) ON DELETE SET NULL,
  province TEXT,
  city TEXT,
  category TEXT,
  keywords TEXT[] DEFAULT '{}',
  radius_km INTEGER,
  max_results INTEGER NOT NULL DEFAULT 50,
  website_filter TEXT NOT NULL DEFAULT 'all',
  phone_required BOOLEAN NOT NULL DEFAULT FALSE,
  email_required BOOLEAN NOT NULL DEFAULT FALSE,
  min_rating NUMERIC,
  min_review_count INTEGER,
  business_status_filter TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'pending',
  total_found INTEGER NOT NULL DEFAULT 0,
  total_saved INTEGER NOT NULL DEFAULT 0,
  total_analyzed INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Prospectos encontrados
CREATE TABLE IF NOT EXISTS prospects (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_place_id TEXT,
  name TEXT NOT NULL,
  normalized_name TEXT,
  category TEXT,
  categories TEXT[] DEFAULT '{}',
  description TEXT,
  country TEXT,
  province TEXT,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  normalized_phone TEXT,
  email TEXT,
  whatsapp TEXT,
  website TEXT,
  website_domain TEXT,
  google_maps_url TEXT,
  rating NUMERIC,
  review_count INTEGER,
  business_status TEXT,
  opening_hours JSONB,
  commercial_activity_score INTEGER NOT NULL DEFAULT 0,
  digital_need_score INTEGER NOT NULL DEFAULT 0,
  contactability_score INTEGER NOT NULL DEFAULT 0,
  service_fit_score INTEGER NOT NULL DEFAULT 0,
  opportunity_score INTEGER NOT NULL DEFAULT 0,
  opportunity_level TEXT,
  recommended_service_id INTEGER REFERENCES prospect_services(id) ON DELETE SET NULL,
  recommended_service_name TEXT,
  opportunity_summary TEXT,
  opportunity_reasons JSONB NOT NULL DEFAULT '[]'::JSONB,
  analysis_status TEXT NOT NULL DEFAULT 'pending_analysis',
  commercial_status TEXT NOT NULL DEFAULT 'new',
  do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_reason TEXT,
  excluded_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'google_places',
  source_url TEXT,
  source_data JSONB,
  last_verified_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Relación búsqueda ↔ prospecto
CREATE TABLE IF NOT EXISTS prospect_search_results (
  id SERIAL PRIMARY KEY,
  search_id INTEGER NOT NULL REFERENCES prospect_searches(id) ON DELETE CASCADE,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  position INTEGER,
  matched_query TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(search_id, prospect_id)
);

-- 5. Análisis de sitio web
CREATE TABLE IF NOT EXISTS website_analyses (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  final_url TEXT,
  reachable BOOLEAN,
  http_status INTEGER,
  has_ssl BOOLEAN,
  is_mobile_friendly BOOLEAN,
  has_ecommerce BOOLEAN,
  has_catalog BOOLEAN,
  has_booking_system BOOLEAN,
  has_contact_form BOOLEAN,
  has_whatsapp BOOLEAN,
  has_customer_portal BOOLEAN,
  has_live_chat BOOLEAN,
  detected_emails TEXT[] DEFAULT '{}',
  detected_phones TEXT[] DEFAULT '{}',
  detected_social_links JSONB NOT NULL DEFAULT '{}'::JSONB,
  detected_technologies TEXT[] DEFAULT '{}',
  detected_keywords TEXT[] DEFAULT '{}',
  performance_score INTEGER,
  accessibility_score INTEGER,
  seo_score INTEGER,
  best_practices_score INTEGER,
  crux_available BOOLEAN NOT NULL DEFAULT FALSE,
  crux_data JSONB,
  analysis_summary TEXT,
  raw_data JSONB,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Interacciones comerciales
CREATE TABLE IF NOT EXISTS prospect_interactions (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  channel TEXT,
  notes TEXT,
  interaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Cola de trabajos
CREATE TABLE IF NOT EXISTS prospect_jobs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id INTEGER REFERENCES prospect_searches(id) ON DELETE CASCADE,
  prospect_id INTEGER REFERENCES prospects(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  result JSONB,
  error_message TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS prospects_user_google_place_unique
  ON prospects(user_id, google_place_id) WHERE google_place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS prospects_user_city_idx ON prospects(user_id, city);
CREATE INDEX IF NOT EXISTS prospects_user_category_idx ON prospects(user_id, category);
CREATE INDEX IF NOT EXISTS prospects_opportunity_score_idx ON prospects(user_id, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS prospects_commercial_status_idx ON prospects(user_id, commercial_status);

CREATE INDEX IF NOT EXISTS prospect_searches_user_status_idx ON prospect_searches(user_id, status);
CREATE INDEX IF NOT EXISTS prospect_search_results_search_idx ON prospect_search_results(search_id);
CREATE INDEX IF NOT EXISTS prospect_jobs_status_idx ON prospect_jobs(status);

-- RLS
ALTER TABLE prospect_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario solo ve sus propios datos
CREATE POLICY "Users can manage own prospect_services"
  ON prospect_services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own prospect_searches"
  ON prospect_searches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own prospects"
  ON prospects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own prospect_search_results"
  ON prospect_search_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prospect_searches
      WHERE prospect_searches.id = prospect_search_results.search_id
      AND prospect_searches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own website_analyses"
  ON website_analyses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prospects
      WHERE prospects.id = website_analyses.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own prospect_interactions"
  ON prospect_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own prospect_jobs"
  ON prospect_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permisos por rol
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
VALUES
  (1, 'radar', true, true, true, true),
  (2, 'radar', true, true, true, false)
ON CONFLICT (role_id, module) DO NOTHING;

-- 8. Registro de uso de APIs externas (para tracking de costos)
CREATE TABLE IF NOT EXISTS radar_api_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id INTEGER REFERENCES prospect_searches(id) ON DELETE SET NULL,
  api_type TEXT NOT NULL,
  query_summary TEXT,
  result_count INTEGER,
  estimated_cost NUMERIC(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS radar_api_usage_user_idx ON radar_api_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS radar_api_usage_search_idx ON radar_api_usage(search_id);

ALTER TABLE radar_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own radar_api_usage"
  ON radar_api_usage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Columnas para marcar prospecto como cliente propio
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS existing_client_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS existing_servicio_id INTEGER REFERENCES servicios(id) ON DELETE SET NULL;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS existing_client_notes TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS prospects_existing_client_idx ON prospects(existing_client_id);

-- 10. Catálogo compartido de rubros
CREATE TABLE IF NOT EXISTS rubros (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO rubros (nombre) VALUES
  ('Indumentaria'), ('Ferretería'), ('Regalería'), ('Juguetería'),
  ('Centro de estética'), ('Inmobiliaria'), ('Restaurante'), ('Óptica'),
  ('Librería'), ('Farmacia'), ('Electrodomésticos'), ('Mueblería'),
  ('Zapatería'), ('Panadería'), ('Taller mecánico'), ('Veterinaria'),
  ('Peluquería'), ('Gimnasio'), ('Supermercado'), ('Odontología'),
  ('Kiosco'), ('Cerrajería'), ('Electrónica'), ('Decoración')
ON CONFLICT (nombre) DO NOTHING;

-- 11. Agregar columna rubro a prospects
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS rubro TEXT;

-- 12. Agregar columna last_pagetoken a prospect_searches
ALTER TABLE prospect_searches ADD COLUMN IF NOT EXISTS last_pagetoken TEXT;
