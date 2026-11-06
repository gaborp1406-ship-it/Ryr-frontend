<template>
  <aside
    class="fixed bottom-0 right-0 top-0 z-40 flex w-[400px] flex-col border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(15,23,42,0.06)] transition-transform duration-300 max-[900px]:w-full"
    :class="abierto ? 'translate-x-0' : 'translate-x-full'"
    aria-label="Asistente de análisis"
  >
    <!-- HEADER -->
    <div class="flex items-center gap-[10px] border-b border-slate-200 px-[18px] py-[14px]">
      <div class="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#0a0a0a] text-white">✦</div>
      <div class="min-w-0">
        <strong class="block text-[14px]">Asistente de análisis</strong>
        <span class="block text-[11px] text-slate-500">Consulta datos reales del dashboard</span>
      </div>
      <button type="button" class="ml-auto text-[22px] leading-none text-slate-400 hover:text-slate-700"
        aria-label="Cerrar" @click="emit('update:abierto', false)">×</button>
    </div>

    <!-- FILTRO ACTIVO -->
    <div class="border-b border-slate-100 bg-slate-50 px-[18px] py-[8px] text-[11px] text-slate-500">
      Filtro activo:
      <strong class="text-slate-700">{{ fechaInicio || 'inicio' }} → {{ fechaFin || 'hoy' }}</strong>
      · {{ idAsesor ? `Asesor #${idAsesor}` : 'Todos los asesores' }}
    </div>

    <!-- MENSAJES -->
    <div ref="contenedor" class="flex flex-1 flex-col gap-[12px] overflow-y-auto px-[18px] py-[16px]">
      <div v-if="!mensajes.length" class="rounded-[12px] border border-slate-200 bg-[#f8faf9] p-[12px] text-[13px] text-slate-600">
        Hola 👋 Pregúntame sobre leads, cierres, contacto o asesores. Uso el rango de fechas del dashboard,
        o el que escribas en tu pregunta (ej: "del 1 al 20 de enero").
      </div>

      <div v-for="(m, i) in mensajes" :key="i" class="flex flex-col"
        :class="m.role === 'user' ? 'items-end' : 'items-start'">
        <div class="max-w-[92%] whitespace-pre-wrap rounded-[12px] px-[12px] py-[10px] text-[13px] leading-[1.5]"
          :class="[
            m.role === 'user' ? 'bg-[#2d8c4a] text-white' : 'border border-slate-200 bg-[#f8faf9] text-slate-800',
            m.error ? '!border-red-200 !bg-red-50 !text-red-700' : '',
          ]" v-html="formatear(m.content)"></div>

        <!-- EVIDENCIA -->
        <details v-if="m.consultas?.length" class="mt-[4px] max-w-[92%] text-[11px] text-slate-500">
          <summary class="cursor-pointer select-none hover:text-slate-700">
            Ver datos usados ({{ m.consultas.length }})
          </summary>
          <div class="mt-[4px] max-h-[200px] overflow-auto rounded-[8px] bg-slate-900 p-[8px] text-[10px] text-slate-100">
            <pre class="m-0 whitespace-pre-wrap">{{ JSON.stringify(m.consultas, null, 2) }}</pre>
          </div>
        </details>
      </div>

      <div v-if="cargando" class="self-start rounded-[12px] border border-slate-200 bg-[#f8faf9] px-[12px] py-[10px] text-[13px] italic text-slate-500">
        Consultando datos…
      </div>
    </div>

    <!-- SUGERENCIAS -->
    <div v-if="!mensajes.length" class="flex flex-wrap gap-[6px] px-[18px] pb-[10px]">
      <button v-for="s in sugerencias" :key="s" type="button"
        class="rounded-full border border-slate-200 bg-white px-[11px] py-[6px] text-[12px] hover:border-[#2d8c4a] hover:text-[#2d8c4a]"
        @click="enviar(s)">
        {{ s }}
      </button>
    </div>

    <!-- INPUT -->
    <div class="flex gap-[8px] border-t border-slate-200 px-[18px] pb-[16px] pt-[12px]">
      <input v-model="texto" type="text" :disabled="cargando" autocomplete="off"
        placeholder="Pregunta sobre los indicadores…"
        class="h-[40px] flex-1 rounded-[9px] border border-slate-200 bg-slate-50 px-[10px] text-[13px] outline-none focus:border-[#2d8c4a] focus:bg-white"
        @keydown.enter.prevent="enviar()" />
      <button type="button" :disabled="cargando || !texto.trim()"
        class="h-[40px] rounded-[9px] bg-[#2d8c4a] px-[16px] text-[12px] font-bold text-white hover:bg-[#24763d] disabled:cursor-not-allowed disabled:opacity-50"
        @click="enviar()">
        Enviar
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import {
  chatAnalistaDatos,
  type ConsultaAnalista,
} from '../actions/analistaDatos.actions';

const props = defineProps<{
  abierto: boolean;
  fechaInicio: string;
  fechaFin: string;
  idAsesor: number | null;
}>();

const emit = defineEmits<{ (e: 'update:abierto', valor: boolean): void }>();

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  consultas?: ConsultaAnalista[];
  error?: boolean;
}

const mensajes = ref<Mensaje[]>([]);
const texto = ref('');
const cargando = ref(false);
const contenedor = ref<HTMLElement | null>(null);

const sugerencias = [
  '¿Cuántos leads hay en total?',
  'Cierres por asesor',
  'Resumen de contacto',
  'Leads por fuente',
];

const bajar = async () => {
  await nextTick();
  if (contenedor.value) contenedor.value.scrollTop = contenedor.value.scrollHeight;
};

// Escapa HTML (seguridad) y solo permite **negrita**
const formatear = (t: string) =>
  t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const enviar = async (preset?: string) => {
  const mensaje = (preset ?? texto.value).trim();
  if (!mensaje || cargando.value) return;

  // El historial se arma ANTES de agregar el mensaje nuevo
  const historial = mensajes.value
    .filter((m) => !m.error)
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  mensajes.value.push({ role: 'user', content: mensaje });
  texto.value = '';
  cargando.value = true;
  bajar();

  try {
    const res = await chatAnalistaDatos({
      mensaje,
      fechaInicio: props.fechaInicio,
      fechaFin: props.fechaFin,
      idAsesor: props.idAsesor,
      historial,
    });

    mensajes.value.push({
      role: 'assistant',
      content: res.respuesta,
      consultas: res.consultas,
    });
  } catch (e: any) {
    mensajes.value.push({
      role: 'assistant',
      content: e?.message ?? 'No pude consultar los datos. Intenta de nuevo.',
      error: true,
    });
  } finally {
    cargando.value = false;
    bajar();
  }
};
</script>