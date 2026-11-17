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

// ───────── archivos: límites (los mismos que valida el backend / WhatsApp) ─────────
const MB = 1024 * 1024;
const LIMITE_MB: Record<TipoHeader, number> = { video: 16, image: 5, document: 100 };
const ACCEPT: Record<TipoHeader, string> = {
  video: 'video/mp4,video/quicktime,video/3gpp,video/webm,video/x-matroska',
  image: 'image/jpeg,image/png',
  document: 'application/pdf',
};
const NOMBRE_TIPO: Record<TipoHeader, string> = { video: 'video', image: 'imagen', document: 'documento PDF' };

const formatoTamano = (bytes: number) =>
  bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// ───────── Excel: columnas reconocidas ─────────
const CLAVES_TELEFONO = ['telefono', 'celular', 'cel', 'movil', 'phone', 'numero', 'whatsapp', 'nro', 'tel'];
const CLAVES_NOMBRE = ['nombre', 'nombres', 'name', 'cliente', 'contacto', 'nombre_completo'];
const EXCEL_MAX_MB = 10;

const normalizarClave = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const FRASES_SUBIDA = [
  'Preparando el despegue…',
  'Encendiendo motores…',
  'Lanzando tu archivo a la nube…',
  'Cruzando la estratosfera…',
  'Ya casi estamos en órbita…',
];

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

    // ───────── subida del archivo del header (Cloudinary) ─────────
    const subida = reactive({
      fase: 'idle' as 'idle' | 'subiendo' | 'procesando' | 'listo' | 'error',
      progreso: 0, // % real del viaje hacia el servidor
      visual: 0, // % mostrado en la animación (llega a 100 solo al terminar)
      tick: 0,
      nombre: '',
      bytes: 0,
      duracion: null as number | null,
      error: '',
      arrastrando: false,
    });
    let subidaTimer: ReturnType<typeof setInterval> | undefined;
    let subidaAbort: AbortController | undefined;

    const subiendoArchivo = computed(() => subida.fase === 'subiendo' || subida.fase === 'procesando');
    const aceptaArchivo = computed(() => (headerFormato.value ? ACCEPT[headerFormato.value] : ''));
    const nombreTipoHeader = computed(() => (headerFormato.value ? NOMBRE_TIPO[headerFormato.value] : 'archivo'));
    const limiteMbHeader = computed(() => (headerFormato.value ? LIMITE_MB[headerFormato.value] : 0));

    const fraseSubida = computed(() => {
      const i = Math.floor(subida.tick / 5);
      if (subida.fase === 'procesando') {
        const t = nombreTipoHeader.value;
        const frases = [
          `Cloudinary está optimizando tu ${t}…`,
          headerFormato.value === 'video' ? 'Convirtiendo a MP4 compatible con WhatsApp…' : 'Verificando el archivo…',
          'Puliendo los últimos detalles…',
          'La magia está en marcha, un momento…',
        ];
        return frases[i % frases.length];
      }
      return FRASES_SUBIDA[i % FRASES_SUBIDA.length];
    });

    const detenerTimerSubida = () => {
      if (subidaTimer) clearInterval(subidaTimer);
      subidaTimer = undefined;
    };

    const iniciarTimerSubida = () => {
      detenerTimerSubida();
      subidaTimer = setInterval(() => {
        subida.tick++;
        // Mientras Cloudinary procesa no hay progreso real: avanza lento sin llegar al 100
        if (subida.fase === 'procesando' && subida.visual < 98) {
          subida.visual += subida.visual < 92 ? 2 : 1;
        }
      }, 500);
    };

    const reiniciarSubida = () => {
      subidaAbort?.abort();
      subidaAbort = undefined;
      detenerTimerSubida();
      subida.fase = 'idle';
      subida.progreso = 0;
      subida.visual = 0;
      subida.tick = 0;
      subida.nombre = '';
      subida.bytes = 0;
      subida.duracion = null;
      subida.error = '';
      subida.arrastrando = false;
    };

    const validarArchivo = (file: File, tipo: TipoHeader): string => {
      const permitidos = ACCEPT[tipo].split(',');
      if (!permitidos.includes(file.type)) {
        return `Formato no permitido. Para ${NOMBRE_TIPO[tipo]} usa: ${tipo === 'video' ? 'MP4, MOV, 3GP o WebM' : tipo === 'image' ? 'JPG o PNG' : 'PDF'
          }.`;
      }
      if (file.size > LIMITE_MB[tipo] * MB) {
        return `Pesa ${formatoTamano(file.size)} y el máximo para ${NOMBRE_TIPO[tipo]} es ${LIMITE_MB[tipo]} MB (límite de WhatsApp).`;
      }
      return '';
    };

    const subirArchivo = async (file: File) => {
      const tipo = headerFormato.value;
      if (!tipo || subiendoArchivo.value) return;

      const problema = validarArchivo(file, tipo);
      if (problema) {
        reiniciarSubida();
        subida.fase = 'error';
        subida.error = problema;
        return;
      }

      reiniciarSubida();
      subida.fase = 'subiendo';
      subida.nombre = file.name;
      subida.bytes = file.size;
      form.headerUrl = '';
      subidaAbort = new AbortController();
      iniciarTimerSubida();

      try {
        const r = await api.subirArchivo(
          file,
          tipo,
          (pct) => {
            subida.progreso = pct;
            subida.visual = Math.round(pct * 0.85);
            if (pct >= 100) subida.fase = 'procesando';
          },
          subidaAbort.signal,
        );
        subida.visual = 100;
        subida.fase = 'listo';
        subida.duracion = r.duracion;
        subida.bytes = r.bytes || file.size;
        form.headerUrl = r.url;
        notificar('ok', `Listo: tu ${NOMBRE_TIPO[tipo]} ya está en Cloudinary.`);
      } catch (e) {
        if (subidaAbort?.signal.aborted) {
          reiniciarSubida(); // lo canceló la persona
        } else {
          subida.fase = 'error';
          subida.error = mensajeError(e);
        }
      } finally {
        detenerTimerSubida();
        subidaAbort = undefined;
      }
    };

    const cancelarSubida = () => reiniciarSubida();

    const quitarArchivo = () => {
      reiniciarSubida();
      form.headerUrl = '';
    };

    const alElegirArchivo = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = ''; // permite volver a elegir el mismo archivo
      if (file) void subirArchivo(file);
    };

    const alSoltarArchivo = (e: DragEvent) => {
      subida.arrastrando = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) void subirArchivo(file);
    };

    // ───────── destinatarios desde Excel ─────────
    const destinatariosExcel = ref<IDestinatarioDto[]>([]);
    const excelInfo = ref<{ nombre: string; filas: number; sinTelefono: number; columnas: string[] } | null>(null);
    const excelLeyendo = ref(false);
    const excelError = ref('');
    const excelArrastrando = ref(false);

    const leerExcel = async (file: File) => {
      excelError.value = '';
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
        excelError.value = 'Sube un archivo Excel (.xlsx, .xls) o CSV.';
        return;
      }
      if (file.size > EXCEL_MAX_MB * MB) {
        excelError.value = `El archivo pesa ${formatoTamano(file.size)}; el máximo es ${EXCEL_MAX_MB} MB.`;
        return;
      }

      excelLeyendo.value = true;
      try {
        const XLSX = await import('xlsx'); // se carga solo cuando se usa
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const hoja = wb.Sheets[wb.SheetNames[0]];
        if (!hoja) throw new Error('El Excel no tiene hojas.');

        const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: '', raw: false });
        if (!filas.length) throw new Error('El Excel está vacío (la primera fila debe tener los encabezados).');

        const claves = Object.keys(filas[0]);
        const mapa = claves.map((k) => ({ original: k, norm: normalizarClave(k) }));
        const telCol =
          CLAVES_TELEFONO.map((c) => mapa.find((m) => m.norm === c)).find(Boolean)?.original ?? claves[0];
        const nomCol = CLAVES_NOMBRE.map((c) => mapa.find((m) => m.norm === c && m.original !== telCol)).find(Boolean)
          ?.original;
        const extras = mapa.filter((m) => m.original !== telCol && m.original !== nomCol && m.norm);

        const lista: IDestinatarioDto[] = [];
        let sinTelefono = 0;
        for (const fila of filas) {
          const telefono = String(fila[telCol] ?? '').trim();
          if (!telefono) {
            sinTelefono++;
            continue;
          }
          const nombre = nomCol ? String(fila[nomCol] ?? '').trim() : '';
          const datos: Record<string, string> = {};
          for (const x of extras) {
            const v = String(fila[x.original] ?? '').trim();
            if (v) datos[x.norm] = v;
          }
          lista.push({
            telefono,
            ...(nombre ? { nombre } : {}),
            ...(Object.keys(datos).length ? { datos } : {}),
          });
        }
        if (!lista.length) throw new Error('No encontré teléfonos. Usa una columna llamada "telefono".');

        destinatariosExcel.value = lista;
        excelInfo.value = {
          nombre: file.name,
          filas: lista.length,
          sinTelefono,
          columnas: extras.map((x) => x.norm),
        };
      } catch (e) {
        destinatariosExcel.value = [];
        excelInfo.value = null;
        excelError.value = e instanceof Error ? e.message : 'No se pudo leer el Excel.';
      } finally {
        excelLeyendo.value = false;
      }
    };

    const alElegirExcel = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = '';
      if (file) void leerExcel(file);
    };

    const alSoltarExcel = (e: DragEvent) => {
      excelArrastrando.value = false;
      const file = e.dataTransfer?.files?.[0];
      if (file) void leerExcel(file);
    };

    const quitarExcel = () => {
      destinatariosExcel.value = [];
      excelInfo.value = null;
      excelError.value = '';
    };

    const descargarPlantillaExcel = async () => {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet([
        ['telefono', 'nombre', 'proyecto'],
        ['987654321', 'Ana Ruiz', 'Alameda'],
        ['993796736', 'Gabriel Torres', 'Central 365'],
      ]);
      ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Destinatarios');
      XLSX.writeFile(wb, 'plantilla_destinatarios.xlsx');
    };

    // Ajusta los campos de variables al cambiar de plantilla
    watch(
      () => form.plantilla,
      () => {
        const previos = form.parametros;
        form.parametros = Array.from({ length: numVariables.value }, (_, i) =>
          previos[i] ?? (i === 0 ? '{primer_nombre}' : ''),
        );
        form.headerUrl = '';
        reiniciarSubida();
      },
    );

    /** Cada línea: telefono, nombre, clave=valor, clave=valor... */
    const destinatariosTextoParseados = computed<IDestinatarioDto[]>(() =>
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

    /** Lo del Excel + lo escrito a mano (el backend quita repetidos e inválidos) */
    const destinatariosParseados = computed<IDestinatarioDto[]>(() => [
      ...destinatariosExcel.value,
      ...destinatariosTextoParseados.value,
    ]);

    const formValido = computed(
      () =>
        form.nombre.trim().length > 0 &&
        !!form.plantilla &&
        (!headerFormato.value || form.headerUrl.trim().length > 0) &&
        destinatariosParseados.value.length > 0 &&
        !subiendoArchivo.value &&
        !excelLeyendo.value,
    );

    const resetForm = () => {
      form.nombre = '';
      form.plantilla = '';
      form.parametros = [];
      form.headerUrl = '';
      form.programadaPara = '';
      form.destinatariosTexto = '';
      quitarExcel();
      reiniciarSubida();
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
      subidaAbort?.abort();
      detenerTimerSubida();
    });

    return {
      // helpers de la vista
      ESTADOS_DESTINATARIO, etiqueta, formatoFecha, segmentos, puedeIniciar, puedePausar, puedeCancelar,
      claseChip, claseSegmento, formatoTamano,
      // general
      plantillas, campanias, cargandoLista, guardando, mostrarForm, aviso,
      // formulario
      form, plantillaSel, cuerpo, numVariables, headerFormato, destinatariosParseados, formValido, crear,
      // archivo del header
      subida, subiendoArchivo, aceptaArchivo, nombreTipoHeader, limiteMbHeader, fraseSubida,
      alElegirArchivo, alSoltarArchivo, cancelarSubida, quitarArchivo,
      // excel
      destinatariosExcel, destinatariosTextoParseados, excelInfo, excelLeyendo, excelError, excelArrastrando,
      alElegirExcel, alSoltarExcel, quitarExcel, descargarPlantillaExcel,
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