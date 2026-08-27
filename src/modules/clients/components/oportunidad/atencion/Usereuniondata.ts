import { ref, computed } from "vue";
import {
    actualizarFechaHoraActividad,
    listarActividadesPorLead,
} from '../../../actions/clientsReunion.action';
import {
    finalizarActividad,
    obtenerHistorialCorreoReunion,
    obtenerHistorialLlamadasReunion,
    obtenerHistorialWhatsappReunion,
    obtenerInfoEstadoReunionLead,
    obtenerTodasActividades,
} from '../../../actions/clients.atencion.action';
import { listarOpciones } from "@/modules/clients/actions/clientsContacto.action";
import { finalizarEtapaOportunidadDesistio } from "../../../actions/clients.atencion.action";
import type {
    IInfoEstadoReunionLeadResponse
} from '../../../interfaces/clients.atencion.interface';
import type { IActualizarFechaHoraActividadRequest, IActualizarFechaHoraActividadResponse, IListarActividadLeadResponse } from "@/modules/clients/interfaces/clientsreunion.interface";
import type { IListarOpcionesResponse } from "@/modules/clients/interfaces/clients.interface";




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

function parseFechaFlexible(fechaInput: any): Date {
    if (!fechaInput) return new Date();
    if (fechaInput instanceof Date) return fechaInput;

    const str = String(fechaInput).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const iso = new Date(str);
        if (!isNaN(iso.getTime())) return iso;
    }

    const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
        const [, dd, mm, yyyy] = dmy;
        const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        if (!isNaN(parsed.getTime())) return parsed;
    }

    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function formatearHora(fecha: Date) {
    return fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function formatearFecha(fecha: Date) {
    return fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function claseEstado(estado: string) {
    const e = (estado || "").toLowerCase();
    if (e.includes("complet") || e.includes("realizad") || e.includes("asisti")) {
        return "bg-emerald-50 text-emerald-600";
    }
    if (e.includes("reprogram")) return "bg-amber-50 text-amber-600";
    if (e.includes("cancel") || e.includes("no asisti")) return "bg-rose-50 text-rose-600";
    if (e.includes("pendient") || e.includes("programad")) return "bg-blue-50 text-blue-600";
    return "bg-slate-100 text-slate-500";
}

export function useReunionData(idLead: number | string) {
    const cargando = ref(true);
    const error = ref<string | null>(null);
    const reunion = ref<IListarActividadLeadResponse | null>(null);
    const historialReuniones = ref<any[]>([]);
    const historialContacto = ref<HistorialItem[]>([]);
    const idEstadoReunion = ref<number | null>(null);
    const idLeadEtapa = ref<number | null>(null);

    const nombreEstadoReunion = ref<string | null>(null);
    const telefonoLead = ref<string | null>(null); // NUEVO
    const proyecto = computed(() => nombreEstadoReunion.value ?? "Sin información");


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

    async function cargarInfoEstadoReunion() {
        const numIdLead = Number(idLead);
        if (!numIdLead) {
            idLeadEtapa.value = null;
            idEstadoReunion.value = null;
            nombreEstadoReunion.value = null;
            return;
        }

        try {
            const info: IInfoEstadoReunionLeadResponse =
                await obtenerInfoEstadoReunionLead(numIdLead);

            idEstadoReunion.value = info?.id_etapa_reunion ?? null; // ✅ Sin tocar
            idLeadEtapa.value = info?.id_lead_etapa ?? null; // ✅ Este va al modal
            nombreEstadoReunion.value = info?.nombre ?? null;
        } catch (e) {
            console.error("Error cargando el estado de la reunión", e);
            idEstadoReunion.value = null;
            idLeadEtapa.value = null;
            nombreEstadoReunion.value = null;
        }
    }

    async function cargarReunion() {
        cargando.value = true;
        error.value = null;

        try {
            const numIdLead = Number(idLead);
            if (!numIdLead) {
                error.value = "No se encontró el ID del lead.";
                return;
            }

            const actividades = await listarActividadesPorLead(numIdLead);

            const reuniones = actividades
                .filter((a: any) =>
                    ["reuni", "visita", "video"].some((k) =>
                        (a.tipo_actividad ?? "").toLowerCase().includes(k)
                    )
                )
                .sort((a: any, b: any) => {
                    const fa = parseFechaFlexible(a.fecha ?? a.fecha_actividad).getTime();
                    const fb = parseFechaFlexible(b.fecha ?? b.fecha_actividad).getTime();
                    return fb - fa;
                });

            reunion.value = reuniones[0] ?? actividades[0] ?? null;

            if (!reunion.value) {
                error.value = "No se encontró información de la reunión.";
            }

            // NUEVO: teléfono viene en la respuesta de listarActividadesPorLead
            telefonoLead.value = (reunion.value as any)?.telefono
                ? String((reunion.value as any).telefono)
                : (actividades[0] as any)?.telefono
                    ? String((actividades[0] as any).telefono)
                    : null;

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

                    const fechaObj = parseFechaFlexible(a.fecha ?? a.fecha_actividad);

                    return {
                        tipo,
                        titulo: a.tipo_actividad,
                        fecha: formatearFecha(fechaObj),
                        hora: a.hora ?? formatearHora(fechaObj),
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

        const idET = idLeadEtapa.value;
         if (!idEC || !idET) {
        historialContacto.value = [];
        return;
    }
        try {
            const [correos, whatsapps, llamadas] = await Promise.all([
                obtenerHistorialCorreoReunion(idEC),
                obtenerHistorialWhatsappReunion(idEC),
                obtenerHistorialLlamadasReunion(idET),
            ]);

            const itemsCorreo: HistorialItem[] = correos.map((c) => {
                const fechaObj = parseFechaFlexible(c.fecha_creacion);
                return {
                    tipo: "email",
                    titulo: c.mensaje?.trim() || "Correo enviado",
                    fecha: formatearFecha(fechaObj),
                    hora: formatearHora(fechaObj),
                    evidencia: Boolean(c.url_evidencia),
                };
            });

            const itemsWhatsapp: HistorialItem[] = whatsapps.map((w) => {
                return {
                    tipo: "whatsapp",
                    titulo: "WhatsApp enviado",
                    fecha: w.fecha ?? "",
                    hora: w.hora ?? "",
                    evidencia: false,
                };
            });

            const itemsLlamada: HistorialItem[] = llamadas.map((l) => {
                const fechaObj = parseFechaFlexible(l.fecha_creacion ?? l.fecha_inicio);
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
            console.error("[cargarHistorialContacto] Error cargando historial", e);
        }
    }

    async function cargarHistorialReuniones() {
        const numIdLead = Number(idLead);
        if (!numIdLead) {
            historialReuniones.value = [];
            return;
        }

        try {
            const actividades = await obtenerTodasActividades(numIdLead);

            historialReuniones.value = (actividades ?? [])
                .map((a: any) => {
                    const fechaObj = parseFechaFlexible(a.fecha ?? a.fecha_actividad);
                    return {
                        ...a,
                        tipo_actividad: a.tipo_actividad ?? "Sin información",
                        titulo: a.titulo ?? a.descripcion ?? a.tipo_actividad ?? "Sin información",
                        fecha: a.fecha ?? formatearFecha(fechaObj),
                        hora: a.hora ?? formatearHora(fechaObj),
                        estado: a.nombre_estado ?? a.estado ?? "Sin información",
                    };
                })
                .sort((a: any, b: any) => (b.id_actividad ?? 0) - (a.id_actividad ?? 0));
        } catch (e) {
            console.error("[cargarHistorialReuniones] Error cargando historial", e);
            historialReuniones.value = [];
        }
    }

    return {
        // Estado
        cargando,
        error,
        reunion,
        historialReuniones,
        historialContacto,
        idEstadoReunion,
        idLeadEtapa,

        nombreEstadoReunion,
        telefonoLead,

        // Computados
        proyecto,
        actividadTitulo,
        actividadCliente,
        actividadEstado,
        actividadFecha,
        actividadHora,
        actividadDescripcion,

        // Métodos
        cargarInfoEstadoReunion,
        cargarReunion,
        cargarHistorialContacto,
        cargarHistorialReuniones,
    };
}



export function useFinalizarActividad(idLead: number | string) {
    const guardando = ref(false);
    const error = ref<string | null>(null);

    async function confirmar(reunion: any, callbacks: { onSuccess?: () => void } = {}) {
        if (!reunion) {
            error.value = "No se encontró una reunión activa para finalizar.";
            return;
        }

        const idActividad = reunion.id_actividad;
        if (!idActividad) {
            error.value = "No se encontró el ID de la actividad.";
            return;
        }

        guardando.value = true;
        error.value = null;

        try {
            await finalizarActividad(idActividad);
            callbacks.onSuccess?.();
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Error al finalizar la actividad.";
        } finally {
            guardando.value = false;
        }
    }

    return { guardando, error, confirmar };
}
export function useReprogramacion(idLead: number | string) {
    const modalAbierto = ref(false);
    const nuevaFecha = ref("");
    const nuevaHora = ref("");
    const guardando = ref(false);
    const error = ref<string | null>(null);

    function abrir(reunion: any) {
        if (!reunion) return;
        nuevaFecha.value = "";
        nuevaHora.value = "";
        error.value = null;
        modalAbierto.value = true;
    }

    function cerrar() {
        // Guard solo aplica al cierre manual (botón X / click afuera / cancelar)
        // mientras se está guardando. No se usa en el flujo interno de éxito.
        if (guardando.value) return;
        modalAbierto.value = false;
        nuevaFecha.value = "";
        nuevaHora.value = "";
        error.value = null;
    }

    async function confirmar(reunion: any, callbacks: { onSuccess?: () => void } = {}) {
        if (!reunion) return;

        if (!nuevaFecha.value || !nuevaHora.value) {
            error.value = "Selecciona la nueva fecha y hora.";
            return;
        }

        const idActividad = (reunion as any).id_actividad;
        if (!idActividad) {
            error.value = "No se encontró el ID de la actividad.";
            return;
        }

        guardando.value = true;
        error.value = null;

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
                error.value = "No se pudo reprogramar la reunión.";
                return;
            }

            // FIX: antes se llamaba a cerrar(), pero guardando.value seguía en
            // true en este punto (recién se pone en false en el finally), así
            // que la guarda de cerrar() bloqueaba el cierre y el modal se
            // quedaba abierto. Reseteamos el estado directamente aquí, sin
            // pasar por esa guarda.
            modalAbierto.value = false;
            nuevaFecha.value = "";
            nuevaHora.value = "";
            error.value = null;

            callbacks.onSuccess?.();
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Error al reprogramar la reunión.";
        } finally {
            guardando.value = false;
        }
    }

    return {
        modalAbierto,
        nuevaFecha,
        nuevaHora,
        guardando,
        error,
        abrir,
        cerrar,
        confirmar,
    };
}

export function useDesistimiento(idLead: number | string) {
    const modalAbierto = ref(false);
    const cargandoOpciones = ref(false);
    const opciones = ref<IListarOpcionesResponse[]>([]);
    const motivoSeleccionado = ref<number | null>(null);
    const guardando = ref(false);
    const error = ref<string | null>(null);

    async function abrir() {
        cargandoOpciones.value = true;
        error.value = null;
        motivoSeleccionado.value = null;

        try {
            opciones.value = await listarOpciones(8);
            modalAbierto.value = true;
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Error al cargar las opciones.";
        } finally {
            cargandoOpciones.value = false;
        }
    }

    function cerrar() {
        // Guard solo aplica al cierre manual mientras se está guardando.
        if (guardando.value) return;
        modalAbierto.value = false;
        motivoSeleccionado.value = null;
        error.value = null;
    }

    async function confirmar(callbacks: { onSuccess?: () => void } = {}) {
        if (!motivoSeleccionado.value) {
            error.value = "Selecciona un motivo.";
            return;
        }

        const numIdLead = Number(idLead);
        if (!numIdLead) {
            error.value = "No se encontró el ID del lead.";
            return;
        }

        guardando.value = true;
        error.value = null;

        try {
            await finalizarEtapaOportunidadDesistio(numIdLead, motivoSeleccionado.value);

            // FIX: mismo problema que en reprogramación. Reseteamos el
            // estado directamente en vez de llamar a cerrar(), que se
            // bloqueaba a sí mismo por el guard de guardando.value.
            modalAbierto.value = false;
            motivoSeleccionado.value = null;
            error.value = null;

            callbacks.onSuccess?.();
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Error al registrar desistimiento.";
        } finally {
            guardando.value = false;
        }
    }

    return {
        modalAbierto,
        cargandoOpciones,
        opciones,
        motivoSeleccionado,
        guardando,
        error,
        abrir,
        cerrar,
        confirmar,
    };
}

export const claseEstadoExport = claseEstado;