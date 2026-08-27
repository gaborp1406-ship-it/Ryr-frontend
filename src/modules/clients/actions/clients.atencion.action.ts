import { automatizateApiNest } from "@/api/automatizateApiNest";
import type { IHistorialCorreoResponse, IHistorialLlamadaResponse, IHistorialWhatsappResponse, IInfoEstadoReunionLeadResponse, IRegistrarCorreoRequest, IRegistrarWhatsappRequest } from "../interfaces/clients.atencion.interface";
import { isAxiosError } from "axios";


export const obtenerInfoEstadoReunionLead = async (
  idLead: number
): Promise<IInfoEstadoReunionLeadResponse> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/info-estado-reunion/${idLead}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al obtener la información del estado de reunión."
      );
    }

    throw error;
  }
};



export const obtenerHistorialCorreoReunion = async (
  idEstadoReunion: number
): Promise<IHistorialCorreoResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/historial-correo/${idEstadoReunion}/21/reunion`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al obtener el historial de correos.'
      );
    }

    throw error;
  }
};

export const obtenerHistorialWhatsappReunion = async (
  idEstadoReunion: number
): Promise<IHistorialWhatsappResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/historial-whatsapp/${idEstadoReunion}/21/reunion`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al obtener el historial de WhatsApp.'
      );
    }

    throw error;
  }
};

export const obtenerHistorialLlamadasReunion = async (
  idEstadoReunion: number
): Promise<IHistorialLlamadaResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/historial-llamadas/${idEstadoReunion}/21`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al obtener el historial de llamadas.'
      );
    }

    throw error;
  }
};





export const registrarWhatsappReunion = async (
  data: IRegistrarWhatsappRequest
) => {
  try {

    const { data: response } = await automatizateApiNest.post(
      "/lead/registrar-whatsapp-reunion",
      data
    );

    return response;

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al registrar WhatsApp."
      );
    }

    throw error;
  }
};



export const registrarCorreoReunion = async (
  data: IRegistrarCorreoRequest
) => {
  try {

    const { data: response } = await automatizateApiNest.post(
      "/lead/registrar-correo-reunion",
      data
    );

    return response;

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al registrar correo."
      );
    }

    throw error;
  }
};


export const obtenerTodasActividades = async (
  id_lead: number
) => {
  try {
    const { data: response } = await automatizateApiNest.get(
      `/lead/todas-actividades/${id_lead}`
    );

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al obtener las actividades."
      );
    }

    throw error;
  }
};

export const finalizarEtapaAtencion = async (
  id_lead: number
) => {
  try {
    const { data: response } = await automatizateApiNest.post(
      `/lead/finalizar-etapa-atencion/${id_lead}`
    );

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al finalizar la etapa de atención."
      );
    }

    throw error;
  }
};

export const finalizarEtapaOportunidadDesistio = async (
  id_lead: number,
  motivo?: number
) => {
  try {
    const { data: response } = await automatizateApiNest.post(
      `/lead/finalizar-etapa-oportunidad-desistio`,
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


export const finalizarActividad = async (
  id_actividad: number
) => {
  try {
    const { data } = await automatizateApiNest.post(
      `/lead/finalizar-actividad/${id_actividad}`
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
