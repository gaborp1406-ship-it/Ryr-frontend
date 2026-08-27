import { automatizateApiNest } from "@/api/automatizateApiNest";
import { isAxiosError } from "axios";
import type { IActualizarChecklistNegociacionRequest, IActualizarChecklistNegociacionResponse, IChecklistNegociacion } from "../interfaces/clients.negociacion.interface";

export const actualizarChecklistNegociacion = async (
  payload: IActualizarChecklistNegociacionRequest
): Promise<IActualizarChecklistNegociacionResponse> => {
  try {
    const { data } = await automatizateApiNest.post(
      "/lead/etapa-negociacion/checklist",
      payload
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al actualizar checklist de negociación."
      );
    }

    throw error;
  }
};

export const obtenerChecklistNegociacion = async (
  id_lead: number
): Promise<IChecklistNegociacion[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/etapa-negociacion/checklist/${id_lead}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al obtener checklist de negociación."
      );
    }

    throw error;
  }
};

export const finalizarEtapaNegociacion = async (
  id_lead: number
) => {
  try {
    const { data } = await automatizateApiNest.post(
      `/lead/finalizar-etapa-negociacion/${id_lead}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al finalizar la etapa de negociación."
      );
    }

    throw error;
  }
};

export const finalizarEtapaNegociacionDesistio = async (
  id_lead: number,
  motivo?: number
) => {
  try {
    const { data: response } = await automatizateApiNest.post(
      `/lead/finalizar-etapa-negociacion-desistio`,
      {
        id_lead,
        motivo,
      }
    );

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al finalizar la etapa de oportunidad como desistido."
      );
    }

    throw error;
  }
};