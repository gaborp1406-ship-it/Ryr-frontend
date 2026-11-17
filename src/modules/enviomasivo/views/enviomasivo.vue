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

      <!-- ───────── Archivo del header (video / imagen / PDF) ───────── -->
      <div v-if="headerFormato" class="mt-4">
        <span class="mb-1 block text-sm font-semibold text-slate-700">
          {{ headerFormato === 'video' ? 'Video' : headerFormato === 'image' ? 'Imagen' : 'Documento' }} de la plantilla
        </span>

        <!-- Subiendo / procesando -->
        <div v-if="subiendoArchivo" class="rounded-xl border border-slate-200 bg-white p-4" role="status"
          aria-live="polite">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-800">{{ subida.nombre }}</p>
              <p class="text-xs text-slate-500">
                {{ formatoTamano(subida.bytes) }} ·
                {{ subida.fase === 'subiendo' ? 'Subiendo archivo…' : 'Procesando…' }}
              </p>
            </div>
            <span class="text-sm font-bold tabular-nums text-[#2d8c4a]">{{ subida.visual }}%</span>
          </div>

          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div class="h-full rounded-full bg-[#2d8c4a] transition-all duration-500"
              :class="subida.fase === 'procesando' ? 'animate-pulse' : ''" :style="{ width: subida.visual + '%' }">
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-xs text-slate-500">
              {{ subida.fase === 'subiendo' ? 'Paso 1 de 2' : 'Paso 2 de 2' }}
            </span>
            <button type="button"
              class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-500"
              @click="cancelarSubida">
              Cancelar
            </button>
          </div>
        </div>

        <!-- Listo: vista previa -->
        <div v-else-if="subida.fase === 'listo' && form.headerUrl"
          class="rounded-xl border border-[#2d8c4a]/30 bg-[#2d8c4a]/5 p-4">
          <div class="flex flex-wrap items-start gap-4">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2d8c4a] text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-800">Archivo subido</p>
              <p class="truncate text-xs text-slate-500">
                {{ subida.nombre }} · {{ formatoTamano(subida.bytes) }}<span v-if="subida.duracion"> · {{
                  Math.round(subida.duracion) }} s</span>
              </p>
              <div class="mt-3">
                <video v-if="headerFormato === 'video'" :src="form.headerUrl" controls preload="metadata"
                  class="max-h-56 w-full max-w-sm rounded-lg bg-black"></video>
                <img v-else-if="headerFormato === 'image'" :src="form.headerUrl" alt="Vista previa"
                  class="max-h-56 rounded-lg border border-slate-200" />
                <a v-else :href="form.headerUrl" target="_blank" rel="noopener"
                  class="text-sm font-semibold text-[#2d8c4a] underline">Abrir documento</a>
              </div>
            </div>
            <button type="button"
              class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500"
              @click="quitarArchivo">
              Cambiar archivo
            </button>
          </div>
        </div>

        <!-- Inactivo / error: zona para soltar -->
        <label v-else
          class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-7 text-center transition focus-within:ring-2 focus-within:ring-teal-700/30"
          :class="subida.arrastrando
            ? 'border-teal-600 bg-teal-50'
            : 'border-slate-300 bg-slate-50 hover:border-teal-600 hover:bg-teal-50/50'"
          @dragover.prevent="subida.arrastrando = true" @dragleave.prevent="subida.arrastrando = false"
          @drop.prevent="alSoltarArchivo">
          <input type="file" class="sr-only" :accept="aceptaArchivo" @change="alElegirArchivo" />
          <svg viewBox="0 0 24 24" class="h-9 w-9 text-teal-700" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <span class="text-sm font-semibold text-slate-700">
            Arrastra tu {{ nombreTipoHeader }} aquí o <span class="text-teal-700 underline">elígelo</span>
          </span>
          <span class="text-xs text-slate-500">Máximo {{ limiteMbHeader }} MB · se sube a Cloudinary</span>
        </label>

        <p v-if="subida.fase === 'error'" role="alert"
          class="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ subida.error }}
        </p>

      </div>

      <!-- ───────── Destinatarios ───────── -->
      <div class="mt-4">
        <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span class="block text-sm font-semibold text-slate-700">Destinatarios</span>
          <button type="button" class="text-xs font-semibold text-teal-700 hover:underline"
            @click="descargarPlantillaExcel">
            Descargar plantilla de Excel
          </button>
        </div>

        <!-- Subir Excel -->
        <div v-if="excelInfo"
          class="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">XLS</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-emerald-900">{{ excelInfo.nombre }}</p>
            <p class="text-xs text-emerald-800/80">
              <strong>{{ excelInfo.filas }}</strong> contacto(s) leídos
              <span v-if="excelInfo.sinTelefono"> · {{ excelInfo.sinTelefono }} fila(s) sin teléfono omitidas</span>
              <span v-if="excelInfo.columnas.length"> · campos: {{excelInfo.columnas.map((c) => '{' + c + '}').join('')
              }}</span>
            </p>
          </div>
          <button type="button"
            class="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-slate-500"
            @click="quitarExcel">
            Quitar Excel
          </button>
        </div>

        <label v-else
          class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition focus-within:ring-2 focus-within:ring-teal-700/30"
          :class="excelArrastrando
            ? 'border-teal-600 bg-teal-50'
            : 'border-slate-300 bg-slate-50 hover:border-teal-600 hover:bg-teal-50/50'"
          @dragover.prevent="excelArrastrando = true" @dragleave.prevent="excelArrastrando = false"
          @drop.prevent="alSoltarExcel">
          <input type="file" class="sr-only" accept=".xlsx,.xls,.csv" @change="alElegirExcel" />
          <span v-if="excelLeyendo" class="flex items-center gap-2 text-sm font-semibold text-[#2d8c4a]">
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-[#2d8c4a] border-t-transparent"></span>
            Leyendo Excel…
          </span>
          <template v-else>
            <span class="text-sm font-semibold text-slate-700">
              Arrastra tu Excel aquí o <span class="text-teal-700 underline">elígelo</span>
            </span>
            <span class="text-xs text-slate-500">
              .xlsx, .xls o .csv · columnas: <strong>telefono</strong>, <strong>nombre</strong>; las demás sirven
              como <code class="rounded bg-white px-1">{proyecto}</code>, etc.
            </span>
          </template>
        </label>

        <p v-if="excelError" role="alert"
          class="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ excelError }}
        </p>


      </div>

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

                  <button type="button"
                    class="rounded-md border border-teal-700 bg-white px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                    @click="abrirRespuestas(c)">
                    Ver
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPaginasCampanias > 1" class="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
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
    <!-- ───────── Modal: respuestas de la campaña ───────── -->
    <div v-if="respuestasModal.abierto" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="cerrarRespuestas">
      <div class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl" role="dialog"
        aria-modal="true" aria-labelledby="t-respuestas">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div class="min-w-0">
            <h2 id="t-respuestas" class="text-lg font-semibold">Respuestas de la campaña</h2>
            <p class="truncate text-sm text-slate-500">{{ respuestasModal.campania?.nombre }}</p>
          </div>
          <button type="button" class="rounded-md px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            @click="cerrarRespuestas">
            Cerrar
          </button>
        </div>

        <!-- Pestañas -->
        <div class="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3" role="tablist">
          <button v-for="t in TABS_RESPUESTA" :key="t.clave" type="button" role="tab"
            :aria-selected="respuestasModal.tab === t.clave"
            class="rounded-full border px-3 py-1 text-xs font-semibold transition" :class="respuestasModal.tab === t.clave
              ? 'border-teal-700 bg-teal-700 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'"
            @click="respuestasModal.tab = t.clave">
            {{ t.texto }} ({{ respuestasModal.resumen[t.clave] }})
          </button>
        </div>
        <!-- Buscador -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
          <input v-model="respuestasModal.busqueda" type="search" placeholder="Buscar por nombre o número"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30 sm:w-72" />
          <span v-if="respuestasModal.busqueda.trim()" class="text-xs text-slate-500">
            {{ respuestasTab.length }} de {{ respuestasDelTab.length }}
          </span>
        </div>
        <!-- Lista -->
        <div class="overflow-auto p-5">
          <p v-if="respuestasModal.cargando" class="py-2 text-sm text-slate-500">Cargando respuestas…</p>
          <p v-else-if="!respuestasTab.length" class="py-2 text-sm text-slate-500">
            {{ respuestasModal.busqueda.trim() ? 'Ninguna respuesta coincide con tu búsqueda.' : 'No hay destinatarios en esta categoría.' }}
          </p>
          <table v-else class="w-full text-left text-sm">
            <thead class="sticky top-0 bg-white">
              <tr class="border-b border-slate-200 text-xs text-slate-500">
                <th class="px-2 py-2 font-semibold">Teléfono</th>
                <th class="px-2 py-2 font-semibold">Nombre</th>
                <th class="px-2 py-2 font-semibold">Mensaje</th>
                <th class="px-2 py-2 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in respuestasTab" :key="r.id" class="border-b border-slate-100 align-top">
                <td class="px-2 py-2.5 tabular-nums">{{ r.telefono }}</td>
                <td class="px-2 py-2.5">{{ r.nombre ?? '—' }}</td>
                <td class="max-w-[260px] px-2 py-2.5 text-slate-600">{{ r.mensaje || '—' }}</td>
                <td class="px-2 py-2.5 text-xs text-slate-500">{{ formatoFecha(r.fecha) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./enviomasivo.ts" lang="ts"></script>