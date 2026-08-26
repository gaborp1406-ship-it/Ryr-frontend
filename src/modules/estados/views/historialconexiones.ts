import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import {
  listarEstadosConexion,
  listarEstadoActualTrabajadores,
  historialEstadoTrabajador,
} from '@/modules/estados/actions/estados.actions';
import type {
  IEstadoConexion,
  IEstadoActualTrabajador,
  IHistorialEstadoTrabajador,
} from '@/modules/estados/interfaces/estados.interface';

export default defineComponent({
  setup() {
    const authStore = useAuthStore();

    const estados = ref<IEstadoConexion[]>([]);
    const asesores = ref<IEstadoActualTrabajador[]>([]);
    const isLoadingAsesores = ref(false);
    const filtroEstado = ref<number | null>(null);
    const asesorSeleccionado = ref<IEstadoActualTrabajador | null>(null);
    const historial = ref<IHistorialEstadoTrabajador[]>([]);
    const isLoadingHistorial = ref(false);
    const filtroHistorialEstado = ref<number | null>(null);
    const filtroFechaDesde = ref('');
    const filtroFechaHasta = ref('');

    const now = ref(Date.now());
    let intervalId: number | undefined;


    function parseLimaTimestampToMs(fecha: string): number {
      if (!fecha || typeof fecha !== 'string') {
        console.warn('Fecha inválida:', fecha);
        return Date.now();
      }
      const match = fecha.match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
      if (!match) {
        console.warn('Formato de fecha no reconocido:', fecha);
        return Date.now();
      }

      const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = match;
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const second = parseInt(secondStr, 10);

      // Validar
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        console.warn('Error parseando fecha:', { year, month, day, hour, minute, second });
        return Date.now();
      }

      const utcMs = Date.UTC(year, month - 1, day, hour, minute, second);

      return utcMs + 5 * 60 * 60 * 1000;
    }

    function formatDuration(ms: number): string {
      const total = Math.max(0, Math.floor(ms / 1000));
      const dias = Math.floor(total / 86400);
      const horas = Math.floor((total % 86400) / 3600);
      const minutos = Math.floor((total % 3600) / 60);
      const segundos = total % 60;

      if (dias > 0) return `${dias}d ${horas}h ${minutos}m`;
      if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
      if (minutos > 0) return `${minutos}m ${segundos}s`;
      return `${segundos}s`;
    }

    function formatFecha(fecha: string | null): string {
      if (!fecha) return '—';

      try {
        const ms = parseLimaTimestampToMs(fecha);
        if (isNaN(ms)) return 'Invalid Date';

        const date = new Date(ms);
        return new Intl.DateTimeFormat('es-PE', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'America/Lima', 
        }).format(date);
      } catch (error) {
        console.error('Error formateando fecha:', fecha, error);
        return 'Invalid Date';
      }
    }
    function tiempoEnVivo(fechaInicio: string): string {
      try {
        const inicio = parseLimaTimestampToMs(fechaInicio);
        if (isNaN(inicio)) return '—';
        return formatDuration(now.value - inicio);
      } catch (error) {
        console.error('Error calculando tiempo en vivo:', error);
        return '—';
      }
    }

    function tiempoHistorial(item: IHistorialEstadoTrabajador): string {
      try {
        const inicio = parseLimaTimestampToMs(item.fecha_inicio);
        const fin = item.fecha_fin ? parseLimaTimestampToMs(item.fecha_fin) : now.value;

        if (isNaN(inicio) || isNaN(fin)) return '—';

        return formatDuration(fin - inicio);
      } catch (error) {
        console.error('Error calculando tiempo historial:', error);
        return '—';
      }
    }

    const asesoresFiltrados = computed(() => {
      if (!filtroEstado.value) return asesores.value;
      return asesores.value.filter((a) => a.id_estado === filtroEstado.value);
    });

    const conteoPorEstado = computed(() => {
      const mapa = new Map<number, number>();
      asesores.value.forEach((a) => {
        mapa.set(a.id_estado, (mapa.get(a.id_estado) ?? 0) + 1);
      });
      return mapa;
    });

    async function cargarEstados() {
      try {
        estados.value = await listarEstadosConexion();
      } catch (error) {
        console.error('Error al cargar estados de conexión:', error);
      }
    }

    async function cargarAsesores() {
      isLoadingAsesores.value = true;
      try {
        asesores.value = await listarEstadoActualTrabajadores();
        if (asesorSeleccionado.value) {
          await cargarHistorial();
        }
      } catch (error) {
        console.error('Error al cargar el estado actual de los asesores:', error);
      } finally {
        isLoadingAsesores.value = false;
      }
    }

    async function cargarHistorial() {
      if (!asesorSeleccionado.value) return;
      isLoadingHistorial.value = true;
      try {
        historial.value = await historialEstadoTrabajador(
          asesorSeleccionado.value.id_trabajador,
          {
            id_estado: filtroHistorialEstado.value ?? undefined,
            fecha_desde: filtroFechaDesde.value || undefined,
            fecha_hasta: filtroFechaHasta.value || undefined,
          }
        );
      } catch (error) {
        console.error('Error al cargar el historial:', error);
      } finally {
        isLoadingHistorial.value = false;
      }
    }

    function verHistorial(asesor: IEstadoActualTrabajador) {
      asesorSeleccionado.value = asesor;
      filtroHistorialEstado.value = null;
      filtroFechaDesde.value = '';
      filtroFechaHasta.value = '';
      cargarHistorial();

      requestAnimationFrame(() => {
        document.getElementById('panel-historial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    function cerrarHistorial() {
      asesorSeleccionado.value = null;
      historial.value = [];
    }

    function limpiarFiltrosHistorial() {
      filtroHistorialEstado.value = null;
      filtroFechaDesde.value = '';
      filtroFechaHasta.value = '';
      cargarHistorial();
    }

    watch(filtroEstado, () => {
    });

    onMounted(() => {
      cargarEstados();
      cargarAsesores();
      intervalId = window.setInterval(() => {
        now.value = Date.now();
      }, 1000);
    });

    onBeforeUnmount(() => {
      if (intervalId) window.clearInterval(intervalId);
    });

    return {
      authStore,
      estados,
      asesores,
      asesoresFiltrados,
      conteoPorEstado,
      isLoadingAsesores,
      filtroEstado,
      asesorSeleccionado,
      historial,
      isLoadingHistorial,
      filtroHistorialEstado,
      filtroFechaDesde,
      filtroFechaHasta,
      tiempoEnVivo,
      tiempoHistorial,
      formatFecha,
      cargarAsesores,
      verHistorial,
      cerrarHistorial,
      limpiarFiltrosHistorial,
      cargarHistorial,
    };
  },
});