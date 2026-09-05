export interface IActualizarChecklistCierreRequest {
  id_lead_etapa: number;
  campo: string;
  valor: boolean;
}

export interface IActualizarChecklistCierreResponse {
  id: number;
  id_lead_etapa: number;
  abono_inicial: boolean;
  firma_minuta: boolean;
  subida_documentos: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  estado: boolean;
}

export interface IChecklistCierre {
  id: number;
  id_lead_etapa: number;
  abono_inicial: boolean;
  firma_minuta: boolean;
  subida_documentos: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  estado: boolean;
}

export interface IRegistrarDocumentoCierreRequest {
  id_etapa_cierre: number;
  nombre_documento: string;
  url_documento: string;
  tipo_documento?: string;
}

export interface IDocumentoCierre {
  id: number;
  id_etapa_cierre: number;
  nombre_documento: string;
  url_documento: string;
  tipo_documento: string | null;
  fecha_creacion: string;
  estado: boolean;
}

export interface IEliminarDocumentoCierreResponse {
  id: number;
  estado: boolean;
}

export interface IInfoDesistioLeadOpoResponse {
  id_lead: number;
  id_lead_etapa: number;
  motivo: number;
  motivo_nombre: string;
}