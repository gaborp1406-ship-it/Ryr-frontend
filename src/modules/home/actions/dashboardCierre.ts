import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

interface IFiltroFechasDashboard {
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

/**
 * 1. Total de leads en negociación
 */
export const contarLeadsNegociacionDashboard = async ({
  fechaInicio,
  fechaFin,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/leads-negociacion',
      {
        params:
          Object.keys(params).length > 0
            ? params
            : undefined,
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al contar leads en negociación',
      );
    }

    throw error;
  }
};

/**
 * 2. Leads en negociación por fuente
 */
export const contarNegociacionPorFuenteDashboard = async ({
  fechaInicio,
  fechaFin,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/negociacion-por-fuente',
      {
        params:
          Object.keys(params).length > 0
            ? params
            : undefined,
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al contar negociación por fuente',
      );
    }

    throw error;
  }
};

/**
 * 3. Leads en negociación por proyecto
 */
export const contarNegociacionPorProyectoDashboard = async ({
  fechaInicio,
  fechaFin,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/negociacion-por-proyecto',
      {
        params:
          Object.keys(params).length > 0
            ? params
            : undefined,
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al contar negociación por proyecto',
      );
    }

    throw error;
  }
};

/**
 * 4. Leads en negociación por asesor
 */
export const contarNegociacionPorAsesorDashboard = async ({
  fechaInicio,
  fechaFin,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/negociacion-por-asesor',
      {
        params:
          Object.keys(params).length > 0
            ? params
            : undefined,
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al contar negociación por asesor',
      );
    }

    throw error;
  }
};

/**
 * 5. Listado de todos los leads en negociación
 */
export const listarLeadsNegociacionDashboard = async ({
  fechaInicio,
  fechaFin,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/listar-leads-negociacion',
      {
        params:
          Object.keys(params).length > 0
            ? params
            : undefined,
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al listar leads en negociación',
      );
    }

    throw error;
  }
};