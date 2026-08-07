export interface IListarActividadesAsesoresRequest {
  fechaInicio?: string;
  fechaFin?: string;
  idAsesor?: number;
  idTipoActividad?: number;
  estado?: number;
}

export interface IListarActividadesAsesoresResponse {
  id: number;
  id_asesor: number;
  id_lead: number;
  id_tipo_actividad: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  estado: number;
  estado_actividad: boolean;
  id_usuario_creacion: number;
  estado_lead: string;
  nombre_asesor: string;
  tipo_actividad: string;
  nombre_cliente: string;
}