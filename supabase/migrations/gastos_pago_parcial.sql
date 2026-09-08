-- Soporte de pagos parciales en gastos:
-- monto_pagado acumula lo efectivamente pagado. El saldo pendiente se calcula
-- como (monto_real - monto_pagado). Un gasto queda "pagado" cuando el acumulado
-- cubre el total real.
ALTER TABLE gastos
  ADD COLUMN IF NOT EXISTS monto_pagado NUMERIC NOT NULL DEFAULT 0;

-- Backfill: los gastos ya pagados tienen pagado lo total
UPDATE gastos SET monto_pagado = COALESCE(monto_real, monto_estimado, 0)
WHERE pagado = true;
