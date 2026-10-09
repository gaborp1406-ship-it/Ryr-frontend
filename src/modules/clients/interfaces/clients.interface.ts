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
export interface IListarAsesoresActivosResponse {
id_trabajador: number;
nombre: string;
id_estado: number;
estado_conexion: string;
color: string;
fecha_inicio: string;
tiempo_en_estado: string;
}



export interface IReasignarLeadRequest {
  id_lead: number;
  id_asesor_nuevo: number;
  usuario_modificacion: number;
  motivo?: string;       // 'SIN_RESPUESTA' | 'CARGA_TRABAJO' | 'MANUAL'
  observacion?: string;
}

export interface IReasignarLeadResponse {
  mensaje: string;
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
  id_fase?: number | null;
  id_etapa?: number | null;
}
export interface IListarEtapasResponse {
  id: number;
  nombre: string;
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
  id_etapa: number;
  nombre_asesor: string;
  fecha_asignacion: string;
  etapa_actual: string;
}

export interface IActualizarLeadDniProyectoRequest {
  id_lead: number;
  dni_cliente: string | null;
  id_proyecto: number;
  usuario_modificacion: number;
}

export interface IActualizarLeadDniProyectoResponse {
  mensaje: string;
}