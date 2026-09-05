import { defineComponent, ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import type { ILeadPorEtapaActual } from '../interfaces/lead.interface';
import { obtenerLeadsPorEtapaActual } from '../actions/lead.action';

export default defineComponent({
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();

    const leads = ref<ILeadPorEtapaActual[]>([]);
    const cargandoLeads = ref(true);
    const reabriendoId = ref<number | null>(null);

    function obtenerIniciales(nombre: string | null | undefined): string {
      if (!nombre) return '-';
      const partes = nombre.trim().split(/\s+/).filter(Boolean);
      if (partes.length === 0) return '-';
      if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }

    async function cargarLeads() {
      cargandoLeads.value = true;
      try {
        const idAgente = authStore.isAgent ? authStore.idEmploye : undefined;

        leads.value = await obtenerLeadsPorEtapaActual(7, idAgente);
      } catch (error: any) {
        console.error('Error cargando leads por etapa actual', error);
        toast.error(error.message ?? 'No se pudieron cargar los leads');
      } finally {
        cargandoLeads.value = false;
      }
    }

    onMounted(() => {
      cargarLeads();
    });

    return {
      toast,
      authStore,
      leads,
      cargandoLeads,
      reabriendoId,
      obtenerIniciales,
    };
  },
});