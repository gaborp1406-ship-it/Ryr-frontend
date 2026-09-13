import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

// ============================================================
// TIPO PARA FILTRO DE FECHAS
// ============================================================
interface IFiltroFechasDashboard {
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

// ============================================================
// CONTAR LEADS POR ETAPA
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarLeadsPorEtapa = async ({
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
      '/dashboard/leads-por-etapa',
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
          'Error al contar leads por etapa.',
      );
    }

    throw error;
  }
};


// ============================================================
// CONTAR LEADS POR FASE
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarLeadsPorFase = async ({
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
      '/dashboard/leads-por-fase',
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
          'Error al contar leads por fase.',
      );
    }

    throw error;
  }
};


// ============================================================
// CONTAR ACTIVIDADES DEL DASHBOARD
//
// ESTA API TODAVÍA NO RECIBE FILTRO DE FECHAS
// ============================================================
export interface IContarActividadesDashboardParams {
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

export const contarActividadesDashboard = async (
  params: IContarActividadesDashboardParams = {},
) => {
  try {
    const { data } = await automatizateApiNest.get(
      '/dashboard/actividades',
      {
        params: {
          fechaInicio: params.fechaInicio || undefined,
          fechaFin: params.fechaFin || undefined,
        },
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          'Error al contar actividades del dashboard.',
      );
    }

    throw error;
  }
};

// ============================================================
// CONTAR DESISTIMIENTOS
//
// idEtapa:
// 3 = Desistio
// 8 = Desistio - Oportunidad
// null / undefined = ambos
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarDesistimientosDashboard = async (
  idEtapa?: number | null,
  fechaInicio?: string | null,
  fechaFin?: string | null,
) => {
  try {
    const params: Record<string, string | number> = {};

    if (
      idEtapa !== undefined &&
      idEtapa !== null
    ) {
      params.id_etapa = idEtapa;
    }

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/desistimientos',
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
          'Error al contar desistimientos.',
      );
    }

    throw error;
  }
};


// ============================================================
// CONTAR LEADS ATENDIDOS / SIN ATENDER
//
// Etapa 1 = Sin atender
// Etapas 2-8 = Atendidos
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarLeadsAtendidosDashboard = async ({
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
      '/dashboard/leads-atendidos',
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
          'Error al contar leads atendidos.',
      );
    }

    throw error;
  }
};