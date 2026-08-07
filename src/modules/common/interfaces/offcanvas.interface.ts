import { ref, shallowRef, readonly, type Component } from 'vue';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface OffcanvasConfig<TResult = unknown> {
  component: Component;
  title: string;
  inputs?: Record<string, unknown>;
}

export interface OffcanvasRef<TResult = unknown> {
  result: Promise<TResult | null>;
}

// ─── Singleton state (módulo-level, equivalente a providedIn: 'root') ──────────

const visible = ref(false);
const config = shallowRef<OffcanvasConfig | null>(null);

let _resolve: ((value: unknown) => void) | null = null;

// ─── Composable ────────────────────────────────────────────────────────────────

export function useOffcanvas() {
  function open<TResult = unknown>(cfg: OffcanvasConfig<TResult>): OffcanvasRef<TResult> {
    // Cerrar cualquier offcanvas previo sin resultado
    if (_resolve) {
      _resolve(null);
      _resolve = null;
    }

    config.value = cfg as OffcanvasConfig;
    visible.value = true;

    let resolveFn!: (value: TResult | null) => void;

    const result = new Promise<TResult | null>((resolve) => {
      resolveFn = resolve;
    });

    _resolve = resolveFn as (value: unknown) => void;

    return { result };
  }

  function close(result?: unknown) {
    if (_resolve) {
      _resolve(result ?? null);
      _resolve = null;
    }

    visible.value = false;

    setTimeout(() => {
      config.value = null;
    }, 300);
  }

  return {
    visible: readonly(visible),
    config: readonly(config),
    open,
    close,
  };
}
