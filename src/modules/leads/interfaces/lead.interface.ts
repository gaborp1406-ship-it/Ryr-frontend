export interface IListarOpcionesResponse {
  id: number;
  nombrelist: string;
  nombre: string;
}

export interface IListarProyectoResponse {
  id_proyecto: number;
  nombre: string;
}

export interface IAsesor {
  id_asesor: number;
  nombre: string;
  estado_conexion: string;
  cantidad_leads: string;
  ultimo_lead_asignado: string | null;
}

export interface ILeadDiario {
  id: number;
  fecha: string;
  asesor: string;
  proyecto: string;
  nombre_cliente: string;
  dni_cliente: string;
  telefono_cliente: string;
  fuente: string;
}

export interface ICrearLead {
  id_asesor: number;
  id_proyecto: number;
  nombre_cliente: string;
  dni_cliente: string;
  telefono_cliente: string;
  id_fuente: number;
  usuario_creacion: number;
}


// RESPUESTA CREAR LEAD
export interface ICrearLeadResponse {
  id_lead: number;
  id_cliente: number;
  id_asesor: number;
  fecha_creacion: string;
}