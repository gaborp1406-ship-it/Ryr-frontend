<template>
  <div class="cal-page min-h-screen bg-[#f5f6f7]">

    <!-- TOPBAR -->
    <header class="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] bg-black px-6 py-3.5">
      <div class="flex flex-wrap items-center gap-4">
        <h1 class="font-barlow-cond text-xl font-bold tracking-wide text-white">Calendario</h1>
        <div class="flex items-center gap-1 rounded-full border border-[#222] bg-[#141414] p-1">
          <button v-for="v in views" :key="v.key" class="view-btn" :class="{ 'view-btn-active': view === v.key }" @click="view = v.key">{{ v.label }}</button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="nav-btn" @click="navigate(-1)" aria-label="Anterior">‹</button>
        <button class="today-btn" @click="goToday">Hoy</button>
        <button class="nav-btn" @click="navigate(1)" aria-label="Siguiente">›</button>
        <span class="min-w-[150px] text-center text-sm font-semibold capitalize text-white">{{ headerLabel }}</span>
        <button class="new-btn" @click="openNewModal()">+ Nueva actividad</button>
      </div>
    </header>

    <!-- BARRA DE FILTROS -->
    <div class="flex flex-wrap items-center gap-2.5 border-b border-[#e3e3e3] bg-white px-6 py-3">
      <select v-model.number="filters.idAsesor" class="filter-select">
        <option :value="null">Todos los asesores</option>
        <option v-for="a in asesores" :key="a.id_asesor" :value="a.id_asesor">{{ a.nombre }}</option>
      </select>

      <select v-model.number="filters.idTipoActividad" class="filter-select">
        <option :value="null">Todos los tipos</option>
        <option v-for="t in tiposActividad" :key="t.id" :value="t.id">{{ t.nombre }}</option>
      </select>

      <select v-model.number="filters.estado" class="filter-select">
        <option :value="null">Todos los estados</option>
        <option v-for="e in estadosOpciones" :key="e.id" :value="e.id">{{ e.nombre }}</option>
      </select>

      <button
        v-if="filters.idAsesor !== null || filters.idTipoActividad !== null || filters.estado !== null"
        class="clear-filters-btn"
        @click="resetFilters">
        Limpiar filtros
      </button>

      <span v-if="loading" class="ml-auto text-xs font-semibold text-[#999]">Cargando actividades…</span>
      <span v-else-if="loadError" class="ml-auto text-xs font-semibold text-[#c0392b]">{{ loadError }}</span>
    </div>

    <main class="p-6">

      <!-- ══ VISTA MES ══ -->
      <div v-if="view === 'mes'" class="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white">
        <div class="grid grid-cols-7 border-b border-[#e3e3e3] bg-[#fafafa]">
          <div v-for="d in weekDays" :key="d" class="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#888]">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="cell in monthCells" :key="cell.dateStr"
            class="min-h-[112px] cursor-pointer border-b border-r border-[#eee] p-1.5 transition-colors hover:bg-[#f7faf7]"
            :class="{ 'bg-[#fbfbfb]': !cell.inMonth, 'bg-[#eef6ef]': cell.isToday }"
            @click="selectDay(cell.dateStr)">
            <div class="mb-1 flex items-center justify-between">
              <span class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
                :class="cell.isToday ? 'bg-[#2d8c4a] text-white' : cell.inMonth ? 'text-[#333]' : 'text-[#bbb]'">{{ cell.day }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <div v-for="ev in cell.events.slice(0, 3)" :key="ev.id"
                class="truncate rounded px-1.5 py-[3px] text-[10px] font-medium text-white"
                :style="{ background: typeColor(ev.idTipoActividad) }" @click.stop="openDetail(ev)">
                {{ ev.time }} · {{ ev.title }}
              </div>
              <div v-if="cell.events.length > 3" class="text-[10px] font-semibold text-[#888]">+{{ cell.events.length - 3 }} más</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ VISTA SEMANA ══ -->
      <div v-else-if="view === 'semana'" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <div v-for="col in weekCells" :key="col.dateStr" class="flex flex-col rounded-xl border border-[#e3e3e3] bg-white">
          <div class="border-b border-[#eee] px-3 py-2.5 text-center" :class="{ 'bg-[#eef6ef]': col.isToday }">
            <div class="text-[10px] font-bold uppercase tracking-wide text-[#888]">{{ col.weekdayLabel }}</div>
            <div class="text-sm font-bold" :class="col.isToday ? 'text-[#2d8c4a]' : 'text-black'">{{ col.day }}</div>
          </div>
          <div class="flex min-h-[260px] flex-col gap-1.5 p-2">
            <div v-for="ev in col.events" :key="ev.id"
              class="cursor-pointer rounded-md border-l-[3px] bg-[#f7f7f7] px-2 py-1.5 text-[11px]"
              :style="{ borderColor: typeColor(ev.idTipoActividad) }" @click="openDetail(ev)">
              <div class="font-semibold text-black">{{ ev.time }} · {{ ev.title }}</div>
              <div v-if="ev.cliente" class="text-[10px] text-[#888]">{{ ev.cliente }}</div>
            </div>
            <div v-if="col.events.length === 0" class="mt-2 text-center text-[10px] text-[#bbb]">Sin eventos</div>
            <button class="mt-auto rounded-md border border-dashed border-[#ccc] py-1.5 text-[10px] font-semibold text-[#999] transition-colors hover:border-[#2d8c4a] hover:text-[#2d8c4a]" @click="openNewModal(col.dateStr)">+ Añadir</button>
          </div>
        </div>
      </div>

      <!-- ══ VISTA DÍA ══ -->
      <div v-else class="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[#e3e3e3] bg-white">
        <div class="border-b border-[#eee] px-5 py-3.5">
          <div class="text-sm font-bold capitalize text-black">{{ dayLabel }}</div>
        </div>
        <div class="flex flex-col divide-y divide-[#f0f0f0]">
          <div v-for="h in dayHours" :key="h" class="flex gap-3 px-5 py-2.5">
            <span class="w-12 shrink-0 pt-0.5 text-[11px] font-semibold text-[#999]">{{ h }}</span>
            <div class="flex flex-1 flex-col gap-1.5">
              <div v-for="ev in eventsAtHour(h)" :key="ev.id"
                class="cursor-pointer rounded-md px-2.5 py-2 text-white" :style="{ background: typeColor(ev.idTipoActividad) }" @click="openDetail(ev)">
                <div class="text-[12px] font-semibold">{{ ev.time }} · {{ ev.title }}</div>
                <div v-if="ev.cliente" class="text-[10px] opacity-90">{{ ev.cliente }}</div>
              </div>
            </div>
          </div>
        </div>
        <button class="m-4 w-[calc(100%-32px)] rounded-md border border-dashed border-[#ccc] py-2 text-xs font-semibold text-[#999] transition-colors hover:border-[#2d8c4a] hover:text-[#2d8c4a]" @click="openNewModal(currentDateStr)">+ Añadir actividad</button>
      </div>
    </main>

    <!-- ═══ MODAL: NUEVA ACTIVIDAD / DETALLE ═══ -->
    <transition name="backdrop">
      <div v-if="modalOpen" class="fixed inset-0 z-[300] bg-black/55" @click="closeModal"></div>
    </transition>
    <transition name="modal-pop">
      <div v-if="modalOpen" class="ev-modal">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-black">{{ editingEvent ? 'Detalle de actividad' : 'Nueva actividad' }}</h3>
          <button class="icon-btn" @click="closeModal" aria-label="Cerrar">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <button v-for="t in tiposActividad" :key="t.id" class="type-pill"
            :class="{ 'type-pill-active': form.idTipoActividad === t.id }"
            :style="form.idTipoActividad === t.id ? { background: typeColor(t.id), borderColor: typeColor(t.id) } : {}"
            @click="form.idTipoActividad = t.id">{{ t.nombre }}</button>
        </div>

        <div class="flex flex-col gap-1">
          <label class="field-label">Título</label>
          <input v-model="form.title" type="text" class="field-input" placeholder="Ej. Visita a caseta con Jorge Salazar" />
        </div>

        <div class="flex flex-wrap gap-3">
          <div class="flex flex-1 flex-col gap-1">
            <label class="field-label">Fecha</label>
            <input v-model="form.date" type="date" class="field-input" />
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label class="field-label">Hora</label>
            <input v-model="form.time" type="time" class="field-input" />
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label class="field-label">Estado</label>
            <select v-model.number="form.estado" class="field-input">
              <option v-for="e in estadosOpciones" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="field-label">Cliente / lead (opcional)</label>
          <input v-model="form.cliente" type="text" class="field-input" placeholder="Nombre del cliente" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="field-label">Notas</label>
          <textarea v-model="form.notas" rows="2" class="field-input resize-y"></textarea>
        </div>

        <div class="mt-1 flex items-center justify-between gap-2.5">
          <button v-if="editingEvent" class="just-btn-cancel text-[#c0392b]" @click="deleteCurrent">Eliminar</button>
          <div class="ml-auto flex gap-2.5">
            <button class="just-btn-cancel" @click="closeModal">Cancelar</button>
            <button class="just-btn-save" :disabled="!form.title || !form.date || !form.time || form.idTipoActividad === null" @click="saveEvent">Guardar</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script src="./RegistercalendarView.ts" lang="ts"></script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

.cal-page { font-family: 'Barlow', sans-serif; }
.font-barlow-cond { font-family: 'Barlow Condensed', sans-serif; }

.view-btn { @apply rounded-full px-3 py-1.5 text-xs font-semibold text-[#999] transition-colors; }
.view-btn-active { @apply bg-[#2d8c4a] text-white; }
.nav-btn { @apply flex h-7 w-7 items-center justify-center rounded-full border border-[#333] text-sm text-white transition-colors hover:border-[#2d8c4a] hover:text-[#2d8c4a]; }
.today-btn { @apply rounded-full border border-[#333] px-3 py-1 text-xs font-semibold text-white transition-colors hover:border-[#2d8c4a] hover:text-[#2d8c4a]; }
.new-btn { @apply rounded-full bg-[#2d8c4a] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#24713c]; }
.icon-btn { @apply flex rounded p-1 text-[#666] transition-colors hover:bg-[#f0f0f0] hover:text-black; }

.filter-select { @apply rounded-md border border-[#ddd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#333]; }
.clear-filters-btn { @apply rounded-md border border-[#ddd] px-2.5 py-1.5 text-xs font-semibold text-[#888] transition-colors hover:border-[#c0392b] hover:text-[#c0392b]; }

.ev-modal {
  @apply fixed left-1/2 top-1/2 z-[301] flex w-[440px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-xl border border-[#ddd] bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,.35)];
}
.field-label { @apply text-[10px] font-semibold uppercase tracking-[1px] text-[#888]; }
.field-input { @apply w-full rounded-md border border-[#ddd] px-3 py-2 text-[13px] text-black; }
.type-pill { @apply cursor-pointer rounded-2xl border border-[#ddd] bg-white px-3 py-1.5 text-xs font-semibold text-[#555] transition-colors; }
.type-pill-active { @apply text-white; }
.just-btn-cancel { @apply rounded-md bg-[#f0f0f0] px-4 py-2 text-[13px] font-semibold text-[#555] transition-colors hover:bg-[#e5e5e5]; }
.just-btn-save { @apply rounded-md bg-[#2d8c4a] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#24713c] disabled:cursor-not-allowed disabled:bg-[#bcd9c4]; }

.backdrop-enter-active, .backdrop-leave-active { transition: opacity .2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
.modal-pop-enter-active, .modal-pop-leave-active { transition: all .18s ease; }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(.95); }
</style>