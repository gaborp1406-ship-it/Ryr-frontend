export interface IAgendarReunionRequest {

  idAsesor: number;

  idLead: number;

  idTipoActividad: number;

  titulo: string;

  descripcion?: string;

  fecha: string;

  hora: string;

  idUsuarioCreacion: number;

}


export interface IAgendarReunionResponse {

  id: number;

  estado: number;

  detalle: string;

}


export interface IListarOpcionesResponse {
  id: number;
  nombrelist: string;
  nombre: string;
}


export interface IListarActividadLeadResponse {
  id_actividad: number
  id_lead: number;
  id_tipo_actividad: number;
  tipo_actividad: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora: string;
  estado: number;
  nombre_estado: string;
  nombres_cliente: string;
}
export interface IActualizarFechaHoraActividadRequest {
  idActividad: number;
  fecha: string;
  hora: string;
}


export interface IActualizarFechaHoraActividadResponse {
  fn_reprogramar_actividad: boolean;
}