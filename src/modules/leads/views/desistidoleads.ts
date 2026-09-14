
import { defineComponent, ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

import { useAuthStore } from '@/modules/auth/stores/auth.store';

import type {
  ILeadPorEtapaActual,
 
} from '../interfaces/lead.interface';

import {
  obtenerLeadsPorEtapaActual,
  reabrirLeadEtapa,
 
} from '../actions/lead.action';
import type { IListarAsesoresResponse } from '@/modules/clients/interfaces/clients.interface';
import { listarAsesores } from '@/modules/clients/actions/clients.action';

const ETAPAS_REABRIBLES = [3, 8];
const ETAPAS_FIJAS = [3, 8];

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

    const idAsesorSeleccionado = ref<number | undefined>(undefined);

    const fechaInicio = ref<string>('');
    const fechaFin = ref<string>('');

    // =========================================================
    // PERMISOS
    // =========================================================

    /**
     * El agente NO puede seleccionar asesor.
     *
     * Admin y cualquier otro rol sí pueden hacerlo.
     */
    const puedeFiltrarPorAsesor = !authStore.isAgent;

    // =========================================================
    // INICIALES
    // =========================================================

    function obtenerIniciales(
      nombre: string | null | undefined
    ): string {
      if (!nombre) return '-';

      const partes = nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (partes.length === 0) return '-';

      if (partes.length === 1) {
        return partes[0].slice(0, 2).toUpperCase();
      }

      return (
        partes[0][0] + partes[1][0]
      ).toUpperCase();
    }

    // =========================================================
    // MOSTRAR BOTÓN REABRIR
    // =========================================================

    function mostrarBotonReabrir(
      lead: ILeadPorEtapaActual
    ): boolean {
      return ETAPAS_REABRIBLES.includes(lead.id_etapa);
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
        console.error(
          'Error cargando asesores',
          error
        );

        toast.error(
          error.message ??
            'No se pudieron cargar los asesores'
        );
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
         * AGENTE:
         * Se fuerza su propio id de trabajador.
         *
         * ADMIN / OTROS ROLES:
         * Usa el asesor seleccionado.
         *
         * undefined = todos los asesores.
         */
        const idAgente = authStore.isAgent
          ? authStore.idEmploye
          : idAsesorSeleccionado.value;

        /**
         * Consultamos las etapas 3 y 8
         * manteniendo los mismos filtros.
         */
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
      } catch (error: any) {
        console.error(
          'Error cargando leads por etapa actual',
          error
        );

        toast.error(
          error.message ??
            'No se pudieron cargar los leads'
        );
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

      await cargarLeads();
    }

    // =========================================================
    // REABRIR LEAD
    // =========================================================

    async function reabrirLead(
      lead: ILeadPorEtapaActual
    ) {
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
        await reabrirLeadEtapa(
          lead.id_lead_etapa
        );

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

        router.push(
          `/clients/details/${lead.id_lead}`
        );
      } catch (error: any) {
        console.error(
          'Error reabriendo lead',
          error
        );

        Swal.fire({
          title: 'No se pudo reabrir',
          text:
            error.message ??
            'No se pudo reabrir el lead',
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
      /**
       * Solo admin / otros roles necesitan
       * cargar el catálogo de asesores.
       */
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

      idAsesorSeleccionado,
      fechaInicio,
      fechaFin,

      obtenerIniciales,
      mostrarBotonReabrir,

      reabrirLead,

      cambiarAsesor,
      aplicarFiltros,
      limpiarFiltros,
    };
  },
});
