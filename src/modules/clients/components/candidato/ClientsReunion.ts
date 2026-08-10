import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { IListarActividadLeadResponse } from "../../interfaces/clientsreunion.interface";
import { listarActividadesPorLead } from "../../actions/clientsReunion.action";
import { actualizarFechaHoraActividad } from "../../actions/clientsReunion.action";
import type {
  IActualizarFechaHoraActividadRequest,
  IActualizarFechaHoraActividadResponse,
} from "../../interfaces/clientsreunion.interface";

export default defineComponent({
  props: {
    idLead: {
      type: [Number, String],
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    const cargando = ref(true);
    const error = ref<string | null>(null);
    const reunion = ref<IListarActividadLeadResponse | null>(null);

    const estadoStyle: Record<string, string> = {
      Pendiente: "bg-amber-50 text-amber-600",
      Confirmada: "bg-[#2d8c4a]/10 text-[#2d8c4a]",
      Reprogramada: "bg-blue-50 text-blue-600",
      Cancelada: "bg-rose-50 text-rose-600",
      "Asistió": "bg-[#2d8c4a]/10 text-[#2d8c4a]",
      "No asistió": "bg-rose-50 text-rose-600",
    };

    // Estilo del badge según nombre_estado, con fallback por si llega un valor no mapeado
    const estadoStyleActual = computed(() => {
      if (!reunion.value) return "";
      return estadoStyle[reunion.value.nombre_estado] ?? "bg-slate-100 text-slate-500";
    });

    // Ícono: caseta vs videollamada, según el texto de tipo_actividad
    const esVideollamada = computed(() =>
      reunion.value?.tipo_actividad?.toLowerCase().includes("video") ?? false
    );

    async function cargarReunion() {
      cargando.value = true;
      error.value = null;

      try {
        const idLead = Number(props.idLead);

        if (!idLead) {
          error.value = "No se encontró el ID del lead.";
          return;
        }

        const actividades = await listarActividadesPorLead(idLead);

        // Filtra la actividad que corresponde a la reunión.
        // Si tienes un id_tipo_actividad fijo para "reunión", reemplaza este find
        // por: actividades.find((a) => a.id_tipo_actividad === ID_REUNION)
        const actividadReunion =
          actividades.find((a) =>
            ["reuni", "visita", "video"].some((k) =>
              a.tipo_actividad.toLowerCase().includes(k)
            )
          ) ?? actividades[0];

        if (!actividadReunion) {
          error.value = "No se encontró información de la reunión.";
          return;
        }

        reunion.value = actividadReunion;
      } catch (e) {
        error.value =
          e instanceof Error ? e.message : "Error al cargar la reunión.";
      } finally {
        cargando.value = false;
      }
    }

    function marcarAsistio() {
      // Aquí iría la llamada al backend para marcar asistencia
      // ejemplo: await api.marcarAsistencia(reunion.value.id_lead, true)
      if (reunion.value) reunion.value.nombre_estado = "Asistió";
      router.push({ name: "MeetingsAsistio" }); // ajusta según tu router
    }

    function cancelarReunion() {
      // Aquí iría la llamada al backend
      // ejemplo: await api.cancelarReunion(reunion.value.id_lead)
      if (reunion.value) reunion.value.nombre_estado = "Cancelada";
    }

    // --- Modal: Reprogramar ---
    const modalReprogramarAbierto = ref(false);
    const nuevaFecha = ref("");
    const nuevaHora = ref("");
    const guardandoReprogramacion = ref(false);
    const errorReprogramar = ref<string | null>(null);

    function reprogramar() {
      if (!reunion.value) return;
      // Precarga la fecha/hora actual si vienen en formato compatible con los inputs
      nuevaFecha.value = "";
      nuevaHora.value = "";
      errorReprogramar.value = null;
      modalReprogramarAbierto.value = true;
    }

    function cerrarModalReprogramar() {
      if (guardandoReprogramacion.value) return; // evita cerrar mientras guarda
      modalReprogramarAbierto.value = false;
      nuevaFecha.value = "";
      nuevaHora.value = "";
      errorReprogramar.value = null;
    }

    async function confirmarReprogramar() {
      if (!reunion.value) return;

      if (!nuevaFecha.value || !nuevaHora.value) {
        errorReprogramar.value = "Selecciona la nueva fecha y hora.";
        return;
      }

      const idActividad = (reunion.value as any).id_actividad;

      if (!idActividad) {
        errorReprogramar.value = "No se encontró el ID de la actividad.";
        return;
      }

      guardandoReprogramacion.value = true;
      errorReprogramar.value = null;

      try {
        const payload: IActualizarFechaHoraActividadRequest = {
          idActividad,
          fecha: nuevaFecha.value,
          hora: nuevaHora.value,
        };

        const resultado: IActualizarFechaHoraActividadResponse[] =
          await actualizarFechaHoraActividad(payload);

        const actualizado = resultado?.[0]?.fn_reprogramar_actividad;

        if (!actualizado) {
          errorReprogramar.value = "No se pudo reprogramar la reunión.";
          return;
        }

        modalReprogramarAbierto.value = false;
        nuevaFecha.value = "";
        nuevaHora.value = "";

        // Recarga la información de la actividad para reflejar el nuevo estado/fecha
        await cargarReunion();
      } catch (e) {
        errorReprogramar.value =
          e instanceof Error ? e.message : "Error al reprogramar la reunión.";
      } finally {
        guardandoReprogramacion.value = false;
      }
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
      if (!motivoNoAsistioSeleccionado.value || !reunion.value) return;

      // Aquí iría la llamada al backend para guardar el motivo de inasistencia
      // ejemplo: await api.registrarInasistencia(reunion.value.id_lead, motivoNoAsistioSeleccionado.value)

      reunion.value.nombre_estado = "No asistió";
      cerrarModalNoAsistio();
      router.push({ name: "MeetingsNoAsistio" }); // ajusta según tu router
    }

    onMounted(cargarReunion);

    return {
      cargando,
      error,
      reunion,
      estadoStyleActual,
      esVideollamada,
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
      // Reprogramar
      modalReprogramarAbierto,
      nuevaFecha,
      nuevaHora,
      guardandoReprogramacion,
      errorReprogramar,
      cerrarModalReprogramar,
      confirmarReprogramar,
    };
  },
});