import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import {
  useReunionData,
  useReprogramacion,
  useDesistimiento,
  useFinalizarActividad,
  claseEstadoExport,
  type HistorialItem,
} from "./atencion/Usereuniondata";
import ModalEvidenciaGmail from "@/modules/clients/components/oportunidad/contacto/ModalEvidenciaGmail.vue";
import ModalEvidenciaWs from "@/modules/clients/components/oportunidad/contacto/ModalEvidenciaWs.vue";
import IconWhatsapp from "@/modules/common/icons/IconWhatsapp.vue";
import ModalReprogramar from "@/modules/clients/components/oportunidad/atencion/Modalreprogramar.vue";
import ModalDesistir from "@/modules/clients/components/oportunidad/atencion/Modaldesistir.vue";
import ModalAgendarReu from "@/modules/clients/components/oportunidad/atencion/ModalAgendarReu.vue";
import ModalLlamada from "@/modules/clients/components/oportunidad/atencion/llamada/views/ModalLlamada.vue";
import { finalizarEtapaAtencion } from "../../actions/clients.atencion.action";
import { useSipPhone } from "@/modules/clients/components/candidato/llamada/composables/useSipPhone.js";
import { useLlamadaSaliente } from "@/modules/clients/components/candidato/llamada/composables/useLlamadaSaliente.js";
import { conectarEventosLlamada } from "@/modules/clients/components/candidato/llamada/actions/Gestioninteraction.action.js";

const ITEMS_POR_PAGINA = 3;

export default defineComponent({
  components: {
    IconWhatsapp,
    ModalEvidenciaWs,
    ModalEvidenciaGmail,
    ModalReprogramar,
    ModalDesistir,
    ModalAgendarReu,
    ModalLlamada,
  },
  props: {
    idLead: {
      type: [Number, String],
      required: true,
    },
  },
  emits: ["etapa-finalizada"],
  setup(props, { emit }) {
    const toast = useToast();
    const authStore = useAuthStore();

    // Composables de datos
    const reunion = useReunionData(props.idLead);
    const reprogramacion = useReprogramacion(props.idLead);
    const desistimiento = useDesistimiento(props.idLead);
    const finalizarActividadState = useFinalizarActividad(props.idLead);

    // ---------- Llamada (SIP + SSE) ----------
    const eventSource = ref<EventSource | null>(null);
    const { sipCredentials, sipRegistrado, cargandoTelefono, conectarTelefono } = useSipPhone();
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

    const modalLlamadaAbierto = ref(false);

    watch(estadoLlamada, (nuevoEstado, estadoAnterior) => {
      if (nuevoEstado === "idle" && estadoAnterior !== "idle") {
        modalLlamadaAbierto.value = false;
        recargarDespuesDeLlamada();
      }
    });

    async function recargarDespuesDeLlamada() {
      await Promise.all([
        reunion.cargarReunion(),
        reunion.cargarHistorialContacto(),
        reunion.cargarHistorialReuniones(),
      ]);
      setTimeout(() => {
        reunion.cargarHistorialContacto();
      }, 4000);
    }
    const puedeCrearReunion = computed(() => {
      const estado = Number((reunion.reunion.value as any)?.estado);
      return estado === 14;
    });
    async function abrirModalLlamada() {
      modalLlamadaAbierto.value = true;

      try {
        if (!reunion.telefonoLead.value) {
          throw new Error("El lead no tiene un teléfono registrado");
        }

        if (reunion.idEstadoReunion.value == null) {
          throw new Error("No se pudo obtener la etapa actual del lead");
        }

        if (reunion.idLeadEtapa.value == null) { // ✅ Validar
          throw new Error("No se pudo obtener la etapa del lead");
        }
        if (!sipRegistrado.value) {
          const credenciales = await conectarTelefono();

          if (!eventSource.value) {
            eventSource.value = conectarEventosLlamada(
              credenciales.agentExtension,
              procesarEventoLlamada
            );
          }
        }

        if (!sipCredentials.value) {
          throw new Error("No se pudieron obtener las credenciales SIP");
        }

        if (authStore.idEmploye == null) {
          throw new Error("Usuario no autenticado");
        }

        await realizarLlamadaSaliente(reunion.telefonoLead.value, {
          agentExtension: sipCredentials.value.agentExtension,
          idTrabajador: authStore.idEmploye,
          id_etapa_lead: reunion.idLeadEtapa.value,
        });
      } catch (error: any) {
        console.error("Error al iniciar la llamada", error);
        toast.error(error.message ?? "No se pudo iniciar la llamada");
        modalLlamadaAbierto.value = false;
      }
    }

    async function cerrarModalLlamada() {
      if (llamadaActiva.value || estadoLlamada.value !== "idle") {
        await hangup();
      }
      modalLlamadaAbierto.value = false;
    }

    // ---------- Estados locales resto ----------
    const modalWhatsappAbierto = ref(false);
    const modalEmailAbierto = ref(false);
    const modalReunionAbierto = ref(false);
    const pasandoNegociacion = ref(false);
    const errorPasarNegociacion = ref<string | null>(null);
    const paginaActualReuniones = ref(1);

    const totalPaginasReuniones = computed(() =>
      Math.max(1, Math.ceil(reunion.historialReuniones.value.length / ITEMS_POR_PAGINA))
    );

    const reunionesPaginadas = computed(() => {
      const inicio = (paginaActualReuniones.value - 1) * ITEMS_POR_PAGINA;
      return reunion.historialReuniones.value.slice(inicio, inicio + ITEMS_POR_PAGINA);
    });

    const paginasVisiblesReuniones = computed(() => {
      const total = totalPaginasReuniones.value;
      const actual = paginaActualReuniones.value;
      const ventana = 5;

      let inicio = Math.max(1, actual - Math.floor(ventana / 2));
      let fin = Math.min(total, inicio + ventana - 1);
      inicio = Math.max(1, fin - ventana + 1);

      const paginas: number[] = [];
      for (let i = inicio; i <= fin; i++) paginas.push(i);
      return paginas;
    });

    function abrirModalWhatsapp() {
      modalWhatsappAbierto.value = true;
    }
    function cerrarModalWhatsapp() {
      modalWhatsappAbierto.value = false;
    }
    async function onGuardarWhatsapp() {
      await reunion.cargarHistorialContacto();
      cerrarModalWhatsapp();
    }

    function abrirModalEmail() {
      modalEmailAbierto.value = true;
    }
    function cerrarModalEmail() {
      modalEmailAbierto.value = false;
    }
    async function onGuardarEmail() {
      await reunion.cargarHistorialContacto();
      cerrarModalEmail();
    }

    function abrirReprogramar() {
      reprogramacion.abrir(reunion.reunion.value);
    }

    async function onConfirmarReprogramacion(fecha: string, hora: string) {
      reprogramacion.nuevaFecha.value = fecha;
      reprogramacion.nuevaHora.value = hora;

      await reprogramacion.confirmar(reunion.reunion.value, {
        onSuccess: async () => {
          await reunion.cargarReunion();
          await reunion.cargarHistorialContacto();
          await reunion.cargarHistorialReuniones();
        },
      });
    }

    async function onConfirmarDesistimiento(motivo: number) {
      desistimiento.motivoSeleccionado.value = motivo;

      await desistimiento.confirmar({
        onSuccess: async () => {
          await reunion.cargarInfoEstadoReunion();
          await Promise.all([
            reunion.cargarReunion(),
            reunion.cargarHistorialContacto(),
            reunion.cargarHistorialReuniones(),
          ]);
          emit("etapa-finalizada");
        },
      });
    }

    async function marcarComoRealizada() {
      await finalizarActividadState.confirmar(reunion.reunion.value, {
        onSuccess: async () => {
          await Promise.all([
            reunion.cargarReunion(),
            reunion.cargarHistorialContacto(),
            reunion.cargarHistorialReuniones(),
          ]);
        },
      });
    }

    function abrirModalReunion() {
      modalReunionAbierto.value = true;
    }
    function cerrarModalReunion() {
      modalReunionAbierto.value = false;
    }
    async function onReunionAgendada() {
      await Promise.all([
        reunion.cargarReunion(),
        reunion.cargarHistorialReuniones(),
      ]);
    }

    async function pasarANegociacion() {
      const idLead = Number(props.idLead);
      if (!idLead) {
        errorPasarNegociacion.value = "No se encontró el ID del lead.";
        return;
      }
      pasandoNegociacion.value = true;
      errorPasarNegociacion.value = null;
      try {
        await finalizarEtapaAtencion(idLead);
        emit("etapa-finalizada");
      } catch (e) {
        errorPasarNegociacion.value =
          e instanceof Error ? e.message : "Error al pasar a negociación.";
      } finally {
        pasandoNegociacion.value = false;
      }
    }

    function irPaginaAnterior() {
      if (paginaActualReuniones.value > 1) paginaActualReuniones.value--;
    }
    function irPaginaSiguiente() {
      if (paginaActualReuniones.value < totalPaginasReuniones.value) paginaActualReuniones.value++;
    }
    function irAPagina(pagina: number) {
      paginaActualReuniones.value = pagina;
    }

    onMounted(async () => {
      await Promise.all([
        reunion.cargarInfoEstadoReunion(),
        reunion.cargarReunion(),
      ]);
      await Promise.all([
        reunion.cargarHistorialContacto(),
        reunion.cargarHistorialReuniones(),
      ]);
    });
    const puedeMarcarRealizada = computed(() => {
      const estado = Number((reunion.reunion.value as any)?.estado);
      return estado !== 14; // Se puede marcar como realizada si NO está en estado 14
    });
    onUnmounted(() => {
      if (eventSource.value) {
        eventSource.value.close();
        eventSource.value = null;
      }
    });

    return {
      ...reunion,

      reprogramacion,
      abrirReprogramar,
      onConfirmarReprogramacion,

      desistimiento,
      onConfirmarDesistimiento,

      finalizarActividadState,
      marcarComoRealizada,

      modalReunionAbierto,
      abrirModalReunion,
      cerrarModalReunion,
      onReunionAgendada,

      abrirModalWhatsapp,
      cerrarModalWhatsapp,
      modalWhatsappAbierto,
      onGuardarWhatsapp,
      puedeMarcarRealizada,
      abrirModalEmail,
      cerrarModalEmail,
      modalEmailAbierto,
      onGuardarEmail,
      puedeCrearReunion,
      // Llamada
      modalLlamadaAbierto,
      abrirModalLlamada,
      cerrarModalLlamada,
      estadoLlamada,
      llamadaActiva,
      numeroDestino,
      duracionSegundos,
      cargandoTelefono,

      pasandoNegociacion,
      errorPasarNegociacion,
      pasarANegociacion,

      paginaActualReuniones,
      totalPaginasReuniones,
      reunionesPaginadas,
      paginasVisiblesReuniones,
      irPaginaAnterior,
      irPaginaSiguiente,
      irAPagina,

      claseEstado: claseEstadoExport,
    };
  },
});