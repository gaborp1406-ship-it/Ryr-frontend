import { isAxiosError } from "axios";
import type { IEditarMensajeLeadEtapaContactoRequest, IEstadoContactoLeadResponse, IFinalizarEtapaContactoDesistioRequest, IInfoDesistioLeadResponse, IListarOpcionesResponse, IRegistrarCorreoRequest, IRegistrarLlamadaRequest, IRegistrarWhatsappRequest } from "../interfaces/clientscontacto.interface";
import { automatizateApiNest } from "@/api/automatizateApiNest";
import type { IHistorialCorreoResponse, IHistorialLlamadaResponse, IHistorialWhatsappResponse } from "../interfaces/clientscontacto.interface";

export const obtenerEstadoContactoLead = async (
  idLead: number
): Promise<IEstadoContactoLeadResponse> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/info-estado-contacto/${idLead}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al obtener el estado de contacto.'
      );
    }

    throw error;
  }
};

export const obtenerHistorialCorreo = async (
  idEstadoContacto: number
): Promise<IHistorialCorreoResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/historial-correo/${idEstadoContacto}/20`
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

export const obtenerHistorialWhatsapp = async (
  idEstadoContacto: number
): Promise<IHistorialWhatsappResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/historial-whatsapp/${idEstadoContacto}/20`
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








export const obtenerHistorialLlamadas = async (
  id_etapa_lead: number
): Promise<IHistorialLlamadaResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/lead/historial-llamadas/${id_etapa_lead}/20`
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








export const registrarWhatsapp = async (
  data: IRegistrarWhatsappRequest
) => {
  try {

    const { data: response } = await automatizateApiNest.post(
      "/lead/registrar-whatsapp",
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



export const registrarCorreo = async (
  data: IRegistrarCorreoRequest
) => {
  try {

    const { data: response } = await automatizateApiNest.post(
      "/lead/registrar-correo",
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


export const listarOpciones = async (
  idListado: number
): Promise<IListarOpcionesResponse[]> => {
  try {
    const { data } = await automatizateApiNest.get(
      `/opciones/listar/${idListado}`
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'Error al listar opciones.'
      );
    }

    throw error;
  }
};


export const registrarLlamada = async (
  data: IRegistrarLlamadaRequest
) => {
  try {

    const { data: response } = await automatizateApiNest.post(
      "/lead/registrar-llamada",
      data
    );

    return response;

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al registrar llamada."
      );
    }

    throw error;
  }
};

export const finalizarEtapaContactoDesistio = async (
  data: IFinalizarEtapaContactoDesistioRequest
) => {

  try {

    const { data: response } = await automatizateApiNest.post(
      "/lead/finalizar-etapa-contacto-desistio",
      data
    );

    return response;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al finalizar etapa desistio."
      );

    }

    throw error;
  }
};

export const obtenerInfoDesistioLead = async (
  idLead: number
): Promise<IInfoDesistioLeadResponse> => {

  try {

    const { data } = await automatizateApiNest.get(
      `/lead/info-desistio-lead/${idLead}`
    );

    return data;

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

export const registrarPrimerContacto = async (
  idEstadoContacto: number
): Promise<void> => {
  try {
    await automatizateApiNest.get(
      `/lead/registrar-primer-contacto/${idEstadoContacto}`
    );
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al registrar el primer contacto."
      );
    }

    throw error;
  }
};

export const editarMensajeLeadEtapaContacto = async (
  data: IEditarMensajeLeadEtapaContactoRequest
) => {
  try {
    const { data: response } = await automatizateApiNest.post(
      "/lead/editar-mensaje-lead-etapa-contacto",
      data
    );

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al editar el mensaje del contacto."
      );
    }

    throw error;
  }
};