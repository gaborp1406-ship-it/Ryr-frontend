import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';
import type { IListarActividadesAsesoresRequest, IListarActividadesAsesoresResponse, IObtenerDetalleActividadResponse } from '../interfaces/calendar.interface';


export const listarActividadesAsesores = async (
  payload: IListarActividadesAsesoresRequest
): Promise<IListarActividadesAsesoresResponse[]> => {

  try {

    const { data } = await automatizateApiNest.post(
      "/lead/listar-actividades-asesores",
      payload
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al listar actividades."
      );

    }

    throw error;

  }

};


export const obtenerDetalleActividad = async (
  id_actividad: number
): Promise<IObtenerDetalleActividadResponse> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/obtener-detalle-actividad/${id_actividad}`
    );

    // El backend actualmente devuelve un array porque
    // la función PostgreSQL retorna TABLE.
    return data[0];

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al obtener el detalle de la actividad."
      );
    }

    throw error;
  }
};