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

export interface IObtenerDetalleActividadResponse {
  id: number;
  id_asesor: number;
  nombre_asesor: string;
  id_lead: number;
  id_tipo_actividad: number;
  tipo_actividad: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora: string;
  estado: number | null;
  estado_nombre: string | null;
  estado_actividad: boolean | null;
  fecha_creacion: string | null;
  fecha_actualizacion: string | null;
  id_usuario_creacion: number | null;
  lugar_plataforma: string | null;
}