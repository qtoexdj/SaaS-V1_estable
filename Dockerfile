# Fase de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Establecer variables de entorno para la construcción
ENV VITE_SUPABASE_URL="https://ogzxogjatdmfisiyapdq.supabase.co"
ENV VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nenhvZ2phdGRtZmlzaXlhcGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5OTA2NDYsImV4cCI6MjA1NTU2NjY0Nn0.RvgFS7mkmwl5_kVujksTUlZh49wg0L8zMoemXD6D1F4"
ENV VITE_APP_NAME="Broky-Front"
ENV VITE_APP_DESCRIPTION="Frontend of Broky"
ENV VITE_APP_VERSION="1.0.0"
ENV VITE_API_TIMEOUT="30000"
ENV VITE_API_RETRY_ATTEMPTS="3"
ENV VITE_ENABLE_DARK_MODE="true"
ENV VITE_ENABLE_NOTIFICATIONS="true"

# Construir la aplicación con base relativa
RUN npm run build -- --base=/

# Fase de producción con Nginx
FROM nginx:alpine

# Copiar archivos de la construcción a la ubicación donde Nginx los sirve
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copiar script de entrada
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
# Crear archivos de healthcheck en las ubicaciones correctas
RUN echo "OK" > /usr/share/nginx/html/healthz && \
    echo "<!DOCTYPE html><html><head><title>Health Check</title></head><body>OK</body></html>" > /usr/share/nginx/html/health.html
RUN echo "OK" > /usr/share/nginx/html/healthz

# Puerto que usará Railway
ENV PORT=8080

# Script de entrada para establecer configuración dinámica
ENTRYPOINT ["/docker-entrypoint.sh"]

# Ejecutar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]