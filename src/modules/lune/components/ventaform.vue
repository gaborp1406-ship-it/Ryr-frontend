<template>
  <form
    class="grid grid-cols-1 items-end gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
    @submit.prevent="enviar"
  >
    <div class="flex min-w-0 flex-col gap-1 sm:col-span-2">
      <label for="venta-cliente" class="text-xs font-medium text-zinc-500">Cliente</label>
      <input
        id="venta-cliente"
        v-model.trim="form.cliente"
        type="text"
        list="venta-clientes"
        placeholder="Nombre del cliente"
        autocomplete="off"
        required
        class="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      />
      <datalist id="venta-clientes">
        <option v-for="nombre in clientes" :key="nombre" :value="nombre" />
      </datalist>
    </div>

    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-producto" class="text-xs font-medium text-zinc-500">Producto</label>
      <select
        id="venta-producto"
        v-model.number="form.productoId"
        required
        class="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      >
        <option :value="0" disabled>Elige un producto</option>
        <option v-for="p in productos" :key="p.id" :value="p.id">
          {{ p.nombre }} ({{ soles(p.precio) }})
        </option>
      </select>
    </div>

    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-cantidad" class="text-xs font-medium text-zinc-500">Cantidad</label>
      <input
        id="venta-cantidad"
        v-model.number="form.cantidad"
        type="number"
        min="1"
        step="1"
        required
        class="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      />
    </div>

    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-monto" class="text-xs font-medium text-zinc-500">Monto (S/)</label>
      <input
        id="venta-monto"
        v-model="form.monto"
        type="number"
        min="0"
        step="0.01"
        :placeholder="sugerido !== null ? sugerido.toFixed(2) : 'Automático'"
        class="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      />
      <span class="text-xs text-zinc-500">
        Vacío = {{ sugerido !== null ? soles(sugerido) : 'precio × cantidad' }}
      </span>
    </div>

    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-fecha" class="text-xs font-medium text-zinc-500">Fecha</label>
      <input
        id="venta-fecha"
        v-model="form.fecha"
        type="date"
        required
        class="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      />
    </div>

    <div class="flex items-center gap-2 pb-2.5">
      <input
        id="venta-pagado"
        v-model="form.pagado"
        type="checkbox"
        class="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
      />
      <label for="venta-pagado" class="text-sm font-medium text-zinc-900">Ya pagó</label>
    </div>

    <div v-if="form.pagado" class="flex min-w-0 flex-col gap-1">
      <label for="venta-metodo" class="text-xs font-medium text-zinc-500">Método de pago</label>
      <select
        id="venta-metodo"
        v-model="form.metodoPago"
        class="h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      >
        <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <button
        type="submit"
        :disabled="guardando || !form.productoId"
        class="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ guardando ? 'Guardando…' : 'Guardar venta' }}
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, type PropType } from 'vue';
import type { ICrearVentaPayload, IProducto } from '../interfaces/lune.interfaces';
import { hoy, soles } from '../interfaces/formato';

export default defineComponent({
  name: 'VentaForm',
  props: {
    productos: { type: Array as PropType<IProducto[]>, required: true },
    metodosPago: { type: Array as PropType<string[]>, required: true },
    /** Nombres de clientes existentes (para autocompletar) */
    clientes: { type: Array as PropType<string[]>, default: () => [] },
    guardando: { type: Boolean, default: false },
  },
  emits: {
    /** `listo` limpia lo que cambia entre ventas (cantidad y monto) cuando se guardó bien */
    guardar: (_payload: ICrearVentaPayload, _listo: () => void) => true,
  },
  setup(props, { emit }) {
    const form = reactive({
      cliente: '',
      productoId: 0,
      cantidad: 1,
      monto: '' as string | number,
      pagado: true,
      metodoPago: 'Yape',
      fecha: hoy(),
    });

    const sugerido = computed<number | null>(() => {
      const producto = props.productos.find((p) => p.id === form.productoId);
      return producto ? producto.precio * (Number(form.cantidad) || 0) : null;
    });

    const enviar = () => {
      if (!form.productoId) return;
      const monto = form.monto === '' ? undefined : Number(form.monto);

      emit(
        'guardar',
        {
          cliente: form.cliente,
          productoId: form.productoId,
          cantidad: Number(form.cantidad),
          monto,
          pagado: form.pagado,
          metodoPago: form.pagado ? form.metodoPago : undefined,
          fecha: form.fecha,
        },
        () => {
          // Se conservan cliente, fecha y método para cargar varias ventas seguidas
          form.cantidad = 1;
          form.monto = '';
        }
      );
    };

    return { form, sugerido, enviar, soles };
  },
});
</script>