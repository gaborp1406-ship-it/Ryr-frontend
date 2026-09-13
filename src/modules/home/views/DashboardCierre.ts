import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  contarLeadsNegociacionDashboard,
  contarNegociacionPorFuenteDashboard,
  contarNegociacionPorProyectoDashboard,
  contarNegociacionPorAsesorDashboard,
  listarLeadsNegociacionDashboard,
} from '../actions/dashboardCierre';



interface ProyectoNegociacion {
  id_proyecto: number;
  proyecto: string;
  cantidad_leads_negociacion: number;
}

interface FuenteNegociacion {
  id_fuente: number;
  fuente: string;
  cantidad_leads_negociacion: number;
}

interface AsesorNegociacion {
  id_asesor: number;
  asesor: string;
  cantidad_leads_negociacion: number;
}

interface LeadNegociacion {
  id_lead: number;
  id_asesor: number;
  asesor: string;
  nombre_cliente: string;
  id_fuente: number;
  fuente: string;
  id_proyecto: number;
  proyecto: string;
  fecha_creacion: string;
}

export default defineComponent({
  name: 'DashboardNegociacion',

  props: {
    // Fechas controladas por el componente padre (DashboardAllView)
    fechaInicio: {
      type: String,
      default: null,
    },

    fechaFin: {
      type: String,
      default: null,
    },
  },

  setup(props) {
    const cargando = ref(false);
    const error = ref<string | null>(null);

    const totalLeads = ref(0);

    const proyectos = ref<ProyectoNegociacion[]>([]);
    const fuentes = ref<FuenteNegociacion[]>([]);
    const asesores = ref<AsesorNegociacion[]>([]);
    const leads = ref<LeadNegociacion[]>([]);
const busquedaCliente = ref('');
    const paginaActual = ref(1);
    const leadsPorPagina = 5;
    const coloresDonut = [
      '#2d8c4a',
      '#70b889',
      '#9bcbaa',
      '#b9ddc4',
      '#d2e9d9',
      '#5fa875',
      '#3d9659',
      '#84c597',
    ];

 const cargarDashboard = async () => {
      try {
        cargando.value = true;
        error.value = null;

        const filtro = {
          fechaInicio: props.fechaInicio || null,
          fechaFin: props.fechaFin || null,
        };

        const [
          totalResponse,
          proyectosResponse,
          fuentesResponse,
          asesoresResponse,
          leadsResponse,
        ] = await Promise.all([
          contarLeadsNegociacionDashboard(filtro),
          contarNegociacionPorProyectoDashboard(filtro),
          contarNegociacionPorFuenteDashboard(filtro),
          contarNegociacionPorAsesorDashboard(filtro),
          listarLeadsNegociacionDashboard(filtro),
        ]);

        totalLeads.value = Number(
          totalResponse?.[0]?.cantidad_leads_negociacion ?? 0,
        );

        proyectos.value = (proyectosResponse ?? []).map(
          (item: ProyectoNegociacion) => ({
            ...item,
            cantidad_leads_negociacion: Number(
              item.cantidad_leads_negociacion ?? 0,
            ),
          }),
        );

        fuentes.value = (fuentesResponse ?? []).map(
          (item: FuenteNegociacion) => ({
            ...item,
            cantidad_leads_negociacion: Number(
              item.cantidad_leads_negociacion ?? 0,
            ),
          }),
        );

        asesores.value = (asesoresResponse ?? []).map(
          (item: AsesorNegociacion) => ({
            ...item,
            cantidad_leads_negociacion: Number(
              item.cantidad_leads_negociacion ?? 0,
            ),
          }),
        );

        leads.value = leadsResponse ?? [];
        paginaActual.value = 1; // resetear página al recargar datos
      } catch (err) {
        console.error(
          'Error al cargar dashboard de negociación:',
          err,
        );

        error.value =
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el dashboard de negociación';
      } finally {
        cargando.value = false;
      }
    };

    /**
     * TOTAL DE LEADS DE LOS PROYECTOS
     */
    const totalProyectos = computed(() => {
      return proyectos.value.reduce(
        (total, proyecto) =>
          total + Number(proyecto.cantidad_leads_negociacion || 0),
        0,
      );
    });

    /**
     * DONUT POR PROYECTO
     */
    const donutStyle = computed(() => {
      if (!proyectos.value.length || totalProyectos.value === 0) {
        return {
          background: '#e5e7eb',
        };
      }

      let acumulado = 0;

      const segmentos = proyectos.value.map((proyecto, index) => {
        const porcentaje =
          (Number(proyecto.cantidad_leads_negociacion) /
            totalProyectos.value) *
          100;

        const inicio = acumulado;
        const fin = acumulado + porcentaje;

        acumulado = fin;

        return `${coloresDonut[index % coloresDonut.length]} ${inicio}% ${fin}%`;
      });

      return {
        background: `conic-gradient(${segmentos.join(', ')})`,
      };
    });

    /**
     * PORCENTAJE DE CADA PROYECTO
     */
    const porcentajeProyecto = (
      cantidad: number,
    ) => {
      if (!totalProyectos.value) return 0;

      return Math.round(
        (Number(cantidad) / totalProyectos.value) * 100,
      );
    };

    /**
     * MÁXIMO PARA BARRAS DE ASESORES
     */
    const maxAsesor = computed(() => {
      if (!asesores.value.length) return 1;

      return Math.max(
        ...asesores.value.map(
          (item) =>
            Number(item.cantidad_leads_negociacion) || 0,
        ),
        1,
      );
    });

    /**
     * ANCHO BARRA ASESOR
     */
    const anchoBarraAsesor = (
      cantidad: number,
    ) => {
      return `${Math.max(
        4,
        (Number(cantidad) / maxAsesor.value) * 100,
      )}%`;
    };

    /**
     * MÁXIMO PARA BARRAS DE FUENTES
     */
    const maxFuente = computed(() => {
      if (!fuentes.value.length) return 1;

      return Math.max(
        ...fuentes.value.map(
          (item) =>
            Number(item.cantidad_leads_negociacion) || 0,
        ),
        1,
      );
    });

    /**
     * ANCHO BARRA FUENTE
     */
    const anchoBarraFuente = (
      cantidad: number,
    ) => {
      return `${Math.max(
        4,
        (Number(cantidad) / maxFuente.value) * 100,
      )}%`;
    };

    /**
     * INICIALES DEL ASESOR
     */
    const iniciales = (nombre: string) => {
      if (!nombre) return '--';

      const partes = nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
      }

      return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
      ).toUpperCase();
    };

    /**
     * FORMATO DE FECHA
     */
    const formatearFecha = (
      fecha: string | null | undefined,
    ) => {
      if (!fecha) return '-';

      const fechaObj = new Date(fecha);

      if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
      }

      return fechaObj.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    /**
     * NÚMERO DE FILAS VISIBLES
     */

  const leadsFiltrados = computed(() => {
      const query = busquedaCliente.value.trim().toLowerCase();

      if (!query) return leads.value;

      return leads.value.filter((lead) =>
        (lead.nombre_cliente || '')
          .toLowerCase()
          .includes(query),
      );
    });

    /**
     * ===== NUEVO: TOTAL DE PÁGINAS =====
     */
    const totalPaginas = computed(() => {
      return Math.max(
        1,
        Math.ceil(leadsFiltrados.value.length / leadsPorPagina),
      );
    });

    /**
     * ===== NUEVO: LEADS DE LA PÁGINA ACTUAL =====
     */
    const leadsPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * leadsPorPagina;
      const fin = inicio + leadsPorPagina;

      return leadsFiltrados.value.slice(inicio, fin);
    });

    /**
     * ===== NUEVO: RANGO MOSTRADO (ej: "1-5 de 23") =====
     */
    const rangoMostrado = computed(() => {
      if (!leadsFiltrados.value.length) {
        return '0 de 0';
      }

      const inicio = (paginaActual.value - 1) * leadsPorPagina + 1;
      const fin = Math.min(
        paginaActual.value * leadsPorPagina,
        leadsFiltrados.value.length,
      );

      return `${inicio}-${fin} de ${leadsFiltrados.value.length}`;
    });

    /**
     * ===== NUEVO: NAVEGACIÓN DE PÁGINAS =====
     */
    const irAPagina = (pagina: number) => {
      if (pagina < 1 || pagina > totalPaginas.value) return;
      paginaActual.value = pagina;
    };

    const paginaAnterior = () => {
      irAPagina(paginaActual.value - 1);
    };

    const paginaSiguiente = () => {
      irAPagina(paginaActual.value + 1);
    };

    /**
     * ===== NUEVO: NÚMEROS DE PÁGINA A MOSTRAR =====
     * Muestra máximo 5 números de página, centrados en la actual
     */
    const numerosPagina = computed(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;
      const maxVisibles = 5;

      if (total <= maxVisibles) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      let inicio = Math.max(1, actual - 2);
      let fin = Math.min(total, inicio + maxVisibles - 1);

      if (fin - inicio < maxVisibles - 1) {
        inicio = Math.max(1, fin - maxVisibles + 1);
      }

      return Array.from(
        { length: fin - inicio + 1 },
        (_, i) => inicio + i,
      );
    });

    // ===== NUEVO: RESETEAR PÁGINA AL BUSCAR =====
    watch(busquedaCliente, () => {
      paginaActual.value = 1;
    });

    const cantidadLeadsMostrados = computed(() => {
      return leadsFiltrados.value.length;
    });

    watch(
      () => [
        props.fechaInicio,
        props.fechaFin,
      ],
      () => {
        cargarDashboard();
      },
    );

    onMounted(() => {
      cargarDashboard();
    });

    return {
      cargando,
      error,

      totalLeads,

      proyectos,
      fuentes,
      asesores,
      leads,

      coloresDonut,
      donutStyle,

      totalProyectos,
      porcentajeProyecto,

      maxAsesor,
      anchoBarraAsesor,

      maxFuente,
      anchoBarraFuente,

      iniciales,
      formatearFecha,

      cantidadLeadsMostrados,
 busquedaCliente,
      leadsFiltrados,
      leadsPaginados,
      paginaActual,
      totalPaginas,
      rangoMostrado,
      irAPagina,
      paginaAnterior,
      paginaSiguiente,
      numerosPagina,
      cargarDashboard,
    };
  },
});