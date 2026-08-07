import { defineComponent, ref } from "vue";
import type { HistorialItem } from "../ClientsContactoHistorial";
import { registrarWhatsapp } from "@/modules/clients/actions/clientsContacto.action"; // ajusta la ruta real

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    idEstadoContacto: {
      type: Number,
      required: true,
    },
  },

  emits: {
    close: () => true,
    guardar: (item: HistorialItem) => true,
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

      // convertir a base64 para enviar al back
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
        // 1. Registrar en backend (backend sube a Supabase y guarda URL en BD)
        await registrarWhatsapp({
          id_estado_contacto: props.idEstadoContacto,
          url_evidencia: archivoBase64.value,
          mensaje: descripcionWhatsapp.value.trim() || undefined,
        });

        // 2. Armar item para historial visual
      const item: HistorialItem = {
          tipo: "whatsapp",
          titulo: "WhatsApp enviado (evidencia adjunta)",
          fecha: new Date().toLocaleDateString("es-PE"),
          hora: new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          evidencia: true,
          descripcion: descripcionWhatsapp.value.trim() || undefined,
          url_evidencia: archivoPreview.value ?? undefined,
        };
        // 3. Avisar al padre que se guardó con éxito
        emit("guardar", item);

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