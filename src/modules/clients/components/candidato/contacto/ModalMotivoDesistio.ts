import { listarOpciones } from "@/modules/clients/actions/clientsContacto.action";
import type { IListarOpcionesResponse } from "@/modules/clients/interfaces/clientscontacto.interface";
import { defineComponent, ref, watch } from "vue";

const ID_LISTADO_MOTIVOS_DESISTIO = 3;
const ID_MOTIVO_OTRO = 36;

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    close: () => true,

    confirmar: (
      opcion: IListarOpcionesResponse,
      motivo_otro?: string
    ) => true,
  },

  setup(props, { emit }) {
    const opciones = ref<IListarOpcionesResponse[]>([]);
    const cargando = ref(false);
    const error = ref<string | null>(null);

    const idSeleccionado = ref<number | null>(null);
    const motivoOtro = ref("");

    const procesando = ref(false);

    const esMotivoOtro = ref(false);

    async function cargarOpciones() {
      cargando.value = true;
      error.value = null;

      try {
        opciones.value = await listarOpciones(
          ID_LISTADO_MOTIVOS_DESISTIO
        );
      } catch (e) {
        error.value =
          e instanceof Error
            ? e.message
            : "Error al cargar los motivos.";
      } finally {
        cargando.value = false;
      }
    }

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          idSeleccionado.value = null;
          motivoOtro.value = "";
          esMotivoOtro.value = false;
          cargarOpciones();
        }
      }
    );

    function seleccionar(id: number) {
      idSeleccionado.value = id;

      esMotivoOtro.value = id === ID_MOTIVO_OTRO;

      if (id !== ID_MOTIVO_OTRO) {
        motivoOtro.value = "";
      }
    }

    function cerrar() {
      emit("close");
    }

    async function confirmar() {
      const opcion = opciones.value.find(
        (o) => o.id === idSeleccionado.value
      );

      if (!opcion) return;

      if (opcion.id === ID_MOTIVO_OTRO) {
        if (!motivoOtro.value.trim()) {
          error.value = "Debes ingresar el motivo.";
          return;
        }
      }

      procesando.value = true;
      error.value = null;

      try {
        const textoOtro =
          opcion.id === ID_MOTIVO_OTRO
            ? motivoOtro.value.trim()
            : undefined;

        emit("confirmar", opcion, textoOtro);
      } finally {
        procesando.value = false;
      }
    }

    return {
      opciones,
      cargando,
      error,
      idSeleccionado,
      motivoOtro,
      esMotivoOtro,
      procesando,
      seleccionar,
      cerrar,
      confirmar,
    };
  },
});