// ------------------------------------------------------------- Catálogos
export type EstadoVenta = 'agendado' | 'entregado';

export interface IProducto {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

export interface IProductoPayload {
  nombre: string;
  precio: number;
  activo?: boolean;
}

export interface ICatalogos {
  productos: IProducto[];
  metodosPago: string[];
  categoriasEgreso: string[];
  socios: string[];
  estadosVenta: EstadoVenta[];
}

// -------------------------------------------------------------- Clientes
export interface ICliente {
  id: number;
  nombre: string;
  telefono: string | null;
  notas: string | null;
  pedidos: number;
  total_comprado: number;
  deuda: number;
  ultima_compra: string | null;
}

export interface IClientePayload {
  nombre: string;
  telefono?: string;
  notas?: string;
}

// ---------------------------------------------------------------- Ventas
/** Un producto dentro del pedido */
export interface IVentaItem {
  id: number;
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Un pedido (venta) con todos sus productos */
export interface IVenta {
  id: number;
  fecha: string;
  cliente: { id: number; nombre: string; telefono: string | null };
  monto: number;
  pagado: boolean;
  metodoPago: string | null;
  fechaPago: string | null;
  notas: string | null;
  estado: EstadoVenta;
  fechaEntrega: string | null;
  entregadoEn: string | null;
  items: IVentaItem[];
}

export interface IFiltroVentas {
  desde?: string;
  hasta?: string;
  cliente?: string;
  pagado?: boolean;
  estado?: EstadoVenta;
}

export interface IItemVentaPayload {
  productoId: number;
  cantidad: number;
  /** Si no se envía = precio actual del producto */
  precioUnitario?: number;
}

export interface ICrearVentaPayload {
  cliente: string;
  items: IItemVentaPayload[];
  /** Si no se envía = suma de (precio × cantidad) de los items */
  monto?: number;
  pagado?: boolean;
  metodoPago?: string;
  fecha?: string;
  notas?: string;
  /** Por defecto 'entregado' */
  estado?: EstadoVenta;
  /** Fecha programada de entrega (pedidos agendados) */
  fechaEntrega?: string;
}

export interface ICambiarEstadoPayload {
  estado: EstadoVenta;
  fechaEntrega?: string;
}

export interface ICuentaDetalleItem {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ICuentaDetalle {
  venta_id: number;
  fecha: string;
  monto: number;
  items: ICuentaDetalleItem[];
}

export interface ICuentaCliente {
  cliente_id: number;
  cliente: string;
  deuda: number;
  pedidos: number;
  desde: string;
  detalle: ICuentaDetalle[];
}

export interface ICuentasPorCobrar {
  total: number;
  clientes: ICuentaCliente[];
}

export interface ICobroResultado {
  ventas_cobradas: number;
  monto_cobrado: number;
}

// --------------------------------------------------------------- Egresos
export interface IEgreso {
  id: number;
  fecha: string;
  concepto: string;
  categoria: string;
  proveedor: string | null;
  metodo_pago: string | null;
  socio: string | null;
  monto: number;
}

export interface IFiltroEgresos {
  desde?: string;
  hasta?: string;
  categoria?: string;
}

export interface ICrearEgresoPayload {
  concepto: string;
  monto: number;
  categoria?: string;
  proveedor?: string;
  metodoPago?: string;
  socio?: string;
  fecha?: string;
}

// -------------------------------------------------------------- Reportes
export interface IReporteResumen {
  ventas: number;
  cobrado: number;
  por_cobrar: number;
  egresos: number;
  utilidad_caja: number;
  utilidad_proyectada: number;
  margen_pct: number;
  pedidos: number;
  unidades: number;
  ticket_promedio: number;
  deuda_total: number;
}

export interface IReporte {
  desde: string;
  hasta: string;
  resumen: IReporteResumen;
  por_producto: { producto: string; unidades: number; monto: number }[];
  ventas_por_dia: { fecha: string; ventas: number; cobrado: number }[];
  egresos_por_categoria: { categoria: string; monto: number }[];
  top_clientes: { cliente: string; pedidos: number; monto: number }[];
}

export interface IFiltroReporte {
  desde?: string;
  hasta?: string;
}

// ----------------------------------------------------------------- Stock
export type TipoMovimiento = 'conteo' | 'entrada' | 'ajuste';

export interface IStock {
  productoId: number;
  producto: string;
  activo: boolean;
  stockMinimo: number;
  stock: number;
  agendado: number;
  disponible: number;
  alerta: boolean;
}

export interface IMovimientoStock {
  clave: string;
  fecha: string;
  productoId: number;
  producto: string;
  tipo: TipoMovimiento | 'venta';
  cantidad: number;
  nota: string | null;
  ventaId: number | null;
  cliente: string | null;
}

export interface IFiltroStock {
  buscar?: string;
  soloAlertas?: boolean;
}

export interface IFiltroMovimientos {
  productoId?: number;
  desde?: string;
  hasta?: string;
}

export interface IMovimientoPayload {
  productoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  nota?: string;
}