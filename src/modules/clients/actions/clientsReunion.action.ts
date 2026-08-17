import { isAxiosError } from "axios";
import { automatizateApiNest } from "@/api/automatizateApiNest";
import type { IActualizarFechaHoraActividadRequest, IActualizarFechaHoraActividadResponse, IAgendarReunionRequest, IAgendarReunionResponse, IListarActividadLeadResponse, IObtenerInfoAgendarReuLeadResponse } from "../interfaces/clientsreunion.interface";
import type { IListarOpcionesResponse } from "../interfaces/clients.interface";


export const agendarReunion = async (
  payload: IAgendarReunionRequest
): Promise<IAgendarReunionResponse> => {

  try {

    const { data } = await automatizateApiNest.post(
      "/lead/agendar-reunion",
      payload
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al agendar reunión."
      );

    }

    throw error;
  }

};
export const obtenerInfoAgendarReuLead = async (
  idLead: number
): Promise<IObtenerInfoAgendarReuLeadResponse[]> => {

  try {

    const { data } = await automatizateApiNest.get(
      `/lead/obtener-info-agendarreu-lead/${idLead}`
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al obtener información de agendar reunión."
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
export const listarActividadesPorLead = async (
  idLead: number
): Promise<IListarActividadLeadResponse[]> => {
  try {
    const { data } = await automatizateApiNest.post(
      "/lead/obtener-actividad-lead",
      {
        idLead,
      }
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al listar actividades del lead."
      );
    }

    throw error;
  }
};

export const actualizarFechaHoraActividad = async (
  payload: IActualizarFechaHoraActividadRequest
): Promise<IActualizarFechaHoraActividadResponse[]> => {
  try {
    const { data } = await automatizateApiNest.post(
      "/lead/reprogramar-actividad",
      payload
    );


    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        "Error al actualizar fecha y hora de la actividad."
      );
    }

    throw error;
  }
};




