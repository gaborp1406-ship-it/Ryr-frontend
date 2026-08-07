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

