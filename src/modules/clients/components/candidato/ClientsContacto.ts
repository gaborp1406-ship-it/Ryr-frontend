import IconWhatsapp from "@/modules/common/icons/IconWhatsapp.vue";
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ModalEvidenciaWs from "./contacto/ModalEvidenciaWs.vue";
import ModalEvidenciaGmail from "./contacto/ModalEvidenciaGmail.vue";
import ModalLlamada from "@/modules/clients/components/candidato/llamada/ModalLlamada.vue";
import ModalDetails from "@/modules/clients/components/candidato/llamada/ModalDetails.vue";
import ModalMotivoDesistio from "@/modules/clients/components/candidato/contacto/ModalMotivoDesistio.vue";
import ModalAgendarReu from "@/modules/clients/components/candidato/contacto/ModalAgendarReu.vue";
import ClientsContactoHistorial from "@/modules/clients/components/candidato/ClientsContactoHistorial.vue";
import type {
  DetalleLlamada,
  LlamadaFinalizadaPayload,
} from "@/modules/clients/components/candidato/llamada/ModalLlamada";
import type { HistorialItem } from "@/modules/clients/components/candidato/ClientsContactoHistorial";
import { finalizarEtapaContactoDesistio, obtenerEstadoContactoLead, registrarCorreo } from "@/modules/clients/actions/clientsContacto.action";
import type { IListarOpcionesResponse } from "../../interfaces/clientscontacto.interface.js";

interface HistorialRefExpuesto {
  cargarHistorial: () => Promise<void>;
  agregarItem: (item: HistorialItem) => void;
  idEstadoContacto: { value: number | null };
}

export default defineComponent({
  components: {
    IconWhatsapp,
    ModalAgendarReu,
    ModalLlamada,
    ModalEvidenciaWs,
    ModalEvidenciaGmail,
    ModalDetails,
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
    const idEstadoContacto = ref<number | null>(null);

    const historialRef = ref<HistorialRefExpuesto | null>(null);


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

      // Caso 1: viene solo la hora, ej "17:44:48.205106"
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

      // Caso 2: viene como fecha completa ISO, ej "2026-07-04T17:44:48.205106"
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
    async function cargarEstadoContacto() {
      try {

        const estado = await obtenerEstadoContactoLead(props.idLead);

        idEstadoContacto.value = estado.id_estado_contacto;

        estadoContacto.value = estado.estado;


        contacto.value = {
          fecha: formatFechaSimple(
            estado.fecha_primer_contacto
          ),
          hora: formatHoraSimple(
            estado.hora_primer_contacto
          ),
        };


      } catch (error) {

        console.error(
          "Error cargando estado contacto",
          error
        );

      }
    }
    const contacto = ref({
      fecha: "-",
      hora: "-",
    });

    function onPrimerContactoCargado(payload: { fecha: string; hora: string }) {
      contacto.value = payload;
    }

    // ---------- Llamada ----------
    const modalLlamadaAbierto = ref(false);

    function abrirModalLlamada() {
      modalLlamadaAbierto.value = true;
    }

    function cerrarModalLlamada() {
      modalLlamadaAbierto.value = false;
    }

    function onLlamadaFinalizada(payload: LlamadaFinalizadaPayload) {
      historialRef.value?.agregarItem({
        tipo: "llamada",
        titulo: "Llamada realizada",
        fecha: payload.fecha,
        hora: payload.hora,
        evidencia: false,
        llamada: payload.llamada,
      });
    }

    const modalDetalleLlamadaAbierto = ref(false);
    const detalleLlamadaSeleccionada = ref<DetalleLlamada | null>(null);

    function verDetalleLlamada(item: HistorialItem) {
      if (!item.llamada) return;
      detalleLlamadaSeleccionada.value = item.llamada;
      modalDetalleLlamadaAbierto.value = true;
    }

    function cerrarModalDetalleLlamada() {
      modalDetalleLlamadaAbierto.value = false;
      detalleLlamadaSeleccionada.value = null;
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

    async function onGuardarWhatsapp(item: HistorialItem) {
      historialRef.value?.agregarItem(item);

      // refresca fecha/hora de primer contacto (por si era el primer registro)
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

    async function onGuardarEmail(item: HistorialItem) {
      historialRef.value?.agregarItem(item);

      // refresca fecha/hora de primer contacto (por si era el primer registro)
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

    async function onConfirmarDesistio(
      opcion: IListarOpcionesResponse
    ) {

      try {

        await finalizarEtapaContactoDesistio({
          id_lead: props.idLead,
          motivo: opcion.id,
        });


        cerrarModalDesistio();


        emit("etapa-finalizada");


      } catch (error) {

        console.error(
          "Error finalizando desistimiento",
          error
        );

      }

    }

    async function onReunionAgendada() {
      cerrarModalAgendarReunion();

      // Recargar la etapa actual del lead
      emit("etapa-finalizada");
    }

    onMounted(() => {
      cargarEstadoContacto();
    });

    return {
      idLead: props.idLead,
      contacto,
      historialRef,
      onPrimerContactoCargado,
      verDetalleLlamada,
      modalWhatsappAbierto,
      abrirModalWhatsapp,
      cerrarModalWhatsapp,
      onGuardarWhatsapp,
      modalEmailAbierto,
      abrirModalEmail,
      cerrarModalEmail,
      onGuardarEmail,
      modalLlamadaAbierto,
      abrirModalLlamada,
      cerrarModalLlamada,
      modalDesistioAbierto,
      estadoContacto,
      abrirModalDesistio,
      onReunionAgendada,
      cerrarModalDesistio,
      onConfirmarDesistio,
      onLlamadaFinalizada,
      idEstadoContacto,
      modalDetalleLlamadaAbierto,
      detalleLlamadaSeleccionada,
      cerrarModalDetalleLlamada,
      modalAgendarReunionAbierto,
      cerrarModalAgendarReunion,
      agendarReunion,
    };
  },
});