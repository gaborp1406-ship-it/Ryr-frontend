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
// 2. CONTACTO POR ASESOR
//
// GET /dashboard/contacto-por-asesor
//
// Retorna:
// - asesor
// - cantidad de leads contactados
// - promedio de tiempo de contacto
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const obtenerContactoPorAsesorDashboard = async ({
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
            '/dashboard/contacto-por-asesor',
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
                'Error al obtener contacto por asesor.',
            );
        }

        throw error;
    }
};


// ============================================================
// 3. RANGOS DE CONTACTO
//
// GET /dashboard/rangos-contacto
//
// Retorna:
// - 0 - 30 min
// - 30 - 60 min
// - 60 min a más
// - cantidad
// - porcentaje
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const obtenerRangosContactoDashboard = async ({
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
            '/dashboard/rangos-contacto',
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
                'Error al obtener rangos de contacto.',
            );
        }

        throw error;
    }
};


// ============================================================
// 4. RESUMEN DE CONTACTO
//
// GET /dashboard/resumen-contacto
//
// Retorna:
// - total_leads
// - leads_contactados
// - promedio_minutos
// - promedio_horas
// - promedio_tiempo_contacto
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const obtenerResumenContactoDashboard = async ({
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
            '/dashboard/resumen-contacto',
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
                'Error al obtener resumen de contacto.',
            );
        }

        throw error;
    }
};


// ============================================================
// 5. LEADS CONTACTADOS POR ASESOR
//
// GET /dashboard/leads-contactados-asesor
//
// Retorna:
// - id_asesor
// - asesor
// - leads_contactados
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const obtenerLeadsContactadosAsesorDashboard = async ({
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
            '/dashboard/leads-contactados-asesor',
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
                'Error al obtener leads contactados por asesor.',
            );
        }

        throw error;
    }
};

// ============================================================
// CONTAR TOTAL DE LEADS
//
// GET /dashboard/total-leads
//
// fechaInicio / fechaFin:
// Formato: YYYY-MM-DD
// ============================================================
export const contarTotalLeadsDashboard = async ({
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