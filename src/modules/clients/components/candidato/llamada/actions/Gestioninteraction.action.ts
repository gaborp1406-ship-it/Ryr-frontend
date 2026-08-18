import { automatizateApiNest } from "@/api/automatizateApiNest";
import { isAxiosError } from "axios";
import type { ICallRequest, ICallResponse,  ICredencialesSipResponse} from "../interfaces/gestion-interaction.interface";



export const obtenerCredencialesSip =
  async (): Promise<ICredencialesSipResponse> => {
    try {
      const { data } = await automatizateApiNest.get(
        "/auth/credenciales-sip"
      );

      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ??
            "Error al obtener las credenciales SIP."
        );
      }

      throw error;
    }
  };


export const realizarLlamada = async (
  payload: ICallRequest
): Promise<ICallResponse> => {

  try {

    const { data } = await automatizateApiNest.post(
      "/ari/call",
      payload
    );


    return data;

  } catch (error) {

    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al realizar la llamada."
      );
    }

    throw error;
  }
};


export const colgarLlamadaActiva = async (
  channelId: string
) => {
  try {
    const { data } = await automatizateApiNest.post(
      "/ari/hangup",
      {
        channelId,
      }
    );

    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Error al colgar la llamada."
      );
    }

    throw error;
  }
};


export const conectarEventosLlamada = (
  extension: string,
  onEvent: (event: any) => void
): EventSource => {
  const eventSource = new EventSource(
    `${automatizateApiNest.defaults.baseURL}/ari/events/${extension}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      onEvent(data);
    } catch (error) {
      console.error(
        "Error procesando evento de llamada:",
        error
      );
    }
  };

  eventSource.onerror = (error) => {
    console.error(
      "Error en conexión SSE de eventos:",
      error
    );
  };

  return eventSource;
};