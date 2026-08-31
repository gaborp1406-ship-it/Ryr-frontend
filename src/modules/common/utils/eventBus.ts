import mitt from 'mitt';

type Eventos = {
  'refrescar-leads': number; // mandamos el id_lead por si lo quieres usar
};

export const eventBus = mitt<Eventos>();