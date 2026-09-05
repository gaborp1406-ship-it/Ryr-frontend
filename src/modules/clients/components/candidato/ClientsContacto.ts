import IconWhatsapp from "@/modules/common/icons/IconWhatsapp.vue";
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import ModalEvidenciaWs from "./contacto/ModalEvidenciaWs.vue";
import ModalEvidenciaGmail from "./contacto/ModalEvidenciaGmail.vue";
import ModalLlamada from "@/modules/clients/components/candidato/llamada/views/ModalLlamada.vue";
import ModalMotivoDesistio from "@/modules/clients/components/candidato/contacto/ModalMotivoDesistio.vue";
import ModalAgendarReu from "@/modules/clients/components/candidato/contacto/ModalAgendarReu.vue";
import ClientsContactoHistorial from "@/modules/clients/components/candidato/ClientsContactoHistorial.vue";
import type { HistorialItem } from "@/modules/clients/components/candidato/ClientsContactoHistorial";
import {
  finalizarEtapaContactoDesistio,
  guardarMensajeLeadEtapaContacto,
  obtenerEstadoContactoLead,
  obtenerHistorialMensajesLeadEtapaContacto,
  registrarPrimerContacto,
} from "@/modules/clients/actions/clientsContacto.action";
import type { IHistorialMensajeLeadEtapaContactoResponse, IListarOpcionesResponse } from "../../interfaces/clientscontacto.interface.js";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useSipPhone } from "@/modules/clients/components/candidato/llamada/composables/useSipPhone.js";
import { useLlamadaSaliente } from "@/modules/clients/components/candidato/llamada/composables/useLlamadaSaliente.js";
import { conectarEventosLlamada } from "@/modules/clients/components/candidato/llamada/actions/Gestioninteraction.action.js";

interface HistorialRefExpuesto {
  cargarHistorial: () => Promise<void>;
  agregarItem: (item: HistorialItem) => void;
  idEstadoContacto: { value: number | null };
}

const MENSAJES_POR_PAGINA = 2;

export default defineComponent({
  components: {
    IconWhatsapp,
    ModalAgendarReu,
    ModalLlamada,
    ModalEvidenciaWs,
    ModalEvidenciaGmail,
    ModalMotivoDesistio,
    ClientsContactoHistorial,
  },
  props: {
    idLead: {
      type: Number,
      required: true,
    },
  },
  emits: {
    "etapa-finalizada": () => true,
  },
  setup(props, { emit }) {
    const router = useRouter();
    const toast = useToast();
    const authStore = useAuthStore();
    const idEstadoContacto = ref<number | null>(null);
    const idEtapa = ref<number | null>(null);
    const telefonoLead = ref<string | null>(null);

    const cargando = ref(true);
    const historialRef = ref<HistorialRefExpuesto | null>(null);

    // ---------- Historial de mensajes ----------
    const nuevoMensaje = ref("");
    const enviandoMensaje = ref(false);
    const historialMensajes = ref<IHistorialMensajeLeadEtapaContactoResponse[]>([]);
    const cargandoHistorialMensajes = ref(false);
    const paginaActual = ref(1);

    const mensajesOrdenados = computed(() =>
      [...historialMensajes.value].sort(
        (a, b) =>
          new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
      )
    );

    const totalPaginas = computed(() =>
      Math.max(1, Math.ceil(mensajesOrdenados.value.length / MENSAJES_POR_PAGINA))
    );

    const mensajesPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * MENSAJES_POR_PAGINA;
      return mensajesOrdenados.value.slice(inicio, inicio + MENSAJES_POR_PAGINA);
    });

    watch(totalPaginas, (nuevoTotal) => {
      if (paginaActual.value > nuevoTotal) {
        paginaActual.value = nuevoTotal;
      }
    });

    function irPaginaAnterior() {
      if (paginaActual.value > 1) {
        paginaActual.value -= 1;
      }
    }

    function irPaginaSiguiente() {
      if (paginaActual.value < totalPaginas.value) {
        paginaActual.value += 1;
      }
    }

    async function cargarHistorialMensajes() {
      if (!idEstadoContacto.value) return;

      cargandoHistorialMensajes.value = true;
      try {
        const data = await obtenerHistorialMensajesLeadEtapaContacto(
          idEstadoContacto.value
        );
        historialMensajes.value = data ?? [];
      } catch (error: any) {
        console.error("Error cargando historial de mensajes", error);
        toast.error(error.message ?? "No se pudo cargar el historial de mensajes");
      } finally {
        cargandoHistorialMensajes.value = false;
      }
    }

    async function enviarMensaje() {
      if (!idEstadoContacto.value) return;

      if (!nuevoMensaje.value.trim()) {
        toast.error("El mensaje no puede estar vacío");
        return;
      }

      enviandoMensaje.value = true;
      try {
        await guardarMensajeLeadEtapaContacto(
          idEstadoContacto.value,
          nuevoMensaje.value
        );
        nuevoMensaje.value = "";
        toast.success("Mensaje guardado correctamente");
        paginaActual.value = 1;
        await cargarHistorialMensajes();
      } catch (error: any) {
        console.error("Error guardando mensaje", error);
        toast.error(error.message ?? "No se pudo guardar el mensaje");
      } finally {
        enviandoMensaje.value = false;
      }
    }

    // ---------- Llamada (SIP + SSE + estado de la llamada) ----------
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



    function formatFechaSimple(valor: string | null | undefined): string {
      if (!valor) return "-";
      const d = new Date(valor);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      return valor;
    }

    function formatHoraSimple(valor: string | null | undefined): string {
      if (!valor) return "-";
      const soloHoraMatch = valor.match(/^(\d{1,2}):(\d{2}):(\d{2})/);
      if (soloHoraMatch) {
        const [, horas, minutos] = soloHoraMatch;
        const fechaAuxiliar = new Date();
        fechaAuxiliar.setHours(Number(horas), Number(minutos), 0, 0);
        return fechaAuxiliar.toLocaleTimeString("es-PE", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      const d = new Date(valor);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("es-PE", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return valor;
    }

    function formatFechaHoraCompleta(valor: string | null | undefined): string {
      if (!valor) return "-";
      const d = new Date(valor);
      if (!isNaN(d.getTime())) {
        const fecha = d.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const hora = d.toLocaleTimeString("es-PE", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return `${fecha} · ${hora}`;
      }
      return valor;
    }

 async function cargarEstadoContacto() {
  try {
    const estado = await obtenerEstadoContactoLead(props.idLead);

    idEstadoContacto.value = estado.id_estado_contacto;
    estadoContacto.value = estado.estado;

    idEtapa.value = estado.id_etapa;

    telefonoLead.value = estado.telefono
      ? String(estado.telefono)
      : null;

    contacto.value = {
      fecha: formatFechaSimple(estado.fecha_primer_contacto),
      hora: formatHoraSimple(estado.hora_primer_contacto),
    };
  } catch (error) {
    console.error("Error cargando estado contacto", error);
  } finally {
    cargando.value = false;
  }
}


    const contacto = ref({
      fecha: "-",
      hora: "-",
    });

    function onPrimerContactoCargado(payload: { fecha: string; hora: string }) {
      contacto.value = payload;
    }

    // Cargar historial de mensajes en cuanto tengamos el id de estado de contacto
    watch(idEstadoContacto, (nuevoId) => {
      if (nuevoId) {
        cargarHistorialMensajes();
      }
    });

    // ---------- Llamada ----------
    const modalLlamadaAbierto = ref(false);

    watch(estadoLlamada, (nuevoEstado, estadoAnterior) => {
      if (nuevoEstado === "idle" && estadoAnterior !== "idle") {
        modalLlamadaAbierto.value = false;
        recargarDespuesDeLlamada();
      }
    });

    async function recargarDespuesDeLlamada() {

      const esPrimerContacto = contacto.value.fecha === "-";

      if (esPrimerContacto && idEstadoContacto.value != null) {
        try {
          await registrarPrimerContacto(idEstadoContacto.value);
        } catch (error) {

        }
      }

      await historialRef.value?.cargarHistorial();
      await cargarEstadoContacto();
      setTimeout(() => {
        historialRef.value?.cargarHistorial();
      }, 4000);
    }


    async function abrirModalLlamada() {
      modalLlamadaAbierto.value = true;

      try {
        // Validar teléfono
        if (!telefonoLead.value) {
          throw new Error("El lead no tiene un teléfono registrado");
        }

        // Validar etapa
        if (idEtapa.value == null) {
          throw new Error("No se pudo obtener la etapa actual del lead");
        }

        // Conectar teléfono SIP si aún no está registrado
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

        console.log("📞 Datos de llamada:", {
          telefono: telefonoLead.value,
          idEtapaLead: idEtapa.value,
          idTrabajador: authStore.idEmploye,
          agentExtension: sipCredentials.value.agentExtension,
          idLead: props.idLead,
        });

        // Realizar llamada al teléfono REAL del lead
        await realizarLlamadaSaliente(telefonoLead.value, {
          agentExtension: sipCredentials.value.agentExtension,
          idTrabajador: authStore.idEmploye,
          id_etapa_lead: idEtapa.value,
        });

      } catch (error: any) {
        console.error("Error al iniciar la llamada", error);

        toast.error(
          error.message ?? "No se pudo iniciar la llamada"
        );

        modalLlamadaAbierto.value = false;
      }
    }




    async function cerrarModalLlamada() {
      // Si hay una llamada en curso, cuelga antes de cerrar el modal
      if (llamadaActiva.value || estadoLlamada.value !== "idle") {
        await hangup();
      }
      modalLlamadaAbierto.value = false;
    }

    const modalAgendarReunionAbierto = ref(false);

    function agendarReunion() {
      modalAgendarReunionAbierto.value = true;
    }

    function cerrarModalAgendarReunion() {
      modalAgendarReunionAbierto.value = false;
    }

    // ---------- WhatsApp ----------
    const modalWhatsappAbierto = ref(false);

    function abrirModalWhatsapp() {
      modalWhatsappAbierto.value = true;
    }

    function cerrarModalWhatsapp() {
      modalWhatsappAbierto.value = false;
    }

    async function onGuardarWhatsapp() {
      await historialRef.value?.cargarHistorial();
      await cargarEstadoContacto();
      cerrarModalWhatsapp();
    }

    // ---------- Email ----------
    const modalEmailAbierto = ref(false);

    function abrirModalEmail() {
      modalEmailAbierto.value = true;
    }

    function cerrarModalEmail() {
      modalEmailAbierto.value = false;
    }

    async function onGuardarEmail() {
      await historialRef.value?.cargarHistorial();
      await cargarEstadoContacto();
      cerrarModalEmail();
    }

    const modalDesistioAbierto = ref(false);

    function abrirModalDesistio() {
      modalDesistioAbierto.value = true;
    }
    const estadoContacto = ref(false);
    function cerrarModalDesistio() {
      modalDesistioAbierto.value = false;
    }

    async function onConfirmarDesistio(opcion: IListarOpcionesResponse) {
      try {
        await finalizarEtapaContactoDesistio({
          id_lead: props.idLead,
          motivo: opcion.id,
        });
        cerrarModalDesistio();
        emit("etapa-finalizada");
      } catch (error) {
        console.error("Error finalizando desistimiento", error);
      }
    }

    async function onReunionAgendada() {
      cerrarModalAgendarReunion();
      emit("etapa-finalizada");
    }
    function cerrarModalLlamadaAuto() {
      modalLlamadaAbierto.value = false;
    }

    onMounted(() => {
      cargarEstadoContacto();
    });

    onUnmounted(() => {
      if (eventSource.value) {
        eventSource.value.close();
        eventSource.value = null;
      }
    });

    return {
      idLead: props.idLead,
      contacto,
      cargando,
      historialRef,
      onPrimerContactoCargado,

      modalWhatsappAbierto,
      abrirModalWhatsapp,
      cerrarModalWhatsapp,
      onGuardarWhatsapp,
      modalEmailAbierto,
      abrirModalEmail,
      cerrarModalEmail,
      onGuardarEmail,
      idEtapa,
      // Llamada
      modalLlamadaAbierto,
      abrirModalLlamada,
      cerrarModalLlamada,
      estadoLlamada,
      llamadaActiva,
      numeroDestino,
      duracionSegundos,

      modalDesistioAbierto,

      estadoContacto,
      abrirModalDesistio,
      onReunionAgendada,
      cerrarModalDesistio,
      onConfirmarDesistio,

      // Historial de mensajes
      nuevoMensaje,
      enviandoMensaje,
      historialMensajes,
      cargandoHistorialMensajes,
      mensajesPaginados,
      paginaActual,
      totalPaginas,
      enviarMensaje,
      irPaginaAnterior,
      irPaginaSiguiente,
      formatFechaHoraCompleta,

      idEstadoContacto,
      cargandoTelefono,

      modalAgendarReunionAbierto,
      cerrarModalAgendarReunion,
      agendarReunion,
    };
  },
});