<template>
    <!-- Conectado: barra delgada -->
    <div v-if="estado === 'conectado'"
        class="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        WhatsApp conectado<span v-if="asesor?.numero"> · {{ asesor.numero }}</span>
    </div>

    <!-- Cargando -->
    <p v-else-if="estado === 'cargando'" class="border-b border-slate-100 px-3 py-2 text-xs text-slate-400">
        Verificando conexión...
    </p>

    <!-- Sin registrar / sin conectar -->
    <div v-else class="space-y-2 border-b border-amber-100 bg-amber-50 p-3 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-semibold text-amber-800">
            <span class="h-2 w-2 rounded-full bg-amber-500" />
            Tu WhatsApp no está conectado
        </div>

        <template v-if="estado === 'sin-registrar'">
            <p>Escribe el número de WhatsApp Business del asesor para poder conectarlo.</p>
            <input v-model="numeroInput" inputmode="tel" placeholder="Ej: 999 697 779"
                class="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500" />
            <button type="button" :disabled="ocupado || !numeroInput.trim()" @click="registrarNumero"
                class="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                Guardar número
            </button>
        </template>

        <template v-else>
            <p>Número: <strong>{{ asesor?.numero }}</strong></p>

            <details class="text-slate-600">
                <summary class="cursor-pointer">¿Cómo se conecta?</summary>
                <ol class="mt-1 list-decimal space-y-0.5 pl-4">
                    <li>Pulsa "Conectar con WhatsApp Business".</li>
                    <li>Elige conectar una cuenta existente de WhatsApp Business.</li>
                    <li>Escanea el código QR con la app WhatsApp Business del celular.</li>
                    <li>Acepta compartir el historial y deja la app abierta unos minutos.</li>
                </ol>
            </details>

            <button type="button" :disabled="ocupado" @click="conectar"
                class="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {{ ocupado ? 'Conectando...' : 'Conectar con WhatsApp Business' }}
            </button>
        </template>

        <p v-if="mensaje" class="text-slate-500">{{ mensaje }}</p>
        <p v-if="error" class="text-red-600">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { isAxiosError } from 'axios';
import { automatizateApiNest } from '@/api/automatizateApiNest';

const props = defineProps<{ idTrabajador: number }>();
const emit = defineEmits<{ (e: 'conectado'): void }>();

type Estado = 'cargando' | 'sin-registrar' | 'desconectado' | 'conectado';

interface Asesor {
    numero: string;
    phone_number_id: string | null;
    waba_id: string | null;
    coexistencia: boolean;
    activo: boolean;
    fecha_conexion: string | null;
}

const estado = ref<Estado>('cargando');
const asesor = ref<Asesor | null>(null);
const numeroInput = ref('');
const mensaje = ref('');
const error = ref('');
const ocupado = ref(false);

// Datos que llegan de Meta durante el flujo (el code dura 30 s)
let code: string | null = null;
let wabaId: string | null = null;
let phoneNumberId: string | null = null;
let enviado = false;

function textoError(e: unknown, porDefecto: string) {
    if (isAxiosError(e)) return e.response?.data?.message ?? porDefecto;
    return e instanceof Error ? e.message : porDefecto;
}

// ───────── Backend ─────────

async function cargarEstado() {
    try {
        const { data } = await automatizateApiNest.get(
            `/whatsapp/coexistencia/asesor/${props.idTrabajador}`,
        );
        asesor.value = data;
        estado.value =
            data.coexistencia && data.activo && data.phone_number_id ? 'conectado' : 'desconectado';
    } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
            estado.value = 'sin-registrar';
            return;
        }
        error.value = textoError(e, 'No se pudo consultar el estado de WhatsApp.');
        estado.value = 'desconectado';
    }
}

async function registrarNumero() {
    error.value = '';
    ocupado.value = true;
    try {
        await automatizateApiNest.post('/whatsapp/coexistencia/asesor', {
            id_trabajador: props.idTrabajador,
            numero: numeroInput.value,
        });
        await cargarEstado();
    } catch (e) {
        error.value = textoError(e, 'No se pudo registrar el número.');
    } finally {
        ocupado.value = false;
    }
}

// ───────── Meta (Embedded Signup) ─────────

function cargarSdk(): Promise<void> {
    return new Promise((resolve) => {
        const w = window as any;
        if (w.FB) return resolve();

        w.fbAsyncInit = () => {
            w.FB.init({
                appId: import.meta.env.VITE_META_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: import.meta.env.VITE_META_GRAPH_VERSION ?? 'v25.0',
            });
            resolve();
        };

        const s = document.createElement('script');
        s.src = 'https://connect.facebook.net/es_LA/sdk.js';
        s.async = true;
        document.body.appendChild(s);
    });
}

function alMensajeDeMeta(event: MessageEvent) {
    if (!event.origin.includes('facebook.com')) return;
    try {
        const data = JSON.parse(event.data);
        if (data.type !== 'WA_EMBEDDED_SIGNUP') return;

        if (data.event === 'CANCEL') {
            mensaje.value = '';
            error.value = 'Cancelaste la conexión antes de terminar.';
            ocupado.value = false;
            return;
        }

        wabaId = data.data?.waba_id ?? wabaId;
        phoneNumberId = data.data?.phone_number_id ?? phoneNumberId;
        void intentarEnviar();
    } catch {
        /* mensajes que no son JSON */
    }
}

async function conectar() {
    error.value = '';
    mensaje.value = 'Abriendo Meta...';
    ocupado.value = true;
    code = wabaId = phoneNumberId = null;
    enviado = false;

    await cargarSdk();

    (window as any).FB.login(
        (resp: any) => {
            if (resp.authResponse?.code) {
                code = resp.authResponse.code;
                void intentarEnviar();
            } else {
                mensaje.value = '';
                error.value = 'No se completó el inicio de sesión con Meta.';
                ocupado.value = false;
            }
        },
        {
            config_id: import.meta.env.VITE_META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
                setup: {},
                featureType: 'whatsapp_business_app_onboarding',
                sessionInfoVersion: '3',
            },
        },
    );
}

async function intentarEnviar() {
    if (enviado || !code || !wabaId) return;
    enviado = true;
    mensaje.value = 'Conectando tu WhatsApp...';

    try {
        await automatizateApiNest.post('/whatsapp/coexistencia/onboarding', {
            code,
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
            id_trabajador: props.idTrabajador,
        });
        mensaje.value = '';
        await cargarEstado();
        emit('conectado');
    } catch (e) {
        mensaje.value = '';
        error.value = textoError(e, 'No se pudo completar la conexión.');
    } finally {
        ocupado.value = false;
    }
}

onMounted(() => {
    window.addEventListener('message', alMensajeDeMeta);
    void cargarEstado();
});

onBeforeUnmount(() => window.removeEventListener('message', alMensajeDeMeta));
</script>