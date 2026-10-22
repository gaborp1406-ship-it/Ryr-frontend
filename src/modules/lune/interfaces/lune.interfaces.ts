// Las respuestas del backend vienen en snake_case (tal como salen de las
// funciones de la BD). Los payloads que se envían van en camelCase (DTOs de Nest).

// ------------------------------------------------------------- Catálogos
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
export interface IVenta {
  id: number;
  fecha: string;
  cliente_id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  monto: number;
  pagado: boolean;
  metodo_pago: string | null;
  fecha_pago: string | null;
  notas: string | null;
}

export interface IFiltroVentas {
  desde?: string;
  hasta?: string;
  cliente?: string;
  pagado?: boolean;
}

export interface ICrearVentaPayload {
  cliente: string;
  productoId: number;
  cantidad: number;
  /** Si no se envía = precio del producto × cantidad */
  monto?: number;
  pagado?: boolean;
  metodoPago?: string;
  fecha?: string;
  notas?: string;
}

export interface ICuentaDetalle {
  venta_id: number;
  fecha: string;
  producto: string;
  cantidad: number;
  monto: number;
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