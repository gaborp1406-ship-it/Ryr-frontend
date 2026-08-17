<template>
  <div class="cal-page min-h-screen bg-[#f5f6f7]">

    <!-- TOPBAR -->
    <header
      class="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a] bg-black px-6 py-3.5">
      <div class="flex flex-wrap items-center gap-4">
        <h1 class="font-barlow-cond text-xl font-bold tracking-wide text-white">Calendario</h1>
        <div class="flex items-center gap-1 rounded-full border border-[#222] bg-[#141414] p-1">
          <button v-for="v in views" :key="v.key" class="view-btn" :class="{ 'view-btn-active': view === v.key }"
            @click="view = v.key">{{ v.label }}</button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="nav-btn" @click="navigate(-1)" aria-label="Anterior">‹</button>
        <button class="today-btn" @click="goToday">Hoy</button>
        <button class="nav-btn" @click="navigate(1)" aria-label="Siguiente">›</button>
        <span class="min-w-[150px] text-center text-sm font-semibold capitalize text-white">{{ headerLabel }}</span>

      </div>
    </header>

    <!-- BARRA DE FILTROS -->
    <div class="flex flex-wrap items-center gap-2.5 border-b border-[#e3e3e3] bg-white px-6 py-3">
      <select v-if="!authStore.isAgent" v-model.number="filters.idAsesor" class="filter-select">
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
        v-if="(authStore.isAgent ? false : filters.idAsesor !== null) || filters.idTipoActividad !== null || filters.estado !== null"
        class="clear-filters-btn" @click="resetFilters">
        Limpiar filtros
      </button>

      <span v-if="loading" class="ml-auto text-xs font-semibold text-[#999]">Cargando actividades…</span>
      <span v-else-if="loadError" class="ml-auto text-xs font-semibold text-[#c0392b]">{{ loadError }}</span>
    </div>

    <main class="p-6">

      <!-- ══ VISTA MES ══ -->
      <div v-if="view === 'mes'" class="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white">
        <div class="grid grid-cols-7 border-b border-[#e3e3e3] bg-[#fafafa]">
          <div v-for="d in weekDays" :key="d"
            class="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-[#888]">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="cell in monthCells" :key="cell.dateStr"
            class="min-h-[112px] cursor-pointer border-b border-r border-[#eee] p-1.5 transition-colors hover:bg-[#f7faf7]"
            :class="{ 'bg-[#fbfbfb]': !cell.inMonth, 'bg-[#eef6ef]': cell.isToday }" @click="selectDay(cell.dateStr)">
            <div class="mb-1 flex items-center justify-between">
              <span class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
                :class="cell.isToday ? 'bg-[#2d8c4a] text-white' : cell.inMonth ? 'text-[#333]' : 'text-[#bbb]'">{{
                  cell.day }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <div v-for="ev in cell.events.slice(0, 3)" :key="ev.id"
                class="truncate rounded px-1.5 py-[3px] text-[10px] font-medium text-white"
                :style="{ background: typeColor(ev.idTipoActividad) }">
                {{ ev.time }} · {{ ev.title }}
              </div>
              <div v-if="cell.events.length > 3" class="text-[10px] font-semibold text-[#888]">+{{ cell.events.length -
                3 }} más</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ VISTA SEMANA ══ -->
      <div v-else-if="view === 'semana'" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <div v-for="col in weekCells" :key="col.dateStr"
          class="flex flex-col rounded-xl border border-[#e3e3e3] bg-white">
          <div class="border-b border-[#eee] px-3 py-2.5 text-center" :class="{ 'bg-[#eef6ef]': col.isToday }">
            <div class="text-[10px] font-bold uppercase tracking-wide text-[#888]">{{ col.weekdayLabel }}</div>
            <div class="text-sm font-bold" :class="col.isToday ? 'text-[#2d8c4a]' : 'text-black'">{{ col.day }}</div>
          </div>
          <div class="flex min-h-[260px] flex-col gap-1.5 p-2">
            <div v-for="ev in col.events" :key="ev.id"
              class="cursor-pointer rounded-md border-l-[3px] bg-[#f7f7f7] px-2 py-1.5 text-[11px]"
              :style="{ borderColor: typeColor(ev.idTipoActividad) }">
              <div class="font-semibold text-black">{{ ev.time }} · {{ ev.title }}</div>
              <div v-if="ev.cliente" class="text-[10px] text-[#888]">{{ ev.cliente }}</div>
            </div>
            <div v-if="col.events.length === 0" class="mt-2 text-center text-[10px] text-[#bbb]">Sin eventos</div>

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
              <div v-for="ev in eventsAtHour(h)" :key="ev.id" class="cursor-pointer rounded-md px-2.5 py-2 text-white"
                :style="{ background: typeColor(ev.idTipoActividad) }">
                <div class="text-[12px] font-semibold">{{ ev.time }} · {{ ev.title }}</div>
                <div v-if="ev.cliente" class="text-[10px] opacity-90">{{ ev.cliente }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

  </div>
</template>

<script src="./RegistercalendarView.ts" lang="ts"></script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap');

.cal-page {
  font-family: 'Barlow', sans-serif;
}

.font-barlow-cond {
  font-family: 'Barlow Condensed', sans-serif;
}

.view-btn {
  @apply rounded-full px-3 py-1.5 text-xs font-semibold text-[#999] transition-colors;
}

.view-btn-active {
  @apply bg-[#2d8c4a] text-white;
}

.nav-btn {
  @apply flex h-7 w-7 items-center justify-center rounded-full border border-[#333] text-sm text-white transition-colors hover:border-[#2d8c4a] hover:text-[#2d8c4a];
}

.today-btn {
  @apply rounded-full border border-[#333] px-3 py-1 text-xs font-semibold text-white transition-colors hover:border-[#2d8c4a] hover:text-[#2d8c4a];
}

.filter-select {
  @apply rounded-md border border-[#ddd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#333];
}

.clear-filters-btn {
  @apply rounded-md border border-[#ddd] px-2.5 py-1.5 text-xs font-semibold text-[#888] transition-colors hover:border-[#c0392b] hover:text-[#c0392b];
}
</style>