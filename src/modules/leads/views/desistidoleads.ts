import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

import { useAuthStore } from '@/modules/auth/stores/auth.store';

import type { ILeadPorEtapaActual } from '../interfaces/lead.interface';

import {
  obtenerLeadsPorEtapaActual,
  reabrirLeadEtapa,
} from '../actions/lead.action';
import type { IListarAsesoresResponse } from '@/modules/clients/interfaces/clients.interface';
import { listarAsesores } from '@/modules/clients/actions/clients.action';

const ETAPAS_REABRIBLES = [3, 8];
const ETAPAS_FIJAS = [3, 8];
const POR_PAGINA = 12;

function normalizar(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default defineComponent({
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();
    const router = useRouter();

    const leads = ref<ILeadPorEtapaActual[]>([]);
    const asesores = ref<IListarAsesoresResponse[]>([]);

    const cargandoLeads = ref(true);
    const cargandoAsesores = ref(false);

    const reabriendoId = ref<number | null>(null);

    // =========================================================
    // FILTROS
    // =========================================================

    // Servidor
    const idAsesorSeleccionado = ref<number | undefined>(undefined);
    const fechaInicio = ref<string>('');
    const fechaFin = ref<string>('');

    // Cliente
    const busqueda = ref('');
    const proyectoSeleccionado = ref('');
    const fuenteSeleccionada = ref('');

    // =========================================================
    // PAGINACIÓN
    // =========================================================

    const paginaActual = ref(1);

    // =========================================================
    // PERMISOS
    // =========================================================

    /**
     * El agente NO puede seleccionar asesor.
     * Admin y cualquier otro rol sí pueden hacerlo.
     */
    const puedeFiltrarPorAsesor = !authStore.isAgent;

    // =========================================================
    // OPCIONES DE FILTROS (derivadas de los leads cargados)
    // =========================================================

    const proyectos = computed<string[]>(() => {
      const set = new Set<string>();
      leads.value.forEach((l) => {
        if (l.nombre_proyecto) set.add(l.nombre_proyecto);
      });
      return [...set].sort((a, b) => a.localeCompare(b));
    });

    const fuentes = computed<string[]>(() => {
      const set = new Set<string>();
      leads.value.forEach((l) => {
        if (l.nombre_fuente) set.add(l.nombre_fuente);
      });
      return [...set].sort((a, b) => a.localeCompare(b));
    });

    // =========================================================
    // LEADS FILTRADOS + PAGINADOS
    // =========================================================

    const leadsFiltrados = computed<ILeadPorEtapaActual[]>(() => {
      const texto = normalizar(busqueda.value);

      return leads.value.filter((lead) => {
        if (
          proyectoSeleccionado.value &&
          lead.nombre_proyecto !== proyectoSeleccionado.value
        ) {
          return false;
        }

        if (
          fuenteSeleccionada.value &&
          lead.nombre_fuente !== fuenteSeleccionada.value
        ) {
          return false;
        }

        if (texto && !normalizar(lead.nombre_clientes).includes(texto)) {
          return false;
        }

        return true;
      });
    });

    const totalPaginas = computed(() =>
      Math.max(1, Math.ceil(leadsFiltrados.value.length / POR_PAGINA))
    );

    const leadsPaginados = computed<ILeadPorEtapaActual[]>(() => {
      const inicio = (paginaActual.value - 1) * POR_PAGINA;
      return leadsFiltrados.value.slice(inicio, inicio + POR_PAGINA);
    });

    const desde = computed(() =>
      leadsFiltrados.value.length === 0
        ? 0
        : (paginaActual.value - 1) * POR_PAGINA + 1
    );

    const hasta = computed(() =>
      Math.min(paginaActual.value * POR_PAGINA, leadsFiltrados.value.length)
    );

    // Ventana de hasta 5 páginas alrededor de la actual
    const paginasVisibles = computed<number[]>(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;
      const ventana = 5;

      let inicio = Math.max(1, actual - Math.floor(ventana / 2));
      const fin = Math.min(total, inicio + ventana - 1);
      inicio = Math.max(1, fin - ventana + 1);

      const paginas: number[] = [];
      for (let i = inicio; i <= fin; i++) paginas.push(i);
      return paginas;
    });

    function irAPagina(pagina: number) {
      if (pagina < 1 || pagina > totalPaginas.value) return;
      paginaActual.value = pagina;
    }

    // Al cambiar filtros del cliente o los datos, volver a la página 1
    watch([busqueda, proyectoSeleccionado, fuenteSeleccionada, leads], () => {
      paginaActual.value = 1;
    });

    // =========================================================
    // INICIALES
    // =========================================================

    function obtenerIniciales(nombre: string | null | undefined): string {
      if (!nombre) return '-';

      const partes = nombre.trim().split(/\s+/).filter(Boolean);

      if (partes.length === 0) return '-';

      if (partes.length === 1) {
        return partes[0].slice(0, 2).toUpperCase();
      }

      return (partes[0][0] + partes[1][0]).toUpperCase();
    }

    // =========================================================
    // MOSTRAR BOTÓN REABRIR
    // =========================================================

    function mostrarBotonReabrir(lead: ILeadPorEtapaActual): boolean {
      return ETAPAS_REABRIBLES.includes(lead.id_etapa);
    }

    // =========================================================
    // VER DETALLE
    // =========================================================

    function verLead(lead: ILeadPorEtapaActual) {
      router.push(`/clients/details/${lead.id_lead}`);
    }

    // =========================================================
    // LISTAR ASESORES
    // =========================================================

    async function cargarAsesores() {
      if (!puedeFiltrarPorAsesor) return;

      cargandoAsesores.value = true;

      try {
        asesores.value = await listarAsesores();
      } catch (error: any) {
        console.error('Error cargando asesores', error);

        toast.error(error.message ?? 'No se pudieron cargar los asesores');
      } finally {
        cargandoAsesores.value = false;
      }
    }

    // =========================================================
    // CARGAR LEADS
    // =========================================================

    async function cargarLeads() {
      cargandoLeads.value = true;

      try {
        /**
         * AGENTE: se fuerza su propio id de trabajador.
         * ADMIN / OTROS ROLES: usa el asesor seleccionado.
         * undefined = todos los asesores.
         */
        const idAgente = authStore.isAgent
          ? authStore.idEmploye
          : idAsesorSeleccionado.value;

        const resultados = await Promise.all(
          ETAPAS_FIJAS.map((idEtapa) =>
            obtenerLeadsPorEtapaActual(
              idEtapa,
              idAgente,
              fechaInicio.value || undefined,
              fechaFin.value || undefined
            )
          )
        );

        leads.value = resultados.flat();

        // Si el proyecto/fuente seleccionado ya no existe, se limpia
        if (
          proyectoSeleccionado.value &&
          !proyectos.value.includes(proyectoSeleccionado.value)
        ) {
          proyectoSeleccionado.value = '';
        }
        if (
          fuenteSeleccionada.value &&
          !fuentes.value.includes(fuenteSeleccionada.value)
        ) {
          fuenteSeleccionada.value = '';
        }
      } catch (error: any) {
        console.error('Error cargando leads por etapa actual', error);

        toast.error(error.message ?? 'No se pudieron cargar los leads');
      } finally {
        cargandoLeads.value = false;
      }
    }

    // =========================================================
    // CAMBIAR ASESOR
    // =========================================================

    async function cambiarAsesor() {
      await cargarLeads();
    }

    // =========================================================
    // APLICAR FILTROS
    // =========================================================

    async function aplicarFiltros() {
      await cargarLeads();
    }

    // =========================================================
    // LIMPIAR FILTROS
    // =========================================================

    async function limpiarFiltros() {
      idAsesorSeleccionado.value = undefined;
      fechaInicio.value = '';
      fechaFin.value = '';

      busqueda.value = '';
      proyectoSeleccionado.value = '';
      fuenteSeleccionada.value = '';
      paginaActual.value = 1;

      await cargarLeads();
    }

    // =========================================================
    // REABRIR LEAD
    // =========================================================

    async function reabrirLead(lead: ILeadPorEtapaActual) {
      const resultado = await Swal.fire({
        title: '¿Reabrir lead?',
        html: `
          Estás a punto de reabrir el lead de
          <b>${lead.nombre_clientes}</b>.
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, reabrir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2d8c4a',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true,
        focusCancel: true,
      });

      if (!resultado.isConfirmed) return;

      reabriendoId.value = lead.id_lead;

      try {
        await reabrirLeadEtapa(lead.id_lead_etapa);

        await Swal.fire({
          title: 'Lead reabierto',
          html: `
            El lead de
            <b>${lead.nombre_clientes}</b>
            se reabrió correctamente.
          `,
          icon: 'success',
          confirmButtonText: 'Ir al lead',
          confirmButtonColor: '#2d8c4a',
        });

        router.push(`/clients/details/${lead.id_lead}`);
      } catch (error: any) {
        console.error('Error reabriendo lead', error);

        Swal.fire({
          title: 'No se pudo reabrir',
          text: error.message ?? 'No se pudo reabrir el lead',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#2d8c4a',
        });
      } finally {
        reabriendoId.value = null;
      }
    }

    // =========================================================
    // INIT
    // =========================================================

    onMounted(async () => {
      if (puedeFiltrarPorAsesor) {
        await cargarAsesores();
      }

      await cargarLeads();
    });

    return {
      toast,
      authStore,

      leads,
      asesores,

      cargandoLeads,
      cargandoAsesores,

      reabriendoId,

      puedeFiltrarPorAsesor,

      // filtros
      idAsesorSeleccionado,
      fechaInicio,
      fechaFin,
      busqueda,
      proyectoSeleccionado,
      fuenteSeleccionada,
      proyectos,
      fuentes,

      // lista + paginación
      leadsFiltrados,
      leadsPaginados,
      paginaActual,
      totalPaginas,
      paginasVisibles,
      desde,
      hasta,
      irAPagina,

      obtenerIniciales,
      mostrarBotonReabrir,
      verLead,

      reabrirLead,

      cambiarAsesor,
      aplicarFiltros,
      limpiarFiltros,
    };
  },
});