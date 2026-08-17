import { defineComponent, ref, computed, onMounted } from "vue";
import {
  actualizarFechaHoraActividad,
  listarActividadesPorLead,
} from "../../actions/clientsReunion.action";
import type {
  IActualizarFechaHoraActividadRequest,
  IActualizarFechaHoraActividadResponse,
  IListarActividadLeadResponse,
} from "../../interfaces/clientsreunion.interface";
import ModalEvidenciaGmail from "@/modules/clients/components/oportunidad/contacto/ModalEvidenciaGmail.vue";
import IconWhatsapp from "@/modules/common/icons/IconWhatsapp.vue";
import ModalEvidenciaWs from "@/modules/clients/components/oportunidad/contacto/ModalEvidenciaWs.vue";
import { obtenerHistorialCorreoReunion, obtenerHistorialLlamadasReunion, obtenerHistorialWhatsappReunion, obtenerInfoEstadoReunionLead } from "../../actions/clients.atencion.action";
import type { IInfoEstadoReunionLeadResponse } from "../../interfaces/clients.atencion.interface";

export interface DetalleLlamada {
  duracion?: string;
  resultado?: string;
  observacion?: string;
  [key: string]: any;
}

export interface LlamadaFinalizadaPayload {
  fecha: string;
  hora: string;
  llamada: DetalleLlamada;
}

export interface HistorialItem {
  tipo: "whatsapp" | "email" | "llamada";
  titulo: string;
  fecha: string;
  hora: string;
  evidencia: boolean;
  llamada?: DetalleLlamada;
}

export default defineComponent({
  components: {
    IconWhatsapp,
    ModalEvidenciaWs,
    ModalEvidenciaGmail,

  },
  props: {
    idLead: {
      type: [Number, String],
      required: true,
    },
  },
  setup(props) {
    const cargando = ref(true);
    const error = ref<string | null>(null);
    const reunion = ref<IListarActividadLeadResponse | null>(null);
    const historialReuniones = ref<IListarActividadLeadResponse[]>([]);
    const historialContacto = ref<HistorialItem[]>([]);
    const idEstadoReunion = ref<number | null>(null);
    const nombreEstadoReunion = ref<string | null>(null);

    const proyecto = computed(() => nombreEstadoReunion.value ?? "Sin información");

    // ---------- Datos de la actividad (reemplazan el bloque "Proyecto") ----------
    const actividadTitulo = computed(
      () => (reunion.value as any)?.titulo ?? (reunion.value as any)?.tipo_actividad ?? "Sin información"
    );
    const actividadCliente = computed(
      () => (reunion.value as any)?.nombres_cliente ?? "Sin información"
    );
    const actividadEstado = computed(
      () => (reunion.value as any)?.nombre_estado ?? "Sin información"
    );
    const actividadFecha = computed(
      () => (reunion.value as any)?.fecha ?? "Sin información"
    );
    const actividadHora = computed(
      () => (reunion.value as any)?.hora ?? "Sin información"
    );
    const actividadDescripcion = computed(
      () => (reunion.value as any)?.descripcion ?? ""
    );

    function formatearHora(fecha: Date) {
      return fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    }

    function formatearFecha(fecha: Date) {
      return fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
    }


    const modalLlamadaAbierto = ref(false);

    function abrirModalLlamada() {
      modalLlamadaAbierto.value = true;
    }

    function cerrarModalLlamada() {
      modalLlamadaAbierto.value = false;
    }

    function onLlamadaFinalizada(payload: LlamadaFinalizadaPayload) {
      historialContacto.value.unshift({
        tipo: "llamada",
        titulo: "Llamada realizada",
        fecha: payload.fecha,
        hora: payload.hora,
        evidencia: false,
        llamada: payload.llamada,
      });
      cerrarModalLlamada();
    }

    // ---------- WhatsApp ----------
    const modalWhatsappAbierto = ref(false);

    function abrirModalWhatsapp() {
      modalWhatsappAbierto.value = true;
    }

    function cerrarModalWhatsapp() {
      modalWhatsappAbierto.value = false;
    }

    async function onGuardarWhatsapp() {
      await cargarHistorialContacto();
      cerrarModalWhatsapp();
    }

    // ---------- Email ----------
    const modalEmailAbierto = ref(false);

    function abrirModalEmail() {
      modalEmailAbierto.value = true;
    }

    function cerrarModalEmail() {
      modalEmailAbierto.value = false;
    }

    async function onGuardarEmail() {
      await cargarHistorialContacto();
      cerrarModalEmail();
    }

    // ---------- Estado de reunión del lead ----------
    async function cargarInfoEstadoReunion() {
      const idLead = Number(props.idLead);

      if (!idLead) {
        idEstadoReunion.value = null;
        nombreEstadoReunion.value = null;
        return;
      }

      try {
        const info: IInfoEstadoReunionLeadResponse =
          await obtenerInfoEstadoReunionLead(idLead);
        idEstadoReunion.value = info?.id_etapa_reunion ?? null;
        nombreEstadoReunion.value = info?.nombre ?? null;
      } catch (e) {
        console.error("Error cargando el estado de la reunión", e);
        idEstadoReunion.value = null;
        nombreEstadoReunion.value = null;
      }
    }


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

        const reuniones = actividades
          .filter((a: any) =>
            ["reuni", "visita", "video"].some((k) =>
              (a.tipo_actividad ?? "").toLowerCase().includes(k)
            )
          )
          .sort((a: any, b: any) => {
            const fa = new Date(a.fecha ?? a.fecha_actividad ?? 0).getTime();
            const fb = new Date(b.fecha ?? b.fecha_actividad ?? 0).getTime();
            return fb - fa; // más reciente primero
          });

        // Actividad principal a mostrar en el bloque superior
        reunion.value = reuniones[0] ?? actividades[0] ?? null;

        // Historial de reuniones: vacío por el momento
        historialReuniones.value = [];

        if (!reunion.value) {
          error.value = "No se encontró información de la reunión.";
        }

        // Historial de contacto derivado de las actividades de wsp/email/llamada
        historialContacto.value = actividades
          .filter((a) =>
            ["whatsapp", "wsp", "correo", "email", "llamada", "call"].some((k) =>
              a.tipo_actividad.toLowerCase().includes(k)
            )
          )
          .map((a: any) => {
            const tipoRaw = a.tipo_actividad.toLowerCase();
            const tipo: HistorialItem["tipo"] = tipoRaw.includes("llamada") || tipoRaw.includes("call")
              ? "llamada"
              : tipoRaw.includes("email") || tipoRaw.includes("correo")
                ? "email"
                : "whatsapp";

            const fechaObj = new Date(a.fecha ?? a.fecha_actividad ?? Date.now());

            return {
              tipo,
              titulo: a.tipo_actividad,
              fecha: formatearFecha(fechaObj),
              hora: formatearHora(fechaObj),
              evidencia: Boolean(a.url_evidencia ?? a.evidencia),
            } as HistorialItem;
          })
          .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));
      } catch (e) {
        error.value = e instanceof Error ? e.message : "Error al cargar la reunión.";
      } finally {
        cargando.value = false;
      }
    }

    async function cargarHistorialContacto() {
      const idEC = idEstadoReunion.value;

      if (!idEC) {
        historialContacto.value = [];
        return;
      }

      try {
        const [correos, whatsapps, llamadas] = await Promise.all([
          obtenerHistorialCorreoReunion(idEC),
          obtenerHistorialWhatsappReunion(idEC),
          obtenerHistorialLlamadasReunion(idEC),
        ]);

        const itemsCorreo: HistorialItem[] = correos.map((c) => {
          const fechaObj = new Date(c.fecha_creacion);
          return {
            tipo: "email",
            titulo: c.mensaje?.trim() || "Correo enviado",
            fecha: formatearFecha(fechaObj),
            hora: formatearHora(fechaObj),
            evidencia: Boolean(c.url_evidencia),
          };
        });

        const itemsWhatsapp: HistorialItem[] = whatsapps.map((w) => {
          const fechaObj = new Date(w.fecha_creacion);
          return {
            tipo: "whatsapp",
            titulo: w.mensaje?.trim() || "WhatsApp enviado",
            fecha: formatearFecha(fechaObj),
            hora: formatearHora(fechaObj),
            evidencia: Boolean(w.url_evidencia),
          };
        });

        const itemsLlamada: HistorialItem[] = llamadas.map((l) => {
          const fechaObj = new Date(l.fecha_creacion ?? l.fecha_inicio);
          return {
            tipo: "llamada",
            titulo: l.contestada ? "Llamada contestada" : "Llamada no contestada",
            fecha: formatearFecha(fechaObj),
            hora: formatearHora(fechaObj),
            evidencia: Boolean(l.grabacion_url),
            llamada: {
              duracion: l.duracion_segundos
                ? `${Math.round(l.duracion_segundos / 60)} min`
                : undefined,
              resultado: l.contestada ? "Contestada" : "No contestada",
              observacion: l.observacion ?? undefined,
            },
          };
        });

        historialContacto.value = [...itemsCorreo, ...itemsWhatsapp, ...itemsLlamada].sort(
          (a, b) => (a.fecha + " " + a.hora < b.fecha + " " + b.hora ? 1 : -1)
        );
      } catch (e) {
        console.error("[cargarHistorialContacto] Error cargando historial de contacto", e);
      }
    }

    // ---------- Reprogramar ----------
    const modalReprogramarAbierto = ref(false);
    const nuevaFecha = ref("");
    const nuevaHora = ref("");
    const guardandoReprogramacion = ref(false);
    const errorReprogramar = ref<string | null>(null);

    function reprogramar() {
      if (!reunion.value) return;
      nuevaFecha.value = "";
      nuevaHora.value = "";
      errorReprogramar.value = null;
      modalReprogramarAbierto.value = true;
    }

    function cerrarModalReprogramar() {
      if (guardandoReprogramacion.value) return;
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

        await cargarReunion();
        await cargarHistorialContacto();   // 👈 nuevo
      } catch (e) {
        errorReprogramar.value =
          e instanceof Error ? e.message : "Error al reprogramar la reunión.";
      } finally {
        guardandoReprogramacion.value = false;
      }
    }

    onMounted(async () => {
      await Promise.all([cargarInfoEstadoReunion(), cargarReunion()]);
      await cargarHistorialContacto();
    });

    return {
      cargando,
      error,
      reunion,
      historialReuniones,
      historialContacto,
      idEstadoReunion,
      nombreEstadoReunion,
      proyecto,
      actividadTitulo,
      actividadCliente,
      actividadEstado,
      actividadFecha,
      actividadHora,
      actividadDescripcion,
      reprogramar,
      abrirModalWhatsapp,
      cerrarModalWhatsapp,
      modalWhatsappAbierto,
      onGuardarWhatsapp,
      abrirModalEmail,
      cerrarModalEmail,
      modalEmailAbierto,
      onGuardarEmail,
      abrirModalLlamada,
      cerrarModalLlamada,
      modalLlamadaAbierto,
      onLlamadaFinalizada,
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