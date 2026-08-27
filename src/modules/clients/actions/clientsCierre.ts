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
