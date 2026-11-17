// src/modules/enviomasivo/helpers/masivo.helpers.ts
import type {
  EstadoCampania,
  EstadoDestinatario,
  ICampaniaResumen,
  TipoHeader,
} from '../interfaces/masivo.interface';

export const MB = 1024 * 1024;

export const ESTADOS_DESTINATARIO: EstadoDestinatario[] = [
  'PENDIENTE', 'ENVIANDO', 'ENVIADO', 'ENTREGADO', 'LEIDO', 'FALLIDO', 'EXCLUIDO',
];

const ETIQUETAS: Record<string, string> = {
  BORRADOR: 'Borrador',
  PROGRAMADA: 'Programada',
  EN_CURSO: 'En curso',
  PAUSADA: 'Pausada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  PENDIENTE: 'Pendiente',
  ENVIANDO: 'Enviando',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  LEIDO: 'Leído',
  FALLIDO: 'Fallido',
  EXCLUIDO: 'Excluido',
};

export const etiqueta = (estado: string) => ETIQUETAS[estado] ?? estado;

export const formatoFecha = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' })
    : '—';

export const formatoTamano = (bytes: number) =>
  bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const mensajeError = (e: unknown) => (e instanceof Error ? e.message : 'Ocurrió un error inesperado.');

type Conteo = Pick<ICampaniaResumen, 'total' | 'enviados' | 'entregados' | 'leidos' | 'fallidos'> & {
  excluidos?: number;
};

/** Partes de la barra de avance de una campaña (suman 100 %) */
export const segmentos = (c: Conteo) => {
  const total = c.total || 0;
  if (!total) return [];
  const leidos = c.leidos;
  const entregados = Math.max(0, c.entregados - c.leidos);
  const enviados = Math.max(0, c.enviados - c.entregados);
  const fallidos = c.fallidos;
  const excluidos = c.excluidos ?? 0;
  const pendientes = Math.max(0, total - c.enviados - c.fallidos - excluidos);
  return [
    { clave: 'leidos', n: leidos, texto: 'Leídos' },
    { clave: 'entregados', n: entregados, texto: 'Entregados' },
    { clave: 'enviados', n: enviados, texto: 'Enviados' },
    { clave: 'fallidos', n: fallidos, texto: 'Fallidos' },
    { clave: 'excluidos', n: excluidos, texto: 'Excluidos' },
    { clave: 'pendientes', n: pendientes, texto: 'Pendientes' },
  ]
    .filter((s) => s.n > 0)
    .map((s) => ({ ...s, ancho: (s.n / total) * 100 }));
};

/** Clases Tailwind del chip de estado (campaña o destinatario) */
export const claseChip = (estado: string) => {
  const base = 'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ';
  switch (estado) {
    case 'EN_CURSO':
    case 'ENVIANDO':
      return base + 'bg-emerald-100 text-emerald-800';
    case 'COMPLETADA':
    case 'ENTREGADO':
    case 'LEIDO':
      return base + 'bg-emerald-100 text-emerald-800';
    case 'PAUSADA':
    case 'PROGRAMADA':
      return base + 'bg-emerald-100 text-emerald-800';
    case 'CANCELADA':
    case 'FALLIDO':
      return base + 'bg-emerald-100 text-emerald-800';
    default:
      return base + 'bg-emerald-100 text-emerald-800';
  }
};

/** Clases Tailwind de cada tramo de la barra de avance */
export const claseSegmento = (clave: string) =>
  ({
    leidos: 'bg-emerald-400',
    entregados: 'bg-emerald-400',
    enviados: 'bg-emerald-400',
    fallidos: 'bg-emerald-400',
    excluidos: 'bg-red-600',
    pendientes: 'bg-emerald-400',
  })[clave] ?? 'bg-emerald-400';

export const puedeIniciar = (e: EstadoCampania) => ['BORRADOR', 'PROGRAMADA', 'PAUSADA'].includes(e);
export const puedePausar = (e: EstadoCampania) => e === 'EN_CURSO';
export const puedeCancelar = (e: EstadoCampania) =>
  ['BORRADOR', 'PROGRAMADA', 'EN_CURSO', 'PAUSADA'].includes(e);

// ───────── archivos del header: mismos límites que valida el backend / WhatsApp ─────────
export const LIMITE_MB: Record<TipoHeader, number> = { video: 16, image: 5, document: 100 };
export const ACCEPT: Record<TipoHeader, string> = {
  video: 'video/mp4,video/quicktime,video/3gpp,video/webm,video/x-matroska',
  image: 'image/jpeg,image/png',
  document: 'application/pdf',
};
export const NOMBRE_TIPO: Record<TipoHeader, string> = {
  video: 'video',
  image: 'imagen',
  document: 'documento PDF',
};