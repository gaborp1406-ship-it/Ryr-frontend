// ModalAgendarReu.ts
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { listarOpciones } from '@/modules/leads/actions/lead.action';
import type { IListarOpcionesResponse } from '@/modules/leads/interfaces/lead.interface';
import { agendarReunion } from '@/modules/clients/actions/clientsReunion.action';

const ID_LISTADO_TIPO_ACTIVIDAD = 4;
const ID_LISTADO_PLATAFORMAS = 9;

export default defineComponent({

  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    idLead: {
      type: Number,
      required: true,
    },
  },
  emits: ["close", "reunion-agendada"],
  setup(props, { emit }) {
    const toast = useToast();
    const authStore = useAuthStore();
    const OTROS_VALUE = "__otros__";

    const cargandoOpciones = ref(false);
    const guardando = ref(false);
    const opcionesTipoActividad = ref<IListarOpcionesResponse[]>([]);
    const opcionesTipoPla = ref<IListarOpcionesResponse[]>([]);
    const plataformaSeleccionada = ref<string | null>(null);

    const form = reactive({
      idTipoActividad: null as number | null,
      titulo: "",
      descripcion: "",
      lugar_plataforma: "",
      fecha: "",
      hora: "",
    });

    const cargarOpciones = async () => {
      cargandoOpciones.value = true;
      try {
        opcionesTipoActividad.value = await listarOpciones(ID_LISTADO_TIPO_ACTIVIDAD);
      } catch (error: any) {
        toast.error(error.message ?? "Error al listar tipos de actividad.");
      } finally {
        cargandoOpciones.value = false;
      }
    };

    const cargarPlataformas = async () => {
      cargandoOpciones.value = true;
      try {
        opcionesTipoPla.value = await listarOpciones(ID_LISTADO_PLATAFORMAS);
      } catch (error: any) {
        toast.error(error.message ?? "Error al listar tipos de actividad.");
      } finally {
        cargandoOpciones.value = false;
      }
    };
    const onCambioPlataforma = () => {
      if (plataformaSeleccionada.value === OTROS_VALUE) {
        form.lugar_plataforma = ""; // limpiamos para que el usuario escriba
      } else {
        form.lugar_plataforma = plataformaSeleccionada.value ?? "";
      }
    };
    const limpiarFormulario = () => {
      form.idTipoActividad = null;
      form.titulo = "";
      form.descripcion = "";
      form.lugar_plataforma = "";
      form.fecha = "";
      form.hora = "";
      plataformaSeleccionada.value = null; // 👈 agregar
    };

    const cerrar = () => {
      limpiarFormulario();
      emit("close");
    };

    const confirmar = async () => {
      if (!authStore.idEmploye) {
        toast.warning("No se encuentra id empleado");
        return;
      }
      if (!form.idTipoActividad) {
        toast.warning("Selecciona un tipo de actividad.");
        return;
      }
      if (!form.titulo.trim()) {
        toast.warning("Ingresa un título.");
        return;
      }
      if (!form.fecha) {
        toast.warning("Selecciona una fecha.");
        return;
      }
      if (!form.hora) {
        toast.warning("Selecciona una hora.");
        return;
      }
      if (!form.lugar_plataforma) {
        toast.warning("Selecciona un lugar o plataforma.");
        return;
      }

      const idEmpleado = authStore.idEmploye;

      guardando.value = true;
      try {
        const respuesta = await agendarReunion({
          idAsesor: idEmpleado,
          idLead: props.idLead,
          idTipoActividad: form.idTipoActividad,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim() || undefined,
          lugar_plataforma: form.lugar_plataforma,
          fecha: form.fecha,
          hora: form.hora,
          idUsuarioCreacion: idEmpleado,
        });

        toast.success(respuesta.detalle ?? "Reunión agendada con éxito.");
        limpiarFormulario();
        emit("reunion-agendada");
        emit("close");
      } catch (error: any) {
        toast.error(error.message ?? "Error al agendar la reunión.");
      } finally {
        guardando.value = false;
      }
    };

    onMounted(() => {
      console.log("ModalAgendarReu idLead:", props.idLead);
      cargarOpciones();
      cargarPlataformas();
    });

    return {
      toast,
      authStore,
      cargandoOpciones,
      guardando,
      opcionesTipoActividad,
      opcionesTipoPla,
      form,
      cerrar,
      confirmar,
      plataformaSeleccionada, // 👈 nuevo
      onCambioPlataforma,     // 👈 nuevo
      OTROS_VALUE,
    };
  },
});