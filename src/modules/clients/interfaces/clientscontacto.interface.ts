export interface IEstadoContactoLeadResponse {
  id_estado_contacto: number;
  id_etapa: number;
  fecha_primer_contacto: string | null;
  hora_primer_contacto: string | null;
  estado: boolean;
  telefono: number
}

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
  duracion_segundos: number;
  fecha_inicio: string;
  fecha_fin: string;
  grabacion_path: string | null;
}

export interface IRegistrarWhatsappRequest {
  id_estado_contacto: number;
  url_evidencia: string;
  mensaje?: string;
  tipo_historial: number
}

export interface IRegistrarCorreoRequest {
  id_estado_contacto: number;
  url_evidencia: string;
  mensaje?: string;
  tipo_historial: number
}

export interface IRegistrarLlamadaRequest {
  id_estado_contacto: number;
  fecha_inicio: string;
  fecha_fin?: string;
  duracion_segundos?: number;
  contestada?: boolean;
  grabacion_url?: string;
  observacion?: string;
}

export interface IListarOpcionesResponse {
  id: number;
  nombrelist: string;
  nombre: string;
}
export interface IFinalizarEtapaContactoDesistioRequest {
  id_lead: number;
  motivo?: number;
}

export interface IInfoDesistioLeadResponse {
  id_lead: number;
  id_lead_etapa: number;
  motivo: number;
  motivo_nombre: string;
}