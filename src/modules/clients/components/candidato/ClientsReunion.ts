import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();

    const reunion = ref({
      tipo: "Visita a caseta", // "Visita a caseta" | "Videollamada"
      proyecto: "Condominio Los Álamos",
      fecha: "28/07/2026",
      hora: "04:30 PM",
      estado: "Pendiente" as "Pendiente" | "Confirmada" | "Reprogramada" | "Cancelada",
    });

    const estadoStyle: Record<string, string> = {
      Pendiente: "bg-amber-50 text-amber-600",
      Confirmada: "bg-[#2d8c4a]/10 text-[#2d8c4a]",
      Reprogramada: "bg-blue-50 text-blue-600",
      Cancelada: "bg-rose-50 text-rose-600",
    };

    // --- Acciones principales ---
    function reprogramar() {
      // Aquí iría la lógica/redirección para elegir nueva fecha y hora
      // ejemplo: router.push({ name: "MeetingsReprogramar", params: { id: meetingId } })
      reunion.value.estado = "Reprogramada";
    }

    function cancelarReunion() {
      // Aquí iría la llamada al backend
      // ejemplo: await api.cancelarReunion(meetingId)
      reunion.value.estado = "Cancelada";
    }

    function marcarAsistio() {
      // Aquí iría la llamada al backend para marcar asistencia
      // ejemplo: await api.marcarAsistencia(meetingId, true)
      router.push({ name: "MeetingsAsistio" }); // ajusta según tu router
    }

    // --- Modal: No asistió ---
    const modalNoAsistioAbierto = ref(false);
    const motivosNoAsistio = ["No respondió", "Canceló", "No se presentó"];
    const motivoNoAsistioSeleccionado = ref<string | null>(null);

    function marcarNoAsistio() {
      modalNoAsistioAbierto.value = true;
    }

    function cerrarModalNoAsistio() {
      modalNoAsistioAbierto.value = false;
      motivoNoAsistioSeleccionado.value = null;
    }

    function seleccionarMotivoNoAsistio(motivo: string) {
      motivoNoAsistioSeleccionado.value = motivo;
    }

    function confirmarNoAsistio() {
      if (!motivoNoAsistioSeleccionado.value) return;

      // Aquí iría la llamada al backend para guardar el motivo de inasistencia
      // ejemplo: await api.registrarInasistencia(meetingId, motivoNoAsistioSeleccionado.value)

      cerrarModalNoAsistio();
      router.push({ name: "MeetingsNoAsistio" }); // ajusta según tu router
    }

    return {
      reunion,
      estadoStyle,
      reprogramar,
      cancelarReunion,
      marcarAsistio,
      marcarNoAsistio,
      modalNoAsistioAbierto,
      motivosNoAsistio,
      motivoNoAsistioSeleccionado,
      cerrarModalNoAsistio,
      seleccionarMotivoNoAsistio,
      confirmarNoAsistio,
    };
  },
});