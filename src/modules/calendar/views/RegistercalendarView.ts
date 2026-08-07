import { defineComponent, ref, reactive, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { listarActividadesAsesores } from '../actions/calendar.action';


import type {
  IListarActividadesAsesoresRequest,
  IListarActividadesAsesoresResponse,

} from '@/modules/calendar/interfaces/calendar.interface';
import type { IListarAsesoresResponse } from '@/modules/clients/interfaces/clients.interface';
import type { IListarOpcionesResponse } from '@/modules/leads/interfaces/lead.interface';
import { listarAsesores } from '@/modules/clients/actions/clients.action';
import { listarOpciones } from '@/modules/clients/actions/clientsReunion.action';



const ID_LISTADO_TIPO_ACTIVIDAD = 4;
const ID_LISTADO_ESTADO = 5;

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm

  idTipoActividad: number;
  tipoActividad: string;

  idAsesor: number;
  asesor: string;

  cliente: string;
  leadId: number | null;
  notas: string;

  estado: number;
  estadoLabel: string;
  estadoActividad: boolean;
}

const TYPE_PALETTE = ['#3a7acc', '#c4762a', '#2d8c4a', '#7c3aed', '#d63384', '#0ea5e9', '#f59e0b', '#64748b'];

export default defineComponent({
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();

    // ── ESTADO DE EVENTOS (poblado desde la API) ─────────────────
    const calendarEvents = reactive<CalendarEvent[]>([]);
    const loading = ref(false);
    const loadError = ref('');

    // ── CATÁLOGOS (asesores / tipos de actividad / estados) ──────
    const asesores = ref<IListarAsesoresResponse[]>([]);
    const tiposActividad = ref<IListarOpcionesResponse[]>([]);
    const estadosOpciones = ref<IListarOpcionesResponse[]>([]);

    async function loadCatalogos() {
      try {
        const [asesoresRes, tiposRes, estadosRes] = await Promise.all([
          listarAsesores(),
          listarOpciones(ID_LISTADO_TIPO_ACTIVIDAD),
          listarOpciones(ID_LISTADO_ESTADO),
        ]);
        asesores.value = asesoresRes;
        tiposActividad.value = tiposRes;
        estadosOpciones.value = estadosRes;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cargar los catálogos de filtros');
      }
    }

    function colorForTipo(idTipoActividad: number) {
      const idx = tiposActividad.value.findIndex((t) => t.id === idTipoActividad);
      return TYPE_PALETTE[(idx === -1 ? idTipoActividad : idx) % TYPE_PALETTE.length];
    }

    function mapApiEvent(item: IListarActividadesAsesoresResponse): CalendarEvent {
      const [datePart] = (item.fecha || '').split('T');
      const timePart = (item.hora || '00:00:00').slice(0, 5);
      const estadoMeta = estadosOpciones.value.find((e) => e.id === item.estado);
      return {
        id: item.id,
        title: item.titulo,
        date: datePart,
        time: timePart,
        idTipoActividad: item.id_tipo_actividad,
        tipoActividad: item.tipo_actividad,
        idAsesor: item.id_asesor,
        asesor: item.nombre_asesor,
        cliente: item.nombre_cliente,
        leadId: item.id_lead ?? null,
        notas: item.descripcion,
        estado: item.estado,
        estadoLabel: estadoMeta?.nombre ?? item.estado_lead,
        estadoActividad: item.estado_actividad,
      };
    }

    // ── FILTROS ───────────────────────────────────────────────────
    const filters = reactive({
      idAsesor: null as number | null,
      idTipoActividad: null as number | null,
      estado: null as number | null,
    });

    function resetFilters() {
      filters.idAsesor = null;
      filters.idTipoActividad = null;
      filters.estado = null;
    }

    // ── VISTAS ────────────────────────────────────────────────
    const views = [
      { key: 'mes', label: 'Mes' },
      { key: 'semana', label: 'Semana' },
      { key: 'dia', label: 'Día' },
    ] as const;
    const view = ref<'mes' | 'semana' | 'dia'>('mes');
    const cursor = ref(new Date());
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const pad = (n: number) => String(n).padStart(2, '0');
    const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const todayStr = toDateStr(new Date());

    function typeColor(idTipoActividad: number) {
      return colorForTipo(idTipoActividad);
    }
    function eventsForDateStr(dateStr: string) {
      return calendarEvents
        .filter((e) => e.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));
    }

    // ── RANGO DE FECHAS SEGÚN LA VISTA ACTUAL ──────────────────────
    function rangeForView(): { fechaInicio: string; fechaFin: string } {
      if (view.value === 'mes') {
        const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
        const startOffset = (first.getDay() + 6) % 7;
        const start = new Date(first);
        start.setDate(first.getDate() - startOffset);
        const end = new Date(start);
        end.setDate(start.getDate() + 41);
        return { fechaInicio: toDateStr(start), fechaFin: toDateStr(end) };
      }
      if (view.value === 'semana') {
        const d = new Date(cursor.value);
        const offset = (d.getDay() + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - offset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { fechaInicio: toDateStr(monday), fechaFin: toDateStr(sunday) };
      }
      const dateStr = toDateStr(cursor.value);
      return { fechaInicio: dateStr, fechaFin: dateStr };
    }

    // ── CARGA DE ACTIVIDADES DESDE EL BACKEND ──────────────────────
    async function loadActividades() {
      loading.value = true;
      loadError.value = '';
      try {
        const { fechaInicio, fechaFin } = rangeForView();
        const payload: IListarActividadesAsesoresRequest = { fechaInicio, fechaFin };
        if (filters.idAsesor != null) payload.idAsesor = filters.idAsesor;
        if (filters.idTipoActividad != null) payload.idTipoActividad = filters.idTipoActividad;
        if (filters.estado != null) payload.estado = filters.estado;

        const data = await listarActividadesAsesores(payload);
        calendarEvents.splice(0, calendarEvents.length, ...data.map(mapApiEvent));
      } catch (err) {
        loadError.value = err instanceof Error ? err.message : 'Error al listar actividades.';
        toast.error(loadError.value);
      } finally {
        loading.value = false;
      }
    }

    // Recarga cuando cambian la vista, el cursor de fecha, o cualquier filtro.
    watch(
      [view, cursor, () => filters.idAsesor, () => filters.idTipoActividad, () => filters.estado],
      () => loadActividades()
    );

    onMounted(async () => {
      await loadCatalogos();
      await loadActividades();
    });

    // ── NAVEGACIÓN ──────────────────────────────────────────────
    function navigate(dir: number) {
      const d = new Date(cursor.value);
      if (view.value === 'mes') d.setMonth(d.getMonth() + dir);
      else if (view.value === 'semana') d.setDate(d.getDate() + dir * 7);
      else d.setDate(d.getDate() + dir);
      cursor.value = d;
    }
    function goToday() {
      cursor.value = new Date();
    }

    // ── VISTA MES ────────────────────────────────────────────────
    const monthCells = computed(() => {
      const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
      const startOffset = (first.getDay() + 6) % 7; // semana empieza en lunes
      const start = new Date(first);
      start.setDate(first.getDate() - startOffset);

      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = toDateStr(d);
        return {
          dateStr,
          day: d.getDate(),
          inMonth: d.getMonth() === cursor.value.getMonth(),
          isToday: dateStr === todayStr,
          events: eventsForDateStr(dateStr),
        };
      });
    });

    // ── VISTA SEMANA ─────────────────────────────────────────────
    const weekCells = computed(() => {
      const d = new Date(cursor.value);
      const offset = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - offset);

      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dateStr = toDateStr(day);
        return {
          dateStr,
          day: day.getDate(),
          weekdayLabel: weekDays[i],
          isToday: dateStr === todayStr,
          events: eventsForDateStr(dateStr),
        };
      });
    });

    // ── VISTA DÍA ────────────────────────────────────────────────
    const currentDateStr = computed(() => toDateStr(cursor.value));
    const dayHours = Array.from({ length: 14 }, (_, i) => `${pad(i + 7)}:00`); // 07:00–20:00
    const dayLabel = computed(() =>
      cursor.value.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    );
    function eventsAtHour(h: string) {
      return eventsForDateStr(currentDateStr.value).filter((e) => e.time.slice(0, 2) === h.slice(0, 2));
    }

    // ── ETIQUETA DE CABECERA ──────────────────────────────────────
    const headerLabel = computed(() => {
      if (view.value === 'mes') return cursor.value.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      if (view.value === 'dia') return cursor.value.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
      const w = weekCells.value;
      return `${w[0].day} – ${w[6].day} ${cursor.value.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}`;
    });

    function selectDay(dateStr: string) {
      cursor.value = new Date(dateStr + 'T00:00:00');
      view.value = 'dia';
    }

    // ── MODAL: crear / ver / editar / eliminar actividad ──────────
    // NOTA: aún no se recibió un endpoint de creación/edición/eliminación
    // de actividades, así que estas acciones sólo actualizan la lista en
    // memoria (se perderán al recargar filtros/vista). Cuando exista el
    // endpoint, reemplaza addEventLocal/updateEventLocal/removeEventLocal
    // por llamadas reales a la API y luego refresca con loadActividades().
    const modalOpen = ref(false);
    const editingEvent = ref<CalendarEvent | null>(null);
    const form = reactive({
      idTipoActividad: null as number | null,
      title: '',
      date: todayStr,
      time: '10:00',
      cliente: '',
      asesor: authStore.nameEmploye ?? '',
      notas: '',
      estado: null as number | null,
    });

    function openNewModal(dateStr?: string) {
      editingEvent.value = null;
      Object.assign(form, {
        idTipoActividad: tiposActividad.value[0]?.id ?? null,
        title: '',
        date: dateStr || currentDateStr.value,
        time: '10:00',
        cliente: '',
        asesor: authStore.nameEmploye ?? '',
        notas: '',
        estado: estadosOpciones.value[0]?.id ?? null,
      });
      modalOpen.value = true;
    }

    function openDetail(ev: CalendarEvent) {
      editingEvent.value = ev;
      Object.assign(form, {
        idTipoActividad: ev.idTipoActividad,
        title: ev.title,
        date: ev.date,
        time: ev.time,
        cliente: ev.cliente,
        asesor: ev.asesor,
        notas: ev.notas,
        estado: ev.estado,
      });
      modalOpen.value = true;
    }

    function closeModal() {
      modalOpen.value = false;
    }

    function saveEvent() {
      if (!form.title || !form.date || !form.time || form.idTipoActividad == null) return;
      const tipoMeta = tiposActividad.value.find((t) => t.id === form.idTipoActividad);
      const estadoMeta = estadosOpciones.value.find((e) => e.id === form.estado);
      try {
        if (editingEvent.value) {
          Object.assign(editingEvent.value, {
            title: form.title,
            date: form.date,
            time: form.time,
            idTipoActividad: form.idTipoActividad,
            tipoActividad: tipoMeta?.nombre ?? editingEvent.value.tipoActividad,
            cliente: form.cliente,
            asesor: form.asesor,
            notas: form.notas,
            estado: form.estado ?? editingEvent.value.estado,
            estadoLabel: estadoMeta?.nombre ?? editingEvent.value.estadoLabel,
          });
          toast.success('Actividad actualizada correctamente (local, pendiente de endpoint)');
        } else {
          calendarEvents.push({
            id: Date.now(),
            title: form.title,
            date: form.date,
            time: form.time,
            idTipoActividad: form.idTipoActividad,
            tipoActividad: tipoMeta?.nombre ?? '',
            idAsesor: 0,
            asesor: form.asesor,
            cliente: form.cliente,
            leadId: null,
            notas: form.notas,
            estado: form.estado ?? 0,
            estadoLabel: estadoMeta?.nombre ?? '',
            estadoActividad: true,
          });
          toast.success('Actividad creada correctamente (local, pendiente de endpoint)');
        }
        modalOpen.value = false;
      } catch (err) {
        toast.error('Ocurrió un error al guardar la actividad');
      }
    }

    function deleteCurrent() {
      if (!editingEvent.value) return;
      try {
        const i = calendarEvents.findIndex((e) => e.id === editingEvent.value!.id);
        if (i !== -1) calendarEvents.splice(i, 1);
        toast.success('Actividad eliminada (local, pendiente de endpoint)');
      } catch (err) {
        toast.error('Ocurrió un error al eliminar la actividad');
      } finally {
        modalOpen.value = false;
      }
    }

    return {
      toast,
      authStore,

      loading,
      loadError,

      asesores,
      tiposActividad,
      estadosOpciones,
      filters,
      resetFilters,

      views,
      view,
      weekDays,
      headerLabel,
      navigate,
      goToday,

      monthCells,
      selectDay,
      typeColor,

      weekCells,

      dayLabel,
      dayHours,
      eventsAtHour,
      currentDateStr,

      modalOpen,
      editingEvent,
      form,
      openNewModal,
      openDetail,
      closeModal,
      saveEvent,
      deleteCurrent,
    };
  },
});