#!/bin/sh
set -e

# Usar el puerto que Railway asigna
# Railway establecerá la variable PORT automáticamente
echo "Configurando nginx para escuchar en el puerto: $PORT (asignado por Railway)"

# Verificar que el directorio de logs exista
mkdir -p /var/log/nginx

# Verificar que los archivos de healthcheck existan
if [ ! -f /usr/share/nginx/html/healthz ]; then
    echo "Creando archivo de healthcheck..."
    echo "OK" > /usr/share/nginx/html/healthz
fi

# Generar configuración de nginx con el puerto correcto
# Verificar directorios y permisos
mkdir -p /tmp/nginx
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Verificar permisos
chmod -R 755 /usr/share/nginx/html

# Verificar la configuración de nginx
nginx -t

# Ejecutar el comando pasado como argumento (generalmente nginx)
exec "$@"