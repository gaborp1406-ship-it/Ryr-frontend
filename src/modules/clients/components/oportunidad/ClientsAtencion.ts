import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  setup() {
    const proyecto = ref("Condominio Los Álamos");

    const formasPago = ["Al contado", "Crédito hipotecario", "Crédito directo"];
    const formaPagoSeleccionada = ref<string | null>(null);

    const inicioReunion = ref<string | null>(null);
    const finReunion = ref<string | null>(null);
    const duracion = ref<string | null>(null);

    const reunionIniciada = ref(false);
    const reunionFinalizada = ref(false);

    const estado = computed(() => {
      if (reunionFinalizada.value) return "Finalizada";
      if (reunionIniciada.value) return "En curso";
      return "Pendiente";
    });

    const estadoStyle: Record<string, string> = {
      Pendiente: "bg-amber-50 text-amber-600",
      "En curso": "bg-blue-50 text-blue-600",
      Finalizada: "bg-[#2d8c4a]/10 text-[#2d8c4a]",
    };

    function formatearHora(fecha: Date) {
      return fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    }

    let inicioTimestamp: number | null = null;

    function iniciarReunion() {
      const ahora = new Date();
      inicioReunion.value = formatearHora(ahora);
      inicioTimestamp = ahora.getTime();
      reunionIniciada.value = true;

      // Aquí iría la llamada al backend
      // ejemplo: await api.registrarInicioReunion(meetingId, ahora.toISOString())
    }

    function finalizarReunion() {
      if (!formaPagoSeleccionada.value || !inicioTimestamp) return;

      const ahora = new Date();
      finReunion.value = formatearHora(ahora);

      const diffMs = ahora.getTime() - inicioTimestamp;
      const minutos = Math.round(diffMs / 60000);
      const horas = Math.floor(minutos / 60);
      const minsRestantes = minutos % 60;
      duracion.value = horas > 0 ? `${horas}h ${minsRestantes}min` : `${minsRestantes}min`;

      reunionFinalizada.value = true;

      // Aquí iría la llamada al backend
      // ejemplo: await api.registrarFinReunion(meetingId, {
      //   fin: ahora.toISOString(),
      //   formaPago: formaPagoSeleccionada.value,
      // })
    }

    return {
      proyecto,
      formasPago,
      formaPagoSeleccionada,
      inicioReunion,
      finReunion,
      duracion,
      reunionIniciada,
      reunionFinalizada,
      estado,
      estadoStyle,
      iniciarReunion,
      finalizarReunion,
    };
  },
});