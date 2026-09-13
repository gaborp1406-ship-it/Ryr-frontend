import { defineComponent, ref, computed, onMounted } from "vue";
import type { IChecklistNegociacion } from "../../interfaces/clients.negociacion.interface";
import {
  actualizarChecklistNegociacion,
  actualizarDocumentoNegociacion,
  finalizarEtapaNegociacion,
  obtenerChecklistNegociacion,
} from "../../actions/clientsNegociacion";
import type { IListarOpcionesResponse } from "../../interfaces/clients.interface";
import { listarOpciones } from "../../actions/clients.action";
import { finalizarEtapaOportunidadDesistio } from "../../actions/clients.atencion.action";
import Swal from "sweetalert2";

type Decision = "Aprobación" | "Denegación" | null;

interface SubPaso {
  id: string;
  titulo: string;
  completado: boolean;
  bloqueado: boolean;
  fecha: string | null;
}

interface PasoPrincipal {
  id: string;
  titulo: string;
  completado: boolean;
  bloqueado: boolean;
  fecha: string | null;
  subpasos?: SubPaso[];
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
    const checklistData = ref<IChecklistNegociacion | null>(null);
    const idLeadEtapa = ref<number | null>(null);
    const idEtapaNegociacion = ref<number | null>(null);
    const seleccionandoTipoCredito = ref(false);
    const guardandoTipoCredito = ref(false);
    const TIPOS_CREDITO = {
      HIPOTECARIO: 35,
      DIRECTO: 34,
    } as const;
    const pasos = ref<PasoPrincipal[]>([
      {
        id: "proforma",
        titulo: "Proforma enviada al cliente",
        completado: false,
        bloqueado: false,
        fecha: null,
      },
      {
        id: "aprobacion_bancaria",
        titulo: "Aprobación bancaria",
        completado: false,
        bloqueado: true,
        fecha: null,
        subpasos: [
          {
            id: "precalificacion",
            titulo: "Precalificación",
            completado: false,
            bloqueado: true,
            fecha: null,
          },
          {
            id: "carta_aprobacion",
            titulo: "Carta de aprobación",
            completado: false,
            bloqueado: true,
            fecha: null,
          },
        ],
      },
    ]);
    const tipoCreditoSeleccionado = computed<number | null>(() => {
      const tipo = checklistData.value?.tipo_credito;

      if (tipo === null || tipo === undefined) {
        return null;
      }

      return Number(tipo);
    });


    const decision = ref<Decision>(null);

    const proforma = computed(() =>
      pasos.value.find((p) => p.id === "proforma")
    );

    async function seleccionarTipoCredito(tipo: number) {
      if (!idLeadEtapa.value || guardandoTipoCredito.value) {
        return;
      }

      try {
        guardandoTipoCredito.value = true;
        actualizando.value = true;
        errores.value = null;

        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value,
          campo: "tipo_credito",
          valor: tipo,
        });

        await cargarChecklist();
      } catch (error) {
        errores.value =
          error instanceof Error
            ? error.message
            : "Error al seleccionar el tipo de crédito";

        console.error("Error seleccionando tipo de crédito:", error);
      } finally {
        guardandoTipoCredito.value = false;
        actualizando.value = false;
      }
    }

    const mostrarAcciones = computed(() => {
      return (
        checklistData.value?.estado !== true &&
        flujoCompletado.value
      );
    });
    const aprobacionBancaria = computed(() =>
      pasos.value.find((p) => p.id === "aprobacion_bancaria")
    );

    const precalificacion = computed(() =>
      aprobacionBancaria.value?.subpasos?.find(
        (p) => p.id === "precalificacion"
      )
    );

    const cartaAprobacion = computed(() =>
      aprobacionBancaria.value?.subpasos?.find(
        (p) => p.id === "carta_aprobacion"
      )
    );

    const docsBanco = ref<SubPaso>({
      id: "docs_banco",
      titulo: "Envío de docs al banco",
      completado: false,
      bloqueado: true,
      fecha: null,
    });

    const mostrarModalDesistio = ref(false);
    const opcionesDesistio = ref<IListarOpcionesResponse[]>([]);
    const motivoSeleccionado = ref<number | null>(null);

    const motivoOtro = ref("");
    const ID_MOTIVO_OTRO = 36;

    const esMotivoOtro = computed(
      () => motivoSeleccionado.value === ID_MOTIVO_OTRO
    );
    const cargandoOpciones = ref(false);
    const enviandoDesistio = ref(false);

    const ID_LISTADO_MOTIVOS_DESISTIO = 3;

    async function abrirModalDesistio() {
      mostrarModalDesistio.value = true;
      motivoSeleccionado.value = null;
      motivoOtro.value = "";
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

        console.error(
          "Error cargando opciones de desistimiento:",
          error
        );
      } finally {
        cargandoOpciones.value = false;
      }
    }

    function cerrarModalDesistio() {
      if (enviandoDesistio.value) return;

      mostrarModalDesistio.value = false;
      motivoSeleccionado.value = null;
      motivoOtro.value = "";
      opcionesDesistio.value = [];
    }
    async function confirmarDesistio() {
      if (!motivoSeleccionado.value) return;

      if (
        motivoSeleccionado.value === ID_MOTIVO_OTRO &&
        !motivoOtro.value.trim()
      ) {
        errores.value =
          "Debes especificar el motivo del desistimiento.";
        return;
      }

      try {
        enviandoDesistio.value = true;
        errores.value = null;

        const textoOtro =
          motivoSeleccionado.value === ID_MOTIVO_OTRO
            ? motivoOtro.value.trim()
            : undefined;

        await finalizarEtapaOportunidadDesistio(
          props.idLead,
          motivoSeleccionado.value,
          textoOtro
        );

        mostrarModalDesistio.value = false;
        motivoSeleccionado.value = null;
        motivoOtro.value = "";
        opcionesDesistio.value = [];

        emit("etapa-finalizada");
      } catch (error) {
        errores.value =
          error instanceof Error
            ? error.message
            : "Error al registrar el desistimiento";

        console.error(
          "Error registrando desistimiento:",
          error
        );
      } finally {
        enviandoDesistio.value = false;
      }
    }

    const completados = computed(() => {
      if (esCreditoDirecto.value) {
        let total = 0;
        let completado = 0;

        total++;

        if (proforma.value?.completado) {
          completado++;
        }

        total++;

        if (acuerdoDirecto.value !== null) {
          completado++;
        }

        return completado;
      }

      // HIPOTECARIO

      let completado = 0;

      if (proforma.value?.completado) {
        completado++;
      }

      if (precalificacion.value?.completado) {
        completado++;
      }

      if (docsBanco.value.completado) {
        completado++;
      }

      if (cartaAprobacion.value?.completado) {
        completado++;
      }

      return completado;
    });
    const flujoCompletado = computed(() => {
      if (!checklistData.value) {
        return false;
      }

      if (esCreditoDirecto.value) {
        return acuerdoDirecto.value !== null;
      }

      if (esCreditoHipotecario.value) {
        return (
          proforma.value?.completado === true &&
          precalificacion.value?.completado === true &&
          docsBanco.value.completado === true &&
          cartaAprobacion.value?.completado === true
        );
      }

      return false;
    });
    const totalPasos = computed(() => {
      return esCreditoDirecto.value ? 2 : 4;
    });
    const progreso = computed(() => {
      return Math.round((completados.value / totalPasos.value) * 100);
    });

    const procesoFinalizado = computed(() => {
      return aprobacionBancaria.value?.completado === true;
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

        const data = await obtenerChecklistNegociacion(props.idLead);

        if (data && data.length > 0) {
          checklistData.value = data[0];
          idEtapaNegociacion.value = data[0].id;
          idLeadEtapa.value = data[0].id_lead_etapa;

          sincronizarDatos(data[0]);
        }
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al cargar el checklist";
        console.error("Error cargando checklist:", error);
      } finally {
        cargando.value = false;
      }
    }

    function archivoABase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result as string);
        };

        reader.onerror = () => {
          reject(new Error("No se pudo leer el archivo."));
        };

        reader.readAsDataURL(file);
      });
    }
    async function subirDocumento(
      event: Event,
      campo: "url_precalificacion" | "url_carta_aprobacion"
    ) {
      const input = event.target as HTMLInputElement;

      if (!input.files || input.files.length === 0) {
        return;
      }

      if (!idEtapaNegociacion.value) {
        errores.value = "No se encontró el ID de la etapa de negociación.";
        return;
      }

      const archivo = input.files[0];

      try {
        actualizando.value = true;
        errores.value = null;

        const base64 = await archivoABase64(archivo);

        await actualizarDocumentoNegociacion({
          id: idEtapaNegociacion.value,
          campo,
          archivo: base64,
        });

        await cargarChecklist();

      } catch (error) {

        errores.value =
          error instanceof Error
            ? error.message
            : "Error al subir el documento.";

        console.error("Error subiendo documento:", error);

      } finally {

        actualizando.value = false;
        input.value = "";
      }
    }
    function sincronizarDatos(data: IChecklistNegociacion) {
      const tipoCredito = Number(data.tipo_credito);

      // ==========================================
      // PROFORMA
      // ==========================================

      if (proforma.value) {
        proforma.value.completado = data.proforma_enviada;
        proforma.value.fecha = data.proforma_enviada
          ? formatearFecha()
          : null;
      }

      // ==========================================
      // CRÉDITO HIPOTECARIO
      // ==========================================

      if (tipoCredito === TIPOS_CREDITO.HIPOTECARIO) {
        // ----------------------------------------
        // APROBACIÓN BANCARIA
        // ----------------------------------------

        if (aprobacionBancaria.value) {
          aprobacionBancaria.value.bloqueado =
            !data.proforma_enviada;

          aprobacionBancaria.value.completado =
            data.aprobacion_bancaria_precalififacion &&
            data.aprobacion_bancaria_carta_aprobacion &&
            (
              data.carta_aprobacion_aprobado ||
              data.carta_aprobacion_denegado
            );
        }

        // ----------------------------------------
        // PRECALIFICACIÓN
        // ----------------------------------------

        if (precalificacion.value) {
          precalificacion.value.completado =
            data.aprobacion_bancaria_precalififacion;

          precalificacion.value.fecha =
            data.aprobacion_bancaria_precalififacion
              ? formatearFecha()
              : null;

          precalificacion.value.bloqueado =
            !data.proforma_enviada;
        }

        // ----------------------------------------
        // CARTA DE APROBACIÓN
        // ----------------------------------------

        if (cartaAprobacion.value) {
          cartaAprobacion.value.completado =
            data.carta_aprobacion_aprobado ||
            data.carta_aprobacion_denegado;

          cartaAprobacion.value.fecha =
            cartaAprobacion.value.completado
              ? formatearFecha()
              : null;

          cartaAprobacion.value.bloqueado =
            !data.aprobacion_bancaria_precalififacion;
        }

        // ----------------------------------------
        // DECISIÓN
        // ----------------------------------------

        if (data.carta_aprobacion_aprobado) {
          decision.value = "Aprobación";
        } else if (data.carta_aprobacion_denegado) {
          decision.value = "Denegación";
        } else {
          decision.value = null;
        }

        // ----------------------------------------
        // ENVÍO DE DOCUMENTOS AL BANCO
        // ----------------------------------------

        docsBanco.value.completado =
          data.aprobacion_bancaria_carta_aprobacion;

        docsBanco.value.fecha =
          data.aprobacion_bancaria_carta_aprobacion
            ? formatearFecha()
            : null;

        docsBanco.value.bloqueado =
          !data.aprobacion_bancaria_precalififacion;
      }

      // ==========================================
      // CRÉDITO DIRECTO
      // ==========================================

      if (tipoCredito === TIPOS_CREDITO.DIRECTO) {
        if (aprobacionBancaria.value) {
          aprobacionBancaria.value.bloqueado = true;
          aprobacionBancaria.value.completado = false;
        }

        if (precalificacion.value) {
          precalificacion.value.bloqueado = true;
          precalificacion.value.completado = false;
        }

        if (cartaAprobacion.value) {
          cartaAprobacion.value.bloqueado = true;
          cartaAprobacion.value.completado = false;
        }

        docsBanco.value.bloqueado = true;
        docsBanco.value.completado = false;
      }
    }



    const esCreditoHipotecario = computed(() => {
      return tipoCreditoSeleccionado.value === TIPOS_CREDITO.HIPOTECARIO;
    });

    const esCreditoDirecto = computed(() => {
      return tipoCreditoSeleccionado.value === TIPOS_CREDITO.DIRECTO;
    });

    const tieneTipoCredito = computed(() => {
      return (
        tipoCreditoSeleccionado.value === TIPOS_CREDITO.HIPOTECARIO ||
        tipoCreditoSeleccionado.value === TIPOS_CREDITO.DIRECTO
      );
    });


    async function actualizarCampo(
      campo: string,
      valor: boolean | number
    ) {
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
          error instanceof Error
            ? error.message
            : "Error al actualizar";

        console.error("Error actualizando campo:", error);
      } finally {
        actualizando.value = false;
      }
    }

    async function completarProforma() {
      if (!proforma.value) return;

      const nuevoValor = !proforma.value.completado;
      await actualizarCampo("proforma_enviada", nuevoValor);
    }

    async function completarPrecalificacion() {
      if (!precalificacion.value || precalificacion.value.bloqueado) {
        return;
      }

      const nuevoValor = !precalificacion.value.completado;
      await actualizarCampo("aprobacion_bancaria_precalififacion", nuevoValor);
    }

    async function completarDocsBanco() {
      if (docsBanco.value.bloqueado) return;

      const nuevoValor = !docsBanco.value.completado;
      await actualizarCampo("aprobacion_bancaria_carta_aprobacion", nuevoValor);
    }

    async function registrarDecision(valor: "Aprobación" | "Denegación") {
      if (!docsBanco.value.completado) return;

      try {
        actualizando.value = true;
        errores.value = null;
        if (decision.value !== valor) {
          if (decision.value === "Aprobación") {
            await actualizarChecklistNegociacion({
              id_lead_etapa: idLeadEtapa.value!,
              campo: "carta_aprobacion_aprobado",
              valor: false,
            });
          } else if (decision.value === "Denegación") {
            await actualizarChecklistNegociacion({
              id_lead_etapa: idLeadEtapa.value!,
              campo: "carta_aprobacion_denegado",
              valor: false,
            });
          }
        }

        const campo =
          valor === "Aprobación"
            ? "carta_aprobacion_aprobado"
            : "carta_aprobacion_denegado";
        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value!,
          campo,
          valor: true,
        });

        await cargarChecklist();
      } catch (error) {
        errores.value =
          error instanceof Error ? error.message : "Error al registrar decisión";
        console.error("Error registrando decisión:", error);
      } finally {
        actualizando.value = false;
      }
    }

    async function pasarACierre() {
      const confirmacion = await Swal.fire({
        title: "¿Pasar a cierre?",
        text: "Esta acción finalizará la etapa de negociación y avanzará el proceso a cierre.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, pasar a cierre",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#0f172a",
        cancelButtonColor: "#94a3b8",
        reverseButtons: true,
      });

      if (!confirmacion.isConfirmed) return;

      try {
        actualizando.value = true;
        errores.value = null;

        await finalizarEtapaNegociacion(props.idLead);

        await Swal.fire({
          title: "Listo",
          text: "El proceso avanzó a la etapa de cierre.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#2d8c4a",
        });

        emit("etapa-finalizada");
      } catch (error) {
        errores.value =
          error instanceof Error
            ? error.message
            : "Error al finalizar la etapa de negociación";
        console.error("Error finalizando etapa de negociación:", error);

        Swal.fire({
          title: "Error",
          text: errores.value,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#e11d48",
        });
      } finally {
        actualizando.value = false;
      }
    }

    async function registrarAcuerdoDirecto(
      valor: "acuerdo" | "desacuerdo"
    ) {
      if (!proforma.value?.completado) {
        return;
      }

      try {
        actualizando.value = true;
        errores.value = null;

        // Primero limpiamos ambas opciones
        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value!,
          campo: "proforma_enviada_decuerdo",
          valor: false,
        });

        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value!,
          campo: "proforma_enviada_descuerdo",
          valor: false,
        });

        // Marcamos la seleccionada
        const campo =
          valor === "acuerdo"
            ? "proforma_enviada_decuerdo"
            : "proforma_enviada_descuerdo";

        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value!,
          campo,
          valor: true,
        });

        await cargarChecklist();
      } catch (error) {
        errores.value =
          error instanceof Error
            ? error.message
            : "Error al registrar la respuesta del cliente";

        console.error(
          "Error registrando respuesta de crédito directo:",
          error
        );
      } finally {
        actualizando.value = false;
      }
    }

    const acuerdoDirecto = computed(() => {
      if (!checklistData.value) {
        return null;
      }

      if (checklistData.value.proforma_enviada_decuerdo) {
        return "acuerdo";
      }

      if (checklistData.value.proforma_enviada_descuerdo) {
        return "desacuerdo";
      }

      return null;
    });

    onMounted(() => {
      cargarChecklist();
    });

    return {
      cargando,
      errores,
      actualizando,
      checklistData,
      pasos,
      proforma,
      acuerdoDirecto,
      registrarAcuerdoDirecto,
      aprobacionBancaria,
      precalificacion,
      cartaAprobacion,
      tipoCreditoSeleccionado,
      tieneTipoCredito,
      TIPOS_CREDITO,
      esCreditoDirecto,
      esCreditoHipotecario,
      seleccionarTipoCredito,
      guardandoTipoCredito,
      docsBanco,
      decision,
      completados,
      totalPasos,
      progreso,
      procesoFinalizado,
      completarProforma,
      completarPrecalificacion,
      completarDocsBanco,
      registrarDecision,
      pasarACierre,
      mostrarAcciones,
      subirDocumento,
      mostrarModalDesistio,
      opcionesDesistio,
      motivoSeleccionado,
      cargandoOpciones,
      actualizarCampo,
      enviandoDesistio,
      abrirModalDesistio,
      motivoOtro,
      esMotivoOtro,
      cerrarModalDesistio,
      confirmarDesistio,
    };
  },
});