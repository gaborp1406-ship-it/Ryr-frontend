import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';
import type { IListarActividadesAsesoresRequest, IListarActividadesAsesoresResponse } from '../interfaces/calendar.interface';


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