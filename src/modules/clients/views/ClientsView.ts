import { computed, defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import type {
  IClientePotencial,
  IListarAsesoresResponse,
  IListarOpcionesResponse,
  IListarProyectoResponse,
} from '../interfaces/clients.interface';
import {
  listarAsesores,
  listarClientesPotenciales,
  listarOpciones,
  listarProyectos,
} from '../actions/clients.action';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { eventBus } from '@/modules/common/utils/eventBus';
interface IComboOption {
  id: number;
  label: string;
}

export default defineComponent({
  setup() {
    const toast = useToast();
    const router = useRouter();
    const authStore = useAuthStore();
    const cargando = ref(true);
    const clientes = ref<IClientePotencial[]>([]);
    const search = ref('');
    const asesores = ref<IListarAsesoresResponse[]>([]);
    const proyectos = ref<IListarProyectoResponse[]>([]);
    const opcionesFuente = ref<IListarOpcionesResponse[]>([]);
    const filtroAsesor = ref<IComboOption | null>(null);
    const filtroProyecto = ref<IComboOption | null>(null);
    const filtroFuente = ref<IComboOption | null>(null);
    const filtroFechaInicio = ref('');
    const filtroFechaFin = ref('');

    const onCambioFecha = () => {

      if (
        filtroFechaInicio.value &&
        filtroFechaFin.value &&
        filtroFechaInicio.value > filtroFechaFin.value
      ) {
        toast.warning('La fecha inicio no puede ser mayor a la fecha fin.');
        return;
      }
      cargarClientes();
    };

    const queryAsesor = ref('');
    const queryProyecto = ref('');
    const queryFuente = ref('');

    const abiertoAsesor = ref(false);
    const abiertoProyecto = ref(false);
    const abiertoFuente = ref(false);

    const opcionesAsesorCombo = computed<IComboOption[]>(() =>
      asesores.value.map((a) => ({ id: a.id_asesor, label: a.nombre }))
    );

    const opcionesProyectoCombo = computed<IComboOption[]>(() =>
      proyectos.value.map((p) => ({ id: p.id_proyecto, label: p.nombre }))
    );

    const opcionesFuenteCombo = computed<IComboOption[]>(() =>
      opcionesFuente.value.map((f) => ({ id: f.id, label: f.nombre }))
    );

    const asesoresFiltrados = computed(() => {
      const term = queryAsesor.value.trim().toLowerCase();
      if (!term) return opcionesAsesorCombo.value;
      return opcionesAsesorCombo.value.filter((o) =>
        o.label.toLowerCase().includes(term)
      );
    });

    const proyectosFiltrados = computed(() => {
      const term = queryProyecto.value.trim().toLowerCase();
      if (!term) return opcionesProyectoCombo.value;
      return opcionesProyectoCombo.value.filter((o) =>
        o.label.toLowerCase().includes(term)
      );
    });

    const fuentesFiltradas = computed(() => {
      const term = queryFuente.value.trim().toLowerCase();
      if (!term) return opcionesFuenteCombo.value;
      return opcionesFuenteCombo.value.filter((o) =>
        o.label.toLowerCase().includes(term)
      );
    });

    const seleccionarAsesor = (opcion: IComboOption | null) => {
      filtroAsesor.value = opcion;
      queryAsesor.value = opcion?.label ?? '';
      abiertoAsesor.value = false;
      cargarClientes();
    };

    const seleccionarProyecto = (opcion: IComboOption | null) => {
      filtroProyecto.value = opcion;
      queryProyecto.value = opcion?.label ?? '';
      abiertoProyecto.value = false;
      cargarClientes();
    };

    const seleccionarFuente = (opcion: IComboOption | null) => {
      filtroFuente.value = opcion;
      queryFuente.value = opcion?.label ?? '';
      abiertoFuente.value = false;
      cargarClientes();
    };

    const onInputAsesor = () => {
      abiertoAsesor.value = true;
      if (!queryAsesor.value) filtroAsesor.value = null;
    };

    const onInputProyecto = () => {
      abiertoProyecto.value = true;
      if (!queryProyecto.value) filtroProyecto.value = null;
    };

    const onInputFuente = () => {
      abiertoFuente.value = true;
      if (!queryFuente.value) filtroFuente.value = null;
    };

    const cerrarCombos = () => {
      abiertoAsesor.value = false;
      abiertoProyecto.value = false;
      abiertoFuente.value = false;
    };

    const itemsPorPagina = 8;
    const paginaActual = ref(1);

    const totalPaginas = computed(() =>
      Math.max(1, Math.ceil(clientes.value.length / itemsPorPagina))
    );

    const clientesPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * itemsPorPagina;
      return clientes.value.slice(inicio, inicio + itemsPorPagina);
    });

    const paginasVisibles = computed(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;
      const paginas: (number | string)[] = [];

      if (total <= 5) {
        for (let i = 1; i <= total; i++) paginas.push(i);
        return paginas;
      }

      paginas.push(1);
      if (actual > 3) paginas.push('...');

      const inicioRango = Math.max(2, actual - 1);
      const finRango = Math.min(total - 1, actual + 1);

      for (let i = inicioRango; i <= finRango; i++) paginas.push(i);

      if (actual < total - 2) paginas.push('...');
      paginas.push(total);

      return paginas;
    });

    const irAPagina = (pagina: number | string) => {
      if (typeof pagina !== 'number') return;
      paginaActual.value = pagina;
    };

    const irPaginaAnterior = () => {
      if (paginaActual.value > 1) paginaActual.value--;
    };

    const irPaginaSiguiente = () => {
      if (paginaActual.value < totalPaginas.value) paginaActual.value++;
    };

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const cargarClientes = async () => {
      cargando.value = true;

      try {
        clientes.value = await listarClientesPotenciales({
          busqueda: search.value.trim() || undefined,
          fecha_inicio: filtroFechaInicio.value || undefined,
          fecha_fin: filtroFechaFin.value || undefined,
          id_asesor: filtroAsesor.value?.id ?? null,
          id_proyecto: filtroProyecto.value?.id ?? null,
          id_fuente: filtroFuente.value?.id ?? null,
        });

        paginaActual.value = 1;
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        cargando.value = false;
      }
    };

    const onBuscarTexto = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        cargarClientes();
      }, 350);
    };

    const limpiarFiltros = () => {
      search.value = '';
      if (!authStore.isAgent) {
        filtroAsesor.value = null;
        queryAsesor.value = '';
      }
      filtroProyecto.value = null;
      filtroFuente.value = null;
      filtroFechaInicio.value = '';
      filtroFechaFin.value = '';
      queryProyecto.value = '';
      queryFuente.value = '';
      cargarClientes();
    };
    const hayFiltrosActivos = computed(
      () =>
        !!search.value ||
        (!authStore.isAgent && !!filtroAsesor.value) ||
        !!filtroProyecto.value ||
        !!filtroFuente.value ||
        !!filtroFechaInicio.value ||
        !!filtroFechaFin.value
    );

    const verLead = (idLead: number) => {
      router.push({
        name: "client-details",
        params: { id: idLead },
      });
    };
    const refrescarPorNotificacion = () => {
      cargarClientes(); // o la función que ya tengas para recargar el listado
    };
    onMounted(async () => {
      eventBus.on('refrescar-leads', refrescarPorNotificacion);
      try {
        const [opciones, proyectosData, asesoresData] = await Promise.all([
          listarOpciones(1),
          listarProyectos(1),
          listarAsesores(),
        ]);

        opcionesFuente.value = opciones;
        proyectos.value = proyectosData;
        asesores.value = asesoresData;

        if (authStore.isAgent) {
          const idPropio = authStore.idEmploye ?? null;
          const propio = opcionesAsesorCombo.value.find((o) => o.id === idPropio) ?? null;
          filtroAsesor.value = propio;
          queryAsesor.value = propio?.label ?? '';
        }

        await cargarClientes();
      } catch (error: any) {
        toast.error(error.message);
      }
    });
    onUnmounted(() => {
      eventBus.off('refrescar-leads', refrescarPorNotificacion);
    });
    return {
      authStore,
      cargando,
      clientes,
      search,
      onBuscarTexto,
      filtroFechaInicio,
      filtroFechaFin,
      onCambioFecha,
      queryAsesor,
      queryProyecto,
      queryFuente,
      abiertoAsesor,
      abiertoProyecto,
      abiertoFuente,
      asesoresFiltrados,
      proyectosFiltrados,
      fuentesFiltradas,
      filtroAsesor,
      filtroProyecto,
      filtroFuente,
      seleccionarAsesor,
      seleccionarProyecto,
      seleccionarFuente,
      onInputAsesor,
      onInputProyecto,
      onInputFuente,
      cerrarCombos,
      limpiarFiltros,
      hayFiltrosActivos,
      verLead,
      clientesPaginados,
      paginaActual,
      totalPaginas,
      paginasVisibles,
      irAPagina,
      irPaginaAnterior,
      irPaginaSiguiente,
    };
  },
});