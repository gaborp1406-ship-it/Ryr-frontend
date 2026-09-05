export interface IActualizarChecklistNegociacionRequest {
  id_lead_etapa: number;
  campo: string;
  valor: boolean;
}

export interface IActualizarChecklistNegociacionResponse {
  id: number;
  id_lead_etapa: number;
  proforma_enviada: boolean;
  aprobacion_bancaria: boolean;
  aprobacion_bancaria_precalififacion: boolean;
  aprobacion_bancaria_carta_aprobacion: boolean;
  carta_aprobacion_aprobado: boolean;
  carta_aprobacion_denegado: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  estado: boolean;
}



export interface IChecklistNegociacion {
  id: number;
  id_lead_etapa: number;
  proforma_enviada: boolean;
  aprobacion_bancaria: boolean;
  aprobacion_bancaria_precalififacion: boolean;
  aprobacion_bancaria_carta_aprobacion: boolean;
  carta_aprobacion_aprobado: boolean;
  carta_aprobacion_denegado: boolean;
  tipo_credito: number | null;
  proforma_enviada_decuerdo: boolean;
  proforma_enviada_descuerdo: boolean;
  url_precalificacion: string | null;
  url_carta_aprobacion: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
  estado: boolean;
}
