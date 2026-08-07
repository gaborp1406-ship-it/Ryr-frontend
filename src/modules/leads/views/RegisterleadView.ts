import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import type { IAsesor, ILeadDiario, IListarOpcionesResponse, IListarProyectoResponse } from '../interfaces/lead.interface';
import { crearLead, listarAsesores, listarLeadsDiarios, listarOpciones, listarProyectos } from '../actions/lead.action';

export default defineComponent({
  setup() {
    const toast = useToast();
    const authStore = useAuthStore();

    const search = ref('');
    const opcionesFuente = ref<IListarOpcionesResponse[]>([]);
    const proyectos = ref<IListarProyectoResponse[]>([]);
    const asesores = ref<IAsesor[]>([]);
    const totalHoy = ref(0);
    const asesorSeleccionado = ref<number | null>(null);
    const leads = ref<ILeadDiario[]>([]);
    const cargando = ref(true);
    const guardando = ref(false);

    // ================= PAGINACIÓN =================
    const itemsPorPagina = 7;
    const paginaActual = ref(1);

    // leads filtrados por búsqueda (si el usuario escribe en el buscador)
    const leadsFiltrados = computed(() => {
      const termino = search.value.trim().toLowerCase();

      if (!termino) {
        return leads.value;
      }

      return leads.value.filter((lead) => {
        return (
          lead.nombre_cliente?.toLowerCase().includes(termino) ||
          lead.dni_cliente?.toLowerCase().includes(termino) ||
          lead.telefono_cliente?.toLowerCase().includes(termino) ||
          lead.asesor?.toLowerCase().includes(termino) ||
          lead.proyecto?.toLowerCase().includes(termino) ||
          lead.fuente?.toLowerCase().includes(termino)
        );
      });
    });

    const totalPaginas = computed(() => {
      return Math.max(1, Math.ceil(leadsFiltrados.value.length / itemsPorPagina));
    });

    const leadsPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * itemsPorPagina;
      return leadsFiltrados.value.slice(inicio, inicio + itemsPorPagina);
    });

    // genera el arreglo de páginas a mostrar: 1 2 3 ... N (con elipsis)
    const paginasVisibles = computed(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;
      const paginas: (number | string)[] = [];

      if (total <= 5) {
        for (let i = 1; i <= total; i++) paginas.push(i);
        return paginas;
      }

      paginas.push(1);

      if (actual > 3) {
        paginas.push('...');
      }

      const inicioRango = Math.max(2, actual - 1);
      const finRango = Math.min(total - 1, actual + 1);

      for (let i = inicioRango; i <= finRango; i++) {
        paginas.push(i);
      }

      if (actual < total - 2) {
        paginas.push('...');
      }

      paginas.push(total);

      return paginas;
    });

    const irAPagina = (pagina: number | string) => {
      if (typeof pagina !== 'number') return;
      paginaActual.value = pagina;
    };

    const irPaginaAnterior = () => {
      if (paginaActual.value > 1) {
        paginaActual.value--;
      }
    };

    const irPaginaSiguiente = () => {
      if (paginaActual.value < totalPaginas.value) {
        paginaActual.value++;
      }
    };
    // ================================================

    const cargarLeads = async () => {
      if (!authStore.idEmploye) {
        toast.error('No se encontró el trabajador de la sesión');
        return;
      }

      cargando.value = true;

      try {
        leads.value = await listarLeadsDiarios(authStore.idEmploye);
        totalHoy.value = leads.value.length;
        paginaActual.value = 1;
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        cargando.value = false;
      }
    };

    const asesorActual = ref('');

    const cargarAsesores = async () => {
      if (!authStore.idEmploye) {
        toast.error('No se encontró el trabajador de la sesión');
        return;
      }

      try {
        asesores.value = await listarAsesores(authStore.idEmploye);

        const asesorDisponible = asesores.value[0];

        asesorSeleccionado.value =
          asesorDisponible?.id_asesor ?? null;

        asesorActual.value =
          asesorDisponible?.nombre ?? 'Sin asesor asignado';

      } catch (error: any) {
        toast.error(error.message);
      }
    };

    const nuevoLead = reactive({
      proyecto: '',
      nombre: '',
      dni: '',
      telefono: '',
      fuente: '',
    });

    const fechaHoy = computed(() => {
      return new Date().toLocaleDateString('es-PE');
    });

    const fechaActual = computed(() => {
      return new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    });

    onMounted(async () => {
      try {

        const [
          opciones,
          proyectosData
        ] = await Promise.all([
          listarOpciones(1),
          listarProyectos(1),
        ]);


        opcionesFuente.value = opciones;
        proyectos.value = proyectosData;


        await cargarAsesores();
        await cargarLeads();


      } catch (error: any) {

        toast.error(error.message);

      }
    });


    const guardarLead = async () => {

      if (guardando.value) {
        return;
      }

      try {


        if (!asesorSeleccionado.value) {
          toast.warning('No hay asesor disponible');
          return;
        }


        if (!nuevoLead.proyecto) {
          toast.warning('Seleccione un proyecto');
          return;
        }


        if (!nuevoLead.nombre) {
          toast.warning('Ingrese nombre del cliente');
          return;
        }


        if (!nuevoLead.telefono) {
          toast.warning('Ingrese teléfono');
          return;
        }
        if (!authStore.idEmploye) {
          toast.error('No se encontró el usuario de sesión');
          return;
        }

        guardando.value = true;

        const payload = {

          id_asesor: asesorSeleccionado.value,

          id_proyecto: Number(nuevoLead.proyecto),

          nombre_cliente: nuevoLead.nombre,

          dni_cliente: nuevoLead.dni,

          telefono_cliente: nuevoLead.telefono,

          id_fuente: Number(nuevoLead.fuente),

          usuario_creacion: authStore.idEmploye,

        };


        console.log('Payload crear lead:', payload);


        const response = await crearLead(payload);



        toast.success(
          'Lead creado correctamente'
        );


        console.log(
          'Respuesta:',
          response
        );



        nuevoLead.proyecto = '';
        nuevoLead.nombre = '';
        nuevoLead.dni = '';
        nuevoLead.telefono = '';
        nuevoLead.fuente = '';



        await cargarLeads();
        await cargarAsesores();



      } catch (error: any) {

        toast.error(
          error.message ?? 'Error al crear lead'
        );

      } finally {

        guardando.value = false;

      }

    };


    const editarLead = (lead: ILeadDiario) => {
      console.log('Editar lead:', lead);

      // aquí luego abrirás modal o modo edición
    };


    return {
      toast,
      authStore,
      asesorSeleccionado,
      search,

      totalHoy,

      asesorActual,

      leads,
      cargando,
      guardando,

      nuevoLead,
      opcionesFuente,
      proyectos,

      fechaHoy,

      fechaActual,

      guardarLead,
      editarLead,

      // paginación
      leadsPaginados,
      paginaActual,
      totalPaginas,
      paginasVisibles,
      irAPagina,
      irPaginaAnterior,
      irPaginaSiguiente,
    };
  },
});