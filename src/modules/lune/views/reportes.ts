import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import LuneTabs from '@/modules/lune/components/lunetabs.vue';

import type { IReporte } from '@/modules/lune/interfaces/lune.interfaces';
import { fechaCorta, haceDias, hoy, inicioDeMes, soles } from '@/modules/lune/interfaces/formato';

import { obtenerReporte } from '../actions/lune.action';

export default defineComponent({
  name: 'ReportesView',
  components: { LuneTabs },
  setup() {
    const reporte = ref<IReporte | null>(null);
    const filtros = reactive({ desde: inicioDeMes(), hasta: hoy() });
    const cargando = ref(false);
    const error = ref('');

    const cargar = async () => {
      cargando.value = true;
      error.value = '';
      try {
        reporte.value = await obtenerReporte({
          desde: filtros.desde || undefined,
          hasta: filtros.hasta || undefined,
        });
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'No se pudo cargar el reporte.';
      } finally {
        cargando.value = false;
      }
    };

    const aplicarRango = (rango: 'hoy' | 'semana' | 'mes') => {
      filtros.hasta = hoy();
      filtros.desde = rango === 'hoy' ? hoy() : rango === 'semana' ? haceDias(6) : inicioDeMes();
    };

    // Altura/ancho relativo de las barras (0% a 100%)
    const porcentaje = (valor: number, maximo: number) =>
      `${maximo > 0 ? Math.max((valor / maximo) * 100, 2) : 0}%`;

    const maxDia = computed(() => Math.max(0, ...(reporte.value?.ventas_por_dia.map((d) => d.ventas) ?? [])));
    const maxProducto = computed(() => Math.max(0, ...(reporte.value?.por_producto.map((p) => p.monto) ?? [])));
    const maxCategoria = computed(() =>
      Math.max(0, ...(reporte.value?.egresos_por_categoria.map((c) => c.monto) ?? []))
    );

    let temporizador: ReturnType<typeof setTimeout> | undefined;
    watch(filtros, () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(cargar, 300);
    });

    onMounted(cargar);
    onBeforeUnmount(() => clearTimeout(temporizador));

    return {
      reporte,
      filtros,
      cargando,
      error,
      aplicarRango,
      porcentaje,
      maxDia,
      maxProducto,
      maxCategoria,
      fechaCorta,
      soles,
    };
  },
});