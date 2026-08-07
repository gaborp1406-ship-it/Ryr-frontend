import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface VentaAlerta {
  nombre_cliente: string;
  terminal_producto: string;
  gpv_m0: string;
  trxs_m0: string;
  doc_cliente?: string;
  fecha_afiliacion?: string;
}

export interface GrupoAlerta {
  nombre_promotor: string;
  ventas: VentaAlerta[];
}

export const useAlertaMovimientoStore = defineStore('alertaMovimiento', () => {
  const mostrar = ref(false);
  const grupos = ref<GrupoAlerta[]>([]);

  const disparar = (ventas: {
    nombre_promotor?: string;
    dni_promotor?: string;
    nombre_cliente?: string;
    terminal_producto?: string;
    fl_m0?: string;
    op_m0?: string;
    doc_cliente?: string;
    fecha_afiliacion?: string;
  }[]) => {
    const filtradas = ventas.filter((v) => Number(v.fl_m0 || 0) <= 10);
    if (!filtradas.length) return;

    const porPromotor = new Map<string, typeof filtradas>();
    filtradas.forEach((sale) => {
      const key = sale.nombre_promotor || sale.dni_promotor || 'Desconocido';
      if (!porPromotor.has(key)) porPromotor.set(key, []);
      porPromotor.get(key)!.push(sale);
    });

    grupos.value = Array.from(porPromotor.entries()).map(([nombre_promotor, items]) => ({
      nombre_promotor,
      ventas: items.map((v) => ({
        nombre_cliente:    v.nombre_cliente    || '-',
        terminal_producto: v.terminal_producto || '-',
        gpv_m0:            v.fl_m0             || '0',
        trxs_m0:           v.op_m0             || '0',
        doc_cliente:       v.doc_cliente       || '-',
        fecha_afiliacion:  v.fecha_afiliacion  || '-',
      })),
    }));

    mostrar.value = true;
  };

  const cerrar = () => {
    mostrar.value = false;
    grupos.value = [];
  };

  return { mostrar, grupos, disparar, cerrar };
});