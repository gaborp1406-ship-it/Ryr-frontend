import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

// ============================================================
// TIPO PARA FILTRO DE FECHAS
// ============================================================
interface IFiltroFechasDashboard {
  fechaInicio?: string | null;
  fechaFin?: string | null;
  idAsesor?: number | null;
}
// ============================================================
// 1. CONTAR LEADS EN CIERRE
//
// Etapa 7 = Cierre
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarLeadsCierreDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/leads-cierre',
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
          'Error al contar leads en cierre.',
      );
    }

    throw error;
  }
};


// ============================================================
// 2. CONTAR TOTAL DE LEADS
//
// Incluye todos los leads de todas las etapas.
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarTotalLeadsDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/total-leads',
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
          'Error al contar el total de leads.',
      );
    }

    throw error;
  }
};


// ============================================================
// 3. CIERRES POR PROYECTO
//
// Devuelve todos los proyectos, incluso los que tengan 0
// cierres.
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarCierresPorProyectoDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/cierres-por-proyecto',
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
          'Error al contar cierres por proyecto.',
      );
    }

    throw error;
  }
};


// ============================================================
// 4. CIERRES POR FUENTE
//
// Devuelve todas las fuentes, incluso las que tengan 0
// cierres.
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarCierresPorFuenteDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/cierres-por-fuente',
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
          'Error al contar cierres por fuente.',
      );
    }

    throw error;
  }
};


// ============================================================
// 5. CIERRES POR ASESOR
//
// Devuelve todos los asesores, incluso los que tengan 0
// cierres.
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarCierresPorAsesorDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/cierres-por-asesor',
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
          'Error al contar cierres por asesor.',
      );
    }

    throw error;
  }
};


// ============================================================
// 6. TOTAL DE LEADS POR FUENTE
//
// Devuelve todas las fuentes y cantidad total de leads.
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarTotalLeadsPorFuenteDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/total-leads-por-fuente',
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
          'Error al contar total de leads por fuente.',
      );
    }

    throw error;
  }
};


// ============================================================
// 7. TASA DE CIERRE
//
// Retorna:
// - leads_cierre
// - total_leads
// - tasa_cierre_porcentaje
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarTasaCierreDashboard = async ({
  fechaInicio,
  fechaFin,
  idAsesor,
}: IFiltroFechasDashboard = {}) => {
  try {
    const params: Record<string, string | number> = {};

    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }

    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }

    if (idAsesor !== undefined && idAsesor !== null) {
      params.id_asesor = idAsesor;
    }

    const { data } = await automatizateApiNest.get(
      '/dashboard/tasa-cierre',
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
          'Error al calcular la tasa de cierre.',
      );
    }

    throw error;
  }
};