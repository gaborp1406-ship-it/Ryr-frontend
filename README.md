# automatizate-admin

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev

## API Nest (Producción)

Este frontend consume endpoints bajo `/ofertas-laborales-back/*`.

Tienes 2 opciones para producción:

1) **API en otro dominio (recomendado)**
- Define `VITE_API_URL_NEST` al construir/deployar (ej: `https://api.tu-dominio.com/`).
- El frontend llamará directo a esa URL.

2) **Mismo dominio (reverse proxy)**
- No definas `VITE_API_URL_NEST` (vacío).
- El frontend llamará same-origin a `/ofertas-laborales-back/*`.
- Tu servidor web (Nginx/Apache/Ingress) debe proxyear ese path hacia tu Nest.

En desarrollo, Vite ya proxyea `/ofertas-laborales-back` hacia `VITE_API_URL_NEST` (o `http://localhost:3000/` si no existe).
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## CV Download — Detalle Postulante

El CRM permite descargar los CVs de postulantes directamente desde la vista de detalle.

### Flujo de descarga

1. `DetallePostulanteView.vue` llama a `GET /new-form-postulantes/postulantes/:id`
2. La respuesta incluye `archivos[]` con campo `url` (URL pública de Supabase)
3. Al hacer clic en "Descargar":
   - **Si `archivo.url` existe** → `window.open(url, '_blank')` (descarga directa desde Supabase)
   - **Fallback (archivos legacy sin URL)** → `GET /new-form-postulantes/postulantes/archivo/:fileId` descarga el binario desde la DB como blob

### Archivos involucrados

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/modules/rrhh/views/ofertas_laborales/DetallePostulanteView.vue` | Vista con botón de descarga, ícono por tipo, tamaño formateado |
| `src/modules/rrhh/actions/ofertas_laborales/get-postulante-detalle.action.ts` | Interfaz `PostulanteArchivo` (incluye `url?: string \| null`) |
| `src/api/automatizateApiNest.ts` | Cliente Axios para el fallback binario |

### Troubleshooting: PDF descargado sale con 0 bytes / corrupto

**Causa más probable:** El backend no fue reiniciado después de agregar `url` al SELECT de archivos. Sin el campo `url`, el frontend cae al fallback binario que devuelve NULL → blob vacío.  
**Solución:** Reiniciar el backend NestJS (`npm run start:dev` en `api_automatizate`).

---

## Notes / Troubleshooting

### RRHH: "Postulantes" blank content (RouterView empty)

**Symptoms**
- Entering RRHH "Postulantes" showed the top bar/breadcrumb but the inner content could render empty or inconsistently.

**Root causes**
- Ambiguous child routing: multiple nested children were defined with `path: ''` at the same level under `/postulantes`, which makes the URL resolution non-deterministic.
- Route name collision: the name `postulanteUpdate` existed in both RRHH and Ofertas Laborales routes, which can break navigation when using `{ name: ... }`.

**Fix applied**
- Keep a single default child (`path: ''`) for `/postulantes` and give other tabs unique paths:
	- `/postulantes` -> postulantes list
	- `/postulantes/cuadro-mando` -> Cuadro Mando
	- `/postulantes/estadisticas` -> Estadísticas
- Rename the Ofertas Laborales child route to a unique name (`ofertasLaboralesList`).
- Breadcrumb link in RRHH layout points to `/postulantes`.

**Files touched**
- `src/modules/rrhh/routes/index.ts`
- `src/modules/rrhh/routes/OfertasLaborales.ts`
- `src/modules/rrhh/layouts/RRHHLayout.vue`
