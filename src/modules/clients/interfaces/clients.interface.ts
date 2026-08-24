export interface IListarAsesoresResponse {
  id_asesor: number;
  nombre: string;
  nombre_abrev: string;
}

export interface IListarOpcionesResponse {
  id: number;
  nombrelist: string;
  nombre: string;
}

export interface IListarProyectoResponse {
  id_proyecto: number;
  nombre: string;
}

export interface IEtapaActualLeadResponse {
  id_lead_etapa: number;
  id_etapa: number;
  nombre_etapa: string;
  fecha_inicio: string;
  usuario: number;
}
export interface IListarClientesPotencialesRequest {
  busqueda?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_asesor?: number | null;
  id_fuente?: number | null;
  id_proyecto?: number | null;
}

export interface IClientePotencial {
  id_lead: number;
  dni_cliente: string;
  cliente: string;
  id_fuente: number;
  fuente: string;
  id_proyecto: number;
  proyecto: string;
  id_asesor: number;
  nombre_asesor: string;
  fecha_asignacion: string;
  etapa_actual:string;
}

