import { defineComponent, ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import type { IChecklistCierre } from "../../interfaces/clients.cierre.interface";
import type { IListarOpcionesResponse } from "../../interfaces/clients.interface";
import { listarOpciones } from "../../actions/clients.action";
import { actualizarChecklistNegociacion, finalizarEtapaCierre, finalizarEtapaCierreDesistio, obtenerChecklistCierre } from "../../actions/clientsCierre";

interface Paso {
  id: string;
  campo: string; 
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
  props: {
    idLead: {
      type: Number,
      required: true,
    },
  },

  emits: ["etapa-finalizada"],

  setup(props, { emit }) {
    const cargando = ref(true);
    const errores = ref<string | null>(null);
    const actualizando = ref(false);
    const checklistData = ref<IChecklistCierre | null>(null);
    const idLeadEtapa = ref<number | null>(null);

    const pasos = ref<Paso[]>([
      {
        id: "cuota_inicial",
        campo: "abono_inicial",
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
        campo: "firma_minuta",
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
        campo: "subida_documentos",
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

    const completados = computed(
      () => pasos.value.filter((p) => p.completado).length
    );

    const progreso = computed(() =>
      Math.round((completados.value / pasos.value.length) * 100)
    );


    const mostrarAcciones = computed(() => {
      return checklistData.value?.estado !== true;
    });

    function formatearFecha() {
      const ahora = new Date();
      return (
        ahora.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        " · " +
        ahora.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    async function cargarChecklist() {
      try {
        cargando.value = true;
        errores.value = null;

        const data = await obtenerChecklistCierre(props.idLead);

        if (data && data.length > 0) {
          checklistData.value = data[0];
          idLeadEtapa.value = data[0].id_lead_etapa;
          sincronizarDatos(data[0]);
        }
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al cargar el checklist";
        console.error("Error cargando checklist de cierre:", error);
      } finally {
        cargando.value = false;
      }
    }

    function sincronizarDatos(data: IChecklistCierre) {
      const cuotaInicial = pasos.value[0];
      const firmaMinuta = pasos.value[1];
      const sperant = pasos.value[2];

      cuotaInicial.completado = data.abono_inicial;
      cuotaInicial.fecha = data.abono_inicial ? formatearFecha() : null;
      firmaMinuta.bloqueado = !data.abono_inicial;
      firmaMinuta.completado = data.firma_minuta;
      firmaMinuta.fecha = data.firma_minuta ? formatearFecha() : null;

      sperant.bloqueado = !data.firma_minuta;
      sperant.completado = data.subida_documentos;
      sperant.fecha = data.subida_documentos ? formatearFecha() : null;
    }

    async function actualizarCampo(campo: string, valor: boolean) {
      if (!idLeadEtapa.value) return;

      try {
        actualizando.value = true;
        errores.value = null;

        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value,
          campo,
          valor,
        });

        await cargarChecklist();
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al actualizar";
        console.error("Error actualizando campo de cierre:", error);
      } finally {
        actualizando.value = false;
      }
    }


    function onArchivoSeleccionado(e: Event, paso: Paso) {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      paso.archivo = file;
      paso.evidenciaNombre = file.name;
      paso.evidenciaPreview = URL.createObjectURL(file);
    }

    async function toggle(paso: Paso) {
      if (paso.bloqueado || actualizando.value) return;

      if (paso.requiereEvidencia) {
        if (!paso.completado && !paso.archivo) return;

        paso.completado = !paso.completado;
        paso.fecha = paso.completado ? formatearFecha() : null;
        return;
      }

      const nuevoValor = !paso.completado;
      await actualizarCampo(paso.campo, nuevoValor);
    }

    const mostrarModalDesistio = ref(false);
    const opcionesDesistio = ref<IListarOpcionesResponse[]>([]);
    const motivoSeleccionado = ref<number | null>(null);
    const cargandoOpciones = ref(false);
    const enviandoDesistio = ref(false);
    const finalizandoRealizado = ref(false);
    const ID_LISTADO_MOTIVOS_DESISTIO = 8;

    async function abrirModalDesistio() {
      mostrarModalDesistio.value = true;
      motivoSeleccionado.value = null;
      errores.value = null;

      try {
        cargandoOpciones.value = true;
        opcionesDesistio.value = await listarOpciones(
          ID_LISTADO_MOTIVOS_DESISTIO
        );
      } catch (error) {
        errores.value =
          error instanceof Error
            ? error.message
            : "Error al cargar los motivos de desistimiento";
        console.error("Error cargando opciones de desistimiento:", error);
      } finally {
        cargandoOpciones.value = false;
      }
    }

    function cerrarModalDesistio() {
      if (enviandoDesistio.value) return;
      mostrarModalDesistio.value = false;
      motivoSeleccionado.value = null;
      opcionesDesistio.value = [];
    }

  async function confirmarDesistio() {
  if (!motivoSeleccionado.value) return;

  try {
    enviandoDesistio.value = true;
    errores.value = null;

    await finalizarEtapaCierreDesistio(
      props.idLead,
      motivoSeleccionado.value
    );

    mostrarModalDesistio.value = false;
    motivoSeleccionado.value = null;
    opcionesDesistio.value = [];

    await cargarChecklist(); // refresca checklistData.estado

    emit("etapa-finalizada");
  } catch (error) {
    errores.value =
      error instanceof Error
        ? error.message
        : "Error al registrar el desistimiento";
    console.error("Error registrando desistimiento:", error);
  } finally {
    enviandoDesistio.value = false;
  }
}


  async function marcarRealizado() {
  try {
    finalizandoRealizado.value = true;
    errores.value = null;

    await finalizarEtapaCierre(props.idLead);

    await cargarChecklist(); 

    await Swal.fire({
      title: "Venta marcada como realizada",
      text: "La etapa de cierre se finalizó correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#2d8c4a",
    });

    emit("etapa-finalizada");
  } catch (error) {
    errores.value =
      error instanceof Error
        ? error.message
        : "Error al finalizar la etapa de cierre";
    console.error("Error finalizando etapa de cierre:", error);

    await Swal.fire({
      title: "No se pudo finalizar",
      text: errores.value,
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#2d8c4a",
    });
  } finally {
    finalizandoRealizado.value = false;
  }
}

    onMounted(() => {
      cargarChecklist();
    });

    return {
      cargando,
      errores,
      actualizando,
      pasos,
      completados,
      progreso,
      mostrarAcciones,
      toggle,
      onArchivoSeleccionado,
      mostrarModalDesistio,
      opcionesDesistio,
      motivoSeleccionado,
      cargandoOpciones,
      enviandoDesistio,
      abrirModalDesistio,
      cerrarModalDesistio,
      confirmarDesistio,
      marcarRealizado,
      finalizandoRealizado,
    };
  },
});