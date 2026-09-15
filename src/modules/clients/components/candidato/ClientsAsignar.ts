
import { computed, defineComponent, onMounted, ref } from "vue";
import Swal from "sweetalert2";

import {
  finalizarEtapaLeadAsignacion,
  obtenerDetalleLeadCliente,
} from "../../actions/clientsAsignar.action";

import { useAuthStore } from "@/modules/auth/stores/auth.store";

export default defineComponent({
  emits: ["etapa-finalizada"],

  props: {
    idLead: {
      type: Number,
      required: true,
    },
  },

  setup(props, { emit }) {
    const lead = ref<any>(null);
    const loading = ref(false);
    const loadingContactar = ref(false);

    const authStore = useAuthStore();

    const puedeContactar = computed(() => authStore.isAgent);

    // =========================================================
    // FORMATO FECHA
    // Ejemplo: 13 de septiembre de 2026
    // =========================================================
function formatFechaSimple(
  valor: string | null | undefined
): string {
  if (!valor) return "-";

  let anio: string | undefined;
  let mes: string | undefined;
  let dia: string | undefined;

  // Si viene como YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  const matchISO = valor.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (matchISO) {
    [, anio, mes, dia] = matchISO;
  } else {
    // Si viene como DD/MM/YYYY
    const matchSlash = valor.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );

    if (matchSlash) {
      [, dia, mes, anio] = matchSlash;
    }
  }

  if (anio && mes && dia) {
    // Creamos la fecha sin permitir conversiones de zona horaria
    const fecha = new Date(
      Number(anio),
      Number(mes) - 1,
      Number(dia)
    );

    return fecha.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return valor;
}

    // =========================================================
    // FORMATO HORA
    // Ejemplo: 6:02 pm
    // =========================================================
    function formatHoraSimple(
      valor: string | null | undefined
    ): string {
      if (!valor) return "-";

      // HH:mm:ss o HH:mm
      const soloHoraMatch = valor.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
      );

      if (soloHoraMatch) {
        const horas = Number(soloHoraMatch[1]);
        const minutos = soloHoraMatch[2];

        const hora12 = horas % 12 || 12;
        const periodo = horas >= 12 ? "pm" : "am";

        return `${hora12}:${minutos} ${periodo}`;
      }

      // Si viene como timestamp completo
      const timestampMatch = valor.match(
        /[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?/
      );

      if (timestampMatch) {
        const horas = Number(timestampMatch[1]);
        const minutos = timestampMatch[2];

        const hora12 = horas % 12 || 12;
        const periodo = horas >= 12 ? "pm" : "am";

        return `${hora12}:${minutos} ${periodo}`;
      }

      return valor;
    }

    // =========================================================
    // FORMATO FECHA + HORA
    // Ejemplo:
    // 13 de septiembre de 2026 · 6:02 pm
    // =========================================================
    function formatFechaHoraCompleta(
      valor: string | null | undefined
    ): string {
      if (!valor) return "-";

      const match = valor.match(
        /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/
      );

      if (match) {
        const [, anio, mes, dia, horas, minutos] = match;

        const fecha = new Date(
          Number(anio),
          Number(mes) - 1,
          Number(dia)
        );

        const fechaFormateada = fecha.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const horaNumero = Number(horas);
        const hora12 = horaNumero % 12 || 12;
        const periodo = horaNumero >= 12 ? "pm" : "am";

        return `${fechaFormateada} · ${hora12}:${minutos} ${periodo}`;
      }

      return valor;
    }

    const cargarInformacion = async () => {
      try {
        loading.value = true;

        lead.value = await obtenerDetalleLeadCliente(props.idLead);
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    const contactarLead = async () => {
      if (!lead.value) return;

      const result = await Swal.fire({
        title: "¿Contactar al cliente?",
        text: "Se marcará esta asignación como resuelta.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, resolver",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#64748b",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      try {
        loadingContactar.value = true;

        const response = await finalizarEtapaLeadAsignacion(
          lead.value.id_lead_etapa
        );

        if (response.finalizado) {
          await cargarInformacion();

          await Swal.fire({
            icon: "success",
            title: "¡Cliente contactado!",
            text: "La asignación fue actualizada correctamente.",
            confirmButtonColor: "#16a34a",
            timer: 2200,
            timerProgressBar: true,
          });

          emit("etapa-finalizada");
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Ocurrió un error",
          text:
            error?.message ??
            "No fue posible actualizar el estado del cliente.",
          confirmButtonColor: "#dc2626",
        });
      } finally {
        loadingContactar.value = false;
      }
    };

    onMounted(() => {
      cargarInformacion();
    });

    return {
      lead,
      loading,
      loadingContactar,
      contactarLead,
      puedeContactar,
      formatFechaSimple,
      formatHoraSimple,
      formatFechaHoraCompleta,
    };
  },
});
