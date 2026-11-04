import type { IWhatsappMensajeResponse } from "../interfaces/whastsapp.interface";
import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';

export interface IIndicadorResponse {
    ok: boolean;
    detalle?: string;
}

const mensajeDeError = (error: unknown, porDefecto: string): never => {
    if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? porDefecto);
    }
    throw error;
};

// El back responde { ok, motivo } o { ok, error }; el front lo unifica en "detalle"
const normalizarIndicador = (data: any): IIndicadorResponse => ({
    ok: !!data?.ok,
    detalle: data?.detalle ?? data?.motivo ?? data?.error,
});

// GET /whatsapp/leads/:idLead/mensajes
export const listarMensajesWhatsappLead = async (
    idLead: number
): Promise<IWhatsappMensajeResponse[]> => {
    try {
        const { data } = await automatizateApiNest.get(
            `/whatsapp/leads/${idLead}/mensajes`
        );
        return data;
    } catch (error) {
        return mensajeDeError(error, 'Error al listar los mensajes de WhatsApp del lead.');
    }
};

// POST /whatsapp/leads/enviar  { id_lead, mensaje }
export const enviarMensajeWhatsappLead = async (
    idLead: number,
    mensaje: string
): Promise<IWhatsappMensajeResponse> => {
    try {
        const { data } = await automatizateApiNest.post(
            `/whatsapp/leads/enviar`,
            { id_lead: idLead, mensaje }
        );
        return data;
    } catch (error) {
        return mensajeDeError(error, 'Error al enviar el mensaje de WhatsApp.');
    }
};

// POST /whatsapp/leads/:idLead/indicador  { escribiendo: false }
// Marca como leído el último mensaje entrante (✓✓ azul para el cliente)
export const marcarLeidoWhatsappLead = async (
    idLead: number
): Promise<IIndicadorResponse> => {
    try {
        const { data } = await automatizateApiNest.post(
            `/whatsapp/leads/${idLead}/indicador`,
            { escribiendo: false }
        );
        return normalizarIndicador(data);
    } catch (error) {
        return mensajeDeError(error, 'Error al marcar el chat como leído.');
    }
};

// POST /whatsapp/leads/:idLead/indicador  { escribiendo: true }
// Marca como leído y muestra "escribiendo..." al cliente
export const escribiendoWhatsappLead = async (
    idLead: number
): Promise<IIndicadorResponse> => {
    try {
        const { data } = await automatizateApiNest.post(
            `/whatsapp/leads/${idLead}/indicador`,
            { escribiendo: true }
        );
        return normalizarIndicador(data);
    } catch (error) {
        return mensajeDeError(error, 'Error al enviar el indicador de escribiendo.');
    }
};