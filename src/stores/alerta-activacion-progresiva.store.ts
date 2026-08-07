import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface VentaAlertaProgresiva {
  nombre_cliente: string;
  terminal_producto: string;
  gpv_m0: number;
  gpv_m1?: number;
  gpv_m2?: number;
  fecha_venta: string;
  dias_transcurridos: number;
  nivel: 'leve' | 'critico';
  nombre_trabajador?: string;
  nombre_supervisor?: string; 
}

export const useAlertaActivacionProgresivaStore = defineStore('alertaActivacionProgresiva', () => {
  const mostrar = ref(false);
  const ventasLeve = ref<VentaAlertaProgresiva[]>([]);
  const ventasCritico = ref<VentaAlertaProgresiva[]>([]);

  const disparar = (leve: VentaAlertaProgresiva[], critico: VentaAlertaProgresiva[]) => {
    if (!leve.length && !critico.length) return;
    ventasLeve.value = leve;
    ventasCritico.value = critico;
    mostrar.value = true;
  };

  const cerrar = () => {
    mostrar.value = false;
    ventasLeve.value = [];
    ventasCritico.value = [];
  };

  return { mostrar, ventasLeve, ventasCritico, disparar, cerrar };
});
