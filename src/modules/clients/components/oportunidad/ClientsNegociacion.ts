import { defineComponent, ref, computed, onMounted } from "vue";
import type { IChecklistNegociacion } from "../../interfaces/clients.negociacion.interface";
import { actualizarChecklistNegociacion, obtenerChecklistNegociacion } from "../../actions/clientsNegociacion";


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

    const decision = ref<Decision>(null);
    const desistio = ref(false);
    const cierre = ref(false);

    const proforma = computed(() =>
      pasos.value.find((p) => p.id === "proforma")
    );

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

    const completados = computed(() => {
      let total = 0;
      let completado = 0;

      total++;
      if (proforma.value?.completado) completado++;

      total++;
      if (precalificacion.value?.completado) completado++;

      total++;
      if (docsBanco.value.completado) completado++;

      total++;
      if (cartaAprobacion.value?.completado) completado++;

      return completado;
    });

    const totalPasos = computed(() => 4);

    const progreso = computed(() => {
      return Math.round(
        (completados.value / totalPasos.value) * 100
      );
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
          idLeadEtapa.value = data[0].id_lead_etapa;
          sincronizarDatos(data[0]);
        }
      } catch (error) {
        errores.value = error instanceof Error ? error.message : "Error al cargar el checklist";
        console.error("Error cargando checklist:", error);
      } finally {
        cargando.value = false;
      }
    }

    function sincronizarDatos(data: IChecklistNegociacion) {
      // Sincronizar proforma
      if (proforma.value) {
        proforma.value.completado = data.proforma_enviada;
        proforma.value.fecha = data.proforma_enviada ? formatearFecha() : null;

        if (data.proforma_enviada) {
          if (aprobacionBancaria.value) {
            aprobacionBancaria.value.bloqueado = false;
          }
          if (precalificacion.value) {
            precalificacion.value.bloqueado = false;
          }
          if (cartaAprobacion.value) {
            cartaAprobacion.value.bloqueado = false;
          }
          docsBanco.value.bloqueado = false;
        }
      }

      // Sincronizar precalificación
      if (precalificacion.value) {
        precalificacion.value.completado = data.aprobacion_bancaria_precalififacion;
        precalificacion.value.fecha = data.aprobacion_bancaria_precalififacion ? formatearFecha() : null;
      }

      // Sincronizar documentos al banco
      docsBanco.value.completado = data.aprobacion_bancaria_carta_aprobacion;
      docsBanco.value.fecha = data.aprobacion_bancaria_carta_aprobacion ? formatearFecha() : null;

      // Sincronizar carta de aprobación
      if (cartaAprobacion.value) {
        cartaAprobacion.value.completado = data.carta_aprobacion_aprobado || data.carta_aprobacion_denegado;
        cartaAprobacion.value.fecha = cartaAprobacion.value.completado ? formatearFecha() : null;
      }

      // Sincronizar decisión
      if (data.carta_aprobacion_aprobado) {
        decision.value = "Aprobación";
      } else if (data.carta_aprobacion_denegado) {
        decision.value = "Denegación";
      } else {
        decision.value = null;
      }

      // Sincronizar aprobación bancaria (parent)
      if (aprobacionBancaria.value) {
        aprobacionBancaria.value.completado = data.aprobacion_bancaria;
        aprobacionBancaria.value.fecha = data.aprobacion_bancaria ? formatearFecha() : null;
      }
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

        // Recargar datos después de actualizar
        await cargarChecklist();
      } catch (error) {
        errores.value = error instanceof Error ? error.message : "Error al actualizar";
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

        // Limpiar decisión anterior
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

        // Registrar nueva decisión
        const campo = valor === "Aprobación" ? "carta_aprobacion_aprobado" : "carta_aprobacion_denegado";
        await actualizarChecklistNegociacion({
          id_lead_etapa: idLeadEtapa.value!,
          campo,
          valor: true,
        });

        await cargarChecklist();
      } catch (error) {
        errores.value = error instanceof Error ? error.message : "Error al registrar decisión";
        console.error("Error registrando decisión:", error);
      } finally {
        actualizando.value = false;
      }
    }

    function resetearCarta() {
      if (cartaAprobacion.value) {
        cartaAprobacion.value.completado = false;
        cartaAprobacion.value.bloqueado = true;
        cartaAprobacion.value.fecha = null;
      }

      docsBanco.value.completado = false;
      docsBanco.value.bloqueado = true;
      docsBanco.value.fecha = null;

      decision.value = null;
    }

    function resetearAprobacionBancaria() {
      if (aprobacionBancaria.value) {
        aprobacionBancaria.value.completado = false;
        aprobacionBancaria.value.bloqueado = true;
        aprobacionBancaria.value.fecha = null;
      }

      if (precalificacion.value) {
        precalificacion.value.completado = false;
        precalificacion.value.bloqueado = true;
        precalificacion.value.fecha = null;
      }

      resetearCarta();
    }

    async function marcarDesistio() {
      desistio.value = true;
      cierre.value = false;

      emit("etapa-finalizada");
    }

    async function pasarACierre() {
      cierre.value = true;
      desistio.value = false;

      emit("etapa-finalizada");
    }

    onMounted(() => {
      cargarChecklist();
    });

    return {
      cargando,
      errores,
      actualizando,
      pasos,
      proforma,
      aprobacionBancaria,
      precalificacion,
      cartaAprobacion,
      docsBanco,
      decision,
      desistio,
      cierre,
      completados,
      totalPasos,
      progreso,
      procesoFinalizado,
      completarProforma,
      completarPrecalificacion,
      completarDocsBanco,
      registrarDecision,
      marcarDesistio,
      pasarACierre,
    };
  },
});