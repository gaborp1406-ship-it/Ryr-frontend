import { listarOpciones } from "@/modules/clients/actions/clientsContacto.action";
import type { IListarOpcionesResponse } from "@/modules/clients/interfaces/clientscontacto.interface";
import { defineComponent, ref, watch } from "vue";

const ID_LISTADO_MOTIVOS_DESISTIO = 3;

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        close: () => true,
        confirmar: (opcion: IListarOpcionesResponse) => true,
    },
    setup(props, { emit }) {
        const opciones = ref<IListarOpcionesResponse[]>([]);
        const cargando = ref(false);
        const error = ref<string | null>(null);
        
        const idSeleccionado = ref<number | null>(null);
        const procesando = ref(false);
        async function cargarOpciones() {
            cargando.value = true;
            error.value = null;
            try {
                opciones.value = await listarOpciones(ID_LISTADO_MOTIVOS_DESISTIO);
            } catch (e) {
                error.value =
                    e instanceof Error ? e.message : "Error al cargar los motivos.";
            } finally {
                cargando.value = false;
            }
        }

        // Cada vez que se abre el modal, recarga y limpia la selección
        watch(
            () => props.visible,
            (val) => {
                if (val) {
                    idSeleccionado.value = null;
                    cargarOpciones();
                }
            }
        );

        function seleccionar(id: number) {
            idSeleccionado.value = id;
        }

        function cerrar() {
            emit("close");
        }

        async function confirmar() {

            const opcion = opciones.value.find(
                (o) => o.id === idSeleccionado.value
            );

            if (!opcion) return;


            procesando.value = true;

            try {

                await emit("confirmar", opcion);

            } finally {

                procesando.value = false;

            }
        }
        return {
            opciones,
            cargando,
            error,
            idSeleccionado,
            procesando,
            seleccionar,
            cerrar,
            confirmar,
        };
    },
});