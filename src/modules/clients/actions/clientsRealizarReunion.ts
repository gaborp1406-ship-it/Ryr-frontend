import { automatizateApiNest } from "@/api/automatizateApiNest";
import type { IFinalizarEtapaContactoAgendarReunionRequest, IFinalizarEtapaContactoAgendarReunionResponse } from "../interfaces/clientsrealizarreunion";
import { isAxiosError } from "axios";

export const finalizarEtapaContactoAgendarReunion = async (
  payload: IFinalizarEtapaContactoAgendarReunionRequest
): Promise<IFinalizarEtapaContactoAgendarReunionResponse> => {

  try {

    const { data } = await automatizateApiNest.post(
      "/lead/finalizar-etapa-contacto-agendarreunion",
      payload
    );

    return data;

  } catch (error) {

    if (isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "Error al finalizar etapa de contacto y agendar reunión."
      );

    }

    throw error;
  }

};
