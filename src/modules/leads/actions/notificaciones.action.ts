import { automatizateApiNest } from "@/api/automatizateApiNest";

export interface IDatosLeadPendiente {
  id_asesor: number;
  id_proyecto: number;
  nombre_cliente: string;
  dni_cliente: string;
  telefono_cliente: string;
  id_fuente: number;
  usuario_creacion: number;
}

export interface INotificacion {
  id: number;
  id_asesor: number;
  id_lead: number | null;              // null en SIN_ASESOR_ACTIVO
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  datos?: IDatosLeadPendiente | null;  // datos para el botón "Derivar"
}

export async function listarNotificaciones(idAsesor: number): Promise<INotificacion[]> {
  const { data } = await automatizateApiNest.get(`/notificaciones/${idAsesor}`);
  return data;
}

export async function marcarNotificacionLeida(id: number): Promise<void> {
  await automatizateApiNest.patch(`/notificaciones/${id}/leida`);
}

export async function eliminarNotificacion(id: number): Promise<void> {
  await automatizateApiNest.delete(`/notificaciones/${id}`);
}

export async function eliminarTodasNotificacion(idAsesor: number): Promise<void> {
  await automatizateApiNest.delete(`/notificaciones/asesor/${idAsesor}/leidas`);
}