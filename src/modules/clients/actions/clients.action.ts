import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

import type {

  IClientePotencial,
  IEtapaActualLeadResponse,

  IListarAsesoresResponse,
  IListarClientesPotencialesRequest,
  IListarOpcionesResponse,
  IListarProyectoResponse,
} from '../interfaces/clients.interface';

export const listarOpciones = async (
  idListado: number
): Promise<IListarOpcionesResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/opciones/listar/${idListado}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al listar opciones.'
      );
    }

    throw error;
  }
};

export const listarAsesores = async (): Promise<IListarAsesoresResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      '/asesor/listar-asesores'
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al listar asesores.'
      );
    }

    throw error;
  }
};

export const listarProyectos = async (
  idEmpresa: number
): Promise<IListarProyectoResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/proyecto/listar/${idEmpresa}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al listar proyectos.'
      );
    }

    throw error;
  }
};


export const listarClientesPotenciales = async (
  payload: IListarClientesPotencialesRequest
): Promise<IClientePotencial[]> => {
  try {
    const { data } = await automatizateApiNest.post(
      '/lead/listar-clientes-potenciales',
      payload
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al listar clientes potenciales.'
      );
    }

    throw error;
  }
};

export const obtenerEtapaActualLead = async (
  idLead: number
): Promise<IEtapaActualLeadResponse> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/obtener-etapa-actual/${idLead}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al obtener la etapa actual del lead.'
      );
    }

    throw error;
  }
};

