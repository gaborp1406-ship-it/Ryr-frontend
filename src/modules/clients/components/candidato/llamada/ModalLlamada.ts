// ModalLlamada.ts
import { defineComponent, ref, computed, watch, onBeforeUnmount } from "vue";

export interface DetalleLlamada {
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  duracion: string;
}

export interface LlamadaFinalizadaPayload {
  fecha: string;
  hora: string;
  llamada: DetalleLlamada;
}

type EstadoLlamada = "llamando" | "en-curso" | "finalizada";

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close", "finalizada"],
  setup(props, { emit }) {
    const estadoLlamada = ref<EstadoLlamada>("llamando");
    const micSilenciado = ref(false);
    const altavozSilenciado = ref(false);
    const tiempoTranscurrido = ref(0);

    let horaInicioLlamada: Date | null = null;
    let temporizadorId: ReturnType<typeof setInterval> | null = null;
    let ringingTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalTimbre: ReturnType<typeof setInterval> | null = null;
    let audioCtx: AudioContext | null = null;

    function formatDuracion(segundosTotales: number): string {
      const minutos = Math.floor(segundosTotales / 60);
      const segundos = segundosTotales % 60;
      return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    }

    const tiempoTranscurridoFormateado = computed(() => formatDuracion(tiempoTranscurrido.value));

    function reproducirTono() {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 425;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1);
    }

    function iniciarSonidoTimbre() {
      try {
        const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioCtor();
        reproducirTono();
        intervalTimbre = setInterval(reproducirTono, 2000);
      } catch (err) {
        audioCtx = null;
      }
    }

    function detenerSonidoTimbre() {
      if (intervalTimbre) {
        clearInterval(intervalTimbre);
        intervalTimbre = null;
      }
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }

    function iniciarTemporizador() {
      tiempoTranscurrido.value = 0;
      temporizadorId = setInterval(() => {
        tiempoTranscurrido.value += 1;
      }, 1000);
    }

    function detenerTemporizador() {
      if (temporizadorId) {
        clearInterval(temporizadorId);
        temporizadorId = null;
      }
    }

    function iniciarLlamada() {
      estadoLlamada.value = "llamando";
      micSilenciado.value = false;
      altavozSilenciado.value = false;
      tiempoTranscurrido.value = 0;

      iniciarSonidoTimbre();

      ringingTimeoutId = setTimeout(() => {
        detenerSonidoTimbre();
        estadoLlamada.value = "en-curso";
        horaInicioLlamada = new Date();
        iniciarTemporizador();
      }, 3500);
    }

    function toggleMicrofono() {
      micSilenciado.value = !micSilenciado.value;
    }

    function toggleAltavoz() {
      altavozSilenciado.value = !altavozSilenciado.value;
    }

    function limpiarTimers() {
      if (ringingTimeoutId) {
        clearTimeout(ringingTimeoutId);
        ringingTimeoutId = null;
      }
      detenerSonidoTimbre();
      detenerTemporizador();
    }

    function colgarLlamada() {
      limpiarTimers();

      if (estadoLlamada.value === "en-curso" && horaInicioLlamada) {
        const horaFin = new Date();
        const duracionSegundos = Math.max(
          0,
          Math.round((horaFin.getTime() - horaInicioLlamada.getTime()) / 1000)
        );

        const payload: LlamadaFinalizadaPayload = {
          fecha: horaFin.toLocaleDateString("es-PE"),
          hora: horaFin.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
          llamada: {
            fechaInicio: horaInicioLlamada.toLocaleDateString("es-PE"),
            horaInicio: horaInicioLlamada.toLocaleTimeString("es-PE", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            fechaFin: horaFin.toLocaleDateString("es-PE"),
            horaFin: horaFin.toLocaleTimeString("es-PE", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            duracion: formatDuracion(duracionSegundos),
          },
        };

        emit("finalizada", payload);
      }

      estadoLlamada.value = "finalizada";
      horaInicioLlamada = null;

      setTimeout(() => {
        emit("close");
      }, 1000);
    }

    function cerrar() {
      limpiarTimers();
      horaInicioLlamada = null;
      emit("close");
    }

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          iniciarLlamada();
        } else {
          limpiarTimers();
          horaInicioLlamada = null;
        }
      }
    );

    onBeforeUnmount(() => {
      limpiarTimers();
    });

    return {
      estadoLlamada,
      micSilenciado,
      altavozSilenciado,
      tiempoTranscurridoFormateado,
      toggleMicrofono,
      toggleAltavoz,
      colgarLlamada,
      cerrar,
    };
  },
});