# Guía de Relación de Datos: Evaluación del Postulante

Este documento detalla cómo se conectan los datos provenientes de la API con la interfaz visual en el componente `PostulanteWizardModal.vue`.

## 1. Fuente de Datos
La estructura principal se define en la interfaz `PostulanteDetalle` (archivo: `get-postulante-detalle.action.ts`).
El objeto reactivo principal en el componente es `data`.

## 2. Datos del Postulante (Perfil)
Estos datos se acceden a través de `data.postulante`.

| Sección Visual | Dato Mostrado | Propiedad en Código | Notas |
|---|---|---|---|
| **Cabecera / Avatar** | Iniciales | *Computado* `initials` | Se deriva de `nombres` y `apellidos`. |
| **Cabecera / Título** | Nombre Completo | `data.postulante.nombres`<br>`data.postulante.apellidos` | Se concatenan en el título principal. |
| **Cabecera / Badges** | Correo | `data.postulante.correo` | Icono de sobre. |
| **Cabecera / Badges** | DNI / Documento | `data.postulante.numero_documento` | Icono de tarjeta. |
| **Cabecera / Badges** | Fecha Registro | `data.postulante.created_at` | Formateado por función `formatDate`. |
| **Barra Lateral (Right)** | Match % | `data.postulante.puntaje_total_kpi` | Se redondea con `Math.round()`. |
| **Barra Lateral (Right)** | Barra de Progreso | `data.postulante.puntaje_total_kpi` | Controla el `width` en % y el color (`getProgressColor`). |
| **Detalles (Col 1)** | Nombres | `data.postulante.nombres` | |
| **Detalles (Col 1)** | Apellidos | `data.postulante.apellidos` | |
| **Detalles (Col 1)** | ID Oferta | `data.postulante.id_oferta_laboral` | ID de referencia del trabajo. |
| **Detalles (Col 1)** | Doc. ID | `data.postulante.numero_documento` | |
| **Detalles (Col 2)** | Email | `data.postulante.correo` | |
| **Detalles (Col 2)** | Teléfono | `data.postulante.celular` | |
| **Detalles (Col 2)** | Fecha | `data.postulante.created_at` | |

## 3. Respuestas a Killer Questions (Cuestionario)
Estos datos son un array accesible a través de `data.kpi`. Se iteran en la sección "Cuestionario" usando `v-for="(kpi, i) in data.kpi"`.

| Elemento Visual | Propiedad del Objeto (`kpi`) | Lógica Visual / Clase CSS |
|---|---|---|
| **Pregunta** | `kpi.pregunta_texto` | Texto en negrita. |
| **Etiqueta (Tag)** | `kpi.meta.tipo` | Si es `'killer'` usa rojo (`text-red-500`), si no azul. |
| **Respuesta** | `kpi.respuesta_texto` | Borde izquierdo de color según el puntaje (`getAnswerBorderColor`). |
| **Puntaje** | `kpi.puntaje_obtenido` | Muestra los puntos ganados por esa respuesta específica. |

### Lógica de Colores (Respuestas)
La función `getAnswerBorderColor(kpi)` determina el color del borde de la respuesta basándose en el porcentaje de acierto de esa pregunta específica:
- ✅ **Verde**: 100% de acierto.
- ⚠️ **Amarillo**: > 0% (acierto parcial).
- ❌ **Rojo**: 0% o pregunta killer fallada.
- ⚪ **Gris**: Si la pregunta no tenía puntaje máximo asignado (informativa).

## 4. Archivos Adjuntos
Accesibles a través de `data.archivos`.

| Elemento | Acción | Propiedad |
|---|---|---|
| **Botón Descarga** | `downloadFile(file)` | `file.id`, `file.nombre` |

## 5. Origen de Datos (Backend Logic)

La información es servida por el método `getDetallePostulante(postulanteId)` en `NewFormPostulantesService` (NestJS), que orquesta consultas a múltiples tablas de PostgreSQL para construir un objeto unificado.

### Esquema de Base de Datos
Las principales tablas consultadas son:
- **`public.rrhh_postulante_datos`**: Fuente del objeto `postulante`. Contiene la información demográfica, de contacto y el puntaje global (`puntaje_total_kpi`).
- **`public.rrhh_postulante_kpi`**: Almacena las respuestas específicas que dio el postulante.
- **`public.rrhh_oferta_killer_questions`** y **`public.rrhh_killer_questions`**: Definen la estructura "ideal" del cuestionario para la oferta laboral asociada.
- **`public.rrhh_postulante_archivo`**: Metadatos de los adjuntos. (El contenido binario se sirve en un endpoint separado `/archivo/:id` para no sobrecargar la respuesta JSON).

### Lógica de Reconstrucción de Respuestas (Smart Mapping)
El backend no se limita a devolver las filas de la tabla de respuestas (`rrhh_postulante_kpi`), sino que realiza un proceso de enriquecimiento para garantizar consistencia visual:

1.  **Recuperación de Estructura**: Obtiene todas las preguntas configuradas para esa oferta laboral (`ofertaId`).
2.  **Mapeo de Respuestas**: Intenta alinear cada pregunta de la oferta con una respuesta del postulante.
    - Prioridad 1: Coincidencia por `id_pregunta`.
    - Prioridad 2: Coincidencia por texto exacto de la pregunta.
    - Prioridad 3: Coincidencia por texto normalizado (sin acentos, minúsculas).
3.  **Inferencia de Texto Legible**:
    - Si la respuesta guardada es un ID numérico (ej. "45"), el backend busca en la tabla de opciones (`rrhh_killer_question_options`) para devolver el texto real (ej. "Nivel Avanzado").
    - Si falta el texto pero hay puntaje positivo, se intenta deducir la respuesta buscando qué opción otorga exactamente ese puntaje.

Este proceso asegura que el frontend siempre reciba `pregunta_texto` y `respuesta_texto` legibles, incluso si internamente se guardaron como referencias numéricas.
| **Botón Descarga** | `downloadFile(file)` | `file.id`, `file.nombre` |
