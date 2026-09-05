import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

import type {
  IAsesor,
  ICrearLead,
  ICrearLeadResponse,
  ILeadDiario,
  ILeadPorEtapaActual,
  IListarEtapaResponse,
  IListarOpcionesResponse,
  IListarProyectoResponse,
  IValidarLeadDuplicadoRequest,
  IValidarLeadDuplicadoResponse,
} from '../interfaces/lead.interface';

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

export const listarAsesores = async (
  id_trabajador: number
): Promise<IAsesor[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/asesor/listar/${id_trabajador}`
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
export const listarLeadsDiarios = async (
  id_trabajador: number
): Promise<ILeadDiario[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/listar-diario/${id_trabajador}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al listar leads diarios.'
      );
    }

    throw error;
  }
};

export const crearLead = async (
  payload: ICrearLead
): Promise<ICrearLeadResponse> => {

  try {

    const { data } = await automatizateApiNest.post(
      '/lead/crear',
      payload
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al crear lead.'
      );
    }

    throw error;
  }
};

export const validarLeadDuplicado = async (
  payload: IValidarLeadDuplicadoRequest
): Promise<IValidarLeadDuplicadoResponse> => {

  try {

    const { data } = await automatizateApiNest.post(
      '/lead/validar-duplicado',
      payload
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al validar lead duplicado.'
      );
    }

    throw error;
  }
};

export const obtenerLeadsPorEtapaActual = async (
  idEtapa?: number,
  idAgente?: number
): Promise<ILeadPorEtapaActual[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      '/lead/leads-por-etapa-actual',
      {
        params: {
          ...(idEtapa !== undefined && { idEtapa }),
          ...(idAgente !== undefined && { idAgente }),
        },
      }
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al obtener leads por etapa actual.'
      );
    }

    throw error;
  }
};
export const listarEtapas = async (
): Promise<IListarEtapaResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      '/lead/listar-etapas'
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al listar etapas.'
      );
    }

    throw error;
  }
};


export const reabrirLeadEtapa = async (
  idLeadEtapa: number
) => {
  try {
    const { data } = await automatizateApiNest.post(
      '/lead/reabrir-lead-etapa',
      {
        idLeadEtapa,
      }
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al reabrir el lead.'
      );
    }

    throw error;
  }
};