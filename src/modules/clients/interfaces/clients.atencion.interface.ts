export interface IHistorialCorreoResponse {
  id: number;
  fecha_creacion: string;
  mensaje: string;
  url_evidencia: string | null;
}

export interface IHistorialWhatsappResponse {
  id: number;
  fecha_creacion: string;
  fecha: string;
  hora: string | null;
}

export interface IHistorialLlamadaResponse {
  id: number;
  fecha_creacion: string;
  duracion_segundos: number;
  fecha_inicio: string;
  fecha_fin: string;
  grabacion_path: string | null;
}


export interface IInfoEstadoReunionLeadResponse {
  nombre: string;
  id_etapa_reunion: number;
  id_lead_etapa: number;
  estado: boolean
}

export interface IRegistrarWhatsappRequest {
  id_estado_reunion: number;
  fecha: string;
  hora: string;
  tipo_historial: number;
}

export interface IRegistrarCorreoRequest {
  id_estado_reunion: number;
  url_evidencia: string;
  mensaje?: string;
  tipo_historial: number
}