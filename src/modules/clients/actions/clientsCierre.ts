import { automatizateApiNest } from "@/api/automatizateApiNest";
import { isAxiosError } from "axios";
import type { IActualizarChecklistCierreRequest, IActualizarChecklistCierreResponse, IChecklistCierre } from "../interfaces/clients.cierre.interface";

export const actualizarChecklistNegociacion = async (
  payload: IActualizarChecklistCierreRequest
): Promise<IActualizarChecklistCierreResponse> => {
  try {
    const { data } = await automatizateApiNest.post(
      "/lead/etapa-cierre/checklist",
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

export const obtenerChecklistCierre = async (
  id_lead: number
): Promise<IChecklistCierre[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/etapa-cierre/checklist/${id_lead}`
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


export const finalizarEtapaCierre = async (
  id_lead: number
) => {
  try {
    const { data } = await automatizateApiNest.post(
      `/lead/finalizar-etapa-cierre/${id_lead}`
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



export const finalizarEtapaCierreDesistio = async (
  id_lead: number,
  motivo?: number
) => {
  try {
    const { data: response } = await automatizateApiNest.post(
      `/lead/finalizar-etapa-cierre-desistio`,
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