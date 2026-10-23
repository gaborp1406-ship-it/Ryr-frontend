<template>
  <form
    class="grid grid-cols-1 items-end gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 lg:grid-cols-4"
    @submit.prevent="enviar"
  >
    <!-- Cliente -->
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
        :class="inputCls"
      />
      <datalist id="venta-clientes">
        <option v-for="nombre in clientes" :key="nombre" :value="nombre" />
      </datalist>
    </div>

    <!-- Fecha del pedido -->
    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-fecha" class="text-xs font-medium text-zinc-500">Fecha</label>
      <input id="venta-fecha" v-model="form.fecha" type="date" required :class="inputCls" />
    </div>

    <!-- Estado -->
    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-estado" class="text-xs font-medium text-zinc-500">Estado</label>
      <select id="venta-estado" v-model="form.estado" :class="inputCls">
        <option value="entregado">Entregado</option>
        <option value="agendado">Agendado</option>
      </select>
    </div>

    <!-- Fecha de entrega (solo agendado) -->
    <div v-if="form.estado === 'agendado'" class="flex min-w-0 flex-col gap-1">
      <label for="venta-entrega" class="text-xs font-medium text-zinc-500">Fecha de entrega</label>
      <input
        id="venta-entrega"
        v-model="form.fechaEntrega"
        type="date"
        required
        :class="inputCls"
      />
    </div>

    <!-- Productos del pedido -->
    <div class="flex flex-col gap-3 sm:col-span-2 lg:col-span-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-zinc-500">Productos del pedido</span>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-900 ring-1 ring-zinc-300 transition hover:bg-zinc-100"
          @click="agregarItem"
        >
          + Agregar producto
        </button>
      </div>

      <div
        v-for="(item, i) in form.items"
        :key="i"
        class="grid grid-cols-12 items-end gap-3 rounded-lg bg-zinc-50 p-3 ring-1 ring-zinc-200"
      >
        <div class="col-span-12 flex min-w-0 flex-col gap-1 sm:col-span-6">
          <label :for="`item-prod-${i}`" class="text-xs font-medium text-zinc-500">Producto</label>
          <select :id="`item-prod-${i}`" v-model.number="item.productoId" required :class="inputCls">
            <option :value="0" disabled>Elige un producto</option>
            <option v-for="p in productos" :key="p.id" :value="p.id">
              {{ p.nombre }} ({{ soles(p.precio) }})
            </option>
          </select>
        </div>

        <div class="col-span-5 flex min-w-0 flex-col gap-1 sm:col-span-2">
          <label :for="`item-cant-${i}`" class="text-xs font-medium text-zinc-500">Cantidad</label>
          <input
            :id="`item-cant-${i}`"
            v-model.number="item.cantidad"
            type="number"
            min="1"
            step="1"
            required
            :class="inputCls"
          />
        </div>

        <div class="col-span-5 flex min-w-0 flex-col gap-1 sm:col-span-3">
          <span class="text-xs font-medium text-zinc-500">Subtotal</span>
          <span class="flex h-10 items-center text-sm font-semibold text-zinc-900">
            {{ soles(subtotal(item)) }}
          </span>
        </div>

        <div class="col-span-2 flex justify-end sm:col-span-1">
          <button
            type="button"
            :disabled="form.items.length === 1"
            class="h-10 rounded-lg px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
            :aria-label="`Quitar producto ${i + 1}`"
            @click="quitarItem(i)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Monto -->
    <div class="flex min-w-0 flex-col gap-1">
      <label for="venta-monto" class="text-xs font-medium text-zinc-500">Monto total (S/)</label>
      <input
        id="venta-monto"
        v-model="form.monto"
        type="number"
        min="0"
        step="0.01"
        :placeholder="sugerido.toFixed(2)"
        :class="inputCls"
      />
      <span class="text-xs text-zinc-500">Vacío = {{ soles(sugerido) }}</span>
    </div>

    <!-- Pagado -->
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
      <select id="venta-metodo" v-model="form.metodoPago" :class="inputCls">
        <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <!-- Guardar -->
    <div class="flex flex-col gap-1">
      <button
        type="submit"
        :disabled="guardando || !itemsValidos"
        class="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ guardando ? 'Guardando…' : 'Guardar venta' }}
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, type PropType } from 'vue';
import type { EstadoVenta, ICrearVentaPayload, IProducto } from '../interfaces/lune.interfaces';
import { hoy, soles } from '../interfaces/formato';

interface IItemForm {
  productoId: number;
  cantidad: number;
}

const itemVacio = (): IItemForm => ({ productoId: 0, cantidad: 1 });

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
    /** `listo` limpia lo que cambia entre ventas (productos, monto, entrega) cuando se guardó bien */
    guardar: (_payload: ICrearVentaPayload, _listo: () => void) => true,
  },
  setup(props, { emit }) {
    const inputCls =
      'h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10';

    const form = reactive({
      cliente: '',
      items: [itemVacio()] as IItemForm[],
      monto: '' as string | number,
      pagado: true,
      metodoPago: 'Yape',
      fecha: hoy(),
      estado: 'entregado' as EstadoVenta,
      fechaEntrega: '',
    });

    const precioDe = (productoId: number) =>
      props.productos.find((p) => p.id === productoId)?.precio ?? 0;

    const subtotal = (item: IItemForm) => precioDe(item.productoId) * (Number(item.cantidad) || 0);

    const sugerido = computed(() => form.items.reduce((acc, it) => acc + subtotal(it), 0));

    const itemsValidos = computed(() =>
      form.items.length > 0 && form.items.every((it) => it.productoId > 0 && Number(it.cantidad) >= 1)
    );

    const agregarItem = () => form.items.push(itemVacio());
    const quitarItem = (i: number) => {
      if (form.items.length > 1) form.items.splice(i, 1);
    };

    const enviar = () => {
      if (!itemsValidos.value) return;
      const monto = form.monto === '' ? undefined : Number(form.monto);
      const agendado = form.estado === 'agendado';

      emit(
        'guardar',
        {
          cliente: form.cliente,
          items: form.items.map((it) => ({
            productoId: it.productoId,
            cantidad: Number(it.cantidad),
          })),
          monto,
          pagado: form.pagado,
          metodoPago: form.pagado ? form.metodoPago : undefined,
          fecha: form.fecha,
          estado: form.estado,
          fechaEntrega: agendado && form.fechaEntrega ? form.fechaEntrega : undefined,
        },
        () => {
          // Se conservan cliente, fecha y método para cargar varias ventas seguidas
          form.items = [itemVacio()];
          form.monto = '';
          form.estado = 'entregado';
          form.fechaEntrega = '';
        }
      );
    };

    return {
      form,
      inputCls,
      sugerido,
      itemsValidos,
      subtotal,
      agregarItem,
      quitarItem,
      enviar,
      soles,
    };
  },
});
</script>