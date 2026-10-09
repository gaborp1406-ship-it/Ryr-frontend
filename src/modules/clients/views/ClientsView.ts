import { computed, defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import type {
  IClientePotencial,
  IListarAsesoresResponse,
  IListarEtapasResponse,
  IListarOpcionesResponse,
  IListarProyectoResponse,
} from '../interfaces/clients.interface';
import {
  listarAsesores,
  listarClientesPotenciales,
  listarEtapas,
  listarOpciones,
  listarProyectos,
  reasignarLead,
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
    const etapas = ref<IListarEtapasResponse[]>([]);
    const filtroAsesor = ref<IComboOption | null>(null);
    const filtroProyecto = ref<IComboOption | null>(null);
    const filtroFuente = ref<IComboOption | null>(null);
    const filtroEtapa = ref<IComboOption | null>(null);
    const filtroFechaInicio = ref('');
    const filtroFechaFin = ref('');

    // La fase ya NO es un filtro "opcional": siempre hay una activa (1 o 2).
    // Arranca en Fase 1 al entrar a la vista.
    const filtroFase = ref<number>(1);

    // Ids de filas que se están "yendo" (para animar antes de quitarlas)
    const idsSaliendo = ref<Set<number>>(new Set());

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
    const queryEtapa = ref('');

    const abiertoAsesor = ref(false);
    const abiertoProyecto = ref(false);
    const abiertoFuente = ref(false);
    const abiertoEtapa = ref(false);

    // Carga las etapas de la fase activa
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

      filtroEtapa.value = null;
      queryEtapa.value = '';
      await cargarEtapas();

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

    const onInputEtapa = () => {
      abiertoEtapa.value = true;
      if (!queryEtapa.value) filtroEtapa.value = null;
    };

    const cerrarCombos = () => {
      abiertoAsesor.value = false;
      abiertoProyecto.value = false;
      abiertoFuente.value = false;
      abiertoEtapa.value = false;
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

    // silencioso = true: sin skeleton, sin errores en toast y sin volver a la página 1
    const cargarClientes = async (silencioso = false) => {
      if (!silencioso) cargando.value = true;

      try {
        clientes.value = await listarClientesPotenciales({
          busqueda: search.value.trim() || undefined,
          fecha_inicio: filtroFechaInicio.value || undefined,
          fecha_fin: filtroFechaFin.value || undefined,
          id_asesor: filtroAsesor.value?.id ?? null,
          id_proyecto: filtroProyecto.value?.id ?? null,
          id_fuente: filtroFuente.value?.id ?? null,
          id_fase: filtroFase.value,
          id_etapa: filtroEtapa.value?.id ?? null,
        });

        if (silencioso) {
          // solo retrocede si la página actual quedó fuera de rango
          if (paginaActual.value > totalPaginas.value) {
            paginaActual.value = totalPaginas.value;
          }
        } else {
          paginaActual.value = 1;
        }
      } catch (error: any) {
        if (!silencioso) toast.error(error.message);
      } finally {
        if (!silencioso) cargando.value = false;
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
      filtroEtapa.value = null;
      // OJO: filtroFase se deja intacto a propósito, "Limpiar filtros"
      // no debe quitar la fase activa (Fase 1 / Fase 2).

      filtroFechaInicio.value = '';
      filtroFechaFin.value = '';

      queryProyecto.value = '';
      queryFuente.value = '';
      queryEtapa.value = '';

      cargarClientes();
    };

    const hayFiltrosActivos = computed(
      () =>
        !!search.value ||
        (!authStore.isAgent && !!filtroAsesor.value) ||
        !!filtroProyecto.value ||
        !!filtroFuente.value ||
        !!filtroEtapa.value ||
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

    // =========================================================
    // REASIGNACIÓN (solo leads en etapa 1 = Asignación)
    // =========================================================
    const ETAPA_ASIGNACION = 1;

    const mostrarModalReasignar = ref(false);
    const reasignando = ref(false);
    const leadSeleccionado = ref<IClientePotencial | null>(null);

    const motivos = [
      { value: 'SIN_RESPUESTA', label: 'El asesor no respondió' },
      { value: 'CARGA_TRABAJO', label: 'Carga de trabajo' },
      { value: 'MANUAL', label: 'Otro motivo' },
    ];

    const formReasignar = reactive({
      id_asesor: '' as number | '',
      motivo: 'SIN_RESPUESTA',
      observacion: '',
    });

    // Solo admin / derivador pueden reasignar
    const puedeReasignar = computed(
      () => authStore.isAdmin || authStore.isDerivador
    );

    const mostrarBotonReasignar = (cliente: IClientePotencial) =>
      puedeReasignar.value && cliente.id_etapa === ETAPA_ASIGNACION;

    // No se ofrece el asesor actual del lead
    const asesoresDisponibles = computed(() =>
      asesores.value.filter(
        (a) => a.id_asesor !== leadSeleccionado.value?.id_asesor
      )
    );

    const abrirReasignar = (cliente: IClientePotencial) => {
      leadSeleccionado.value = cliente;
      formReasignar.id_asesor = '';
      formReasignar.motivo = 'SIN_RESPUESTA';
      formReasignar.observacion = '';
      mostrarModalReasignar.value = true;
    };

    const cerrarReasignar = () => {
      if (reasignando.value) return;
      mostrarModalReasignar.value = false;
      leadSeleccionado.value = null;
    };

    const confirmarReasignacion = async () => {
      if (reasignando.value || !leadSeleccionado.value) return;

      if (!formReasignar.id_asesor) {
        toast.warning('Seleccione el nuevo asesor.');
        return;
      }

      if (!authStore.idEmploye) {
        toast.error('No se encontró el usuario de sesión');
        return;
      }

      reasignando.value = true;

      try {
        const res = await reasignarLead({
          id_lead: leadSeleccionado.value.id_lead,
          id_asesor_nuevo: Number(formReasignar.id_asesor),
          usuario_modificacion: authStore.idEmploye,
          motivo: formReasignar.motivo,
          observacion: formReasignar.observacion.trim() || undefined,
        });

        toast.success(res.mensaje || 'Lead reasignado correctamente.');
        mostrarModalReasignar.value = false;
        leadSeleccionado.value = null;
        await cargarClientes(true);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        reasignando.value = false;
      }
    };

    // =========================================================
    // TIEMPO REAL
    // =========================================================

    // Quita la fila con animación
    const quitarLeadConEfecto = (idLead: number) => {
      idsSaliendo.value = new Set(idsSaliendo.value).add(idLead);

      setTimeout(() => {
        clientes.value = clientes.value.filter((c) => c.id_lead !== idLead);

        const nuevo = new Set(idsSaliendo.value);
        nuevo.delete(idLead);
        idsSaliendo.value = nuevo;

        if (paginaActual.value > totalPaginas.value) {
          paginaActual.value = totalPaginas.value;
        }
      }, 400);
    };

    // Le quitaron un lead a este asesor
    const onLeadPerdido = (payload: { id_lead: number }) => {
      const existe = clientes.value.some((c) => c.id_lead === payload.id_lead);
      if (!existe) return;

      quitarLeadConEfecto(payload.id_lead);
      toast.info('Un lead fue reasignado a otro asesor.');
    };

    const refrescarPorNotificacion = () => {
      cargarClientes(true);
    };

    onMounted(async () => {
      eventBus.on('refrescar-leads', refrescarPorNotificacion);
      eventBus.on('lead-lost', onLeadPerdido);
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

        await cargarEtapas();

        // filtroFase ya arranca en 1 por defecto (ver ref arriba).
        await cargarClientes();
      } catch (error: any) {
        toast.error(error.message);
      }
    });

    onUnmounted(() => {
      eventBus.off('refrescar-leads', refrescarPorNotificacion);
      eventBus.off('lead-lost', onLeadPerdido);
      if (debounceTimer) clearTimeout(debounceTimer);
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
      queryEtapa,
      abiertoAsesor,
      abiertoProyecto,
      abiertoFuente,
      abiertoEtapa,
      asesoresFiltrados,
      proyectosFiltrados,
      fuentesFiltradas,
      etapasFiltradas,
      filtroAsesor,
      filtroProyecto,
      filtroFuente,
      filtroEtapa,
      seleccionarAsesor,
      seleccionarProyecto,
      seleccionarFuente,
      seleccionarEtapa,
      onInputAsesor,
      onInputProyecto,
      onInputFuente,
      onInputEtapa,
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

      // tiempo real
      idsSaliendo,

      // reasignación
      mostrarModalReasignar,
      reasignando,
      leadSeleccionado,
      motivos,
      formReasignar,
      asesoresDisponibles,
      mostrarBotonReasignar,
      abrirReasignar,
      cerrarReasignar,
      confirmarReasignacion,
    };
  },
});