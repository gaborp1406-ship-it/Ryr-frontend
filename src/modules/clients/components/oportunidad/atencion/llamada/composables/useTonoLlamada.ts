// composables/useTonoLlamada.ts
import { ref } from "vue";

type PatronTono = "llamando" | "timbrando";

// Genera tonos de telefonía (dial tone / ringback) vía Web Audio API, sin assets externos
export function useTonoLlamada() {
  let audioCtx: AudioContext | null = null;
  let osciladores: OscillatorNode[] = [];
  let gainNode: GainNode | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const sonando = ref(false);

  const getContext = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  };

  const detenerTono = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    osciladores.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    osciladores = [];
    gainNode?.disconnect();
    gainNode = null;
    sonando.value = false;
  };

  // Ciclo on/off (ej: 2s tono + 4s silencio) hasta que se llame detenerTono()
  const reproducirCiclo = (frecuencias: number[], msOn: number, msOff: number) => {
    detenerTono();
    sonando.value = true;
    const ctx = getContext();

    const ciclo = () => {
      gainNode = ctx.createGain();
      gainNode.gain.value = 0.12; // volumen bajito, es solo indicador
      gainNode.connect(ctx.destination);

      osciladores = frecuencias.map((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gainNode!);
        osc.start();
        return osc;
      });

      timeoutId = setTimeout(() => {
        osciladores.forEach((osc) => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        osciladores = [];
        gainNode?.disconnect();
        gainNode = null;
        timeoutId = setTimeout(ciclo, msOff);
      }, msOn);
    };

    ciclo();
  };

  const reproducirTono = (patron: PatronTono) => {
    if (patron === "llamando") {
      reproducirCiclo([425], 1000, 1000);          // tono de "marcando", parejo
    } else {
      reproducirCiclo([440, 480], 2000, 4000);      // ringback clásico 440+480Hz, 2s on / 4s off
    }
  };

  return { sonando, reproducirTono, detenerTono };
}