
export interface ICredencialesSipResponse {
  success: boolean;
  agentExtension: string;
  agentPassword: string;
  sipServer: string;
  sipPort: string;
  expirenIn: number;
}


export interface ICallRequest {
  agent: string;
  phone: string;
  idTrabajador: number;
}


export interface ICallResponse {
  id: string;
  name?: string;
  state?: string;
  phone: string;
  idRegistroLlamada: number;
  channelId: string;
}