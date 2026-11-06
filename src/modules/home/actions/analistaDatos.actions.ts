import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

export interface MensajeChat {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConsultaAnalista {
  metrica: string;
  parametros: {
    fecha_inicio: string | null;
    fecha_fin: string | null;
    id_asesor: number | null;
    id_etapa?: number | null;
  };
  total_filas: number | null;
  truncado: boolean;
  datos?: unknown;
  error?: string;
}

export interface RespuestaAnalista {
  respuesta: string;
  filtros: {
    fecha_inicio: string | null;
    fecha_fin: string | null;
    id_asesor: number | null;
  };
  consultas: ConsultaAnalista[];
  uso: { entrada: number; salida: number };
}

interface ChatAnalistaParams {
  mensaje: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  idAsesor?: number | null;
  historial?: MensajeChat[];
}

export const chatAnalistaDatos = async ({
  mensaje,
  fechaInicio,
  fechaFin,
  idAsesor,
  historial = [],
}: ChatAnalistaParams): Promise<RespuestaAnalista> => {
  try {
    const { data } = await automatizateApiNest.post<RespuestaAnalista>(
      '/analista-datos/chat',
      {
        mensaje,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        id_asesor: idAsesor ?? undefined,
        historial,
      },
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      const msg = error.response?.data?.message;
      throw new Error(
        Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al consultar al analista.',
      );
    }

    throw error;
  }
};