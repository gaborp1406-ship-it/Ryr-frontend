import { defineComponent, ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

import type {
  ILeadPorEtapaActual,

} from '../interfaces/lead.interface';

import {
  obtenerLeadsPorEtapaActual,
} from '../actions/lead.action';
import type { IListarAsesoresResponse } from '@/modules/clients/interfaces/clients.interface';
import { listarAsesores } from '@/modules/clients/actions/clients.action';

export default defineComponent({
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();

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

    // Solo los agentes quedan limitados a sus propios leads.
    // Admin y cualquier otro rol pueden seleccionar asesor.
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

      return (partes[0][0] + partes[1][0]).toUpperCase();
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

        toast.error(
          error.message ?? 'No se pudieron cargar los asesores'
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
         * Siempre consulta únicamente sus propios leads.
         *
         * ADMIN / OTROS ROLES:
         * Usa el asesor seleccionado.
         * Si no hay asesor seleccionado, consulta todos.
         */
        const idAgente = authStore.isAgent
          ? authStore.idEmploye
          : idAsesorSeleccionado.value;

        leads.value = await obtenerLeadsPorEtapaActual(
          7,
          idAgente,
          fechaInicio.value || undefined,
          fechaFin.value || undefined
        );
      } catch (error: any) {
        console.error(
          'Error cargando leads por etapa actual',
          error
        );

        toast.error(
          error.message ?? 'No se pudieron cargar los leads'
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
    // CAMBIAR FECHAS
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

      idAsesorSeleccionado,
      fechaInicio,
      fechaFin,

      obtenerIniciales,

      cargarLeads,
      cambiarAsesor,
      aplicarFiltros,
      limpiarFiltros,
    };
  },
});
