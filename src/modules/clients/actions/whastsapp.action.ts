import type { IWhatsappMensajeResponse } from "../interfaces/whastsapp.interface";
import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

export interface IIndicadorResponse {
    ok: boolean;
    detalle?: string;
}

export const listarMensajesWhatsappLead = async (
    idLead: number
): Promise<IWhatsappMensajeResponse[]> => {
    try {
        const { data } = await automatizateApiNest.get(
            `/whatsapp/mensajes/${idLead}`
        );

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ??
                'Error al listar los mensajes de WhatsApp del lead.'
            );
        }

        throw error;
    }
};

export const enviarMensajeWhatsappLead = async (
    idLead: number,
    mensaje: string
): Promise<IWhatsappMensajeResponse> => {
    try {
        const { data } = await automatizateApiNest.post(
            `/whatsapp/enviar/${idLead}`,
            { mensaje }
        );

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ??
                'Error al enviar el mensaje de WhatsApp.'
            );
        }

        throw error;
    }
};

// Marca como leído el último mensaje entrante (✓✓ azul para el cliente)
export const marcarLeidoWhatsappLead = async (
    idLead: number
): Promise<IIndicadorResponse> => {
    try {
        const { data } = await automatizateApiNest.post(
            `/whatsapp/leido/${idLead}`
        );

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ??
                'Error al marcar el chat como leído.'
            );
        }

        throw error;
    }
};

// Marca como leído y muestra "escribiendo..." al cliente
export const escribiendoWhatsappLead = async (
    idLead: number
): Promise<IIndicadorResponse> => {
    try {
        const { data } = await automatizateApiNest.post(
            `/whatsapp/escribiendo/${idLead}`
        );

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ??
                'Error al enviar el indicador de escribiendo.'
            );
        }

        throw error;
    }
};