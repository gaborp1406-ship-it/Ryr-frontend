export type EstadoWhatsappMensaje =
  | 'enviado'
  | 'entregado'
  | 'leido'
  | 'fallido';

export interface IWhatsappMensajeResponse {
  id: number;
  id_lead: number;
  numero_whatsapp: string;
  tipo_mensaje: 'entrante' | 'saliente';
  mensaje: string | null;
  wa_message_id: string;
  fecha_mensaje: string;
  estado?: EstadoWhatsappMensaje;
  fecha_entregado?: string | null;
  fecha_leido?: string | null;
  error_detalle?: string | null;
}