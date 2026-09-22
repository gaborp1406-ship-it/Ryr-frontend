import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue';

import { useAuthStore } from '@/modules/auth/stores/auth.store';

import {
  listarEstadosConexion,
  listarEstadoActualTrabajadores,
  historialEstadoTrabajador,
} from '@/modules/estados/actions/estados.actions';

import type {
  IEstadoConexion,
  IEstadoActualTrabajador,
  IHistorialEstadoTrabajador,
} from '@/modules/estados/interfaces/estados.interface';

import ExcelJS from "exceljs";
import type { IListarAsesoresResponse } from '@/modules/clients/interfaces/clients.interface';
import { listarAsesores } from '@/modules/clients/actions/clients.action';

export default defineComponent({
  setup() {
    const authStore = useAuthStore();

    const estados = ref<IEstadoConexion[]>([]);
    const asesores = ref<IEstadoActualTrabajador[]>([]);

    const isLoadingAsesores = ref(false);
    const isLoadingHistorial = ref(false);
    const isExportando = ref(false);

    // Filtro de tarjetas superiores
    const filtroEstado = ref<number | null>(null);

    // Historial (panel "Ver historial" de un asesor puntual)
    const historial = ref<IHistorialEstadoTrabajador[]>([]);

    const asesorSeleccionado =
      ref<IEstadoActualTrabajador | null>(null);


    const mostrarModalExportar = ref(false);

    const asesoresExportacion =
      ref<IListarAsesoresResponse[]>([]);

    const isLoadingAsesoresExportacion = ref(false);

    // Filtros EXCLUSIVOS para Excel
    const exportFiltroTrabajador = ref<number | null>(null);
    const exportFiltroEstado = ref<number | null>(null);
    const exportFechaDesde = ref('');
    const exportFechaHasta = ref('');
    const filtroTrabajador = ref<number | null>(null);
    const filtroHistorialEstado = ref<number | null>(null);
    const filtroFechaDesde = ref('');
    const filtroFechaHasta = ref('');

    // Paginación del panel en pantalla
    const paginaActual = ref(1);
    const registrosPorPagina = ref(10);

    const now = ref(Date.now());

    let intervalId: number | undefined;

    function parseLimaTimestampToMs(fecha: string): number {
      if (!fecha || typeof fecha !== 'string') {
        return Date.now();
      }

      const match = fecha.match(
        /(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/,
      );

      if (!match) {
        console.warn('Formato de fecha no reconocido:', fecha);
        return Date.now();
      }

      const [
        ,
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr,
      ] = match;

      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const second = parseInt(secondStr, 10);

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hour) ||
        isNaN(minute) ||
        isNaN(second)
      ) {
        return Date.now();
      }

      const utcMs = Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
        second,
      );

      return utcMs + 5 * 60 * 60 * 1000;
    }
    async function abrirModalExportar() {
      // Limpiar filtros anteriores
      exportFiltroTrabajador.value = null;
      exportFiltroEstado.value = null;
      exportFechaDesde.value = '';
      exportFechaHasta.value = '';

      mostrarModalExportar.value = true;

      // Cargar asesores
      if (asesoresExportacion.value.length === 0) {
        isLoadingAsesoresExportacion.value = true;

        try {
          asesoresExportacion.value =
            await listarAsesores();
        } catch (error) {
          console.error(
            'Error al cargar asesores para exportación:',
            error,
          );
        } finally {
          isLoadingAsesoresExportacion.value = false;
        }
      }
    }

    function cerrarModalExportar() {
      if (isExportando.value) return;

      mostrarModalExportar.value = false;
    }
    function formatDuration(ms: number): string {
      const total = Math.max(0, Math.floor(ms / 1000));

      const dias = Math.floor(total / 86400);
      const horas = Math.floor((total % 86400) / 3600);
      const minutos = Math.floor((total % 3600) / 60);
      const segundos = total % 60;

      if (dias > 0) {
        return `${dias}d ${horas}h ${minutos}m`;
      }

      if (horas > 0) {
        return `${horas}h ${minutos}m ${segundos}s`;
      }

      if (minutos > 0) {
        return `${minutos}m ${segundos}s`;
      }

      return `${segundos}s`;
    }

    function formatFecha(fecha: string | null): string {
      if (!fecha) return '—';

      try {
        const ms = parseLimaTimestampToMs(fecha);

        if (isNaN(ms)) return 'Invalid Date';

        const date = new Date(ms);

        return new Intl.DateTimeFormat('es-PE', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'America/Lima',
        }).format(date);
      } catch (error) {
        console.error(
          'Error formateando fecha:',
          fecha,
          error,
        );

        return 'Invalid Date';
      }
    }

    function tiempoEnVivo(fechaInicio: string): string {
      try {
        const inicio = parseLimaTimestampToMs(fechaInicio);

        if (isNaN(inicio)) return '—';

        return formatDuration(now.value - inicio);
      } catch {
        return '—';
      }
    }

    function tiempoHistorial(
      item: IHistorialEstadoTrabajador,
    ): string {
      try {
        const inicio = parseLimaTimestampToMs(
          item.fecha_inicio,
        );

        const fin = item.fecha_fin
          ? parseLimaTimestampToMs(item.fecha_fin)
          : now.value;

        if (isNaN(inicio) || isNaN(fin)) {
          return '—';
        }

        return formatDuration(fin - inicio);
      } catch {
        return '—';
      }
    }

    const asesoresFiltrados = computed(() => {
      if (!filtroEstado.value) {
        return asesores.value;
      }

      return asesores.value.filter(
        (a) => a.id_estado === filtroEstado.value,
      );
    });

    const conteoPorEstado = computed(() => {
      const mapa = new Map<number, number>();

      asesores.value.forEach((a) => {
        mapa.set(
          a.id_estado,
          (mapa.get(a.id_estado) ?? 0) + 1,
        );
      });

      return mapa;
    });

    /*
     * Historial filtrado — SOLO para el panel "Ver historial" en pantalla.
     * La exportación a Excel NO usa esto: pide su propia data sin filtros.
     */
    const historialFiltrado = computed(() => {
      return historial.value.filter((item) => {
        if (
          filtroTrabajador.value !== null &&
          item.id_trabajador !== filtroTrabajador.value
        ) {
          return false;
        }

        if (
          filtroHistorialEstado.value !== null &&
          item.id_estado !== filtroHistorialEstado.value
        ) {
          return false;
        }

        return true;
      });
    });

    const totalPaginas = computed(() => {
      return Math.max(
        1,
        Math.ceil(
          historialFiltrado.value.length /
          registrosPorPagina.value,
        ),
      );
    });

    const historialPaginado = computed(() => {
      const inicio =
        (paginaActual.value - 1) *
        registrosPorPagina.value;

      const fin =
        inicio + registrosPorPagina.value;

      return historialFiltrado.value.slice(inicio, fin);
    });

    const paginasVisibles = computed(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;

      if (total <= 7) {
        return Array.from(
          { length: total },
          (_, index) => index + 1,
        );
      }

      if (actual <= 4) {
        return [1, 2, 3, 4, 5, -1, total];
      }

      if (actual >= total - 3) {
        return [
          1,
          -1,
          total - 4,
          total - 3,
          total - 2,
          total - 1,
          total,
        ];
      }

      return [
        1,
        -1,
        actual - 1,
        actual,
        actual + 1,
        -1,
        total,
      ];
    });

    function cambiarPagina(pagina: number) {
      if (
        pagina < 1 ||
        pagina > totalPaginas.value
      ) {
        return;
      }

      paginaActual.value = pagina;
    }

    function siguientePagina() {
      if (paginaActual.value < totalPaginas.value) {
        paginaActual.value++;
      }
    }

    function anteriorPagina() {
      if (paginaActual.value > 1) {
        paginaActual.value--;
      }
    }

    function cambiarRegistrosPorPagina() {
      paginaActual.value = 1;
    }

    async function cargarEstados() {
      try {
        estados.value =
          await listarEstadosConexion();
      } catch (error) {
        console.error(
          'Error al cargar estados de conexión:',
          error,
        );
      }
    }

    async function cargarAsesores() {
      isLoadingAsesores.value = true;

      try {
        asesores.value =
          await listarEstadoActualTrabajadores();

        if (asesorSeleccionado.value) {
          await cargarHistorial();
        }
      } catch (error) {
        console.error(
          'Error al cargar el estado actual de los asesores:',
          error,
        );
      } finally {
        isLoadingAsesores.value = false;
      }
    }

    async function cargarHistorial() {
      isLoadingHistorial.value = true;

      try {
        historial.value =
          await historialEstadoTrabajador({
            id_trabajador:
              filtroTrabajador.value ??
              asesorSeleccionado.value?.id_trabajador ??
              undefined,

            id_estado:
              filtroHistorialEstado.value ??
              undefined,

            fecha_desde:
              filtroFechaDesde.value ||
              undefined,

            fecha_hasta:
              filtroFechaHasta.value ||
              undefined,
          });

        paginaActual.value = 1;
      } catch (error) {
        console.error(
          'Error al cargar el historial:',
          error,
        );
      } finally {
        isLoadingHistorial.value = false;
      }
    }

    function verHistorial(
      asesor: IEstadoActualTrabajador,
    ) {
      asesorSeleccionado.value = asesor;

      filtroTrabajador.value =
        asesor.id_trabajador;

      filtroHistorialEstado.value = null;
      filtroFechaDesde.value = '';
      filtroFechaHasta.value = '';

      cargarHistorial();

      requestAnimationFrame(() => {
        document
          .getElementById('panel-historial')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      });
    }

    function cerrarHistorial() {
      asesorSeleccionado.value = null;
      filtroTrabajador.value = null;
      historial.value = [];
      paginaActual.value = 1;
    }

    function limpiarFiltrosHistorial() {
      filtroTrabajador.value = null;
      filtroHistorialEstado.value = null;
      filtroFechaDesde.value = '';
      filtroFechaHasta.value = '';

      asesorSeleccionado.value = null;

      cargarHistorial();
    }


    function sanitizarNombreHoja(
      nombre: string,
      index: number,
    ): string {
      const limpio = (nombre || `Estado ${index + 1}`)
        .replace(/[\\/?*[\]]/g, '')
        .trim()
        .slice(0, 31);

      return limpio || `Estado ${index + 1}`;
    }



    async function exportarExcel() {
      if (isExportando.value) return;

      isExportando.value = true;

      try {
        // =========================================================
        // 1. OBTENER TODO EL HISTORIAL
        // =========================================================

        const datosCompletos =
          await historialEstadoTrabajador({
            id_trabajador:
              exportFiltroTrabajador.value ?? undefined,

            id_estado:
              exportFiltroEstado.value ?? undefined,

            fecha_desde:
              exportFechaDesde.value || undefined,

            fecha_hasta:
              exportFechaHasta.value || undefined,
          });
        if (!datosCompletos.length) {
          console.warn("No hay historial para exportar.");
          return;
        }

        // =========================================================
        // 2. CREAR WORKBOOK
        // =========================================================

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "RYR";
        workbook.lastModifiedBy = "RYR";
        workbook.created = new Date();
        workbook.modified = new Date();

        // =========================================================
        // 3. COLORES
        // =========================================================

        const COLORES = {
          verde: "2D8C4A",
          verdeOscuro: "1F6B39",
          verdeClaro: "DCFCE7",

          rojo: "DC2626",
          rojoClaro: "FEE2E2",

          naranja: "EA580C",
          naranjaClaro: "FFEDD5",

          amarillo: "D97706",
          amarilloClaro: "FEF3C7",

          celeste: "0284C7",
          celesteClaro: "E0F2FE",

          gris: "64748B",
          grisClaro: "F1F5F9",

          borde: "D1D5DB",
          blanco: "FFFFFF",

          texto: "1F2937",
        };

        // =========================================================
        // 4. ESTILO DEL ENCABEZADO
        // =========================================================

        function estilizarEncabezado(
          worksheet: ExcelJS.Worksheet,
        ) {
          const headerRow = worksheet.getRow(1);

          headerRow.height = 30;

          headerRow.eachCell((cell) => {
            cell.font = {
              bold: true,
              color: {
                argb: COLORES.blanco,
              },
              size: 11,
            };

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: {
                argb: COLORES.verde,
              },
            };

            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };

            cell.border = {
              top: {
                style: "thin",
                color: {
                  argb: COLORES.verdeOscuro,
                },
              },
              bottom: {
                style: "thin",
                color: {
                  argb: COLORES.verdeOscuro,
                },
              },
              left: {
                style: "thin",
                color: {
                  argb: COLORES.verdeOscuro,
                },
              },
              right: {
                style: "thin",
                color: {
                  argb: COLORES.verdeOscuro,
                },
              },
            };
          });
        }

        // =========================================================
        // 5. ESTILO GENERAL DE CELDAS
        // =========================================================

        function estilizarFilas(
          worksheet: ExcelJS.Worksheet,
          columnasFecha: number[],
        ) {
          worksheet.eachRow(
            (row, rowNumber) => {
              if (rowNumber === 1) return;

              const esFilaPar =
                rowNumber % 2 === 0;

              row.height = 24;

              row.eachCell(
                (cell, colNumber) => {
                  cell.font = {
                    color: {
                      argb: COLORES.texto,
                    },
                    size: 10,
                  };

                  cell.alignment = {
                    vertical: "middle",
                  };

                  cell.border = {
                    top: {
                      style: "thin",
                      color: {
                        argb: COLORES.borde,
                      },
                    },
                    bottom: {
                      style: "thin",
                      color: {
                        argb: COLORES.borde,
                      },
                    },
                    left: {
                      style: "thin",
                      color: {
                        argb: COLORES.borde,
                      },
                    },
                    right: {
                      style: "thin",
                      color: {
                        argb: COLORES.borde,
                      },
                    },
                  };

                  // Filas alternadas
                  if (esFilaPar) {
                    cell.fill = {
                      type: "pattern",
                      pattern: "solid",
                      fgColor: {
                        argb: "F8FAFC",
                      },
                    };
                  }

                  // Fechas
                  if (
                    columnasFecha.includes(
                      colNumber,
                    )
                  ) {
                    cell.numFmt =
                      "dd/mm/yyyy hh:mm:ss";

                    cell.alignment = {
                      horizontal: "center",
                      vertical: "middle",
                    };
                  }
                },
              );
            },
          );
        }

        // =========================================================
        // 6. COLORES DE ESTADO
        // =========================================================

        function colorearEstado(
          cell: ExcelJS.Cell,
        ) {
          if (!cell.value) return;

          const estado = String(
            cell.value,
          ).toLowerCase();

          let fondo = COLORES.grisClaro;
          let texto = COLORES.gris;

          if (
            estado.includes("activo") &&
            !estado.includes("no ac")
          ) {
            fondo = COLORES.verdeClaro;
            texto = "166534";
          } else if (
            estado.includes("descanso") ||
            estado.includes("desconectado")
          ) {
            fondo = COLORES.rojoClaro;
            texto = "991B1B";
          } else if (
            estado.includes("ocupado")
          ) {
            fondo = COLORES.naranjaClaro;
            texto = "9A3412";
          } else if (
            estado.includes("almuerzo")
          ) {
            fondo = COLORES.amarilloClaro;
            texto = "92400E";
          } else if (
            estado.includes("no ac")
          ) {
            fondo = COLORES.celesteClaro;
            texto = "075985";
          }

          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: fondo,
            },
          };

          cell.font = {
            bold: true,
            color: {
              argb: texto,
            },
            size: 10,
          };

          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        }

        // =========================================================
        // 7. CREAR HOJA GENERAL
        // =========================================================

        const hojaGeneral =
          workbook.addWorksheet("General");

        hojaGeneral.columns = [
          {
            header: "Trabajador",
            key: "trabajador",
            width: 32,
          },
          {
            header: "Estado",
            key: "estado",
            width: 24,
          },
          {
            header: "Fecha inicio",
            key: "fecha_inicio",
            width: 24,
          },
          {
            header: "Fecha fin",
            key: "fecha_fin",
            width: 24,
          },
        ];

        // =========================================================
        // 8. AGREGAR DATOS
        // =========================================================

        datosCompletos.forEach((item) => {
          hojaGeneral.addRow({
            trabajador: item.nombre,
            estado: item.estado_conexion,

            fecha_inicio: item.fecha_inicio
              ? new Date(
                item.fecha_inicio.replace(
                  " ",
                  "T",
                ),
              )
              : null,

            fecha_fin: item.fecha_fin
              ? new Date(
                item.fecha_fin.replace(
                  " ",
                  "T",
                ),
              )
              : null,
          });
        });

        // =========================================================
        // 9. ESTILIZAR GENERAL
        // =========================================================

        estilizarEncabezado(
          hojaGeneral,
        );

        estilizarFilas(
          hojaGeneral,
          [3, 4],
        );

        // Columna estado
        hojaGeneral
          .getColumn(2)
          .eachCell(
            (cell, rowNumber) => {
              if (rowNumber > 1) {
                colorearEstado(cell);
              }
            },
          );

        // =========================================================
        // 10. FILTRO
        // =========================================================

        hojaGeneral.autoFilter = {
          from: "A1",
          to: `D${datosCompletos.length + 1
            }`,
        };

        // =========================================================
        // 11. CONGELAR ENCABEZADO
        // =========================================================

        hojaGeneral.views = [
          {
            state: "frozen",
            ySplit: 1,
            showGridLines: false,
          },
        ];


        // =========================================================
        // 13. HOJAS POR ESTADO
        // =========================================================

        const estadosUnicos =
          Array.from(
            new Set(
              datosCompletos.map(
                (item) =>
                  item.estado_conexion,
              ),
            ),
          );

        estadosUnicos.forEach(
          (estado, index) => {
            const registros =
              datosCompletos.filter(
                (item) =>
                  item.estado_conexion ===
                  estado,
              );

            const nombreHoja =
              sanitizarNombreHoja(
                estado,
                index,
              );

            const hoja =
              workbook.addWorksheet(
                nombreHoja,
              );

            // -----------------------------------------------------
            // Columnas
            // -----------------------------------------------------

            hoja.columns = [
              {
                header: "Trabajador",
                key: "trabajador",
                width: 32,
              },
              {
                header: "Fecha inicio",
                key: "fecha_inicio",
                width: 24,
              },
              {
                header: "Fecha fin",
                key: "fecha_fin",
                width: 24,
              },
            ];

            // -----------------------------------------------------
            // Datos
            // -----------------------------------------------------

            registros.forEach((item) => {
              hoja.addRow({
                trabajador: item.nombre,

                fecha_inicio:
                  item.fecha_inicio
                    ? new Date(
                      item.fecha_inicio.replace(
                        " ",
                        "T",
                      ),
                    )
                    : null,

                fecha_fin: item.fecha_fin
                  ? new Date(
                    item.fecha_fin.replace(
                      " ",
                      "T",
                    ),
                  )
                  : null,
              });
            });

            // -----------------------------------------------------
            // Estilos
            // -----------------------------------------------------

            estilizarEncabezado(hoja);

            estilizarFilas(
              hoja,
              [2, 3],
            );

            // -----------------------------------------------------
            // Filtro
            // -----------------------------------------------------

            hoja.autoFilter = {
              from: "A1",
              to: `C${registros.length + 1
                }`,
            };

            // -----------------------------------------------------
            // Congelar encabezado
            // -----------------------------------------------------

            hoja.views = [
              {
                state: "frozen",
                ySplit: 1,
                showGridLines: false,
              },
            ];

            // -----------------------------------------------------
            // Tabla
            // -----------------------------------------------------


          },
        );

        // =========================================================
        // 14. EXPORTAR
        // =========================================================

        const fecha = new Date()
          .toISOString()
          .slice(0, 10);

        const buffer =
          await workbook.xlsx.writeBuffer();

        const blob = new Blob(
          [buffer],
          {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        );

        const url =
          window.URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          `historial_conexiones_${fecha}.xlsx`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(
          "Error al exportar Excel:",
          error,
        );
      } finally {
        isExportando.value = false;
      }
    }



    onMounted(() => {
      cargarEstados();
      cargarAsesores();

      intervalId = window.setInterval(() => {
        now.value = Date.now();
      }, 1000);
    });

    onBeforeUnmount(() => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    });

    return {
      authStore,
      estados,
      asesores,
      asesoresFiltrados,
      conteoPorEstado,
      isLoadingAsesores,
      isLoadingHistorial,
      isExportando,
      filtroEstado,
      asesorSeleccionado,
      historial,
      historialFiltrado,
      historialPaginado,
      filtroTrabajador,
      filtroHistorialEstado,
      filtroFechaDesde,
      filtroFechaHasta,
      paginaActual,
      totalPaginas,
      paginasVisibles,
      registrosPorPagina,
      tiempoEnVivo,
      tiempoHistorial,
      formatFecha,
      cargarAsesores,
      cargarHistorial,
      verHistorial,
      cerrarHistorial,
      limpiarFiltrosHistorial,
      cambiarPagina,
      siguientePagina,
      mostrarModalExportar,
      asesoresExportacion,
      isLoadingAsesoresExportacion,

      exportFiltroTrabajador,
      exportFiltroEstado,
      exportFechaDesde,
      exportFechaHasta,

      abrirModalExportar,
      cerrarModalExportar,
      anteriorPagina,
      cambiarRegistrosPorPagina,
      exportarExcel,
    };
  },
});