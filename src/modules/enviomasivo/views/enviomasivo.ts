// src/modules/enviomasivo/views/enviomasivo.ts
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import * as api from '../actions/masivo.actions';
import type {
  EstadoCampania,
  EstadoDestinatario,
  ICampaniaDetalle,
  ICampaniaResumen,
  ICrearCampaniaDto,
  IDestinatarioDto,
  IDestinatarioEstado,
  IOptout,
  IPlantilla,
  TipoHeader,
} from '../interfaces/masivo.interface';

const LIMITE = 50;
const CAMPANIAS_POR_PAGINA = 5;

const ESTADOS_DESTINATARIO: EstadoDestinatario[] = [
  'PENDIENTE', 'ENVIANDO', 'ENVIADO', 'ENTREGADO', 'LEIDO', 'FALLIDO', 'EXCLUIDO',
];

const ETIQUETAS: Record<string, string> = {
  BORRADOR: 'Borrador',
  PROGRAMADA: 'Programada',
  EN_CURSO: 'En curso',
  PAUSADA: 'Pausada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  PENDIENTE: 'Pendiente',
  ENVIANDO: 'Enviando',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  LEIDO: 'Leído',
  FALLIDO: 'Fallido',
  EXCLUIDO: 'Excluido',
};

const etiqueta = (estado: string) => ETIQUETAS[estado] ?? estado;

const formatoFecha = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' })
    : '—';

/** Partes de la barra de avance de una campaña (suman 100 %) */
const segmentos = (c: ICampaniaResumen) => {
  const total = c.total || 0;
  if (!total) return [];
  const leidos = c.leidos;
  const entregados = Math.max(0, c.entregados - c.leidos);
  const enviados = Math.max(0, c.enviados - c.entregados);
  const fallidos = c.fallidos;
  const excluidos = c.excluidos ?? 0;
  const pendientes = Math.max(0, total - c.enviados - c.fallidos - excluidos);
  return [
    { clave: 'leidos', n: leidos, texto: 'Leídos' },
    { clave: 'entregados', n: entregados, texto: 'Entregados' },
    { clave: 'enviados', n: enviados, texto: 'Enviados' },
    { clave: 'fallidos', n: fallidos, texto: 'Fallidos' },
    { clave: 'excluidos', n: excluidos, texto: 'Excluidos' },
    { clave: 'pendientes', n: pendientes, texto: 'Pendientes' },
  ]
    .filter((s) => s.n > 0)
    .map((s) => ({ ...s, ancho: (s.n / total) * 100 }));
};

/** Clases Tailwind del chip de estado (campaña o destinatario) */
const claseChip = (estado: string) => {
  const base = 'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ';
  switch (estado) {
    case 'EN_CURSO':
    case 'ENVIANDO':
      return base + 'bg-emerald-100 text-emerald-800';
    case 'COMPLETADA':
    case 'ENTREGADO':
    case 'LEIDO':
      return base + 'bg-emerald-100 text-emerald-800';
    case 'PAUSADA':
    case 'PROGRAMADA':
      return base + 'bg-emerald-100 text-emerald-800';
    case 'CANCELADA':
    case 'FALLIDO':
      return base + 'bg-emerald-100 text-emerald-800';
    default:
      return base + 'bg-emerald-100 text-emerald-800';
  }
};

/** Clases Tailwind de cada tramo de la barra de avance */
const claseSegmento = (clave: string) =>
  ({
    leidos: 'bg-emerald-400',
    entregados: 'bg-emerald-400',
    enviados: 'bg-emerald-400',
    fallidos: 'bg-emerald-400',
     excluidos: 'bg-red-600',
    pendientes: 'bg-emerald-400',
  })[clave] ?? 'bg-emerald-400';

const puedeIniciar = (e: EstadoCampania) => ['BORRADOR', 'PROGRAMADA', 'PAUSADA'].includes(e);
const puedePausar = (e: EstadoCampania) => e === 'EN_CURSO';
const puedeCancelar = (e: EstadoCampania) =>
  ['BORRADOR', 'PROGRAMADA', 'EN_CURSO', 'PAUSADA'].includes(e);

export default defineComponent({
  setup() {
    // ───────── estado general ─────────
    const plantillas = ref<IPlantilla[]>([]);
    const campanias = ref<ICampaniaResumen[]>([]);
    const cargandoLista = ref(false);
    const guardando = ref(false);
    const mostrarForm = ref(false);
    const aviso = ref<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
    let avisoTimer: ReturnType<typeof setTimeout> | undefined;

    const notificar = (tipo: 'ok' | 'error', texto: string) => {
      aviso.value = { tipo, texto };
      clearTimeout(avisoTimer);
      avisoTimer = setTimeout(() => (aviso.value = null), 6000);
    };
    const mensajeError = (e: unknown) => (e instanceof Error ? e.message : 'Ocurrió un error inesperado.');

    // ───────── formulario de creación ─────────
    const form = reactive({
      nombre: '',
      plantilla: '',
      parametros: [] as string[],
      headerUrl: '',
      programadaPara: '',
      destinatariosTexto: '',
    });

    const plantillaSel = computed(() => plantillas.value.find((p) => p.nombre === form.plantilla));
    const cuerpo = computed(() => plantillaSel.value?.componentes.find((c) => c.type === 'BODY')?.text ?? '');
    const numVariables = computed(() => {
      const m = [...cuerpo.value.matchAll(/\{\{(\d+)\}\}/g)].map((x) => Number(x[1]));
      return m.length ? Math.max(...m) : 0;
    });
    const headerFormato = computed<TipoHeader | null>(() => {
      const h = plantillaSel.value?.componentes.find((c) => c.type === 'HEADER');
      const f = h?.format;
      return f === 'IMAGE' || f === 'VIDEO' || f === 'DOCUMENT' ? (f.toLowerCase() as TipoHeader) : null;
    });

    // Ajusta los campos de variables al cambiar de plantilla
    watch(
      () => form.plantilla,
      () => {
        const previos = form.parametros;
        form.parametros = Array.from({ length: numVariables.value }, (_, i) =>
          previos[i] ?? (i === 0 ? '{primer_nombre}' : ''),
        );
        form.headerUrl = '';
      },
    );

    /** Cada línea: telefono, nombre, clave=valor, clave=valor... */
    const destinatariosParseados = computed<IDestinatarioDto[]>(() =>
      form.destinatariosTexto
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((linea) => {
          const [telefono, nombre, ...resto] = linea.split(/[,;\t]/).map((x) => x.trim());
          const datos: Record<string, string> = {};
          for (const r of resto) {
            const m = r.match(/^(\w+)\s*=\s*(.+)$/);
            if (m) datos[m[1]] = m[2];
          }
          return {
            telefono,
            ...(nombre && !/^\w+\s*=/.test(nombre) ? { nombre } : {}),
            ...(Object.keys(datos).length ? { datos } : {}),
          };
        }),
    );

    const formValido = computed(
      () =>
        form.nombre.trim().length > 0 &&
        !!form.plantilla &&
        (!headerFormato.value || form.headerUrl.trim().length > 0) &&
        destinatariosParseados.value.length > 0,
    );

    const resetForm = () => {
      form.nombre = '';
      form.plantilla = '';
      form.parametros = [];
      form.headerUrl = '';
      form.programadaPara = '';
      form.destinatariosTexto = '';
    };

    const crear = async (iniciar: boolean) => {
      if (!formValido.value || guardando.value) return;
      const programada = form.programadaPara ? new Date(form.programadaPara) : null;
      const dto: ICrearCampaniaDto = {
        nombre: form.nombre.trim(),
        plantilla: form.plantilla,
        idioma: plantillaSel.value?.idioma ?? 'es',
        parametros: form.parametros,
        destinatarios: destinatariosParseados.value,
        ...(headerFormato.value ? { header: { tipo: headerFormato.value, url: form.headerUrl.trim() } } : {}),
        ...(programada ? { programada_para: programada.toISOString() } : {}),
      };
      guardando.value = true;
      try {
        const r = await api.crearCampania(dto);
        const c = r.carga;
        const excl = c?.excluidos_por_baja ?? 0;
        let texto = `Campaña creada con ${(c?.agregados ?? 0) + excl} contactos.`;
        if (excl) texto += ` ${excl} están en la lista de exclusión: quedan como Excluido y no recibirán mensajes.`;
        if (c && (c.invalidos || c.repetidos)) {
          texto += ` Descartados: ${c.invalidos} inválidos y ${c.repetidos} repetidos.`;
        }
        if (iniciar && !programada) {
          await api.iniciarCampania(r.id);
          texto += ' Envío iniciado.';
        }
        notificar('ok', texto);
        resetForm();
        mostrarForm.value = false;
        await cargarCampanias();
        paginaCampanias.value = 1;
        await abrirDetalle(r.id);
      } catch (e) {
        notificar('error', mensajeError(e));
      } finally {
        guardando.value = false;
      }
    };

    // ───────── lista de campañas ─────────
    const cargarCampanias = async (silencioso = false) => {
      if (!silencioso) cargandoLista.value = true;
      try {
        campanias.value = await api.listarCampanias();
      } catch (e) {
        if (!silencioso) notificar('error', mensajeError(e));
      } finally {
        cargandoLista.value = false;
      }
    };

    const cargarPlantillas = async () => {
      try {
        plantillas.value = await api.listarPlantillas();
      } catch (e) {
        notificar('error', mensajeError(e));
      }
    };

    // ───────── paginación de campañas (5 por página) ─────────
    const paginaCampanias = ref(1);
    const totalPaginasCampanias = computed(() =>
      Math.max(1, Math.ceil(campanias.value.length / CAMPANIAS_POR_PAGINA)),
    );
    const campaniasPagina = computed(() => {
      const ini = (paginaCampanias.value - 1) * CAMPANIAS_POR_PAGINA;
      return campanias.value.slice(ini, ini + CAMPANIAS_POR_PAGINA);
    });
    const desdeCampanias = computed(() =>
      campanias.value.length ? (paginaCampanias.value - 1) * CAMPANIAS_POR_PAGINA + 1 : 0,
    );
    const hastaCampanias = computed(() =>
      Math.min(paginaCampanias.value * CAMPANIAS_POR_PAGINA, campanias.value.length),
    );
    const cambiarPaginaCampanias = (delta: number) => {
      paginaCampanias.value = Math.min(
        totalPaginasCampanias.value,
        Math.max(1, paginaCampanias.value + delta),
      );
    };
    // Si se borran campañas y la página actual ya no existe, retrocede
    watch(totalPaginasCampanias, (total) => {
      if (paginaCampanias.value > total) paginaCampanias.value = total;
    });

    // ───────── detalle ─────────
    const detalle = ref<ICampaniaDetalle | null>(null);
    const destinatarios = ref<IDestinatarioEstado[]>([]);
    const filtroEstado = ref<EstadoDestinatario | ''>('');
    const pagina = ref(1);
    const cargandoDetalle = ref(false);
    const hayMas = computed(() => destinatarios.value.length === LIMITE);

    const cargarDestinatarios = async () => {
      if (!detalle.value) return;
      try {
        destinatarios.value = await api.listarDestinatarios(detalle.value.id, {
          estado: filtroEstado.value,
          pagina: pagina.value,
          limite: LIMITE,
        });
      } catch (e) {
        notificar('error', mensajeError(e));
      }
    };

    const refrescarDetalle = async () => {
      if (!detalle.value) return;
      try {
        detalle.value = await api.obtenerCampania(detalle.value.id);
        await cargarDestinatarios();
      } catch {
        /* se reintenta en el siguiente ciclo */
      }
    };

    const abrirDetalle = async (id: number | string) => {
      cargandoDetalle.value = true;
      filtroEstado.value = '';
      pagina.value = 1;
      try {
        detalle.value = await api.obtenerCampania(id);
        await cargarDestinatarios();
      } catch (e) {
        notificar('error', mensajeError(e));
      } finally {
        cargandoDetalle.value = false;
      }
    };

    const cerrarDetalle = () => {
      detalle.value = null;
      destinatarios.value = [];
    };

    watch([filtroEstado], () => {
      pagina.value = 1;
      void cargarDestinatarios();
    });

    const cambiarPagina = (delta: number) => {
      pagina.value = Math.max(1, pagina.value + delta);
      void cargarDestinatarios();
    };

    // ───────── acciones sobre una campaña ─────────
    const ocupado = ref<string | null>(null); // "iniciar-3", "pausar-3"...

    const ejecutar = async (clave: string, fn: () => Promise<string>) => {
      if (ocupado.value) return;
      ocupado.value = clave;
      try {
        notificar('ok', await fn());
        await cargarCampanias(true);
        await refrescarDetalle();
      } catch (e) {
        notificar('error', mensajeError(e));
      } finally {
        ocupado.value = null;
      }
    };

    const iniciar = (id: number | string) =>
      ejecutar(`iniciar-${id}`, async () => {
        await api.iniciarCampania(id);
        return 'Envío iniciado.';
      });

    const pausar = (id: number | string) =>
      ejecutar(`pausar-${id}`, async () => {
        await api.pausarCampania(id);
        return 'Campaña pausada.';
      });

    const cancelar = (id: number | string) => {
      if (!window.confirm('¿Cancelar la campaña? Los destinatarios pendientes quedarán excluidos y no se puede deshacer.')) return;
      return ejecutar(`cancelar-${id}`, async () => {
        await api.cancelarCampania(id);
        return 'Campaña cancelada.';
      });
    };

    // ───────── lista de exclusión ─────────
    const optoutTelefono = ref('');
    const optouts = ref<IOptout[]>([]);
    const cargandoOptout = ref(false);
    const busquedaOptout = ref('');

    const optoutsFiltrados = computed(() => {
      const q = busquedaOptout.value.trim().toLowerCase();
      if (!q) return optouts.value;
      return optouts.value.filter(
        (o) => o.telefono.includes(q.replace(/\D/g, '') || q) || (o.motivo ?? '').toLowerCase().includes(q),
      );
    });

    const cargarOptouts = async () => {
      cargandoOptout.value = true;
      try {
        optouts.value = await api.listarOptout();
      } catch (e) {
        notificar('error', mensajeError(e));
      } finally {
        cargandoOptout.value = false;
      }
    };

    const gestionarOptout = async (agregar: boolean, telefono?: string) => {
      const tel = (telefono ?? optoutTelefono.value).trim();
      if (!tel) return;
      try {
        const r = agregar ? await api.agregarOptout(tel) : await api.quitarOptout(tel);
        notificar('ok', r.excluido ? `${r.telefono} no recibirá más mensajes.` : `${r.telefono} salió de la lista de exclusión.`);
        if (!telefono) optoutTelefono.value = '';
        await cargarOptouts();
        await cargarCampanias(true);
        await refrescarDetalle();
      } catch (e) {
        notificar('error', mensajeError(e));
      }
    };

    // ───────── ciclo de vida: refresco mientras haya envíos en curso ─────────
    let timer: ReturnType<typeof setInterval> | undefined;

    onMounted(async () => {
      await Promise.all([cargarCampanias(), cargarPlantillas(), cargarOptouts()]);
      timer = setInterval(async () => {
        if (!campanias.value.some((c) => c.estado === 'EN_CURSO')) return;
        await cargarCampanias(true);
        await refrescarDetalle();
      }, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer);
      clearTimeout(avisoTimer);
    });

    return {
      // helpers de la vista
      ESTADOS_DESTINATARIO, etiqueta, formatoFecha, segmentos, puedeIniciar, puedePausar, puedeCancelar,
      claseChip, claseSegmento,
      // general
      plantillas, campanias, cargandoLista, guardando, mostrarForm, aviso,
      // formulario
      form, plantillaSel, cuerpo, numVariables, headerFormato, destinatariosParseados, formValido, crear,
      // lista
      cargarCampanias,
      campaniasPagina, paginaCampanias, totalPaginasCampanias, desdeCampanias, hastaCampanias,
      cambiarPaginaCampanias,
      // detalle
      detalle, destinatarios, filtroEstado, pagina, hayMas, cargandoDetalle,
      abrirDetalle, cerrarDetalle, cambiarPagina,
      // acciones
      ocupado, iniciar, pausar, cancelar,
      // exclusión
      optoutTelefono, optouts, optoutsFiltrados, busquedaOptout, cargandoOptout, cargarOptouts, gestionarOptout,
    };
  },
});