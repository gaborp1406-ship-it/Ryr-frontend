import { defineComponent, ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import type { ILeadPorEtapaActual } from '../interfaces/lead.interface';
import { obtenerLeadsPorEtapaActual, reabrirLeadEtapa } from '../actions/lead.action';

const ETAPAS_REABRIBLES = [3, 8];
const ETAPAS_FIJAS = [3, 8];

export default defineComponent({
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();
    const router = useRouter();

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

    function mostrarBotonReabrir(lead: ILeadPorEtapaActual): boolean {
      return ETAPAS_REABRIBLES.includes(lead.id_etapa);
    }

    async function cargarLeads() {
      cargandoLeads.value = true;
      try {
        const idAgente = authStore.isAgent ? authStore.idEmploye : undefined;

        const resultados = await Promise.all(
          ETAPAS_FIJAS.map((idEtapa) =>
            obtenerLeadsPorEtapaActual(idEtapa, idAgente)
          )
        );
        leads.value = resultados.flat();
      } catch (error: any) {
        console.error('Error cargando leads por etapa actual', error);
        toast.error(error.message ?? 'No se pudieron cargar los leads');
      } finally {
        cargandoLeads.value = false;
      }
    }

    async function reabrirLead(lead: ILeadPorEtapaActual) {
      const resultado = await Swal.fire({
        title: '¿Reabrir lead?',
        html: `Estás a punto de reabrir el lead de <b>${lead.nombre_clientes}</b>.`,
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
          html: `El lead de <b>${lead.nombre_clientes}</b> se reabrió correctamente.`,
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
      mostrarBotonReabrir,
      reabrirLead,
    };
  },
});