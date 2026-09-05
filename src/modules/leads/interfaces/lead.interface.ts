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
   accion: 'ALERTA' | 'CREADO_NUEVO_PROYECTO' | 'CREADO';
  debe_notificar: boolean;
  id_lead_anterior: number | null;
  id_asesor_anterior: number | null;
  mensaje: string;
}



export interface IValidarLeadDuplicadoRequest {
  dni: string;
  telefono: string;
}

export interface IValidarLeadDuplicadoResponse {
  bloqueado: boolean;
  mensaje: string | null;
  id_cliente_existente: number | null;
  id_lead_existente: number | null;
  id_asesor_existente: number | null;
  id_proyecto_existente: number | null;
  id_etapa_actual: number | null;
}


export interface ILeadPorEtapaActual {
  id_lead: number;
  id_cliente: number;
  nombre_clientes: string;
  id_proyecto: number;
  nombre_proyecto: string;
  id_fuente: number;
  nombre_fuente: string;
  id_asesor: number;
  nombre_asesor: string;
  id_lead_etapa: number;
  id_etapa: number;
  nombre_etapa: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado_actual: boolean;
  fecha_creacion: string;
}

export interface IListarEtapaResponse {
  id: number;
  nombre: string;
  orden: number;
}