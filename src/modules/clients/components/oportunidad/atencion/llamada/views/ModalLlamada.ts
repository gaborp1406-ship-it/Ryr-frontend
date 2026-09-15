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

    // ✅ AGREGAR: Estados para micrófono y altavoz
    const micSilenciado = ref(false);
    const altavozSilenciado = ref(false);

    // ✅ AGREGAR: Referencias a elementos de audio
    const remoteAudioRef = ref<HTMLAudioElement | null>(null);
    const localStreamRef = ref<MediaStream | null>(null);

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
     * ✅ AGREGAR: Silenciar/reactivar micrófono
     */
    const toggleMicrophone = async () => {
      try {
        if (localStreamRef.value) {
          localStreamRef.value.getAudioTracks().forEach(track => {
            track.enabled = micSilenciado.value; // Si estaba silenciado, reactivar
          });
          micSilenciado.value = !micSilenciado.value;
          
          const mensaje = micSilenciado.value ? "🔇 Micrófono silenciado" : "🔊 Micrófono activado";
          toast.info(mensaje);
        }
      } catch (error) {
        console.error("❌ Error al silenciar micrófono:", error);
        toast.error("Error al silenciar micrófono");
      }
    };

    /**
     * ✅ AGREGAR: Silenciar/reactivar altavoz
     */
    const toggleSpeaker = () => {
      try {
        if (remoteAudioRef.value) {
          remoteAudioRef.value.muted = !remoteAudioRef.value.muted;
          altavozSilenciado.value = !altavozSilenciado.value;
          
          const mensaje = altavozSilenciado.value ? "🔇 Altavoz silenciado" : "🔊 Altavoz activado";
          toast.info(mensaje);
        }
      } catch (error) {
        console.error("❌ Error al silenciar altavoz:", error);
        toast.error("Error al silenciar altavoz");
      }
    };

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

        // ✅ AGREGAR: Obtener el elemento de audio remoto
        remoteAudioRef.value = document.getElementById("remoteAudio") as HTMLAudioElement;

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

      // ✅ AGREGAR: Resetear estados de audio
      micSilenciado.value = false;
      altavozSilenciado.value = false;

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
      // ✅ AGREGAR: Limpiar estados de audio
      micSilenciado.value = false;
      altavozSilenciado.value = false;
      
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

      // ✅ AGREGAR: Estados de audio
      micSilenciado,
      altavozSilenciado,

      // Métodos
      makeCall,
      handleHangup,
      toggleMicrophone,  // ✅ AGREGAR
      toggleSpeaker,     // ✅ AGREGAR
    };
  },
});