import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from 'vue';

import DashboardComercial from './DashboardComercial.vue';
import DashboardContactabilidad from './DashboardContactabilidad.vue';
import DashboardCierre from './DashboardCierre.vue';

import {
  contarActividadesDashboard,
  contarDesistimientosDashboard,
  contarLeadsAtendidosDashboard,
  contarLeadsPorEtapa,
  contarLeadsPorFase,
} from '../actions/home.actions';
import { obtenerLeadsContactadosAsesorDashboard } from '../actions/dashboardContabilidad.js';
import { useAuthStore } from '@/modules/auth/stores/auth.store.js';


type DashboardTab =
  | 'general'
  | 'comercial'
  | 'contactabilidad'
  | 'cierres';

interface Kpi {
  label: string;
  value: string;
  trend: number;
  description: string;
  icon: 'users' | 'target' | 'calendar' | 'check';
  colorClass: string;
}

interface LeadEtapa {
  id_etapa: number;
  etapa: string;
  cantidad: number;
}

interface ActividadDashboard {
  fecha: string;
  dia_semana: string;
  id_tipo_actividad: number;
  tipo_actividad: string;
  estado: number;
  estado_nombre: string;
  cantidad: number | string;
}

interface Desistimiento {
  id_etapa: number;
  etapa: string;
  motivo: number;
  motivo_nombre: string;
  cantidad: number;
}

interface LeadAtendido {
  tipo: number;
  estado: string;
  cantidad: number;
}

interface AsesorOpcion {
  id_asesor: number;
  asesor: string;
}

type ActividadGraficoKey =
  | 'visitas_pendientes'
  | 'videollamadas_pendientes'
  | 'visitas_realizadas'
  | 'videollamadas_realizadas';

export interface ActividadGrafico {
  key: ActividadGraficoKey;
  titulo: string;
  subtitulo: string;
  tipo: number;
  estado: number;
  color: string;
  colorIcono: string;
}

export interface DesistimientoPieItem {
  id: string;
  nombre: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export default defineComponent({
  name: 'DashboardAllView',

  components: {
    DashboardComercial,
    DashboardContactabilidad,
    DashboardCierre,
  },

  setup() {
    // =========================================================
    // AUTH STORE
    // =========================================================
    const authStore = useAuthStore();
    const esAgent = computed(() => authStore.isAgent);
    const idEmpleadoDelAgent = computed(() => authStore.idEmploye);

    const activeTab = ref<DashboardTab>('general');

    const tabs = [
      {
        id: 'general' as DashboardTab,
        label: 'General',
      },
      {
        id: 'comercial' as DashboardTab,
        label: 'Comercial',
      },
      {
        id: 'contactabilidad' as DashboardTab,
        label: 'Contactabilidad',
      },
      {
        id: 'cierres' as DashboardTab,
        label: 'Cierres',
      },
    ];

    const titulosPorTab: Record<DashboardTab, string> = {
      general: 'Resumen general',
      comercial: 'Dashboard Comercial',
      contactabilidad: 'Dashboard de Contactabilidad',
      cierres: 'Dashboard de Cierres',
    };

    const tituloActivo = computed(
      () => titulosPorTab[activeTab.value],
    );

    // =========================================================
    // FILTRO DE FECHAS
    // =========================================================

    const fechaInicio = ref<string>('');
    const fechaFin = ref<string>('');

    // =========================================================
    // FILTRO DE ASESOR
    // =========================================================

    // Se guarda como string porque así lo maneja el <select v-model>
    const idAsesor = ref<string>('');

    const asesores = ref<AsesorOpcion[]>([]);

    const cargandoAsesores = ref(false);

    // Valor numérico (o null) listo para pasar a las APIs / props
    const idAsesorNumerico = computed<number | null>(() => {
      if (!idAsesor.value) {
        return null;
      }

      const valor = Number(idAsesor.value);

      return Number.isInteger(valor) ? valor : null;
    });

    const cargarAsesores = async () => {
      try {
        cargandoAsesores.value = true;

        const response =
          await obtenerLeadsContactadosAsesorDashboard();

        const lista = Array.isArray(response)
          ? response
          : [];

        asesores.value = lista
          .filter(
            (x: any) =>
              x?.id_asesor !== undefined &&
              x?.id_asesor !== null,
          )
          .map((x: any) => ({
            id_asesor: Number(x.id_asesor),
            asesor: String(x.asesor ?? `Asesor ${x.id_asesor}`),
          }))
          .sort((a: AsesorOpcion, b: AsesorOpcion) =>
            a.asesor.localeCompare(b.asesor),
          );
      } catch (error) {
        console.error(
          'Error al cargar la lista de asesores:',
          error,
        );
      } finally {
        cargandoAsesores.value = false;
      }
    };

    // =========================================================
    // ESTADOS
    // =========================================================

    const cargando = ref(true);

    const leadsPorEtapa = ref<LeadEtapa[]>([]);

    const actividades = ref<ActividadDashboard[]>([]);

    const leadsAtendidos = ref<LeadAtendido[]>([]);

    const desistimientos = ref<Desistimiento[]>([]);

    // =========================================================
    // KPIs
    // =========================================================

    const totalCandidatos = computed(() => {
      return leadsPorEtapa.value
        .filter(
          (x) =>
            Number(x.id_etapa) >= 1 &&
            Number(x.id_etapa) <= 4,
        )
        .reduce(
          (total, x) =>
            total + Number(x.cantidad || 0),
          0,
        );
    });

    const totalOportunidades = computed(() => {
      return leadsPorEtapa.value
        .filter(
          (x) =>
            Number(x.id_etapa) >= 5 &&
            Number(x.id_etapa) <= 8,
        )
        .reduce(
          (total, x) =>
            total + Number(x.cantidad || 0),
          0,
        );
    });

    const totalCierres = computed(() => {
      const cierre = leadsPorEtapa.value.find(
        (x) => Number(x.id_etapa) === 7,
      );

      return Number(cierre?.cantidad || 0);
    });

    const kpis = computed<Kpi[]>(() => [
      {
        label: 'Candidatos',
        value: totalCandidatos.value.toString(),
        trend: 0,
        description: 'Leads de primera fase',
        icon: 'users',
        colorClass: 'kpi-green',
      },
      {
        label: 'Oportunidades',
        value: totalOportunidades.value.toString(),
        trend: 0,
        description: 'Leads de segunda fase',
        icon: 'target',
        colorClass: 'kpi-black',
      },
      {
        label: 'Cierres',
        value: totalCierres.value.toString(),
        trend: 0,
        description: 'Operaciones en cierre',
        icon: 'check',
        colorClass: 'kpi-orange',
      },
    ]);

    // =========================================================
    // LEADS POR ETAPA
    // =========================================================

    const nombresEtapas: Record<number, string> = {
      1: 'Asignación',
      2: 'Contacto',
      3: 'Desistió',
      4: 'Agendar reunión',
      5: 'Atención',
      6: 'Negociación',
      7: 'Cierre',
      8: 'Desistió - oportunidad',
    };

    const coloresEtapas: Record<number, string> = {
      1: '#2d8c4a',
      2: '#3f91c9',
      3: '#e76f8f',
      4: '#f4c542',
      5: '#f39c35',
      6: '#8e7cc3',
      7: '#42a5a5',
      8: '#64748b',
    };

    const etapasOrdenadas = computed(() => {
      const resultado: LeadEtapa[] = [];

      for (let id = 1; id <= 8; id++) {
        const encontrada = leadsPorEtapa.value.find(
          (x) => Number(x.id_etapa) === id,
        );

        resultado.push({
          id_etapa: id,
          etapa: nombresEtapas[id],
          cantidad: Number(
            encontrada?.cantidad || 0,
          ),
        });
      }

      return resultado;
    });

    const leadsPorEtapaVista = computed(() => {
      return etapasOrdenadas.value.map((etapa) => ({
        id: etapa.id_etapa,
        nombre: etapa.etapa,
        valor: etapa.cantidad,
        color:
          coloresEtapas[etapa.id_etapa],
      }));
    });

    const getPorcentajeEtapa = (
      valor: number,
    ) => {
      const maximo = Math.max(
        ...etapasOrdenadas.value.map(
          (etapa) => etapa.cantidad,
        ),
        0,
      );

      if (!maximo) return 0;

      return (valor / maximo) * 100;
    };

    // =========================================================
    // CANDIDATOS ATENDIDOS / SIN ATENDER
    // =========================================================

    const candidatos = computed(() => {
      const atendidos =
        leadsAtendidos.value.find(
          (x) => Number(x.tipo) === 2,
        );

      const sinAtender =
        leadsAtendidos.value.find(
          (x) => Number(x.tipo) === 1,
        );

      return {
        atendidos: Number(
          atendidos?.cantidad || 0,
        ),
        sinAtender: Number(
          sinAtender?.cantidad || 0,
        ),
      };
    });

    const candidatosMaximo = computed(() =>
      Math.max(
        candidatos.value.atendidos,
        candidatos.value.sinAtender,
        0,
      ),
    );

    const getPorcentajeCandidatos = (
      valor: number,
    ) => {
      if (!candidatosMaximo.value) return 0;

      return Math.min(
        (valor /
          candidatosMaximo.value) *
        100,
        100,
      );
    };

    const candidatosEscala = computed(() => {
      const max = candidatosMaximo.value;

      if (!max) {
        return [0];
      }

      const step = Math.ceil(max / 5);

      const marcas: number[] = [];

      for (
        let v = 0;
        v < max;
        v += step
      ) {
        marcas.push(v);
      }

      if (!marcas.includes(max)) {
        marcas.push(max);
      }

      return marcas;
    });

    // =========================================================
    // ACTIVIDADES
    // =========================================================

    const actividadesGraficos = computed<ActividadGrafico[]>(() => [
      {
        key: 'visitas_pendientes',
        titulo: 'Visitas Agendadas',
        subtitulo: 'Semana Actual',
        tipo: 12,
        estado: 13,
        color: '#2876c7',
        colorIcono: '#2876c7',
      },
      {
        key: 'videollamadas_pendientes',
        titulo: 'Videollamadas Agendadas',
        subtitulo: 'Semana Actual',
        tipo: 11,
        estado: 13,
        color: '#2876c7',
        colorIcono: '#2876c7',
      },
      {
        key: 'visitas_realizadas',
        titulo: 'Visitas Realizadas',
        subtitulo: 'Semana Actual',
        tipo: 12,
        estado: 14,
        color: '#2d9b59',
        colorIcono: '#2d9b59',
      },
      {
        key: 'videollamadas_realizadas',
        titulo: 'Videollamadas Realizadas',
        subtitulo: 'Semana Actual',
        tipo: 11,
        estado: 14,
        color: '#2d9b59',
        colorIcono: '#2d9b59',
      },
    ]);

    const obtenerDatosActividad = (
      tipo: number,
      estado: number,
    ) => {
      const ordenDias: Record<string, number> = {
        Lunes: 1,
        Martes: 2,
        Miércoles: 3,
        Jueves: 4,
        Viernes: 5,
        Sábado: 6,
        Domingo: 7,
      };

      return actividades.value
        .filter(
          (x) =>
            Number(x.id_tipo_actividad) === tipo &&
            Number(x.estado) === estado,
        )
        .sort(
          (a, b) =>
            (ordenDias[a.dia_semana] || 99) -
            (ordenDias[b.dia_semana] || 99),
        );
    };

    const obtenerMaximoActividad = (
      tipo: number,
      estado: number,
    ) => {
      const datos = obtenerDatosActividad(tipo, estado);

      return Math.max(
        ...datos.map((x) => Number(x.cantidad || 0)),
        0,
      );
    };

    const obtenerPuntosActividad = (
      tipo: number,
      estado: number,
    ) => {
      const datos = obtenerDatosActividad(tipo, estado);

      if (!datos.length) {
        return '';
      }

      const maximo = Math.max(
        ...datos.map((x) => Number(x.cantidad || 0)),
        0,
      );

      const ancho = 260;
      const alto = 105;

      const paddingX = 10;
      const paddingY = 8;

      const anchoUtil = ancho - paddingX * 2;
      const altoUtil = alto - paddingY * 2;

      return datos
        .map((dato, index) => {
          const cantidad = Number(dato.cantidad || 0);

          const x =
            datos.length === 1
              ? ancho / 2
              : paddingX +
              (index / (datos.length - 1)) *
              anchoUtil;

          const y =
            maximo === 0
              ? alto - paddingY
              : alto -
              paddingY -
              (cantidad / maximo) *
              altoUtil;

          return `${x},${y}`;
        })
        .join(' ');
    };

    const obtenerPuntosCirculosActividad = (
      tipo: number,
      estado: number,
    ) => {
      const datos = obtenerDatosActividad(tipo, estado);

      if (!datos.length) {
        return [];
      }

      const maximo = Math.max(
        ...datos.map((x) => Number(x.cantidad || 0)),
        0,
      );

      const ancho = 260;
      const alto = 105;

      const paddingX = 10;
      const paddingY = 8;

      const anchoUtil = ancho - paddingX * 2;
      const altoUtil = alto - paddingY * 2;

      return datos.map((dato, index) => {
        const cantidad = Number(dato.cantidad || 0);

        const x =
          datos.length === 1
            ? ancho / 2
            : paddingX +
            (index / (datos.length - 1)) *
            anchoUtil;

        const y =
          maximo === 0
            ? alto - paddingY
            : alto -
            paddingY -
            (cantidad / maximo) *
            altoUtil;

        return {
          x,
          y,
          cantidad,
          dia: dato.dia_semana,
          tipoActividad: dato.tipo_actividad,
          estadoNombre: dato.estado_nombre,
        };
      });
    };
    const obtenerEscalaActividad = (
      tipo: number,
      estado: number,
    ) => {
      const maximo = obtenerMaximoActividad(
        tipo,
        estado,
      );

      if (maximo === 0) {
        return [40, 30, 20, 10, 0];
      }

      const step = Math.max(
        Math.ceil(maximo / 4 / 10) * 10,
        1,
      );

      const escala: number[] = [];

      for (
        let valor = 0;
        valor <= maximo + step;
        valor += step
      ) {
        escala.push(valor);
      }

      return escala.reverse();
    };

    // =========================================================
    // DESISTIMIENTOS (GRÁFICO DE PASTEL)
    // =========================================================

    const desistimientoEtapa =
      ref<3 | 8>(3);

    const desistimientosFiltrados =
      computed(() => {
        return desistimientos.value
          .filter(
            (x) =>
              Number(x.id_etapa) ===
              desistimientoEtapa.value,
          )
          .sort(
            (a, b) =>
              Number(b.cantidad) -
              Number(a.cantidad),
          );
      });

    const totalDesistimientos =
      computed(() => {
        return desistimientosFiltrados.value.reduce(
          (total, motivo) =>
            total +
            Number(
              motivo.cantidad || 0,
            ),
          0,
        );
      });

    const getPorcentajeDesistimiento = (
      cantidad: number,
    ): number => {
      const total = totalDesistimientos.value;

      if (total <= 0) {
        return 0;
      }

      return (cantidad / total) * 100;
    };

    const paletaDesistimientos = [
      '#2d8c4a',
      '#f39c35',
      '#3f91c9',
      '#e76f8f',
      '#8e7cc3',
      '#64748b',
      '#f4c542',
      '#42a5a5',
    ];


    // =========================================================
    // VALIDAR FECHAS
    // =========================================================

    const validarRangoFechas = () => {
      if (
        !fechaInicio.value ||
        !fechaFin.value
      ) {
        return true;
      }

      if (
        fechaInicio.value >
        fechaFin.value
      ) {
        return false;
      }

      return true;
    };

    // =========================================================
    // CARGAR DASHBOARD
    // =========================================================

    const cargarDashboard = async () => {
      try {
        cargando.value = true;

        const inicio =
          fechaInicio.value || null;

        const fin =
          fechaFin.value || null;

        const asesor = idAsesorNumerico.value;

        const [
          etapasResponse,
          actividadesResponse,
          desistimientosResponse,
          atendidosResponse,
        ] = await Promise.all([
          // FECHA + ASESOR
          contarLeadsPorEtapa({
            fechaInicio: inicio,
            fechaFin: fin,
            idAsesor: asesor,
          }),

          // ACTIVIDADES + ASESOR
          contarActividadesDashboard({
            fechaInicio: inicio,
            fechaFin: fin,
            idAsesor: asesor,
          }),
          // FECHA + ASESOR
          contarDesistimientosDashboard(
            desistimientoEtapa.value,
            inicio,
            fin,
            asesor,
          ),

          // FECHA + ASESOR
          contarLeadsAtendidosDashboard({
            fechaInicio: inicio,
            fechaFin: fin,
            idAsesor: asesor,
          }),
        ]);

        // =====================================================
        // ETAPAS
        // =====================================================

        leadsPorEtapa.value =
          Array.isArray(
            etapasResponse,
          )
            ? etapasResponse
            : [];

        // =====================================================
        // ACTIVIDADES
        // =====================================================

        actividades.value = Array.isArray(
          actividadesResponse,
        )
          ? actividadesResponse
          : [];

        // =====================================================
        // DESISTIMIENTOS
        // =====================================================

        desistimientos.value =
          Array.isArray(
            desistimientosResponse,
          )
            ? desistimientosResponse
            : [];

        // =====================================================
        // ATENDIDOS
        // =====================================================

        leadsAtendidos.value =
          Array.isArray(
            atendidosResponse,
          )
            ? atendidosResponse
            : [];
      } catch (error) {
        console.error(
          'Error al cargar dashboard:',
          error,
        );
      } finally {
        cargando.value = false;
      }
    };

    // =========================================================
    // APLICAR FILTRO DE FECHAS / ASESOR
    // =========================================================

    const aplicarFiltroFechas = async () => {
      if (!validarRangoFechas()) {
        console.error(
          'La fecha de inicio no puede ser mayor que la fecha de fin.',
        );

        return;
      }

      await cargarDashboard();
    };

    // =========================================================
    // LIMPIAR FILTRO
    // =========================================================

    const limpiarFiltroFechas = async () => {
      fechaInicio.value = '';
      fechaFin.value = '';
      
      // ✅ Si es agent, mantiene su ID. Si no, limpia.
      if (!esAgent.value) {
        idAsesor.value = '';
      }

      await cargarDashboard();
    };

    // =========================================================
    // CAMBIAR DESISTIMIENTO
    // =========================================================

    const cambiarEtapaDesistimiento =
      async (
        etapa: 3 | 8,
      ) => {
        desistimientoEtapa.value =
          etapa;

        try {
          const response =
            await contarDesistimientosDashboard(
              etapa,
              fechaInicio.value ||
              null,
              fechaFin.value ||
              null,
              idAsesorNumerico.value,
            );

          desistimientos.value =
            Array.isArray(response)
              ? response
              : [];
        } catch (error) {
          console.error(
            'Error al cargar desistimientos:',
            error,
          );
        }
      };

    // =========================================================
    // INICIALIZAR
    // =========================================================

    onMounted(() => {
      // ✅ SI ES AGENT: ASIGNA SU ID AUTOMÁTICAMENTE
      if (esAgent.value) {
        idAsesor.value = String(idEmpleadoDelAgent.value);
      } else {
        // ✅ SI NO ES AGENT: CARGA LA LISTA DE ASESORES
        cargarAsesores();
      }

      // ✅ CARGA EL DASHBOARD (con el ID del agent si aplica)
      cargarDashboard();
    });

    return {
      activeTab,
      tabs,
      tituloActivo,
      kpis,
      cargando,

      // ✅ RETORNA PARA SABER SI ES AGENT EN EL TEMPLATE
      esAgent,

      // Filtro fechas
      fechaInicio,
      fechaFin,
      aplicarFiltroFechas,
      limpiarFiltroFechas,

      // Filtro asesor
      idAsesor,
      idAsesorNumerico,
      asesores,
      cargandoAsesores,

      // Etapas
      leadsPorEtapa:
        leadsPorEtapaVista,
      getPorcentajeEtapa,

      // Candidatos
      candidatos,
      candidatosMaximo,
      candidatosEscala,
      getPorcentajeCandidatos,

      // Actividades
      actividades,
      actividadesGraficos,
      obtenerDatosActividad,
      obtenerPuntosActividad,
      obtenerPuntosCirculosActividad,
      obtenerEscalaActividad,
      obtenerMaximoActividad,

      // Desistimientos
      desistimientoEtapa,
      desistimientosFiltrados,
      totalDesistimientos,
      getPorcentajeDesistimiento,
      cambiarEtapaDesistimiento,
    };
  },
});