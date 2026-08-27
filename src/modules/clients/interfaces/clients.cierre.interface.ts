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