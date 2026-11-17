<!-- src/modules/enviomasivo/views/enviomasivo.vue -->
<template>
  <div class="min-h-full space-y-5 bg-white p-4 text-slate-800 sm:p-6">
    <!-- Encabezado -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Envío masivo</h1>
        <p class="mt-1 text-sm text-slate-500">Campañas de WhatsApp con plantillas aprobadas por Meta.</p>
      </div>
      <button type="button" class="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        @click="mostrarForm = !mostrarForm">
        {{ mostrarForm ? 'Cerrar formulario' : 'Nueva campaña' }}
      </button>
    </header>

    <!-- Aviso -->
    <p v-if="aviso" role="status" class="rounded-md border px-4 py-3 text-sm" :class="aviso.tipo === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700'">
      {{ aviso.texto }}
    </p>

    <!-- ───────── Nueva campaña ───────── -->
    <section v-if="mostrarForm" class="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="t-nueva">
      <h2 id="t-nueva" class="mb-4 text-lg font-semibold">Nueva campaña</h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-slate-700">Nombre de la campaña</span>
          <input v-model="form.nombre" type="text" maxlength="120" placeholder="Central 365 – noviembre"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-slate-700">Plantilla</span>
          <select v-model="form.plantilla"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30">
            <option value="" disabled>Elige una plantilla aprobada</option>
            <option v-for="p in plantillas" :key="p.nombre + p.idioma" :value="p.nombre">
              {{ p.nombre }} ({{ p.categoria.toLowerCase() }})
            </option>
          </select>
        </label>
      </div>

      <blockquote v-if="cuerpo"
        class="mt-4 whitespace-pre-wrap rounded-r-md border-l-4 border-teal-700 bg-slate-50 px-4 py-3 text-sm">{{ cuerpo
        }}</blockquote>

      <div v-if="numVariables" class="mt-4 space-y-3">
        <p class="text-sm text-slate-500">
          Esta plantilla tiene {{ numVariables }} variable(s). Escribe texto fijo o usa
          <code class="rounded bg-slate-100 px-1 text-xs">{nombre}</code>,
          <code class="rounded bg-slate-100 px-1 text-xs">{primer_nombre}</code> o un campo de datos como
          <code class="rounded bg-slate-100 px-1 text-xs">{proyecto}</code>.
        </p>
        <label v-for="(_, i) in form.parametros" :key="i" class="block">
          <span class="mb-1 block text-sm font-semibold text-slate-700">Variable {{ i + 1 }}</span>
          <input v-model="form.parametros[i]" type="text"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30" />
        </label>
      </div>

      <label v-if="headerFormato" class="mt-4 block">
        <span class="mb-1 block text-sm font-semibold text-slate-700">
          URL pública del {{ headerFormato === 'video' ? 'video' : headerFormato === 'image' ? 'imagen' : 'documento' }}
        </span>
        <input v-model="form.headerUrl" type="url" placeholder="https://…"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30" />
        <span class="mt-1 block text-xs text-slate-500">
          Debe ser un enlace directo y público (HTTPS). Meta pide el archivo en cada envío.
        </span>
      </label>

      <label class="mt-4 block">
        <span class="mb-1 block text-sm font-semibold text-slate-700">Destinatarios</span>
        <textarea v-model="form.destinatariosTexto" rows="7" spellcheck="false"
          placeholder="987654321&#10;+51 993 796 736, Gabriel Torres&#10;955007460, Ana Ruiz, proyecto=Alameda"
          class="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30" />
        <span class="mt-1 block text-xs text-slate-500">
     
          <strong class="text-slate-700">{{ destinatariosParseados.length }}</strong> línea(s) leída(s).
        </span>
      </label>



      <div class="mt-5 flex flex-wrap gap-2">
        <button type="button" :disabled="!formValido || guardando"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          @click="crear(false)">
          {{ form.programadaPara ? 'Programar campaña' : 'Guardar borrador' }}
        </button>
        <button v-if="!form.programadaPara" type="button" :disabled="!formValido || guardando"
          class="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          @click="crear(true)">
          Crear y enviar ahora
        </button>
      </div>
    </section>

    <!-- ───────── Campañas ───────── -->
    <section class="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="t-lista">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 id="t-lista" class="text-lg font-semibold">Campañas</h2>
        <button type="button" :disabled="cargandoLista"
          class="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          @click="cargarCampanias(false)">
          Actualizar
        </button>
      </div>

      <p v-if="cargandoLista && !campanias.length" class="py-2 text-sm text-slate-500">Cargando campañas…</p>
      <p v-else-if="!campanias.length" class="py-2 text-sm text-slate-500">
        Aún no hay campañas. Crea la primera con “Nueva campaña”.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs text-slate-500">
              <th class="px-2 py-2 font-semibold">Campaña</th>
              <th class="px-2 py-2 font-semibold">Estado</th>
              <th class="min-w-[260px] px-2 py-2 font-semibold">Avance</th>
              <th class="px-2 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in campaniasPagina" :key="c.id" class="border-b border-slate-100 align-top"
              :class="detalle && String(detalle.id) === String(c.id) ? 'bg-teal-50/60' : ''">
              <td class="px-2 py-3">
                <button type="button" class="text-left font-bold text-teal-700 hover:underline"
                  @click="abrirDetalle(c.id)">
                  {{ c.nombre }}
                </button>
                <div class="text-xs text-slate-500">{{ c.plantilla }} · {{ formatoFecha(c.fecha_creacion) }}</div>
              </td>
              <td class="px-2 py-3">
                <span :class="claseChip(c.estado)">{{ etiqueta(c.estado) }}</span>
                <div v-if="c.estado === 'PROGRAMADA'" class="mt-1 text-xs text-slate-500">
                  {{ formatoFecha(c.programada_para) }}
                </div>
              </td>
              <td class="px-2 py-3">
                <div class="mb-1 flex h-2.5 overflow-hidden rounded-full bg-slate-200" role="img"
                  :aria-label="`${c.enviados} de ${c.total} enviados`">
                  <span v-for="s in segmentos(c)" :key="s.clave" class="block h-full" :class="claseSegmento(s.clave)"
                    :style="{ width: s.ancho + '%' }" :title="`${s.texto}: ${s.n}`" />
                </div>
                <div class="text-xs text-slate-500">
                  {{ c.enviados }}/{{ c.total }} enviados · {{ c.fallidos }} fallidos · {{ c.excluidos }} excluidos
                  </div>
              </td>
              <td class="px-2 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <button v-if="puedeIniciar(c.estado)" type="button" :disabled="!!ocupado"
                    class="rounded-md bg-teal-700 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    @click="iniciar(c.id)">
                    {{ c.estado === 'PAUSADA' ? 'Reanudar' : 'Iniciar' }}
                  </button>
                  <button v-if="puedePausar(c.estado)" type="button" :disabled="!!ocupado"
                    class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500 disabled:opacity-50"
                    @click="pausar(c.id)">
                    Pausar
                  </button>
                  <button v-if="puedeCancelar(c.estado)" type="button" :disabled="!!ocupado"
                    class="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    @click="cancelar(c.id)">
                    Cancelar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPaginasCampanias > 1"
        class="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span class="text-xs text-slate-500">
          Mostrando {{ desdeCampanias }}–{{ hastaCampanias }} de {{ campanias.length }} campañas
        </span>
        <div class="flex items-center gap-3">
          <button type="button" :disabled="paginaCampanias === 1"
            class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500 disabled:opacity-50"
            @click="cambiarPaginaCampanias(-1)">
            Anterior
          </button>
          <span class="text-slate-600">Página {{ paginaCampanias }} de {{ totalPaginasCampanias }}</span>
          <button type="button" :disabled="paginaCampanias === totalPaginasCampanias"
            class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500 disabled:opacity-50"
            @click="cambiarPaginaCampanias(1)">
            Siguiente
          </button>
        </div>
      </div>

    
    </section>

    <!-- ───────── Detalle ───────── -->
    <section v-if="detalle" class="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="t-detalle">
      <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="t-detalle" class="text-lg font-semibold">{{ detalle.nombre }}</h2>
      
        </div>
        <div class="flex gap-1.5">
      
          <button type="button" class="rounded-md px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            @click="cerrarDetalle">
            Cerrar
          </button>
        </div>
      </div>

    

     

      <p v-if="cargandoDetalle" class="py-2 text-sm text-slate-500">Cargando destinatarios…</p>
      <p v-else-if="!destinatarios.length" class="py-2 text-sm text-slate-500">No hay destinatarios con este filtro.</p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs text-slate-500">
              <th class="px-2 py-2 font-semibold">Teléfono</th>
              <th class="px-2 py-2 font-semibold">Nombre</th>
              <th class="px-2 py-2 font-semibold">Estado</th>
       
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in destinatarios" :key="d.id" class="border-b border-slate-100">
              <td class="px-2 py-2.5 tabular-nums">{{ d.telefono }}</td>
              <td class="px-2 py-2.5">{{ d.nombre ?? '—' }}</td>
              <td class="px-2 py-2.5">
                <span :class="claseChip(d.estado)">{{ etiqueta(d.estado) }}</span>
                <span v-if="d.respondio" :class="[claseChip('LEIDO'), 'ml-1']">Respondió</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-3 flex items-center justify-end gap-3 text-sm">
        <button type="button" :disabled="pagina === 1"
          class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500 disabled:opacity-50"
          @click="cambiarPagina(-1)">
          Anterior
        </button>
        <span class="text-slate-600">Página {{ pagina }}</span>
        <button type="button" :disabled="!hayMas"
          class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500 disabled:opacity-50"
          @click="cambiarPagina(1)">
          Siguiente
        </button>
      </div>
    </section>

    <!-- ───────── Lista de exclusión ───────── -->
    <section class="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="t-optout">
      <h2 id="t-optout" class="text-lg font-semibold">Lista de exclusión</h2>
      <p class="mb-4 mt-1 text-sm text-slate-500">
        Los números de esta lista no reciben mensajes de ninguna campaña. Quienes responden “baja”, “stop”,
        “no me interesa” o frases parecidas se agregan solos.
      </p>
      <div class="flex flex-wrap items-end gap-2">
        <label class="block min-w-[220px]">
          <span class="mb-1 block text-sm font-semibold text-slate-700">Teléfono</span>
          <input v-model="optoutTelefono" type="tel" placeholder="987654321"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
            @keyup.enter="gestionarOptout(true)" />
        </label>
        <button type="button" :disabled="!optoutTelefono.trim()"
          class="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          @click="gestionarOptout(true)">
          Excluir número
        </button>
        <button type="button" :disabled="!optoutTelefono.trim()"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:border-slate-500 disabled:opacity-50"
          @click="gestionarOptout(false)">
          Quitar de la lista
        </button>
      </div>

      <div class="mt-6">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-700">Números excluidos ({{ optouts.length }})</h3>
          <input v-model="busquedaOptout" type="search" placeholder="Buscar número o motivo"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30 sm:w-64" />
        </div>

        <p v-if="cargandoOptout && !optouts.length" class="py-2 text-sm text-slate-500">Cargando lista…</p>
        <p v-else-if="!optoutsFiltrados.length" class="py-2 text-sm text-slate-500">
          {{ optouts.length ? 'No hay resultados para esa búsqueda.' : 'Todavía no hay números excluidos.' }}
        </p>

        <div v-else class="max-h-80 overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 bg-white">
              <tr class="border-b border-slate-200 text-xs text-slate-500">
                <th class="px-2 py-2 font-semibold">Teléfono</th>
                <th class="px-2 py-2 font-semibold">Motivo</th>
                <th class="px-2 py-2 font-semibold">Fecha</th>
                <th class="px-2 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in optoutsFiltrados" :key="o.telefono" class="border-b border-slate-100">
                <td class="px-2 py-2.5 tabular-nums">{{ o.telefono }}</td>
                <td class="px-2 py-2.5 text-slate-600">{{ o.motivo ?? '—' }}</td>
                <td class="px-2 py-2.5 text-xs text-slate-500">{{ formatoFecha(o.fecha) }}</td>
                <td class="px-2 py-2.5 text-right">
                  <button type="button"
                    class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500"
                    @click="gestionarOptout(false, o.telefono)">
                    Quitar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

  </div>
</template>

<script src="./enviomasivo.ts" lang="ts"></script>