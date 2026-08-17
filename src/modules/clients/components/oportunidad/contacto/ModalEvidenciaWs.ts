import { registrarWhatsappReunion } from "@/modules/clients/actions/clients.atencion.action";
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    visible: { type: Boolean, required: true },
    idEstadoReunion: { type: Number, required: true },
  },

  emits: {
    close: () => true,
    guardar: () => true, // ya no manda item, el padre recarga el historial real
  },

  setup(props, { emit }) {
    const archivoSeleccionado = ref<File | null>(null);
    const archivoPreview = ref<string | null>(null);
    const archivoBase64 = ref<string | null>(null);
    const descripcionWhatsapp = ref("");
    const guardandoWhatsapp = ref(false);
    const errorWhatsapp = ref<string | null>(null);

    function cerrarModalWhatsapp() {
      archivoSeleccionado.value = null;
      descripcionWhatsapp.value = "";
      archivoBase64.value = null;
      errorWhatsapp.value = null;

      if (archivoPreview.value) {
        URL.revokeObjectURL(archivoPreview.value);
      }
      archivoPreview.value = null;

      emit("close");
    }

    function onArchivoSeleccionado(e: Event) {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no puede superar los 5MB");
        return;
      }

      archivoSeleccionado.value = file;

      if (archivoPreview.value) {
        URL.revokeObjectURL(archivoPreview.value);
      }
      archivoPreview.value = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = () => {
        archivoBase64.value = reader.result as string;
      };
      reader.readAsDataURL(file);
    }

    async function guardarEvidencia() {
      if (!archivoSeleccionado.value || !archivoBase64.value) return;

      guardandoWhatsapp.value = true;
      errorWhatsapp.value = null;

      try {
        // El backend sube a Supabase y guarda la URL real en BD
        await registrarWhatsappReunion({
          id_estado_reunion: props.idEstadoReunion,
          url_evidencia: archivoBase64.value,
          mensaje: descripcionWhatsapp.value.trim() || undefined,
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
      archivoPreview,
      descripcionWhatsapp,
      guardandoWhatsapp,
      errorWhatsapp,
      cerrarModalWhatsapp,
      onArchivoSeleccionado,
      guardarEvidencia,
    };
  },
});