import { defineComponent, ref, computed, onMounted } from "vue";
import {
  useReunionData,
  useReprogramacion,
  useDesistimiento,
  claseEstadoExport,
  type LlamadaFinalizadaPayload,
  type HistorialItem,
} from "./atencion/Usereuniondata";
import ModalEvidenciaGmail from "@/modules/clients/components/oportunidad/contacto/ModalEvidenciaGmail.vue";
import ModalEvidenciaWs from "@/modules/clients/components/oportunidad/contacto/ModalEvidenciaWs.vue";
import IconWhatsapp from "@/modules/common/icons/IconWhatsapp.vue";
import ModalReprogramar from "@/modules/clients/components/oportunidad/atencion/Modalreprogramar.vue";
import ModalDesistir from "@/modules/clients/components/oportunidad/atencion/Modaldesistir.vue";
import { finalizarEtapaAtencion } from "../../actions/clients.atencion.action";

const ITEMS_POR_PAGINA = 3;

export default defineComponent({
  components: {
    IconWhatsapp,
    ModalEvidenciaWs,
    ModalEvidenciaGmail,
    ModalReprogramar,
    ModalDesistir,
  },
  props: {
    idLead: {
      type: [Number, String],
      required: true,
    },
  },
  emits: ["etapa-finalizada"],
  setup(props, { emit }) {
    // Composables
    const reunion = useReunionData(props.idLead);
    const reprogramacion = useReprogramacion(props.idLead);
    const desistimiento = useDesistimiento(props.idLead);

    // Estados locales
    const modalWhatsappAbierto = ref(false);
    const modalEmailAbierto = ref(false);
    const modalLlamadaAbierto = ref(false);
    const pasandoNegociacion = ref(false);
    const errorPasarNegociacion = ref<string | null>(null);
    const paginaActualReuniones = ref(1);

    // Computados
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

    // Métodos - WhatsApp
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

    // Métodos - Email
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

    // Métodos - Llamada
    function abrirModalLlamada() {
      modalLlamadaAbierto.value = true;
    }

    function cerrarModalLlamada() {
      modalLlamadaAbierto.value = false;
    }

    function onLlamadaFinalizada(payload: LlamadaFinalizadaPayload) {
      reunion.historialContacto.value.unshift({
        tipo: "llamada",
        titulo: "Llamada realizada",
        fecha: payload.fecha,
        hora: payload.hora,
        evidencia: false,
        llamada: payload.llamada,
      });
      cerrarModalLlamada();
    }

    // Métodos - Reprogramación
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

    // Métodos - Desistimiento
    async function onConfirmarDesistimiento(motivo: number) {
      // FIX: faltaba asignar el motivo elegido al composable antes de confirmar.
      // Sin esta línea, `desistimiento.motivoSeleccionado` seguía en `null`
      // (lo resetea `abrir()`) y `confirmar()` siempre mostraba
      // "Selecciona un motivo." aunque ya lo hubieras elegido en el modal.
      desistimiento.motivoSeleccionado.value = motivo;

      await desistimiento.confirmar({
        onSuccess: async () => {
          await reunion.cargarInfoEstadoReunion();
          // Recargar todos los datos después de desistir
          await Promise.all([
            reunion.cargarReunion(),
            reunion.cargarHistorialContacto(),
            reunion.cargarHistorialReuniones(),
          ]);

          // FIX: al desistir, el lead cambia de etapa (pasa a "Desistió-O"),
          // así que hay que avisarle al padre (ClientsDetails.ts) para que
          // vuelva a llamar a obtenerEtapaActualLead y actualice el submenu
          // disponible. Antes solo se recargaban los datos locales de este
          // componente, pero nunca se emitía el evento que dispara
          // cargarEtapaActual() en el padre.
          emit("etapa-finalizada");
        },
      });
    }

    // Métodos - Negociación
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

    // Métodos - Paginación
    function irPaginaAnterior() {
      if (paginaActualReuniones.value > 1) paginaActualReuniones.value--;
    }

    function irPaginaSiguiente() {
      if (paginaActualReuniones.value < totalPaginasReuniones.value) paginaActualReuniones.value++;
    }

    function irAPagina(pagina: number) {
      paginaActualReuniones.value = pagina;
    }

    // Lifecycle
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

    return {
      // Reunion
      ...reunion,

      // Reprogramación
      reprogramacion,
      abrirReprogramar,
      onConfirmarReprogramacion,

      // Desistimiento
      desistimiento,
      onConfirmarDesistimiento,

      // WhatsApp
      abrirModalWhatsapp,
      cerrarModalWhatsapp,
      modalWhatsappAbierto,
      onGuardarWhatsapp,

      // Email
      abrirModalEmail,
      cerrarModalEmail,
      modalEmailAbierto,
      onGuardarEmail,

      // Llamada
      abrirModalLlamada,
      cerrarModalLlamada,
      modalLlamadaAbierto,
      onLlamadaFinalizada,

      // Negociación
      pasandoNegociacion,
      errorPasarNegociacion,
      pasarANegociacion,

      // Paginación
      paginaActualReuniones,
      totalPaginasReuniones,
      reunionesPaginadas,
      paginasVisiblesReuniones,
      irPaginaAnterior,
      irPaginaSiguiente,
      irAPagina,

      // Utils
      claseEstado: claseEstadoExport,
    };
  },
});