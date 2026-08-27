
export interface ICredencialesSipResponse {
  success: boolean;
  sipUsername: string;
  sipPassword: string;
  sipServer: string;
  sipPort: string;
  expirenIn: number;
}


export interface ICallRequest {
  agent: string;
  phone: string;
  idTrabajador: number;
  id_etapa_lead: number;
  tipo_historial: number
}


export interface ICallResponse {
  id: string;
  name?: string;
  state?: string;
  phone: string;
  idRegistroLlamada: number;
  channelId: string;
}