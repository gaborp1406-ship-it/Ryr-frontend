

export interface ICredencialesSipResponse {
  success: boolean;
  agentExtension: string;
  sipUsername: string;
  sipPassword: string;
  sipServer: string;
  sipPort: string;
  expirenIn: number;
}


export interface IHorarioProcesoSaliente {
  id: number;
  horario_inicio: string;
  horario_fin: string;
  id_dia_semana: number;
  dia_semana: string;
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