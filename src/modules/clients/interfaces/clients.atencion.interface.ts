export interface IHistorialCorreoResponse {
  id: number;
  fecha_creacion: string;
  mensaje: string;
  url_evidencia: string | null;
}

export interface IHistorialWhatsappResponse {
  id: number;
  fecha_creacion: string;
  mensaje: string;
  url_evidencia: string | null;
}

export interface IHistorialLlamadaResponse {
  id: number;
  fecha_creacion: string;
  contestada: boolean;
  duracion_segundos: number;
  fecha_inicio: string;
  fecha_fin: string;
  grabacion_url: string | null;
  observacion: string | null;
}

export interface IInfoEstadoReunionLeadResponse {
  nombre: string;
  id_etapa_reunion: number;
}

export interface IRegistrarWhatsappRequest {
  id_estado_reunion: number;
  url_evidencia: string;
  mensaje?: string;
  tipo_historial: number
}

export interface IRegistrarCorreoRequest {
  id_estado_reunion: number;
  url_evidencia: string;
  mensaje?: string;
  tipo_historial: number
}