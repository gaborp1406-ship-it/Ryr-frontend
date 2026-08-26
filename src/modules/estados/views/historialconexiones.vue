<template>
  <div class="conexiones-page">
    <div class="filter-chips-header">
      <div class="filter-chips">
        <button class="chip" :class="{ 'chip--active': filtroEstado === null }" @click="filtroEstado = null">
          Todos
          <span class="chip__count">{{ asesores.length }}</span>
        </button>
        <button v-for="e in estados" :key="e.id" class="chip" :class="{ 'chip--active': filtroEstado === e.id }"
          :style="{ '--chip-color': e.color || '#94a3b8' }" @click="filtroEstado = e.id">
          <span class="chip__dot"></span>
          {{ e.nombre }}
          <span class="chip__count">{{ conteoPorEstado.get(e.id) ?? 0 }}</span>
        </button>
      </div>

      <button class="btn-refresh" :disabled="isLoadingAsesores" @click="cargarAsesores">
        <svg class="icon" :class="{ spinning: isLoadingAsesores }" width="16" height="16" viewBox="0 0 24 24"
          fill="none">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Actualizar
      </button>
    </div>

    <div v-if="isLoadingAsesores && asesores.length === 0" class="state-msg">
      Cargando asesores...
    </div>

    <div v-else-if="asesoresFiltrados.length === 0" class="state-msg">
      No hay asesores con ese estado.
    </div>

    <div v-else class="asesores-grid">
      <div v-for="a in asesoresFiltrados" :key="a.id_trabajador" class="asesor-card"
        :style="{ '--status-color': a.color || '#94a3b8' }">
        <div class="asesor-card__top">
          <div class="asesor-card__avatar">
            {{ a.nombre?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="asesor-card__info">
            <p class="asesor-card__nombre" :title="a.nombre">{{ a.nombre }}</p>
            <span class="status-badge">
              <span class="status-badge__dot"></span>
              {{ a.estado_conexion }}
            </span>
          </div>
        </div>

        <div class="asesor-card__timer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="asesor-card__timer-value">{{ tiempoEnVivo(a.fecha_inicio) }}</span>
        </div>

        <p class="asesor-card__desde">Desde las {{ formatFecha(a.fecha_inicio) }}</p>

        <button class="asesor-card__btn" @click="verHistorial(a)">
          Ver historial
        </button>
      </div>
    </div>

    <transition name="panel-fade">
      <div v-if="asesorSeleccionado" id="panel-historial" class="historial-panel">
        <div class="historial-header">
          <div class="historial-header__info">
            <h2 class="historial-title">
              Historial de <span>{{ asesorSeleccionado.nombre }}</span>
            </h2>
          
          </div>
          <button class="btn-close" @click="cerrarHistorial" aria-label="Cerrar historial">✕</button>
        </div>

        <!-- Filtros del historial -->
        <div class="historial-filters">
          <div class="field">
            <label>Estado</label>
            <select v-model="filtroHistorialEstado">
              <option :value="null">Todos los estados</option>
              <option v-for="e in estados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>

          <div class="field">
            <label>Desde</label>
            <input type="date" v-model="filtroFechaDesde" />
          </div>

          <div class="field">
            <label>Hasta</label>
            <input type="date" v-model="filtroFechaHasta" />
          </div>

          <div class="field field--actions">
            <button class="btn-primary" :disabled="isLoadingHistorial" @click="cargarHistorial">
              Filtrar
            </button>
            <button class="btn-secondary" @click="limpiarFiltrosHistorial">
              Limpiar
            </button>
          </div>
        </div>
        <div v-if="isLoadingHistorial" class="state-msg">Cargando historial...</div>
        <div v-else-if="historial.length === 0" class="state-msg">
          No hay registros para los filtros seleccionados.
        </div>

        <div v-else class="historial-table">
          <div class="historial-table__head">
            <span>Estado</span>
            <span>Inicio</span>
            <span>Fin</span>
            <span>Duración</span>
          </div>

          <div v-for="item in historial" :key="item.id" class="historial-row"
            :class="{ 'historial-row--live': !item.fecha_fin }" :style="{ '--status-color': item.color || '#94a3b8' }">
            <span class="status-badge">
              <span class="status-badge__dot"></span>
              {{ item.estado_conexion }}
            </span>
            <span class="historial-row__fecha">{{ formatFecha(item.fecha_inicio) }}</span>
            <span class="historial-row__fecha">
              <template v-if="item.fecha_fin">{{ formatFecha(item.fecha_fin) }}</template>
              <span v-else class="badge-live">En curso</span>
            </span>
            <span class="historial-row__duracion">{{ tiempoHistorial(item) }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script src="./historialconexiones.ts" lang="ts"></script>

<style scoped>
.conexiones-page {
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.filter-chips-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -.02em;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: .9rem;
  color: #64748b;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-refresh:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.chip:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.chip--active {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}

.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color, #94a3b8);
  flex-shrink: 0;
}

.chip__count {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(0, 0, 0, .06);
  font-size: .75rem;
}

.chip--active .chip__count {
  background: rgba(255, 255, 255, .18);
}

.state-msg {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: .9rem;
}

.asesores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}

.asesor-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  transition: box-shadow .2s ease, transform .2s ease;
  overflow: hidden;
}

.asesor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--status-color, #94a3b8);
}

.asesor-card:hover {
  box-shadow: 0 8px 24px rgba(15, 23, 42, .08);
  transform: translateY(-2px);
}

.asesor-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.asesor-card__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--status-color, #94a3b8);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.asesor-card__info {
  min-width: 0;
}

.asesor-card__nombre {
  margin: 0 0 4px;
  font-size: .92rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--status-color, #94a3b8) 14%, white);
  color: var(--status-color, #64748b);
  font-size: .74rem;
  font-weight: 700;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--status-color, #94a3b8);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color, #94a3b8) 22%, transparent);
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-color, #94a3b8) 45%, transparent);
  }

  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--status-color, #94a3b8) 0%, transparent);
  }

  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-color, #94a3b8) 0%, transparent);
  }
}

.asesor-card__timer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  margin-bottom: 10px;
}

.asesor-card__timer-value {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: .92rem;
}

.asesor-card__desde {
  margin: 0 0 14px;
  font-size: .78rem;
  color: #94a3b8;
}

.asesor-card__btn {
  width: 100%;
  padding: 8px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.asesor-card__btn:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

/* ---------- Panel de historial ---------- */

.historial-panel {
  margin-top: 32px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 22px;
}

.historial-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.historial-header__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.historial-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.historial-title span {
  color: #2d8c4a;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  font-size: .9rem;
  transition: all .18s ease;
}

.btn-close:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.historial-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.field label {
  font-size: .74rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .02em;
}

.field select,
.field input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: .85rem;
  color: #0f172a;
}

.field select:focus,
.field input:focus {
  outline: none;
  border-color: #2d8c4a;
}

.field--actions {
  flex-direction: row;
  gap: 8px;
  min-width: auto;
}

.btn-primary {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #0f172a;
  color: #ffffff;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #1e293b;
}

.btn-primary:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s ease;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

/* ---------- Tabla de historial ---------- */

.historial-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.historial-table__head {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 1.4fr 1fr;
  padding: 0 14px 8px;
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
  color: #94a3b8;
}

.historial-row {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 1.4fr 1fr;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border-left: 3px solid var(--status-color, #94a3b8);
  transition: background .15s ease;
}

.historial-row:hover {
  background: #f1f5f9;
}

.historial-row--live {
  background: color-mix(in srgb, var(--status-color, #94a3b8) 6%, #f8fafc);
}

.historial-row__fecha {
  font-size: .83rem;
  color: #475569;
}

.historial-row__duracion {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: .85rem;
  color: #0f172a;
}

.badge-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #16a34a;
  font-weight: 700;
  font-size: .78rem;
}

.badge-live::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
  animation: pulse-green 1.5s infinite;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, .5);
  }

  70% {
    box-shadow: 0 0 0 5px rgba(22, 163, 74, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ---------- Responsivo ---------- */

@media (max-width: 640px) {
  .conexiones-page {
    padding: 16px;
  }

  .asesores-grid {
    grid-template-columns: 1fr;
  }

  .historial-table__head {
    display: none;
  }

  .historial-row {
    grid-template-columns: 1fr;
    gap: 6px;
    align-items: flex-start;
  }

  .historial-row__duracion::before {
    content: 'Duración: ';
    color: #94a3b8;
    font-weight: 500;
  }
}
</style>