// src/modules/enviomasivo/interfaces/masivo.interface.ts

export type EstadoCampania =
  | 'BORRADOR'
  | 'PROGRAMADA'
  | 'EN_CURSO'
  | 'PAUSADA'
  | 'COMPLETADA'
  | 'CANCELADA';

export type EstadoDestinatario =
  | 'PENDIENTE'
  | 'ENVIANDO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'LEIDO'
  | 'FALLIDO'
  | 'EXCLUIDO';

export type TipoHeader = 'image' | 'video' | 'document';

// ───────── Plantillas (GET /campanias/plantillas) ─────────

export interface IPlantillaComponente {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: Record<string, unknown>;
  buttons?: unknown[];
}

export interface IPlantilla {
  nombre: string;
  idioma: string;
  categoria: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | string;
  componentes: IPlantillaComponente[];
}

// ───────── Crear campaña (POST /campanias) ─────────

export interface IDestinatarioDto {
  telefono: string;
  nombre?: string;
  /** Campos extra para variables: { proyecto: "Alameda" } */
  datos?: Record<string, string>;
}

export interface ICrearCampaniaDto {
  nombre: string;
  plantilla: string;
  idioma?: string;
  /** Una entrada por variable del body. Admite {nombre}, {primer_nombre} y {campo_de_datos} */
  parametros?: string[];
  header?: { tipo: TipoHeader; url: string };
  /** Fecha ISO */
  programada_para?: string;
  destinatarios?: IDestinatarioDto[];
}

export interface ICarga {
  recibidos: number;
  agregados: number;
  invalidos: number;
  excluidos_por_baja: number;
  repetidos: number;
}

// ───────── Campañas ─────────

/** Fila de GET /campanias */
export interface ICampaniaResumen {
  id: number | string;
  nombre: string;
  plantilla: string;
  estado: EstadoCampania;
  programada_para: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_creacion: string;
  total: number;
  enviados: number;
  entregados: number;
  leidos: number;
  fallidos: number;
  excluidos: number;
  respondieron: number;
}

/** GET /campanias/:id */
export interface ICampaniaDetalle {
  id: number | string;
  nombre: string;
  plantilla: string;
  idioma: string;
  parametros: string[];
  header_tipo: TipoHeader | null;
  header_url: string | null;
  estado: EstadoCampania;
  programada_para: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_creacion: string;
  total: number;
  por_estado: Partial<Record<EstadoDestinatario, number>>;
  respondieron: number;
}

/** POST /campanias devuelve el detalle + el resumen de carga */
export interface ICrearCampaniaResp extends ICampaniaDetalle {
  carga: ICarga | null;
}

// ───────── Destinatarios ─────────

export interface IDestinatarioEstado {
  id: number | string;
  telefono: string;
  nombre: string | null;
  estado: EstadoDestinatario;
  error: string | null;
  fecha_envio: string | null;
  fecha_estado: string | null;
  respondio: boolean;
  fecha_respuesta: string | null;
}

export interface IFiltroDestinatarios {
  estado?: EstadoDestinatario | '';
  pagina?: number;
  limite?: number;
}

// ───────── Otras respuestas ─────────

export interface IReintentoResp {
  reencolados: number;
}

/** Fila de GET /campanias/optout */
export interface IOptout {
  telefono: string;
  motivo: string | null;
  fecha: string | null;
}

export interface IOptoutResp {
  telefono: string;
  excluido: boolean;
}