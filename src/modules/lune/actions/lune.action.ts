import { automatizateApiNest } from '@/api/automatizateApiNest';
import { isAxiosError } from 'axios';
import type {
  ICambiarEstadoPayload,
  ICatalogos,
  ICliente,
  IClientePayload,
  ICobroResultado,
  ICrearEgresoPayload,
  ICrearVentaPayload,
  ICuentasPorCobrar,
  IEgreso,
  IFiltroEgresos,
  IFiltroMovimientos,
  IFiltroReporte,
  IFiltroStock,
  IFiltroVentas,
  IMovimientoPayload,
  IMovimientoStock,
  IProducto,
  IProductoPayload,
  IReporte,
  IStock,
  IVenta,
} from '../interfaces/lune.interfaces'

/**
 * Ejecuta una llamada y traduce el error de Nest a un Error con mensaje legible.
 * (Nest devuelve `message` como string o como array cuando falla la validación.)
 */
const ejecutar = async <T>(
  llamada: () => Promise<{ data: T }>,
  mensajePorDefecto: string
): Promise<T> => {
  try {
    const { data } = await llamada();
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.message;
      throw new Error(
        Array.isArray(message) ? message.join(', ') : message ?? mensajePorDefecto
      );
    }
    throw error;
  }
};

// =====================================================================
// CATÁLOGOS (desplegables)
// =====================================================================
export const obtenerCatalogos = (): Promise<ICatalogos> =>
  ejecutar(() => automatizateApiNest.get('/lune/catalogos'), 'Error al cargar los catálogos.');

// =====================================================================
// PRODUCTOS
// =====================================================================
export const listarProductos = (todos = false): Promise<IProducto[]> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/productos', { params: { todos } }),
    'Error al listar los productos.'
  );

export const crearProducto = (payload: IProductoPayload): Promise<IProducto> =>
  ejecutar(() => automatizateApiNest.post('/lune/productos', payload), 'Error al crear el producto.');

export const actualizarProducto = (id: number, payload: IProductoPayload): Promise<IProducto> =>
  ejecutar(
    () => automatizateApiNest.put(`/lune/productos/${id}`, payload),
    'Error al actualizar el producto.'
  );

// =====================================================================
// CLIENTES
// =====================================================================
export const listarClientes = (buscar?: string): Promise<ICliente[]> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/clientes', { params: { buscar } }),
    'Error al listar los clientes.'
  );

export const crearCliente = (payload: IClientePayload): Promise<ICliente> =>
  ejecutar(() => automatizateApiNest.post('/lune/clientes', payload), 'Error al crear el cliente.');

export const actualizarCliente = (id: number, payload: IClientePayload): Promise<ICliente> =>
  ejecutar(
    () => automatizateApiNest.put(`/lune/clientes/${id}`, payload),
    'Error al actualizar el cliente.'
  );

/** Cobra de una vez toda la deuda pendiente de un cliente */
export const cobrarDeudaCliente = (id: number, metodoPago?: string): Promise<ICobroResultado> =>
  ejecutar(
    () => automatizateApiNest.patch(`/lune/clientes/${id}/cobrar`, { metodoPago }),
    'Error al cobrar al cliente.'
  );

// =====================================================================
// VENTAS (PEDIDOS)
// =====================================================================
export const listarVentas = (filtro: IFiltroVentas = {}): Promise<IVenta[]> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/ventas', { params: filtro }),
    'Error al listar las ventas.'
  );

/** Un pedido con todos sus productos */
export const obtenerVenta = (id: number): Promise<IVenta> =>
  ejecutar(() => automatizateApiNest.get(`/lune/ventas/${id}`), 'Error al cargar el pedido.');

export const registrarVenta = (payload: ICrearVentaPayload): Promise<IVenta> =>
  ejecutar(() => automatizateApiNest.post('/lune/ventas', payload), 'Error al registrar la venta.');

/** Cambia entre agendado / entregado (y opcionalmente reprograma la entrega) */
export const cambiarEstadoVenta = (id: number, payload: ICambiarEstadoPayload): Promise<IVenta> =>
  ejecutar(
    () => automatizateApiNest.patch(`/lune/ventas/${id}/estado`, payload),
    'Error al cambiar el estado del pedido.'
  );

/** Atajo: marca el pedido como entregado */
export const marcarVentaEntregada = (id: number): Promise<IVenta> =>
  ejecutar(
    () => automatizateApiNest.patch(`/lune/ventas/${id}/entregar`),
    'Error al marcar el pedido como entregado.'
  );

/** Marca UNA venta como pagada */
export const marcarVentaPagada = (id: number, metodoPago?: string): Promise<IVenta> =>
  ejecutar(
    () => automatizateApiNest.patch(`/lune/ventas/${id}/pagar`, { metodoPago }),
    'Error al marcar la venta como pagada.'
  );

export const eliminarVenta = (id: number): Promise<{ eliminado: boolean; id: number }> =>
  ejecutar(() => automatizateApiNest.delete(`/lune/ventas/${id}`), 'Error al eliminar la venta.');

/** Lo que te deben (reemplaza la hoja "Cuentas" del Excel) */
export const obtenerCuentasPorCobrar = (): Promise<ICuentasPorCobrar> =>
  ejecutar(() => automatizateApiNest.get('/lune/cuentas'), 'Error al cargar las cuentas por cobrar.');

// =====================================================================
// EGRESOS
// =====================================================================
export const listarEgresos = (filtro: IFiltroEgresos = {}): Promise<IEgreso[]> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/egresos', { params: filtro }),
    'Error al listar los egresos.'
  );

export const registrarEgreso = (payload: ICrearEgresoPayload): Promise<IEgreso> =>
  ejecutar(() => automatizateApiNest.post('/lune/egresos', payload), 'Error al registrar el egreso.');

export const eliminarEgreso = (id: number): Promise<{ eliminado: boolean; id: number }> =>
  ejecutar(() => automatizateApiNest.delete(`/lune/egresos/${id}`), 'Error al eliminar el egreso.');

// =====================================================================
// REPORTES
// =====================================================================
export const obtenerReporte = (filtro: IFiltroReporte = {}): Promise<IReporte> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/reportes', { params: filtro }),
    'Error al cargar el reporte.'
  );

  // =====================================================================
// STOCK
// =====================================================================
export const listarStock = (filtro: IFiltroStock = {}): Promise<IStock[]> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/stock', { params: filtro }),
    'Error al cargar el stock.'
  );

export const listarMovimientosStock = (filtro: IFiltroMovimientos = {}): Promise<IMovimientoStock[]> =>
  ejecutar(
    () => automatizateApiNest.get('/lune/stock/movimientos', { params: filtro }),
    'Error al cargar el historial.'
  );

export const registrarMovimientoStock = (payload: IMovimientoPayload): Promise<IStock> =>
  ejecutar(
    () => automatizateApiNest.post('/lune/stock/movimientos', payload),
    'Error al registrar el movimiento.'
  );

export const actualizarStockMinimo = (productoId: number, stockMinimo: number): Promise<IStock> =>
  ejecutar(
    () => automatizateApiNest.patch(`/lune/stock/${productoId}/minimo`, { stockMinimo }),
    'Error al actualizar el stock mínimo.'
  );