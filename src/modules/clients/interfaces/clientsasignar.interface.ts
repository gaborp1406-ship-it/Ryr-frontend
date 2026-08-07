export interface IDetalleLeadClienteResponse {
  id_lead: number;
  id_lead_etapa: number;
  nombres: string;
  numero_documento: string;
  telefono: string;
  id_proyecto: number;
  proyecto: string;
  id_fuente: number;
  estado: boolean;
  fuente: string;
  fecha_ingreso: string;
  hora_ingreso: string;
}

export interface IFinalizarEtapaLeadAsignacionResponse {
  finalizado: boolean;
}
