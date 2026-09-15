import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useToast } from "vue-toastification";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { conectarEventosLlamada } from "../actions/Gestioninteraction.action.js";

import { useSipPhone } from "../composables/useSipPhone.js";
import { useLlamadaSaliente } from "../composables/useLlamadaSaliente.js";

import ModalLlamada from "../views/ModalLlamada.vue";


export default defineComponent({
  components: {
    ModalLlamada,
  },

  setup() {
    const toast = useToast();
    const authStore = useAuthStore();

    const eventSource = ref<EventSource | null>(null);

    // Composables
    const { sipCredentials, sipRegistrado, cargandoTelefono, conectarTelefono, micSilenciado, toggleMic } = useSipPhone();
    const {
      currentCallId,
      isCalling,
      estadoLlamada,
      llamadaActiva,
      numeroDestino,
      duracionSegundos,
      procesarEventoLlamada,
      makeCall: realizarLlamadaSaliente,
      hangup,
    } = useLlamadaSaliente();
    const modalLlamadaVisible = computed(() => {
      return estadoLlamada.value !== "idle";
    });
    /**
     * INICIALIZAR: Conectar SIP al montar el componente
     */
    const inicializarTelefono = async () => {
      if (sipRegistrado.value) {

        return;
      }

      try {

        const credenciales = await conectarTelefono();

        // Conectar a eventos SSE
        if (!eventSource.value) {
          eventSource.value = conectarEventosLlamada(
            credenciales.agentExtension,
            procesarEventoLlamada
          );

        }

        toast.success("📱 Telefonía inicializada");
      } catch (error: any) {
        console.error("❌ Error inicializando:", error);
        toast.error(error.message ?? "Error al inicializar telefonía");
      }
    };

    /**
     * REALIZAR LLAMADA
     */
    const makeCall = async (externalNumber: string, idEtapaLead: number) => {
      // Validar SIP
      if (!sipRegistrado.value) {
        toast.error("Teléfono no conectado. Reinicia la página.");
        return;
      }

      if (!sipCredentials.value) {
        toast.error("Credenciales no disponibles");
        return;
      }

      // Validar usuario
      if (authStore.idEmploye == null) {
        toast.error("Usuario no autenticado");
        return;
      }



      await realizarLlamadaSaliente(externalNumber, {
        agentExtension: sipCredentials.value.agentExtension,
        idTrabajador: authStore.idEmploye,
        id_etapa_lead: idEtapaLead,

      });
    };

    /**
     * COLGAR LLAMADA
     */
    const handleHangup = async () => {

      await hangup();
    };

    // Ciclo de vida
    onMounted(() => {
      inicializarTelefono();
    });

    onUnmounted(() => {
      if (eventSource.value) {
        eventSource.value.close();
        eventSource.value = null;
      }
    });

    return {
      // Estados
      isCalling,
      currentCallId,
      micSilenciado,   // 👈 agregar
      toggleMic,       // 👈 agregar
      estadoLlamada,
      llamadaActiva,
      numeroDestino,
      duracionSegundos,
      modalLlamadaVisible,

      // Métodos
      makeCall,
      handleHangup,
    };
  },
});