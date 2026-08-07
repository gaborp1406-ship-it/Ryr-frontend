import { defineComponent, onMounted, ref } from "vue";
import Swal from "sweetalert2";
import { finalizarEtapaLeadAsignacion, obtenerDetalleLeadCliente } from "../../actions/clientsAsignar.action";

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
    };
  },
});