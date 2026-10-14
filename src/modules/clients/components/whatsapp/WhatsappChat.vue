<template>
    <div class="fixed bottom-5 right-5 z-50">
        <!-- Botón flotante -->
        <button type="button" @click="alternarChat"
            class="flex items-center gap-3 rounded-full bg-emerald-600 px-5 py-3 text-white shadow-xl transition hover:bg-emerald-700">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor">
                <path
                    d="M20.52 3.48A11.85 11.85 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.16 1.6 5.97L0 24l6.26-1.64a11.9 11.9 0 0 0 5.81 1.5h.01C18.66 23.86 24 18.5 24 11.93c0-3.19-1.24-6.19-3.48-8.45ZM12.08 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.9 7.01c0 5.46-4.44 9.9-9.94 9.9Zm5.43-7.41c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.3 1.26.48 1.69.61.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
            </svg>

            <span class="text-sm font-semibold">WhatsApp</span>

            <span v-if="noLeidos > 0" class="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-emerald-700">
                {{ noLeidos }}
            </span>
        </button>

        <!-- Panel del chat -->
        <div v-if="abierto"
            class="absolute bottom-16 right-0 flex h-[min(520px,75vh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <!-- Encabezado -->
            <div class="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
                <div>
                    <p class="font-semibold">Chat Whatsapp</p>
                   
                </div>

                <div class="flex gap-2">
                    <button type="button" @click="cargarMensajes" :disabled="cargando || enviando"
                        title="Actualizar mensajes" class="rounded-lg p-2 hover:bg-emerald-700 disabled:opacity-50">
                        ↻
                    </button>

                    <button type="button" @click="abierto = false" title="Cerrar chat"
                        class="rounded-lg px-2 hover:bg-emerald-700">
                        ✕
                    </button>
                </div>
            </div>

            <!-- Aviso de error -->
            <p v-if="error" class="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                {{ error }}
            </p>

            <!-- Historial -->
            <div ref="listaRef" class="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
                <p v-if="cargando && !mensajes.length" class="py-8 text-center text-sm text-slate-500">
                    Cargando mensajes...
                </p>

                <p v-else-if="!mensajes.length && !cargando" class="py-8 text-center text-sm text-slate-500">
                    Todavía no hay mensajes para este lead.
                </p>

                <div v-for="mensaje in mensajes" :key="mensaje.wa_message_id || mensaje.id" class="flex" :class="mensaje.tipo_mensaje === 'entrante'
                    ? 'justify-start'
                    : 'justify-end'
                    ">
                    <div class="max-w-[85%] rounded-2xl px-3 py-2 shadow-sm" :class="mensaje.tipo_mensaje === 'entrante'
                        ? 'rounded-bl-sm bg-white text-slate-800'
                        : 'rounded-br-sm bg-emerald-100 text-slate-800'
                        ">
                        <p class="whitespace-pre-wrap break-words text-sm">
                            {{ mensaje.mensaje || 'Mensaje multimedia' }}
                        </p>

                        <p class="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                            {{ formatearFecha(mensaje.fecha_mensaje) }}

                            <template v-if="mensaje.tipo_mensaje === 'saliente'">
                                <span v-if="mensaje.estado === 'enviado'" title="Enviado">✓</span>
                                <span v-else-if="mensaje.estado === 'entregado'" title="Entregado">✓✓</span>
                                <span v-else-if="mensaje.estado === 'leido'" class="text-sky-500"
                                    title="Leído">✓✓</span>
                                <span v-else-if="mensaje.estado === 'fallido'" class="font-bold text-red-500"
                                    :title="mensaje.error_detalle || 'No se pudo entregar'">!</span>
                            </template>
                        </p>
                    </div>
                </div>

                <p v-if="cargando && mensajes.length" class="py-2 text-center text-xs text-slate-400">
                    Actualizando...
                </p>
            </div>

   

            <!-- Formulario para enviar -->
            <form class="flex items-end gap-2 border-t border-slate-200 bg-white p-3" @submit.prevent="enviarMensaje">
                <textarea v-model="nuevoMensaje" rows="1" maxlength="4096" placeholder="Escribe un mensaje..."
                    class="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    :disabled="enviando" @keydown.enter.exact.prevent="enviarMensaje" />

                <button type="submit" :disabled="enviando || !nuevoMensaje.trim()"
                    class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {{ enviando ? 'Enviando...' : 'Enviar' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { io, type Socket } from 'socket.io-client';

import {
    enviarMensajeWhatsappLead,
    escribiendoWhatsappLead,
    listarMensajesWhatsappLead,
    marcarLeidoWhatsappLead,
} from '../../actions/whastsapp.action';

import type {
    IWhatsappMensajeResponse,
} from '../../interfaces/whastsapp.interface';

const props = defineProps<{
    idLead: number;
}>();

const INTERVALO_ESCRIBIENDO_MS = 20_000;

const abierto = ref(false);
const cargando = ref(false);
const enviando = ref(false);
const conectado = ref(false);
const error = ref('');
const nuevoMensaje = ref('');
const noLeidos = ref(0);
const estadoEscribiendo = ref('');

const mensajes = ref<IWhatsappMensajeResponse[]>([]);
const listaRef = ref<HTMLElement | null>(null);

let socket: Socket | null = null;
let ultimoAvisoEscribiendo = 0;

const sonido = new Audio('/sounds/notificacionwsp.mp3');
sonido.preload = 'auto';

async function bajarAlFinal() {
    await nextTick();

    if (listaRef.value) {
        listaRef.value.scrollTop = listaRef.value.scrollHeight;
    }
}

function reproducirSonido() {
    sonido.currentTime = 0;
    // El navegador bloquea el audio hasta que el usuario interactúa con la página.
    sonido.play().catch(() => { });
}

async function marcarLeido() {
    try {
        await marcarLeidoWhatsappLead(props.idLead);
    } catch {
        // No es crítico, no mostramos error.
    }
}

// Avisa "escribiendo..." al cliente. Máximo 1 vez cada 20 s
// (el indicador de Meta dura hasta 25 s).
async function avisarEscribiendo() {
    const ahora = Date.now();

    if (ahora - ultimoAvisoEscribiendo < INTERVALO_ESCRIBIENDO_MS) return;

    ultimoAvisoEscribiendo = ahora;
    estadoEscribiendo.value = 'Enviando "escribiendo..." al cliente...';
    console.log('[escribiendo] llamando al backend, lead', props.idLead);

    try {
        const res = await escribiendoWhatsappLead(props.idLead);
        console.log('[escribiendo] respuesta del backend:', res);

        estadoEscribiendo.value = res?.ok
            ? '✓ "Escribiendo..." enviado al cliente'
            : `⚠ No se pudo mostrar "escribiendo": ${res?.detalle ?? 'sin detalle'}`;
    } catch (e) {
        console.error('[escribiendo] error', e);
        estadoEscribiendo.value = `⚠ Error: ${e instanceof Error ? e.message : 'desconocido'}`;
    }
}

// Un solo disparador: cada vez que cambia el texto y no está vacío.
watch(nuevoMensaje, (valor) => {
    if (!valor.trim()) {
        estadoEscribiendo.value = '';
        return;
    }

    avisarEscribiendo();
});

async function cargarMensajes() {
    if (cargando.value) return;

    cargando.value = true;
    error.value = '';

    try {
        mensajes.value = await listarMensajesWhatsappLead(props.idLead);
        await bajarAlFinal();
    } catch (e) {
        error.value =
            e instanceof Error
                ? e.message
                : 'No se pudieron cargar los mensajes.';
    } finally {
        cargando.value = false;
    }
}

async function alternarChat() {
    abierto.value = !abierto.value;

    if (abierto.value) {
        noLeidos.value = 0;
        await cargarMensajes();
        marcarLeido();
    }
}

function formatearFecha(fecha: string) {
    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

async function enviarMensaje() {
    const texto = nuevoMensaje.value.trim();

    if (!texto || enviando.value) return;

    enviando.value = true;
    error.value = '';

    try {
        const guardado = await enviarMensajeWhatsappLead(props.idLead, texto);

        nuevoMensaje.value = '';
        ultimoAvisoEscribiendo = 0;
        estadoEscribiendo.value = '';

        // El socket también emite este mensaje; evitamos duplicarlo.
        if (
            guardado?.wa_message_id &&
            !mensajes.value.some((m) => m.wa_message_id === guardado.wa_message_id)
        ) {
            mensajes.value.push(guardado);
            await bajarAlFinal();
        }
    } catch (e) {
        error.value =
            e instanceof Error
                ? e.message
                : 'No se pudo enviar el mensaje.';
    } finally {
        enviando.value = false;
    }
}

// ───────────── Tiempo real (Socket.IO) ─────────────

function conectarSocket() {
    // Usamos solo el origin por si la URL trae un prefijo como /api
    const origen = new URL(import.meta.env.VITE_API_URL_NEST, window.location.origin).origin;

    socket = io(`${origen}/whatsapp`, { transports: ['websocket'] });

    // Se ejecuta también al reconectar, así vuelve a unirse a la sala.
    socket.on('connect', () => {
        conectado.value = true;
        socket!.emit('unirse-lead', props.idLead);

        // Recupera lo que pudo llegar mientras estuvo desconectado.
        if (abierto.value) cargarMensajes();
    });

    socket.on('disconnect', () => {
        conectado.value = false;
    });

    socket.on('mensaje-nuevo', (m: IWhatsappMensajeResponse) => {
        if (m.id_lead !== props.idLead) return;
        if (mensajes.value.some((x) => x.wa_message_id === m.wa_message_id)) return;

        mensajes.value.push(m);
        bajarAlFinal();

        if (m.tipo_mensaje === 'entrante') {
            reproducirSonido();

            if (abierto.value) marcarLeido();
            else noLeidos.value++;
        }
    });

    socket.on(
        'estado-mensaje',
        ({ wa_message_id, estado }: { wa_message_id: string; estado: IWhatsappMensajeResponse['estado'] }) => {
            const m = mensajes.value.find((x) => x.wa_message_id === wa_message_id);
            if (m) m.estado = estado;
        },
    );
}

onMounted(conectarSocket);

onBeforeUnmount(() => {
    socket?.disconnect();
    socket = null;
});

watch(
    () => props.idLead,
    (nuevo, viejo) => {
        socket?.emit('salir-lead', viejo);
        socket?.emit('unirse-lead', nuevo);

        mensajes.value = [];
        error.value = '';
        noLeidos.value = 0;
        estadoEscribiendo.value = '';
        ultimoAvisoEscribiendo = 0;

        if (abierto.value) {
            cargarMensajes().then(marcarLeido);
        }
    },
);
</script>