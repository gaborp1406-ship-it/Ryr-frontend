import { defineComponent, ref, computed, onMounted } from "vue";
import type { IListarActividadLeadResponse } from "../../interfaces/clientsreunion.interface";
import { listarActividadesPorLead, obtenerInfoAgendarReuLead } from "../../actions/clientsReunion.action";
import { finalizarEtapaContactoAgendarReunion } from "../../actions/clientsRealizarReunion";
import type { IFinalizarEtapaContactoAgendarReunionRequest } from "../../interfaces/clientsrealizarreunion";

export default defineComponent({
  props: {
    idLead: {
      type: [Number, String],
      required: true,
    },
  },
  emits: ["etapa-finalizada"],
  setup(props, { emit }) {
    const cargando = ref(true);
    const error = ref<string | null>(null);
    const reunion = ref<IListarActividadLeadResponse | null>(null);

    // Indica si el lead ya fue convertido a oportunidad (oculta el botón)
    const yaConvertido = ref(false);

    // Estado del botón "Convertir en oportunidad"
    const convirtiendo = ref(false);
    const errorConvertir = ref<string | null>(null);

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

    async function cargarReunion() {
      const idLead = Number(props.idLead);

      if (!idLead) {
        error.value = "No se encontró el ID del lead.";
        return;
      }

      const actividades = await listarActividadesPorLead(idLead);

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
    }

    // Consulta si ya existe un registro de "agendar reunión" con estado true
    // (es decir, si el lead ya fue convertido a oportunidad)
    async function cargarInfoAgendarReu() {
      const idLead = Number(props.idLead);

      if (!idLead) return;

      const info = await obtenerInfoAgendarReuLead(idLead);
      yaConvertido.value = info.some((item) => item.estado === true);
    }

    async function cargarDatos() {
      cargando.value = true;
      error.value = null;

      try {
        await Promise.all([cargarReunion(), cargarInfoAgendarReu()]);
      } catch (e) {
        error.value =
          e instanceof Error ? e.message : "Error al cargar la información de la reunión.";
      } finally {
        cargando.value = false;
      }
    }

    // Convierte el lead en oportunidad llamando al endpoint de finalizar etapa
    async function convertirOportunidad() {
      const idLead = Number(props.idLead);

      if (!idLead) {
        errorConvertir.value = "No se encontró el ID del lead.";
        return;
      }

      convirtiendo.value = true;
      errorConvertir.value = null;

      try {
        const payload: IFinalizarEtapaContactoAgendarReunionRequest = {
          id_lead: idLead,
          // 👇 agrega aquí más campos si la interfaz real los exige
        };

        await finalizarEtapaContactoAgendarReunion(payload);

        // El lead ya cambió de etapa: avisamos al padre para que recargue
        emit("etapa-finalizada");
      } catch (e) {
        errorConvertir.value =
          e instanceof Error
            ? e.message
            : "Error al convertir el lead en oportunidad.";
      } finally {
        convirtiendo.value = false;
      }
    }

    onMounted(cargarDatos);

    return {
      cargando,
      error,
      reunion,
      estadoStyleActual,
      yaConvertido,
      convirtiendo,
      errorConvertir,
      convertirOportunidad,
    };
  },
});