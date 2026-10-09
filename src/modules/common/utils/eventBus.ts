import mitt from 'mitt';

type Eventos = {
  'refrescar-leads': number; // id_lead por si lo quieres usar
  'lead-lost': { id_lead: number }; // el asesor perdió este lead (reasignado)
};

export const eventBus = mitt<Eventos>();