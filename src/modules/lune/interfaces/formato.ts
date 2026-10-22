const dos = (n: number) => String(n).padStart(2, '0');

/** S/ 1,234.50 */
export const soles = (valor: number | null | undefined): string =>
  `S/ ${Number(valor ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** "2026-10-17" -> "17 oct" (sin pasar por UTC, para que no se corra un día) */
export const fechaCorta = (iso?: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
};

/** Fecha de hoy en hora LOCAL (YYYY-MM-DD). toISOString() usa UTC y de noche daría mañana. */
export const hoy = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

export const inicioDeMes = (): string => `${hoy().slice(0, 8)}01`;

export const haceDias = (dias: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};