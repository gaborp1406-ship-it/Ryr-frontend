// src/modules/clients/actions/whatsapp.action.ts
import axios from 'axios';

/**
 * ⚠️ Si ya tienes una instancia de axios en tu proyecto (con baseURL y token),
 * borra este bloque y importa la tuya:  import api from '@/api/...';
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    withCredentials: true,
});
// Si usas JWT en header, descomenta y ajusta:
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

export type EstadoMensajeWsp = 'ENVIADO' | 'ENTREGADO' | 'LEIDO' | 'FALLIDO' | 'RECIBIDO';

export interface MensajeWsp {
    id: string;
    direccion: 'ENTRANTE' | 'SALIENTE';
    tipo: string;
    contenido: string;
    estado: EstadoMensajeWsp;
    error: string | null;
    fecha_creacion: string;
    tiene_archivo?: boolean;       // archivo guardado en el servidor (se pide con obtenerArchivoBlob)
    media_url?: string | null;     // enlace público (video/imagen de plantilla)
    media_mime?: string | null;
    media_nombre?: string | null;
}

export interface ConversacionWsp {
    ventana_abierta: boolean;
    mensajes: MensajeWsp[];
}

export async function obtenerConversacion(idLead: number): Promise<ConversacionWsp> {
    const { data } = await api.get<ConversacionWsp>(`/whatsapp/leads/${idLead}/mensajes`);
    return data;
}

export async function enviarTexto(idLead: number, texto: string): Promise<MensajeWsp> {
    const { data } = await api.post<MensajeWsp>(`/whatsapp/leads/${idLead}/mensajes`, { texto });
    return data;
}

export async function enviarPlantilla(
    idLead: number,
    nombre: string,
    idioma: string,
    parametros: string[],
): Promise<MensajeWsp> {
    const { data } = await api.post<MensajeWsp>(`/whatsapp/leads/${idLead}/plantilla`, {
        nombre,
        idioma,
        parametros,
    });
    return data;
}

/** Saludo con un clic: el backend arma cliente, asesor y empresa desde el lead */
export async function enviarSaludo(idLead: number): Promise<MensajeWsp> {
    const { data } = await api.post<MensajeWsp>(`/whatsapp/leads/${idLead}/saludo`);
    return data;
}

/** Envía una imagen, video o documento en medio del chat (el texto va como comentario) */
export async function enviarArchivo(idLead: number, archivo: File, caption = ''): Promise<MensajeWsp> {
    const form = new FormData();
    form.append('archivo', archivo);
    if (caption.trim()) form.append('caption', caption.trim());
    const { data } = await api.post<MensajeWsp>(`/whatsapp/leads/${idLead}/archivo`, form);
    return data;
}

/** Descarga el archivo de un mensaje (pasa por tu autenticación, por eso se pide como blob) */
export async function obtenerArchivoBlob(idMensaje: string | number): Promise<Blob> {
    const { data } = await api.get(`/whatsapp/mensajes/${idMensaje}/archivo`, { responseType: 'blob' });
    return data as Blob;
}