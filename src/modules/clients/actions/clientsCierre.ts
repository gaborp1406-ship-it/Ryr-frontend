import { automatizateApiNest } from "@/api/automatizateApiNest";
import { isAxiosError } from "axios";
import type { IActualizarChecklistCierreRequest, IActualizarChecklistCierreResponse, IChecklistCierre, IDocumentoCierre, IEliminarDocumentoCierreResponse, IInfoDesistioLeadOpoResponse, IRegistrarDocumentoCierreRequest } from "../interfaces/clients.cierre.interface";

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

export const registrarDocumentoCierre = async (
  payload: IRegistrarDocumentoCierreRequest
): Promise<IDocumentoCierre> => {
  try {
    const { data } = await automatizateApiNest.post(
      "/lead/registrar-documento-cierre",
      payload
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al registrar documento de cierre."
      );
    }

    throw error;
  }
};


// =====================================================
// DOCUMENTOS - OBTENER
// =====================================================

export const obtenerDocumentosCierre = async (
  id_etapa_cierre: number
): Promise<IDocumentoCierre[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/obtener-documentos-cierre/${id_etapa_cierre}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al obtener documentos de cierre."
      );
    }

    throw error;
  }
};


// =====================================================
// DOCUMENTOS - ELIMINAR
// =====================================================

export const eliminarDocumentoCierre = async (
  id: number
): Promise<IEliminarDocumentoCierreResponse> => {
  try {
    const { data } = await automatizateApiNest.delete(
      `/lead/eliminar-documento-cierrew/${id}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al eliminar documento de cierre."
      );
    }

    throw error;
  }
};

export const obtenerInfoDesistioLeadOpo = async (
  idLead: number
): Promise<IInfoDesistioLeadOpoResponse[]> => {

  try {

    const { data } = await automatizateApiNest.get(
      `/lead/info-desistio-lead-opo/${idLead}`
    );

    if (Array.isArray(data)) {
      return data;
    }

    return [data];

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al obtener información del desistimiento."
      );

    }

    throw error;
  }
};