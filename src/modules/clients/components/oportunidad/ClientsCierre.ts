import { defineComponent, ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import type { IChecklistCierre, IDocumentoCierre } from "../../interfaces/clients.cierre.interface";
import type { IListarOpcionesResponse } from "../../interfaces/clients.interface";
import { listarOpciones } from "../../actions/clients.action";
import {
  actualizarChecklistNegociacion,
  finalizarEtapaCierre,
  finalizarEtapaCierreDesistio,
  obtenerChecklistCierre,
  registrarDocumentoCierre,
  obtenerDocumentosCierre,
  eliminarDocumentoCierre,
} from "../../actions/clientsCierre";
import { useAuthStore } from "@/modules/auth/stores/auth.store";

interface Paso {
  id: string;
  campo: string;
  titulo: string;
  completado: boolean;
  bloqueado: boolean;
  fecha: string | null;
  requiereEvidencia: boolean;
  evidenciaPreview: string | null; // data:<mime>;base64,<...>
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
    const authStore = useAuthStore();
    const cierreFinalizado = computed(() => checklistData.value?.estado === true);
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
    const puedeEliminarDocumento = computed(() => {
      if (authStore.isAdmin) return true;
      return !cierreFinalizado.value;
    });
    const mostrarAcciones = computed(() => {
      return checklistData.value?.estado !== true;
    });

    // ==== Documentos de cierre ====
    const documentos = ref<IDocumentoCierre[]>([]);
    const cargandoDocumentos = ref(false);
    const subiendoDocumento = ref(false);
    const eliminandoDocumentoId = ref<number | null>(null);

    const idEtapaCierre = computed(() => checklistData.value?.id ?? null);

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
          await cargarDocumentos();
        }
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al cargar el checklist";
        console.error("Error cargando checklist de cierre:", error);
      } finally {
        cargando.value = false;
      }
    }

    async function cargarDocumentos() {
      if (!idEtapaCierre.value) return;
      try {
        cargandoDocumentos.value = true;
        documentos.value = await obtenerDocumentosCierre(idEtapaCierre.value);
      } catch (error) {
        console.error("Error cargando documentos de cierre:", error);
      } finally {
        cargandoDocumentos.value = false;
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
      paso.evidenciaPreview = null;

      const reader = new FileReader();
      reader.onload = () => {
        // reader.result ya viene como "data:<mime>;base64,<...>"
        paso.evidenciaPreview = reader.result as string;
      };
      reader.onerror = () => {
        errores.value = "No se pudo leer el archivo seleccionado";
        console.error("Error leyendo archivo:", reader.error);
      };
      reader.readAsDataURL(file);

      // Limpiar el input para poder volver a seleccionar el mismo archivo si se cancela
      target.value = "";
    }

    function cancelarArchivoSeleccionado(paso: Paso) {
      paso.archivo = null;
      paso.evidenciaPreview = null;
      paso.evidenciaNombre = null;
    }

    async function toggle(paso: Paso) {
      if (paso.bloqueado || actualizando.value) return;

      // El paso de evidencia ya no se marca manualmente: se marca solo
      // cuando se registra un documento (ver confirmarSubidaDocumento).
      if (paso.requiereEvidencia) return;

      const nuevoValor = !paso.completado;
      await actualizarCampo(paso.campo, nuevoValor);
    }

    async function confirmarSubidaDocumento(paso: Paso) {
      if (!paso.archivo || !paso.evidenciaPreview || !idEtapaCierre.value || !idLeadEtapa.value) {
        return;
      }

      try {
        subiendoDocumento.value = true;
        errores.value = null;

        // Se registra el documento (en base64, el backend lo sube a Supabase)
        // y se marca "subida_documentos" en el checklist EN PARALELO.
        await Promise.all([
          registrarDocumentoCierre({
            id_etapa_cierre: idEtapaCierre.value,
            nombre_documento: paso.archivo.name,
            url_documento: paso.evidenciaPreview,
            tipo_documento: paso.archivo.type,
          }),
          actualizarChecklistNegociacion({
            id_lead_etapa: idLeadEtapa.value,
            campo: paso.campo, // "subida_documentos"
            valor: true,
          }),
        ]);

        paso.archivo = null;
        paso.evidenciaPreview = null;
        paso.evidenciaNombre = null;

        await cargarChecklist(); // refresca checklist + lista de documentos
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al subir el documento";
        console.error("Error registrando documento de cierre:", error);

        await Swal.fire({
          title: "No se pudo subir el documento",
          text: errores.value,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#2d8c4a",
        });
      } finally {
        subiendoDocumento.value = false;
      }
    }

    async function eliminarDocumento(documento: IDocumentoCierre) {
      if (!idLeadEtapa.value) return;

      const confirmacion = await Swal.fire({
        title: "¿Eliminar documento?",
        text: `Se eliminará "${documento.nombre_documento}".`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e11d48",
      });

      if (!confirmacion.isConfirmed) return;

      try {
        eliminandoDocumentoId.value = documento.id;
        errores.value = null;

        await eliminarDocumentoCierre(documento.id);
        await cargarDocumentos();

        // Si ya no queda ningún documento, se desmarca "subida_documentos"
        // automáticamente (depende de si hay documentos subidos o no).
        if (documentos.value.length === 0) {
          await actualizarChecklistNegociacion({
            id_lead_etapa: idLeadEtapa.value,
            campo: "subida_documentos",
            valor: false,
          });
          await cargarChecklist();
        }
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al eliminar el documento";
        console.error("Error eliminando documento de cierre:", error);

        await Swal.fire({
          title: "No se pudo eliminar",
          text: errores.value,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#2d8c4a",
        });
      } finally {
        eliminandoDocumentoId.value = null;
      }
    }

    // ==== Celebración ====
    interface ConfettiPieza {
      id: number;
      left: number;
      color: string;
      duration: number;
      delay: number;
      size: number;
    }

    const mostrarCelebracion = ref(false);
    const confetti = ref<ConfettiPieza[]>([]);
    const COLORES_CONFETTI = ["#2d8c4a", "#f4b400", "#4285f4", "#ea4335", "#a259ff", "#ff7a59"];

    function generarConfetti(cantidad = 70) {
      confetti.value = Array.from({ length: cantidad }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORES_CONFETTI[Math.floor(Math.random() * COLORES_CONFETTI.length)],
        duration: 2.5 + Math.random() * 2,
        delay: Math.random() * 1.5,
        size: 6 + Math.random() * 6,
      }));
    }

    function cerrarCelebracion() {
      mostrarCelebracion.value = false;
      confetti.value = [];
      emit("etapa-finalizada");
    }

    // ==== Desistio ====
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

        generarConfetti();
        mostrarCelebracion.value = true;
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
      cancelarArchivoSeleccionado,
      // documentos
      documentos,
      cargandoDocumentos,
      subiendoDocumento,
      eliminandoDocumentoId,
      confirmarSubidaDocumento,
      eliminarDocumento,
      // desistio
      mostrarModalDesistio,
      opcionesDesistio,
      motivoSeleccionado,
      cargandoOpciones,
      enviandoDesistio,
      abrirModalDesistio,
      cerrarModalDesistio,
      confirmarDesistio,
      // realizado / celebracion
      marcarRealizado,
      finalizandoRealizado,
      mostrarCelebracion,
      confetti,
      cerrarCelebracion,
      puedeEliminarDocumento
    };
  },
});