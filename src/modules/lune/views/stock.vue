<template>
    <div class="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <section class="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 lg:px-10">
            <!-- Cabecera -->
            <header
                class="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                    <span
                        class="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-base font-bold text-white shadow-sm"
                        aria-hidden="true">L</span>
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Luné</h1>
                        <p class="text-sm text-zinc-500">Control de stock</p>
                    </div>
                </div>
                <LuneTabs />
            </header>

            <!-- Aviso -->
            <transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-2 opacity-0"
                leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0">
                <p v-if="mensaje" role="status" :class="[
                    'fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-xl',
                    mensaje.tipo === 'ok'
                        ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                        : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
                ]">
                    {{ mensaje.texto }}
                </p>
            </transition>

            <!-- Resumen -->
            <div class="grid gap-4 sm:grid-cols-3">
                <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                    <p class="text-xs font-medium text-zinc-500">Productos</p>
                    <p class="mt-1 text-2xl font-bold tabular-nums">{{ resumen.productos }}</p>
                </div>
                <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                    <p class="text-xs font-medium text-zinc-500">En alerta (stock bajo o sin stock)</p>
                    <p class="mt-1 text-2xl font-bold tabular-nums"
                        :class="resumen.alertas ? 'text-rose-600' : 'text-emerald-600'">
                        {{ resumen.alertas }}
                    </p>
                </div>
                <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                    <p class="text-xs font-medium text-zinc-500">Unidades agendadas por entregar</p>
                    <p class="mt-1 text-2xl font-bold tabular-nums text-amber-600">{{ resumen.agendado }}</p>
                </div>
            </div>

            <!-- Filtros -->
            <div class="mt-6 flex flex-wrap items-end gap-3">
                <div class="min-w-[12rem] flex-1 sm:max-w-sm">
                    <label for="s-buscar" class="mb-1 block text-xs font-medium text-zinc-500">Producto</label>
                    <input id="s-buscar" v-model="filtros.buscar" type="search" placeholder="Buscar producto"
                        autocomplete="off"
                        class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
                <label class="flex items-center gap-2 pb-2 text-sm text-zinc-700">
                    <input v-model="filtros.soloAlertas" type="checkbox" class="h-4 w-4 rounded border-zinc-300" />
                    Solo alertas
                </label>
                <span v-if="cargando" class="pb-2 text-sm text-zinc-500">Cargando…</span>
            </div>

            <!-- Tabla -->
            <div class="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
                <div v-if="!stock.length" class="px-6 py-14 text-center">
                    <p class="text-sm font-medium text-zinc-900">No hay productos para mostrar</p>
                    <p class="mt-1 text-sm text-zinc-500">Cambia el filtro o registra productos primero.</p>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-zinc-100 text-sm">
                        <thead class="bg-zinc-50 text-left text-xs font-semibold text-zinc-600">
                            <tr>
                                <th class="px-4 py-3">Producto</th>
                                <th class="px-4 py-3">Estado</th>
                                <th class="px-4 py-3 text-right">Stock</th>
                                <th class="px-4 py-3 text-right">Agendado</th>
                                <th class="px-4 py-3 text-right">Disponible</th>
                                <th class="px-4 py-3 text-right">Mínimo</th>
                                <th class="px-4 py-3 text-right"><span class="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100">
                            <tr v-for="s in stock" :key="s.productoId" class="transition hover:bg-zinc-50">
                                <td class="px-4 py-3 font-medium text-zinc-900">
                                    {{ s.producto }}
                                    <span v-if="!s.activo"
                                        class="ml-1 text-xs font-normal text-zinc-400">(inactivo)</span>
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', semaforo(s).clase]">
                                        {{ semaforo(s).texto }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-right text-base font-bold tabular-nums"
                                    :class="s.stock <= 0 ? 'text-rose-600' : 'text-zinc-900'">
                                    {{ s.stock }}
                                </td>
                                <td class="px-4 py-3 text-right tabular-nums text-amber-700">{{ s.agendado }}</td>
                                <td class="px-4 py-3 text-right tabular-nums"
                                    :class="s.disponible < 0 ? 'text-rose-600 font-semibold' : 'text-zinc-700'">
                                    {{ s.disponible }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <input type="number" min="0" step="1" :value="s.stockMinimo"
                                        :aria-label="`Stock mínimo de ${s.producto}`"
                                        class="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-right text-sm tabular-nums focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                                        @change="cambiarMinimo(s, $event)" />
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <button type="button"
                                            class="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-zinc-700"
                                            @click="abrirMovimiento(s, 'entrada')">+ Entrada</button>
                                        <button type="button"
                                            class="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100"
                                            @click="abrirMovimiento(s, 'ajuste')">Ajuste</button>
                                        <button type="button"
                                            class="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100"
                                            @click="abrirMovimiento(s, 'conteo')">Conteo</button>
                                        <button type="button"
                                            class="rounded-md px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200 hover:bg-violet-50"
                                            @click="abrirHistorial(s)">Historial</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal: movimiento -->
            <div v-if="movimiento.abierto"
                class="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/40 p-4" role="dialog"
                aria-modal="true" @click.self="cerrarMovimiento">
                <form class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-zinc-200"
                    @submit.prevent="guardarMovimiento">
                    <h2 class="text-lg font-bold text-zinc-900">{{ textosTipo[movimiento.tipo].titulo }}</h2>
                    <p class="text-sm text-zinc-500">{{ movimiento.producto }}</p>

                    <div class="mt-4">
                        <label for="m-tipo" class="mb-1 block text-xs font-medium text-zinc-500">Tipo de
                            movimiento</label>
                        <select id="m-tipo" v-model="movimiento.tipo"
                            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
                            <option value="entrada">Entrada</option>
                            <option value="ajuste">Ajuste</option>
                            <option value="conteo">Conteo (inventario físico)</option>
                        </select>
                    </div>

                    <div class="mt-4">
                        <label for="m-cantidad" class="mb-1 block text-xs font-medium text-zinc-500">{{
                            textosTipo[movimiento.tipo].etiqueta }}</label>
                        <input id="m-cantidad" v-model="movimiento.cantidad" type="number" step="1" required
                            :min="movimiento.tipo === 'ajuste' ? undefined : 0"
                            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                    </div>

                    <div class="mt-4">
                        <label for="m-nota" class="mb-1 block text-xs font-medium text-zinc-500">Nota (opcional)</label>
                        <input id="m-nota" v-model.trim="movimiento.nota" type="text" autocomplete="off"
                            placeholder="Ej: tanda del sábado, se cayó una caja"
                            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
                    </div>

                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button"
                            class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-100"
                            @click="cerrarMovimiento">Cancelar</button>
                        <button type="submit" :disabled="guardando"
                            class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60">
                            {{ guardando ? 'Guardando…' : 'Guardar' }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- Modal: historial -->
            <div v-if="historial.abierto" class="fixed inset-0 z-40 flex items-center justify-center bg-zinc-900/40 p-4"
                role="dialog" aria-modal="true" @click.self="cerrarHistorial">
                <div
                    class="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl ring-1 ring-zinc-200">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-bold text-zinc-900">Historial</h2>
                            <p class="text-sm text-zinc-500">{{ historial.producto }}</p>
                        </div>
                        <button type="button" class="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-100"
                            aria-label="Cerrar" @click="cerrarHistorial">✕</button>
                    </div>

                    <p v-if="historial.cargando" class="mt-4 text-sm text-zinc-500">Cargando…</p>
                    <p v-else-if="!historial.movimientos.length" class="mt-4 text-sm text-zinc-500">Aún no hay
                        movimientos.</p>

                    <ul v-else class="mt-4 divide-y divide-zinc-100 overflow-y-auto rounded-lg ring-1 ring-zinc-200">
                        <li v-for="m in historial.movimientos" :key="m.clave"
                            class="flex items-center justify-between gap-3 px-4 py-3">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <span
                                        :class="['rounded-full px-2 py-0.5 text-xs font-semibold', etiquetaMovimiento(m.tipo).clase]">
                                        {{ etiquetaMovimiento(m.tipo).texto }}
                                    </span>
                                    <span class="text-xs text-zinc-500">{{ fechaHora(m.fecha) }}</span>
                                </div>
                                <p class="mt-0.5 truncate text-xs text-zinc-500">
                                    <template v-if="m.tipo === 'venta'">Pedido #{{ m.ventaId }} · {{ m.cliente
                                        }}</template>
                                    <template v-else>{{ m.nota || 'Sin nota' }}</template>
                                </p>
                            </div>
                            <span class="text-sm font-bold tabular-nums"
                                :class="m.tipo === 'conteo' ? 'text-zinc-900' : m.cantidad < 0 ? 'text-rose-600' : 'text-emerald-600'">
                                {{ m.tipo === 'conteo' ? `= ${m.cantidad}` : m.cantidad > 0 ? `+${m.cantidad}` :
                                m.cantidad }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
</template>

<script src="./stock" lang="ts"></script>