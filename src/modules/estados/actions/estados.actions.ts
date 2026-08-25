import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';
import type {
  IEstadoConexion,
  IEstadoActualTrabajador,
  ICambiarEstadoRequest,
  IHistorialEstadoTrabajador,
} from '../interfaces/estados.interface';


export const listarEstadosConexion = async (): Promise<IEstadoConexion[]> => {

  try {

    const { data } = await automatizateApiNest.get(
      "/trabajador/estados-conexion"
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al listar estados de conexión."
      );

    }

    throw error;

  }

};

export const obtenerEstadoActual = async (
  id_trabajador: number
): Promise<IEstadoActualTrabajador> => {

  try {

    const { data } = await automatizateApiNest.get(
      `/trabajador/${id_trabajador}/estado-actual`
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al obtener el estado actual."
      );

    }

    throw error;

  }

};

export const cambiarEstadoAsesor = async (
  payload: ICambiarEstadoRequest
): Promise<IEstadoActualTrabajador> => {

  try {

    const { data } = await automatizateApiNest.post(
      "/trabajador/estado/cambiar",
      payload
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al cambiar el estado."
      );

    }

    throw error;

  }

};

export const listarEstadoActualTrabajadores = async (
  id_estado?: number
): Promise<IEstadoActualTrabajador[]> => {

  try {

    const { data } = await automatizateApiNest.get(
      "/trabajador/estado-actual",
      {
        params: id_estado ? { id_estado } : {},
      }
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al listar el estado actual de los trabajadores."
      );

    }

    throw error;

  }

};

export const historialEstadoTrabajador = async (
  id_trabajador: number,
  filtros?: {
    id_estado?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
  }
): Promise<IHistorialEstadoTrabajador[]> => {

  try {

    const { data } = await automatizateApiNest.get(
      `/trabajador/${id_trabajador}/historial-estado`,
      {
        params: filtros,
      }
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al obtener el historial de estados."
      );

    }

    throw error;

  }

};