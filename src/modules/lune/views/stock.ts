import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import LuneTabs from '@/modules/lune/components/lunetabs.vue';
import {
  actualizarStockMinimo,
  listarMovimientosStock,
  listarStock,
  registrarMovimientoStock,
} from '@/modules/lune/actions/lune.action';
import type {
  IMovimientoStock,
  IStock,
  TipoMovimiento,
} from '@/modules/lune/interfaces/lune.interfaces';

const textosTipo: Record<TipoMovimiento, { titulo: string; etiqueta: string; ayuda: string }> = {
  entrada: {
    titulo: 'Registrar entrada',
    etiqueta: 'Unidades que ingresan',
    ayuda: 'Producción o compra: suma al stock.',
  },
  ajuste: {
    titulo: 'Registrar ajuste',
    etiqueta: 'Cantidad (+ suma, − resta)',
    ayuda: 'Ej: -2 por merma, +1 por corrección.',
  },
  conteo: {
    titulo: 'Registrar conteo físico',
    etiqueta: 'Cantidad total que tienes ahora',
    ayuda: 'Fija el stock exacto desde este momento.',
  },
};

export default defineComponent({
  name: 'StockView',
  components: { LuneTabs },
  setup() {
    const stock = ref<IStock[]>([]);
    const filtros = reactive({ buscar: '', soloAlertas: false });

    const cargando = ref(false);
    const guardando = ref(false);
    const mensaje = ref<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    const movimiento = reactive({
      abierto: false,
      productoId: 0,
      producto: '',
      tipo: 'entrada' as TipoMovimiento,
      cantidad: '' as string | number,
      nota: '',
    });

    const historial = reactive({
      abierto: false,
      cargando: false,
      producto: '',
      movimientos: [] as IMovimientoStock[],
    });

    const resumen = computed(() => ({
      productos: stock.value.length,
      alertas: stock.value.filter((s) => s.alerta).length,
      agendado: stock.value.reduce((t, s) => t + s.agendado, 0),
    }));

    // ------------------------------------------------------------ avisos
    let temporizadorMensaje: ReturnType<typeof setTimeout> | undefined;
    const mostrar = (tipo: 'ok' | 'error', texto: string) => {
      mensaje.value = { tipo, texto };
      clearTimeout(temporizadorMensaje);
      temporizadorMensaje = setTimeout(() => (mensaje.value = null), 5000);
    };
    const textoError = (e: unknown, porDefecto: string) => (e instanceof Error ? e.message : porDefecto);

    // ------------------------------------------------------------- helpers
    const semaforo = (s: IStock) => {
      if (s.stock <= 0) return { texto: 'Sin stock', clase: 'bg-rose-50 text-rose-700' };
      if (s.alerta) return { texto: 'Stock bajo', clase: 'bg-amber-50 text-amber-700' };
      return { texto: 'OK', clase: 'bg-emerald-50 text-emerald-700' };
    };

    const etiquetaMovimiento = (tipo: IMovimientoStock['tipo']) => {
      switch (tipo) {
        case 'entrada': return { texto: 'Entrada', clase: 'bg-emerald-50 text-emerald-700' };
        case 'ajuste': return { texto: 'Ajuste', clase: 'bg-amber-50 text-amber-700' };
        case 'conteo': return { texto: 'Conteo', clase: 'bg-sky-50 text-sky-700' };
        default: return { texto: 'Venta', clase: 'bg-zinc-100 text-zinc-700' };
      }
    };

    const fechaHora = (iso: string) =>
      new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });

    // ------------------------------------------------------------- cargas
    const cargar = async () => {
      cargando.value = true;
      try {
        stock.value = await listarStock({
          buscar: filtros.buscar.trim() || undefined,
          soloAlertas: filtros.soloAlertas || undefined,
        });
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo cargar el stock.'));
      } finally {
        cargando.value = false;
      }
    };

    // ------------------------------------------------------------ acciones
    const abrirMovimiento = (s: IStock, tipo: TipoMovimiento) => {
      movimiento.productoId = s.productoId;
      movimiento.producto = s.producto;
      movimiento.tipo = tipo;
      movimiento.cantidad = '';
      movimiento.nota = '';
      movimiento.abierto = true;
    };
    const cerrarMovimiento = () => (movimiento.abierto = false);

    const guardarMovimiento = async () => {
      guardando.value = true;
      try {
        await registrarMovimientoStock({
          productoId: movimiento.productoId,
          tipo: movimiento.tipo,
          cantidad: Math.trunc(Number(movimiento.cantidad)),
          nota: movimiento.nota || undefined,
        });
        mostrar('ok', `${textosTipo[movimiento.tipo].titulo.replace('Registrar ', '')} guardado en ${movimiento.producto}.`);
        movimiento.abierto = false;
        await cargar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo guardar el movimiento.'));
      } finally {
        guardando.value = false;
      }
    };

   const cambiarMinimo = async (s: IStock, evento: Event) => {
  const valor = (evento.target as HTMLInputElement).value;
  const minimo = Math.trunc(Number(valor));
  if (!Number.isFinite(minimo) || minimo < 0 || minimo === s.stockMinimo) {
    await cargar(); // restaura el valor mostrado
    return;
  }
  try {
    await actualizarStockMinimo(s.productoId, minimo);
    mostrar('ok', `Mínimo de ${s.producto} actualizado.`);
  } catch (e) {
    mostrar('error', textoError(e, 'No se pudo actualizar el mínimo.'));
  }
  await cargar();
};


    const abrirHistorial = async (s: IStock) => {
      historial.abierto = true;
      historial.cargando = true;
      historial.producto = s.producto;
      historial.movimientos = [];
      try {
        historial.movimientos = await listarMovimientosStock({ productoId: s.productoId });
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo cargar el historial.'));
        historial.abierto = false;
      } finally {
        historial.cargando = false;
      }
    };
    const cerrarHistorial = () => (historial.abierto = false);

    // ----------------------------------------------------------- ciclo de vida
    let temporizadorFiltros: ReturnType<typeof setTimeout> | undefined;
    watch(filtros, () => {
      clearTimeout(temporizadorFiltros);
      temporizadorFiltros = setTimeout(cargar, 300);
    });

    onMounted(cargar);

    onBeforeUnmount(() => {
      clearTimeout(temporizadorMensaje);
      clearTimeout(temporizadorFiltros);
    });

    return {
      stock,
      filtros,
      cargando,
      guardando,
      mensaje,
      resumen,
      movimiento,
      historial,
      textosTipo,
      semaforo,
      etiquetaMovimiento,
      fechaHora,
      abrirMovimiento,
      cerrarMovimiento,
      guardarMovimiento,
      cambiarMinimo,
      abrirHistorial,
      cerrarHistorial,
    };
  },
});