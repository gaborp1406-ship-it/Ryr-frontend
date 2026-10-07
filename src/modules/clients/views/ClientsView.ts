import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import type {
  IClientePotencial,
  IListarAsesoresResponse,
  IListarEtapasResponse, // NUEVO
  IListarOpcionesResponse,
  IListarProyectoResponse,
} from '../interfaces/clients.interface';
import {
  listarAsesores,
  listarClientesPotenciales,
  listarEtapas, // NUEVO
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
    const etapas = ref<IListarEtapasResponse[]>([]); // NUEVO
    const filtroAsesor = ref<IComboOption | null>(null);
    const filtroProyecto = ref<IComboOption | null>(null);
    const filtroFuente = ref<IComboOption | null>(null);
    const filtroEtapa = ref<IComboOption | null>(null); // NUEVO
    const filtroFechaInicio = ref('');
    const filtroFechaFin = ref('');

    // La fase ya NO es un filtro "opcional": siempre hay una activa (1 o 2).
    // Arranca en Fase 1 al entrar a la vista.
    const filtroFase = ref<number>(1);

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
    const queryEtapa = ref(''); // NUEVO

    const abiertoAsesor = ref(false);
    const abiertoProyecto = ref(false);
    const abiertoFuente = ref(false);
    const abiertoEtapa = ref(false); // NUEVO

    // NUEVO: carga las etapas de la fase activa
    const cargarEtapas = async () => {
      try {
        etapas.value = await listarEtapas(filtroFase.value);
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    // Al cambiar de fase, la etapa elegida ya no aplica: se limpia y se recargan las etapas.
    const seleccionarFase = async (fase: number) => {
      if (filtroFase.value === fase) return;
      filtroFase.value = fase;

      filtroEtapa.value = null; // NUEVO
      queryEtapa.value = ''; // NUEVO
      await cargarEtapas(); // NUEVO

      cargarClientes();
    };

    const opcionesAsesorCombo = computed<IComboOption[]>(() =>
      asesores.value.map((a) => ({ id: a.id_asesor, label: a.nombre }))
    );

    const opcionesProyectoCombo = computed<IComboOption[]>(() =>
      proyectos.value.map((p) => ({ id: p.id_proyecto, label: p.nombre }))
    );

    const opcionesFuenteCombo = computed<IComboOption[]>(() =>
      opcionesFuente.value.map((f) => ({ id: f.id, label: f.nombre }))
    );

    // NUEVO
    const opcionesEtapaCombo = computed<IComboOption[]>(() =>
      etapas.value.map((e) => ({ id: e.id, label: e.nombre }))
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

    // NUEVO
    const etapasFiltradas = computed(() => {
      const term = queryEtapa.value.trim().toLowerCase();
      if (!term) return opcionesEtapaCombo.value;
      return opcionesEtapaCombo.value.filter((o) =>
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

    // NUEVO
    const seleccionarEtapa = (opcion: IComboOption | null) => {
      filtroEtapa.value = opcion;
      queryEtapa.value = opcion?.label ?? '';
      abiertoEtapa.value = false;
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

    // NUEVO
    const onInputEtapa = () => {
      abiertoEtapa.value = true;
      if (!queryEtapa.value) filtroEtapa.value = null;
    };

    const cerrarCombos = () => {
      abiertoAsesor.value = false;
      abiertoProyecto.value = false;
      abiertoFuente.value = false;
      abiertoEtapa.value = false; // NUEVO
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
          id_fase: filtroFase.value,
          id_etapa: filtroEtapa.value?.id ?? null, // NUEVO
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
      filtroEtapa.value = null; // NUEVO
      // OJO: filtroFase se deja intacto a propósito, "Limpiar filtros"
      // no debe quitar la fase activa (Fase 1 / Fase 2).

      filtroFechaInicio.value = '';
      filtroFechaFin.value = '';

      queryProyecto.value = '';
      queryFuente.value = '';
      queryEtapa.value = ''; // NUEVO

      cargarClientes();
    };

    const hayFiltrosActivos = computed(
      () =>
        !!search.value ||
        (!authStore.isAgent && !!filtroAsesor.value) ||
        !!filtroProyecto.value ||
        !!filtroFuente.value ||
        !!filtroEtapa.value || // NUEVO
        !!filtroFechaInicio.value ||
        !!filtroFechaFin.value
      // filtroFase NO cuenta como "filtro activo": siempre hay uno seleccionado.
    );

    const verLead = (idLead: number) => {
      router.push({
        name: 'client-details',
        params: { id: idLead },
      });
    };

    const refrescarPorNotificacion = () => {
      cargarClientes();
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

        await cargarEtapas(); // NUEVO

        // filtroFase ya arranca en 1 por defecto (ver ref arriba).
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
      queryEtapa, // NUEVO
      abiertoAsesor,
      abiertoProyecto,
      abiertoFuente,
      abiertoEtapa, // NUEVO
      asesoresFiltrados,
      proyectosFiltrados,
      fuentesFiltradas,
      etapasFiltradas, // NUEVO
      filtroAsesor,
      filtroProyecto,
      filtroFuente,
      filtroEtapa, // NUEVO
      seleccionarAsesor,
      seleccionarProyecto,
      seleccionarFuente,
      seleccionarEtapa, // NUEVO
      onInputAsesor,
      onInputProyecto,
      onInputFuente,
      onInputEtapa, // NUEVO
      cerrarCombos,
      limpiarFiltros,
      hayFiltrosActivos,
      verLead,
      filtroFase,
      seleccionarFase,
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