export interface IEstadoConexion {
  id: number;
  nombre: string;
  descripcion: string | null;
  color: string | null;
}

export interface IEstadoActualTrabajador {
  id_trabajador: number;
  nombre: string;
  id_estado: number;
  estado_conexion: string;
  color: string | null;
  fecha_inicio: string;
  tiempo_en_estado: string; // interval de Postgres viene como string, ej: "01:15:00"
}

export interface ICambiarEstadoRequest {
  id_trabajador: number;
  id_estado: number;
}

export interface IHistorialEstadoTrabajador {
  id: number;
  id_trabajador: number;
  nombre: string;
  id_estado: number;
  estado_conexion: string;
  color: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  tiempo_en_estado: string;
}