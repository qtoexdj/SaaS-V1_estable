# SaaS Platform Frontend

## Configuración de Variables de Entorno en Railway

### Variables Requeridas

Las siguientes variables deben configurarse en el dashboard de Railway:

```bash
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### Variables Predefinidas

Estas variables ya están configuradas en el `railway.toml`:

```bash
VITE_APP_NAME=SaaS Platform
VITE_APP_DESCRIPTION=Panel de Administración
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Despliegue

1. Instala la CLI de Railway:
```bash
npm i -g @railway/cli
```

2. Inicia sesión en Railway:
```bash
railway login
```

3. Vincula el proyecto:
```bash
railway link
```

4. Configura las variables sensibles en el dashboard de Railway:
   - Ve a tu proyecto en Railway
   - Navega a la sección "Variables"
   - Agrega `SUPABASE_URL` y `SUPABASE_ANON_KEY`

5. Despliega la aplicación:
```bash
railway up
```

## Desarrollo Local con Docker

1. Construye la imagen:
```bash
docker-compose build
```

2. Inicia el contenedor:
```bash
docker-compose up
```

La aplicación estará disponible en `http://localhost:3004`
