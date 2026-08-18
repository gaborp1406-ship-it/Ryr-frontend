import { onUnmounted, ref } from "vue";
import { useToast } from "vue-toastification";
import {
    realizarLlamada,
    colgarLlamadaActiva,
} from "../actions/Gestioninteraction.action.js";
import { useTonoLlamada } from "./useTonoLlamada.js";

export type SipStatus = "connected" | "calling" | "ringing" | "in-call" | "no-answer" | "idle";
export type EstadoLlamada = SipStatus;

interface IParametrosLlamada {
    agentExtension: string;
    idTrabajador: number;
}

/**
 * COMPOSABLE DE LLAMADAS SALIENTES
 * 
 * Maneja:
 * - Estado de la llamada
 * - Duración del tiempo
 * - Tonos de llamada
 * - Eventos SSE
 */
export function useLlamadaSaliente() {
    const toast = useToast();
    const { reproducirTono, detenerTono } = useTonoLlamada();

    // Estado
    const currentCallId = ref<string | null>(null);
    const isCalling = ref(false);
    const estadoLlamada = ref<EstadoLlamada>("idle");
    const llamadaActiva = ref(false);
    const numeroDestino = ref("");
    const duracionSegundos = ref(0);

    let intervaloDuracion: ReturnType<typeof setInterval> | null = null;

    /**
     * Iniciar contador de duración
     */
    const iniciarContadorDuracion = () => {
        detenerContadorDuracion();
        duracionSegundos.value = 0;
        intervaloDuracion = setInterval(() => {
            duracionSegundos.value += 1;
        }, 1000);
    };

    /**
     * Detener contador de duración
     */
    const detenerContadorDuracion = () => {
        if (intervaloDuracion) {
            clearInterval(intervaloDuracion);
            intervaloDuracion = null;
        }
    };

    /**
     * Reiniciar estado de la llamada
     */
    const reiniciarLlamada = () => {
        detenerContadorDuracion();
        duracionSegundos.value = 0;
        numeroDestino.value = "";
        currentCallId.value = null;
        llamadaActiva.value = false;
    };

    /**
     * PROCESAR EVENTOS SSE
     * 
     * Eventos esperados:
     * - "calling" → Llamando al cliente
     * - "ringing" → Timbrando en cliente
     * - "in-call" → Llamada conectada
     * - "call-ended" → Llamada finalizada
     * - "no-answer" → Sin respuesta
     */
    const procesarEventoLlamada = (event: any) => {
        console.log("📡 Evento SSE:", event.type);

        switch (event.type) {
            case "calling":
            case "ringing-agent":
                estadoLlamada.value = "calling";
                reproducirTono("llamando");
                console.log("📞 Llamando...");
                break;

            case "ringing":
            case "ringing-outbound":
                estadoLlamada.value = "ringing";
                reproducirTono("timbrando");
                toast.info("📞 Timbrando...");
                console.log("📞 Timbrando...");
                break;

            case "call-connected":
            case "in-call":
                estadoLlamada.value = "in-call";
                llamadaActiva.value = true;
                detenerTono();
                iniciarContadorDuracion();
                toast.success("✅ Llamada conectada");
                console.log("✅ Conectado");
                break;

            case "call-ended":
                estadoLlamada.value = "idle";
                detenerTono();
                reiniciarLlamada();
                toast.info("📴 Llamada finalizada");
                console.log("📴 Finalizada");
                break;

            case "no-answer":
                estadoLlamada.value = "no-answer";
                llamadaActiva.value = false;
                detenerTono();
                detenerContadorDuracion();
                toast.warning("🚫 No contestó");
                console.log("🚫 No contestó");

                // Auto-cierre después de 3 segundos
                setTimeout(() => {
                    estadoLlamada.value = "idle";
                    numeroDestino.value = "";
                }, 3000);

                currentCallId.value = null;
                break;

            default:
                console.log("⚠️ Evento desconocido:", event.type);
        }
    };

    /**
     * REALIZAR LLAMADA SALIENTE
     */
    const makeCall = async (numeroExterno: string, params: IParametrosLlamada) => {
        if (isCalling.value) {
            toast.warning("Ya hay una llamada en proceso");
            return;
        }

        const numero = numeroExterno?.trim();

        if (!numero) {
            toast.warning("Ingresa un número para llamar");
            return;
        }

        isCalling.value = true;
        numeroDestino.value = numero;
        estadoLlamada.value = "calling";

        try {
            console.log(`📞 Llamando a ${numero} desde agente ${params.agentExtension}`);

            const response = await realizarLlamada({
                agent: params.agentExtension,
                phone: numero,
                idTrabajador: params.idTrabajador,
            });

            currentCallId.value = response.channelId;
            console.log("✅ Llamada iniciada:", response.channelId);

        } catch (error: any) {
            console.error("❌ Error:", error);
            estadoLlamada.value = "idle";
            numeroDestino.value = "";
            toast.error(error.message ?? "Error al realizar llamada");

        } finally {
            isCalling.value = false;
        }
    };

    /**
     * COLGAR LLAMADA
     */
    const hangup = async () => {
        if (!currentCallId.value) {
            toast.warning("No hay llamada activa");
            return;
        }

        const channelId = currentCallId.value;

        try {
            console.log(`📴 Colgando ${channelId}`);
            detenerTono();
            await colgarLlamadaActiva(channelId);
            console.log("✅ Colgada");

        } catch (error: any) {
            console.error("❌ Error:", error);
            toast.error(error.message ?? "Error al colgar");
        }
    };

    /**
     * LIMPIEZA AL DESMONTAR
     */
    onUnmounted(() => {
        detenerContadorDuracion();
        detenerTono();
    });

    return {
        // Estados
        currentCallId,
        isCalling,
        estadoLlamada,
        llamadaActiva,
        numeroDestino,
        duracionSegundos,

        // Métodos
        procesarEventoLlamada,
        makeCall,
        hangup,
    };
}