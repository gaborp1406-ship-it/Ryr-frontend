import { onUnmounted, ref } from "vue";
import { useToast } from "vue-toastification";
import {
    realizarLlamada,
    colgarLlamadaActiva,
} from "../actions/Gestioninteraction.action.js";
import { useTonoLlamada } from "./useTonoLlamada.js";

export type SipStatus = "connected" | "calling" | "ringing" | "in-call" | "no-answer";
export type EstadoLlamada = SipStatus | "idle";

interface IParametrosLlamada {
    agentExtension: string;
    idTrabajador: number;
}

// Actualiza el indicador visual de estado SIP en el DOM (si existe; si no, no hace nada)
const setSipStatus = (state: SipStatus) => {
    const dot = document.getElementById("sipStatusDot");
    const txt = document.getElementById("sipStatusText");
    if (!dot || !txt) return;

    dot.className = "status-dot";

    const map: Record<SipStatus, { cls: string; label: string }> = {
        connected: { cls: "connected", label: "Registrado" },
        calling: { cls: "calling", label: "Llamando..." },
        ringing: { cls: "ringing", label: "Timbrando" },
        "in-call": { cls: "connected", label: "En llamada" },
        "no-answer": { cls: "calling", label: "No contestó" },
    };

    const s = map[state];
    dot.classList.add(s.cls);
    txt.textContent = s.label;
};

// Maneja el ciclo completo de una llamada manual saliente:
// 1) makeCall()            -> estado "calling"   (Conectando / Llamando...)
// 2) evento "ringing-outbound" -> estado "ringing" (Timbrando, el cliente está sonando)
// 3) evento "call-connected"   -> estado "in-call" (arranca el contador de segundos)
// 4) hangup() / evento "call-ended" -> vuelve a "idle"
export function useLlamadaSaliente() {
    const toast = useToast();
    const { reproducirTono, detenerTono } = useTonoLlamada(); // 👈 nuevo

    const currentCallId = ref<string | null>(null);
    const isCalling = ref(false);

    const estadoLlamada = ref<EstadoLlamada>("idle");
    const llamadaActiva = ref(false);
    const numeroDestino = ref("");

    const duracionSegundos = ref(0);
    let intervaloDuracion: ReturnType<typeof setInterval> | null = null;

    const iniciarContadorDuracion = () => {
        detenerContadorDuracion();
        duracionSegundos.value = 0;
        intervaloDuracion = setInterval(() => {
            duracionSegundos.value += 1;
        }, 1000);
    };

    function detenerContadorDuracion() {
        if (intervaloDuracion) {
            clearInterval(intervaloDuracion);
            intervaloDuracion = null;
        }
    }

    const reiniciarLlamada = () => {
        detenerContadorDuracion();
        duracionSegundos.value = 0;
        numeroDestino.value = "";
        currentCallId.value = null;
        llamadaActiva.value = false;
    };

    // Traduce los eventos que llegan por SSE al estado visual del teléfono
    const procesarEventoLlamada = (event: any) => {
        console.log("📡 Evento llamada:", event);

        switch (event.type) {
            case "ringing-agent":
                setSipStatus("calling");
                estadoLlamada.value = "calling";
                break;

            case "ringing-outbound":
                setSipStatus("ringing");
                estadoLlamada.value = "ringing";
                reproducirTono("timbrando");            // 👈 nuevo
                toast.info("📞 Timbrando...");
                break;

            case "call-connected":
                setSipStatus("in-call");
                estadoLlamada.value = "in-call";
                llamadaActiva.value = true;
                detenerTono();                           // 👈 nuevo, corta el ring
                iniciarContadorDuracion();
                toast.success("✅ Llamada conectada");
                break;

            case "call-ended":
                setSipStatus("connected");
                estadoLlamada.value = "idle";
                detenerTono();                           // 👈 nuevo
                reiniciarLlamada();
                toast.info("📴 Llamada finalizada");
                break;

            case "no-answer":
                setSipStatus("no-answer");
                estadoLlamada.value = "no-answer";
                llamadaActiva.value = false;
                detenerTono();                           // 👈 nuevo
                detenerContadorDuracion();
                duracionSegundos.value = 0;
                toast.warning("🚫 No contestó");

                setTimeout(() => {
                    setSipStatus("connected");
                    estadoLlamada.value = "idle";
                    numeroDestino.value = "";
                }, 2500);

                currentCallId.value = null;
                break;

            // ...resto igual...
        }
    };





    const makeCall = async (numeroExterno: string, params: IParametrosLlamada) => {
        if (isCalling.value) return;

        const numero = numeroExterno?.trim();

        if (!numero) {
            toast.warning("Ingresa un número para llamar");
            return;
        }

        isCalling.value = true;
        numeroDestino.value = numero;

        // Estado visual inicial: "Conectando / Llamando..."
        estadoLlamada.value = "calling";
        setSipStatus("calling");

        try {
         
           
            const response = await realizarLlamada({
                agent: params.agentExtension,
                phone: numero,
                idTrabajador: params.idTrabajador,
             
            });

            currentCallId.value = response.channelId;
            console.log("✅ Llamada iniciada:", response);
        } catch (error: any) {
            setSipStatus("connected");
            estadoLlamada.value = "idle";
            numeroDestino.value = "";

            toast.error(error.message ?? "Error al realizar llamada");
            console.error(error);
        } finally {
            isCalling.value = false;
        }
    };

    const hangup = async () => {
        detenerTono();
        if (!currentCallId.value) {
            toast.warning("No hay una llamada activa para colgar.");
            return;
        }

        const channelId = currentCallId.value;

        try {
            await colgarLlamadaActiva(channelId);
            console.log("📴 Solicitud de hangup enviada:", channelId);
        } catch (error: any) {
            toast.error(error.message ?? "Error al colgar la llamada.");
            console.error("❌ Error al colgar:", error);
        }
    };

    onUnmounted(() => {
        detenerContadorDuracion();
        detenerTono();
    });

    return {
        currentCallId,
        isCalling,
        estadoLlamada,
        llamadaActiva,
        numeroDestino,
        duracionSegundos,
        procesarEventoLlamada,
        makeCall,
        hangup,
    };
}