import { registrarWhatsappReunion } from "@/modules/clients/actions/clients.atencion.action";
import { defineComponent, ref } from "vue";

function fechaHoy(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function horaAhora(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

export default defineComponent({
  props: {
    visible: { type: Boolean, required: true },
    idEstadoReunion: { type: Number, required: true },
  },

  emits: {
    close: () => true,
    guardar: () => true, // el padre recarga el historial real
  },

  setup(props, { emit }) {
    const fecha = ref(fechaHoy());
    const hora = ref(horaAhora());
    const guardandoWhatsapp = ref(false);
    const errorWhatsapp = ref<string | null>(null);

    function resetFormulario() {
      fecha.value = fechaHoy();
      hora.value = horaAhora();
      errorWhatsapp.value = null;
    }

    function cerrarModalWhatsapp() {
      resetFormulario();
      emit("close");
    }

    async function guardarEvidencia() {
      if (!fecha.value || !hora.value) {
        errorWhatsapp.value = "Debes indicar fecha y hora.";
        return;
      }

      guardandoWhatsapp.value = true;
      errorWhatsapp.value = null;

      try {
        await registrarWhatsappReunion({
          id_estado_reunion: props.idEstadoReunion,
          fecha: fecha.value,
          hora: hora.value,
          tipo_historial: 21,
        });

        // Avisamos al padre que terminó: él recarga el historial desde el backend
        emit("guardar");
        cerrarModalWhatsapp();
      } catch (error) {
        console.error("Error guardando evidencia WhatsApp", error);
        errorWhatsapp.value = "No se pudo guardar la evidencia. Intenta de nuevo.";
      } finally {
        guardandoWhatsapp.value = false;
      }
    }

    return {
      fecha,
      hora,
      guardandoWhatsapp,
      errorWhatsapp,
      cerrarModalWhatsapp,
      guardarEvidencia,
    };
  },
});