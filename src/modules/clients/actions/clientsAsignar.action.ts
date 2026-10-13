import { automatizateApiNest } from "@/api/automatizateApiNest";
import type { IDetalleLeadClienteResponse, IFinalizarEtapaLeadAsignacionResponse } from "../interfaces/clientsasignar.interface";
import { isAxiosError } from "axios";

export const obtenerDetalleLeadCliente = async (
  idLead: number
): Promise<IDetalleLeadClienteResponse> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/detalle/${idLead}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al obtener el detalle del lead.'
      );
    }

    throw error;
  }
};

export const finalizarEtapaLeadAsignacion = async (
  idLeadEtapa: number
): Promise<IFinalizarEtapaLeadAsignacionResponse> => {
  try {
    const { data } = await automatizateApiNest.post(
      `/lead/finalizar-etapa/${idLeadEtapa}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al finalizar la etapa del lead.'
      );
    }

    throw error;
  }
};


export interface IVerificarLeadReasignadoResponse {
  es_reasignado: boolean;
  id_asesor_anterior: number | null;
  nombre_asesor_anterior: string | null;
}

export const verificarLeadReasignado = async (
  idLead: number
): Promise<IVerificarLeadReasignadoResponse> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/verificar-lead-reasignado/${idLead}`
    );

    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al verificar si el lead fue reasignado.'
      );
    }

    throw error;
  }
};