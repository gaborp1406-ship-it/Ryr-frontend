import { defineComponent, ref, computed } from "vue";

interface Paso {
  id: string;
  titulo: string;
  completado: boolean;
  bloqueado: boolean;
  fecha: string | null;
  requiereEvidencia: boolean;
  evidenciaPreview: string | null;
  evidenciaNombre: string | null;
  archivo: File | null;
}

export default defineComponent({
  setup() {
    const pasos = ref<Paso[]>([
      {
        id: "cuota_inicial",
        titulo: "Abono de cuota inicial",
        completado: false,
        bloqueado: false,
        fecha: null,
        requiereEvidencia: false,
        evidenciaPreview: null,
        evidenciaNombre: null,
        archivo: null,
      },
      {
        id: "firma_minuta",
        titulo: "Firma de minuta",
        completado: false,
        bloqueado: true,
        fecha: null,
        requiereEvidencia: false,
        evidenciaPreview: null,
        evidenciaNombre: null,
        archivo: null,
      },
      {
        id: "sperant",
        titulo: "Subida de documentos a Sperant",
        completado: false,
        bloqueado: true,
        fecha: null,
        requiereEvidencia: true,
        evidenciaPreview: null,
        evidenciaNombre: null,
        archivo: null,
      },
    ]);

    const completados = computed(() => pasos.value.filter(p => p.completado).length);
    const progreso = computed(() => Math.round((completados.value / pasos.value.length) * 100));

    function formatearFecha() {
      return new Date().toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " · " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    }

    function onArchivoSeleccionado(e: Event, paso: Paso) {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      paso.archivo = file;
      paso.evidenciaNombre = file.name;
      paso.evidenciaPreview = URL.createObjectURL(file);
    }

    function toggle(paso: Paso) {
      if (paso.bloqueado) return;

      // Si el paso requiere evidencia, no se puede completar sin archivo subido
      if (paso.requiereEvidencia && !paso.completado && !paso.archivo) return;

      paso.completado = !paso.completado;
      paso.fecha = paso.completado ? formatearFecha() : null;

      // Aquí iría la llamada al backend
      // ejemplo: await api.actualizarPasoVenta(leadId, paso.id, paso.completado, paso.archivo)

      desbloquearSiguiente(paso);
    }

    function desbloquearSiguiente(pasoActual: Paso) {
      const index = pasos.value.findIndex(p => p.id === pasoActual.id);
      const siguiente = pasos.value[index + 1];

      if (siguiente && pasoActual.completado) {
        siguiente.bloqueado = false;
      }

      // Si se desmarca un paso, bloquea y resetea los siguientes
      if (!pasoActual.completado) {
        for (let i = index + 1; i < pasos.value.length; i++) {
          pasos.value[i].bloqueado = true;
          pasos.value[i].completado = false;
          pasos.value[i].fecha = null;
          pasos.value[i].evidenciaPreview = null;
          pasos.value[i].evidenciaNombre = null;
          pasos.value[i].archivo = null;
        }
      }
    }

    return {
      pasos,
      completados,
      progreso,
      toggle,
      onArchivoSeleccionado,
    };
  },
});