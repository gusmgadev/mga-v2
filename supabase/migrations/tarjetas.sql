CREATE TABLE tarjetas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  banco TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tarjetas iniciales (basadas en las del CSV de gastos)
INSERT INTO tarjetas (nombre, tipo, banco) VALUES
('VISA SANTANDER',    'VISA',       'SANTANDER'),
('TARJETA NARANJA',   'NARANJA',    NULL),
('TARJETA LA ANONIMA','LA ANONIMA', NULL);

-- Agregar FK en gastos
ALTER TABLE gastos ADD COLUMN tarjeta_id INTEGER REFERENCES tarjetas(id) ON DELETE SET NULL;
