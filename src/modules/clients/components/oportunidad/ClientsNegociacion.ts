import { defineComponent, ref, computed } from "vue";

interface Paso {
  id: string;
  titulo: string;
  completado: boolean;
  bloqueado: boolean;
  fecha: string | null;
}

export default defineComponent({
  setup() {
    const pasos = ref<Paso[]>([
      { id: "proforma", titulo: "Proforma enviada al cliente", completado: false, bloqueado: false, fecha: null },
      { id: "aprobacion_bancaria", titulo: "Aprobación bancaria", completado: false, bloqueado: true, fecha: null },
      { id: "precalificacion", titulo: "Pre calificación", completado: false, bloqueado: true, fecha: null },
      { id: "carta_aprobacion", titulo: "Carta de aprobación", completado: false, bloqueado: true, fecha: null },
      { id: "docs_banco", titulo: "Envío de docs al banco", completado: false, bloqueado: true, fecha: null },
    ]);

    const decision = ref<"Aprobación" | "Denegación" | null>(null);

    const completados = computed(() => pasos.value.filter(p => p.completado).length);
    const progreso = computed(() => Math.round((completados.value / pasos.value.length) * 100));

    function formatearFecha() {
      return new Date().toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) + " · " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    }

    function toggle(paso: Paso) {
      if (paso.bloqueado) return;

      paso.completado = !paso.completado;
      paso.fecha = paso.completado ? formatearFecha() : null;

      // Aquí iría la llamada al backend
      // ejemplo: await api.actualizarPaso(leadId, paso.id, paso.completado)

      desbloquearSiguiente(paso);
    }

    function desbloquearSiguiente(pasoActual: Paso) {
      const index = pasos.value.findIndex(p => p.id === pasoActual.id);
      const siguiente = pasos.value[index + 1];
      if (siguiente && pasoActual.completado) {
        siguiente.bloqueado = false;
      }
      // Si se desmarca un paso, bloquea los siguientes para mantener el orden
      if (!pasoActual.completado) {
        for (let i = index + 1; i < pasos.value.length; i++) {
          pasos.value[i].bloqueado = true;
          pasos.value[i].completado = false;
          pasos.value[i].fecha = null;
        }
        if (index === pasos.value.findIndex(p => p.id === "docs_banco")) {
          decision.value = null;
        }
      }
    }

    function registrarDecision(valor: "Aprobación" | "Denegación") {
      decision.value = valor;

      // Aquí iría la llamada al backend
      // ejemplo: await api.registrarDecisionBancaria(leadId, valor)
    }

    return {
      pasos,
      decision,
      completados,
      progreso,
      toggle,
      registrarDecision,
    };
  },
});