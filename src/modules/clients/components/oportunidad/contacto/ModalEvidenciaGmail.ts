import { registrarCorreoReunion } from "@/modules/clients/actions/clients.atencion.action";
import { defineComponent, ref } from "vue";

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        idEstadoReunion: {
            type: Number,
            required: true
        }
    },
    emits: {
        close: () => true,
        guardar: () => true, 
    },

    setup(props, { emit }) {
        const archivoEmailSeleccionado = ref<File | null>(null);
        const archivoEmailPreview = ref<string | null>(null);
        const descripcionEmail = ref("");
        const archivoEmailBase64 = ref<string | null>(null);
        const guardandoEmail = ref(false);
        const errorEmail = ref<string | null>(null);

        function cerrarModalEmail() {
            archivoEmailSeleccionado.value = null;
            descripcionEmail.value = "";
            archivoEmailBase64.value = null;
            errorEmail.value = null;

            if (archivoEmailPreview.value) {
                URL.revokeObjectURL(archivoEmailPreview.value);
            }

            archivoEmailPreview.value = null;

            emit("close");
        }

        function onArchivoEmailSeleccionado(e: Event) {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            // validar tamaño opcional 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert("El archivo no puede superar los 5MB");
                return;
            }

            archivoEmailSeleccionado.value = file;

            if (archivoEmailPreview.value) {
                URL.revokeObjectURL(archivoEmailPreview.value);
            }

            archivoEmailPreview.value = URL.createObjectURL(file);

            const reader = new FileReader();

            reader.onload = () => {
                archivoEmailBase64.value = reader.result as string;
            };

            reader.readAsDataURL(file);
        }

        async function guardarEvidenciaEmail() {
            if (!archivoEmailSeleccionado.value || !archivoEmailBase64.value) return;

            guardandoEmail.value = true;
            errorEmail.value = null;

            try {
                await registrarCorreoReunion({
                    id_estado_reunion: props.idEstadoReunion,
                    url_evidencia: archivoEmailBase64.value,
                    mensaje: descripcionEmail.value.trim() || undefined,
                    tipo_historial: 21,
                });
                emit("guardar");

                cerrarModalEmail();
            } catch (error) {
                console.error("Error guardando evidencia correo", error);
                errorEmail.value = "No se pudo guardar la evidencia. Intenta de nuevo.";
            } finally {
                guardandoEmail.value = false;
            }
        }

        return {
            archivoEmailPreview,
            descripcionEmail,
            guardandoEmail,
            errorEmail,
            cerrarModalEmail,
            onArchivoEmailSeleccionado,
            guardarEvidenciaEmail,
        };
    },
});