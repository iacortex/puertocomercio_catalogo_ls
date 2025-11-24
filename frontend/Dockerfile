# -------------------------
# 🟦 ETAPA 1: Build del Frontend
# -------------------------
FROM node:18 AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Pasar variable desde docker-compose
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install

# Copiar proyecto
COPY . .

# Build de producción
RUN npm run build


# -------------------------
# 🟩 ETAPA 2: Servir con Nginx
# -------------------------
FROM nginx:stable

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
