// ClientsContactoHistorial.ts
import IconWhatsapp from "@/modules/common/icons/IconWhatsapp.vue";
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import type { DetalleLlamada } from "@/modules/clients/components/candidato/llamada/ModalLlamada";
import type {
    IHistorialCorreoResponse,
    IHistorialLlamadaResponse,
    IHistorialWhatsappResponse,
} from "../../interfaces/clientscontacto.interface";
import {
    obtenerHistorialCorreo,
    obtenerHistorialLlamadas,
    obtenerHistorialWhatsapp,
} from "../../actions/clientsContacto.action";

export interface HistorialItem {
    tipo: "llamada" | "whatsapp" | "correo";
    titulo: string;
    fecha: string;
    hora: string;
    evidencia: boolean;
    url_evidencia?: string | null;
    descripcion?: string;
    llamada?: DetalleLlamada;
}

type TipoEvidencia = "imagen" | "pdf" | "audio" | "video";

export default defineComponent({
    components: {
        IconWhatsapp,
    },
    props: {
        idLead: {
            type: Number,
            required: true,
        },
        idEstadoContacto: {
            type: Number,
            required: true,
        },
    },
    emits: ["ver-detalle-llamada", "primer-contacto-cargado"],
    setup(props, { emit, expose }) {
        const historial = ref<HistorialItem[]>([]);
        const cargando = ref(false);
        const error = ref<string | null>(null);

        // ---------- Modal de evidencia ----------
        const modalEvidenciaVisible = ref(false);
        const evidenciaUrlActual = ref("");

        const EXTENSIONES: Record<string, TipoEvidencia> = {
            png: "imagen", jpg: "imagen", jpeg: "imagen", gif: "imagen", webp: "imagen", svg: "imagen",
            pdf: "pdf",
            mp3: "audio", wav: "audio", ogg: "audio", m4a: "audio",
            mp4: "video", webm: "video", mov: "video",
        };

        const tipoEvidenciaActual = computed<TipoEvidencia | null>(() => {
            if (!evidenciaUrlActual.value) return null;
            const limpio = evidenciaUrlActual.value.split("?")[0];
            const ext = limpio.split(".").pop()?.toLowerCase() ?? "";
            return EXTENSIONES[ext] ?? null;
        });

        function abrirEvidencia(item: HistorialItem) {
            if (!item.url_evidencia) return;
            evidenciaUrlActual.value = item.url_evidencia;
            modalEvidenciaVisible.value = true;
        }

        function cerrarEvidencia() {
            modalEvidenciaVisible.value = false;
            evidenciaUrlActual.value = "";
        }

        // ---------- Helpers de formato ----------
        function formatFechaDesdeISO(iso: string | null | undefined): string {
            if (!iso) return "-";
            const d = new Date(iso);
            if (isNaN(d.getTime())) return iso;
            return d.toLocaleDateString("es-PE");
        }

        function formatHoraDesdeISO(iso: string | null | undefined): string {
            if (!iso) return "-";
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "-";
            return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
        }

        function formatHoraCompletaDesdeISO(iso: string | null | undefined): string {
            if (!iso) return "-";
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "-";
            return d.toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        }

        function formatDuracion(segundosTotales: number): string {
            const minutos = Math.floor(segundosTotales / 60);
            const segundos = segundosTotales % 60;
            return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
        }

        // ---------- Carga principal ----------
        async function cargarHistorial() {
            cargando.value = true;
            error.value = null;

            try {
                const [correos, whatsapps, llamadas] = await Promise.all([
                    obtenerHistorialCorreo(props.idEstadoContacto),
                    obtenerHistorialWhatsapp(props.idEstadoContacto),
                    obtenerHistorialLlamadas(props.idEstadoContacto),
                ]);

                const itemsConTimestamp: { timestamp: number; item: HistorialItem }[] = [];

                correos.forEach((c: IHistorialCorreoResponse) => {
                    itemsConTimestamp.push({
                        timestamp: new Date(c.fecha_creacion).getTime(),
                        item: {
                            tipo: "correo",
                            titulo: "Correo enviado",
                            fecha: formatFechaDesdeISO(c.fecha_creacion),
                            hora: formatHoraDesdeISO(c.fecha_creacion),
                            evidencia: !!c.url_evidencia,
                            descripcion: c.mensaje || undefined,
                            url_evidencia: c.url_evidencia,
                        },
                    });
                });

                whatsapps.forEach((w: IHistorialWhatsappResponse) => {
                    itemsConTimestamp.push({
                        timestamp: new Date(w.fecha_creacion).getTime(),
                        item: {
                            tipo: "whatsapp",
                            titulo: "WhatsApp enviado",
                            fecha: formatFechaDesdeISO(w.fecha_creacion),
                            hora: formatHoraDesdeISO(w.fecha_creacion),
                            evidencia: !!w.url_evidencia,
                            descripcion: w.mensaje || undefined,
                            url_evidencia: w.url_evidencia,
                        },
                    });
                });

                // Llamadas: por ahora sin evidencia (grabación no se maneja todavía)
                llamadas.forEach((l: IHistorialLlamadaResponse) => {
                    itemsConTimestamp.push({
                        timestamp: new Date(l.fecha_creacion).getTime(),
                        item: {
                            tipo: "llamada",
                            titulo: l.contestada ? "Llamada realizada" : "Llamada no contestada",
                            fecha: formatFechaDesdeISO(l.fecha_creacion),
                            hora: formatHoraDesdeISO(l.fecha_creacion),
                            evidencia: false,
                            descripcion: l.observacion || undefined,
                            llamada: {
                                fechaInicio: formatFechaDesdeISO(l.fecha_inicio),
                                horaInicio: formatHoraCompletaDesdeISO(l.fecha_inicio),
                                fechaFin: formatFechaDesdeISO(l.fecha_fin),
                                horaFin: formatHoraCompletaDesdeISO(l.fecha_fin),
                                duracion: formatDuracion(l.duracion_segundos),
                            },
                        },
                    });
                });

                itemsConTimestamp.sort((a, b) => a.timestamp - b.timestamp);
                historial.value = itemsConTimestamp.map((x) => x.item);
                paginaActual.value = 1;
            } catch (err) {
                error.value =
                    err instanceof Error ? err.message : "Error al cargar el historial de contacto.";
                console.error(err);
            } finally {
                cargando.value = false;
            }
        }

        // ---------- Paginación ----------
        const ITEMS_POR_PAGINA = 5;
        const paginaActual = ref(1);

        const totalPaginas = computed(() =>
            Math.max(1, Math.ceil(historial.value.length / ITEMS_POR_PAGINA))
        );

        const historialOrdenado = computed(() => [...historial.value].reverse());

        const itemsPaginados = computed(() => {
            const inicio = (paginaActual.value - 1) * ITEMS_POR_PAGINA;
            return historialOrdenado.value.slice(inicio, inicio + ITEMS_POR_PAGINA);
        });

        const paginasVisibles = computed<(number | "...")[]>(() => {
            const total = totalPaginas.value;
            const actual = paginaActual.value;
            const paginas: (number | "...")[] = [];

            if (total <= 7) {
                for (let i = 1; i <= total; i++) paginas.push(i);
                return paginas;
            }

            paginas.push(1);
            if (actual > 3) paginas.push("...");

            const inicio = Math.max(2, actual - 1);
            const fin = Math.min(total - 1, actual + 1);
            for (let i = inicio; i <= fin; i++) paginas.push(i);

            if (actual < total - 2) paginas.push("...");
            paginas.push(total);

            return paginas;
        });

        function irAPagina(pagina: number | "...") {
            if (pagina === "...") return;
            paginaActual.value = pagina;
        }

        function irPaginaAnterior() {
            if (paginaActual.value > 1) paginaActual.value--;
        }

        function irPaginaSiguiente() {
            if (paginaActual.value < totalPaginas.value) paginaActual.value++;
        }

        watch(totalPaginas, (nuevoTotal) => {
            if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
        });

        function agregarItem(item: HistorialItem) {
            historial.value.push(item);
            paginaActual.value = 1;
        }

        function verDetalleLlamada(item: HistorialItem) {
            if (!item.llamada) return;
            emit("ver-detalle-llamada", item);
        }

        onMounted(() => {
            cargarHistorial();
        });

        expose({
            cargarHistorial,
            agregarItem,
        });

        return {
            historial: itemsPaginados,
            cargando,
            error,
            verDetalleLlamada,
            paginaActual,
            totalPaginas,
            paginasVisibles,
            irAPagina,
            irPaginaAnterior,
            irPaginaSiguiente,
            modalEvidenciaVisible,
            evidenciaUrlActual,
            tipoEvidenciaActual,
            abrirEvidencia,
            cerrarEvidencia,
        };
    },
});