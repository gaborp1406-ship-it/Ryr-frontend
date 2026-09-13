import { automatizateApiNest } from "@/api/automatizateApiNest";
import { isAxiosError } from "axios";
import type { IActualizarChecklistNegociacionRequest, IActualizarChecklistNegociacionResponse, IActualizarDocumentoNegociacionRequest, IActualizarDocumentoNegociacionResponse, IChecklistNegociacion } from "../interfaces/clients.negociacion.interface";

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
  motivo?: number,
  motivo_otro?: string
) => {
  try {
    const { data: response } = await automatizateApiNest.post(
      "/lead/finalizar-etapa-negociacion-desistio",
      {
        id_lead,
        motivo,
        motivo_otro,
      }
    );

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al finalizar la etapa de negociación como desistido."
      );
    }

    throw error;
  }
};

export const actualizarDocumentoNegociacion = async (
  payload: IActualizarDocumentoNegociacionRequest
): Promise<IActualizarDocumentoNegociacionResponse> => {
  try {
    const { data } = await automatizateApiNest.post(
      "/lead/actualizar-documento-negociacion",
      payload
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al subir el documento de negociación."
      );
    }

    throw error;
  }
};