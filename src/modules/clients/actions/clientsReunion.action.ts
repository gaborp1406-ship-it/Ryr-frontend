import { isAxiosError } from "axios";
import { automatizateApiNest } from "@/api/automatizateApiNest";
import type { IAgendarReunionRequest, IAgendarReunionResponse } from "../interfaces/clientsreunion.interface";
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
