// src/modules/enviomasivo/actions/masivo.actions.ts
import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';
import type {
  IArchivoSubido,
  ICampaniaDetalle,
  ICampaniaResumen,
  ICrearCampaniaDto,
  ICrearCampaniaResp,
  IDestinatarioDto,
  IDestinatarioEstado,
  IFiltroDestinatarios,
  IOptout,
  IOptoutResp,
  IPlantilla,
  IReintentoResp,
  ICarga,
  TipoHeader,
} from '../interfaces/masivo.interface';

/** Convierte cualquier error de axios en un Error con el mensaje del backend */
const lanzar = (error: unknown, porDefecto: string): never => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : (msg ?? porDefecto));
  }
  throw error;
};

// ───────── Plantillas ─────────

export const listarPlantillas = async (): Promise<IPlantilla[]> => {
  try {
    const { data } = await automatizateApiNest.get('/campanias/plantillas');
    return data;
  } catch (error) {
    return lanzar(error, 'Error al listar las plantillas de Meta.');
  }
};

// ───────── Archivo del header (Cloudinary) ─────────

/**
 * Sube el video/imagen/PDF al backend, que lo manda a Cloudinary y devuelve la URL pública.
 * `onProgreso` recibe 0-100 mientras el archivo viaja hacia el servidor.
 */
export const subirArchivo = async (
  archivo: File,
  tipo: TipoHeader,
  onProgreso?: (porcentaje: number) => void,
  signal?: AbortSignal,
): Promise<IArchivoSubido> => {
  const fd = new FormData();
  fd.append('archivo', archivo);
  try {
    const { data } = await automatizateApiNest.post('/campanias/archivo', fd, {
      params: { tipo },
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5 * 60 * 1000,
      signal,
      onUploadProgress: (e) => {
        const total = e.total || archivo.size;
        if (total) onProgreso?.(Math.min(100, Math.round((e.loaded * 100) / total)));
      },
    });
    return data;
  } catch (error) {
    return lanzar(error, 'Error al subir el archivo.');
  }
};

// ───────── Campañas ─────────

export const listarCampanias = async (): Promise<ICampaniaResumen[]> => {
  try {
    const { data } = await automatizateApiNest.get('/campanias');
    return data;
  } catch (error) {
    return lanzar(error, 'Error al listar las campañas.');
  }
};

export const obtenerCampania = async (id: number | string): Promise<ICampaniaDetalle> => {
  try {
    const { data } = await automatizateApiNest.get(`/campanias/${id}`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al obtener la campaña.');
  }
};

export const crearCampania = async (dto: ICrearCampaniaDto): Promise<ICrearCampaniaResp> => {
  try {
    const { data } = await automatizateApiNest.post('/campanias', dto);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al crear la campaña.');
  }
};

// ───────── Destinatarios ─────────

export const listarDestinatarios = async (
  id: number | string,
  filtro: IFiltroDestinatarios = {},
): Promise<IDestinatarioEstado[]> => {
  try {
    const { data } = await automatizateApiNest.get(`/campanias/${id}/destinatarios`, {
      params: {
        estado: filtro.estado || undefined,
        pagina: filtro.pagina ?? 1,
        limite: filtro.limite ?? 50,
      },
    });
    return data;
  } catch (error) {
    return lanzar(error, 'Error al listar los destinatarios.');
  }
};

export const agregarDestinatarios = async (
  id: number | string,
  destinatarios: IDestinatarioDto[],
): Promise<ICarga> => {
  try {
    const { data } = await automatizateApiNest.post(`/campanias/${id}/destinatarios`, { destinatarios });
    return data;
  } catch (error) {
    return lanzar(error, 'Error al agregar destinatarios.');
  }
};

// ───────── Control ─────────

export const iniciarCampania = async (id: number | string): Promise<ICampaniaDetalle> => {
  try {
    const { data } = await automatizateApiNest.post(`/campanias/${id}/iniciar`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al iniciar la campaña.');
  }
};

export const pausarCampania = async (id: number | string): Promise<ICampaniaDetalle> => {
  try {
    const { data } = await automatizateApiNest.post(`/campanias/${id}/pausar`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al pausar la campaña.');
  }
};

export const cancelarCampania = async (id: number | string): Promise<ICampaniaDetalle> => {
  try {
    const { data } = await automatizateApiNest.post(`/campanias/${id}/cancelar`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al cancelar la campaña.');
  }
};

export const reintentarFallidos = async (id: number | string): Promise<IReintentoResp> => {
  try {
    const { data } = await automatizateApiNest.post(`/campanias/${id}/reintentar-fallidos`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al reintentar los fallidos.');
  }
};

// ───────── Lista de exclusión ─────────

export const listarOptout = async (): Promise<IOptout[]> => {
  try {
    const { data } = await automatizateApiNest.get('/campanias/optout');
    return data;
  } catch (error) {
    return lanzar(error, 'Error al listar la lista de exclusión.');
  }
};

export const agregarOptout = async (telefono: string): Promise<IOptoutResp> => {
  try {
    const { data } = await automatizateApiNest.post(`/campanias/optout/${encodeURIComponent(telefono)}`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al agregar el teléfono a la lista de exclusión.');
  }
};

export const quitarOptout = async (telefono: string): Promise<IOptoutResp> => {
  try {
    const { data } = await automatizateApiNest.delete(`/campanias/optout/${encodeURIComponent(telefono)}`);
    return data;
  } catch (error) {
    return lanzar(error, 'Error al quitar el teléfono de la lista de exclusión.');
  }
};