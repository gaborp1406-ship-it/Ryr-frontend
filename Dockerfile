# Etapa 1: build de la app Vue
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la cache de Docker
COPY package*.json ./
RUN npm ci

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# Etapa 2: servir los archivos estáticos con nginx
FROM nginx:alpine

# Copiamos el build generado (Vite genera la carpeta "dist")
COPY --from=build /app/dist /usr/share/nginx/html

# Config de nginx para SPA (Vue Router en modo history)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]