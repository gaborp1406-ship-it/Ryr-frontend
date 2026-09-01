import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useToast } from "vue-toastification";

import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { conectarEventosLlamada } from "../actions/Gestioninteraction.action";

import ModalLlamada from "./ModalLlamada.vue";
import { useLlamadaSaliente } from '@/modules/clients/components/oportunidad/atencion/llamada/composables/useLlamadaSaliente';
import { useSipPhone } from '@/modules/clients/components/oportunidad/atencion/llamada/composables/useSipPhone';


export default defineComponent({
  components: {
    ModalLlamada,
  },

  setup() {
    const toast = useToast();
    const authStore = useAuthStore();

    const eventSource = ref<EventSource | null>(null);
    const { sipCredentials, sipRegistrado, conectarTelefono } = useSipPhone();

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
        console.log("✅ SIP ya registrado");
        return;
      }

      try {
        console.log("📱 Inicializando telefonía...");
        const credenciales = await conectarTelefono();

        // Conectar a eventos SSE
        if (!eventSource.value) {
          eventSource.value = conectarEventosLlamada(
            credenciales.agentExtension,
            procesarEventoLlamada
          );
          console.log("📡 SSE conectado");
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

      console.log(`📞 Llamando a: ${externalNumber}`);

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
      console.log("📴 Colgando...");
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