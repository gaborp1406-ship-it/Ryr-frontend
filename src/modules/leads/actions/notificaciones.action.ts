import { automatizateApiNest } from "@/api/automatizateApiNest";

export interface INotificacion {
  id: number;
  id_asesor: number;
  id_lead: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
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
