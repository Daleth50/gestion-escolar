# Gestión Escolar

Aplicación escolar con Next.js, React, TypeScript y Material UI, organizada
con MVVM.

## Integración local con MySQL y Express

El CRUD de Profesores y el Dashboard usan la API Express y MySQL; Materias,
Grupos y Reportes detallados continúan con el almacenamiento local hasta
implementar sus endpoints.

### Requisitos

- Node.js 20.9 o superior y npm.
- Docker Desktop con Docker Compose.

### Inicio

1. Preparar las variables locales a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

   Los valores de ejemplo son solo para desarrollo; no usarlos en producción.
2. Construir e iniciar MySQL y la API:

   ```bash
   docker compose up -d --build
   docker compose ps
   ```

3. Instalar dependencias del frontend con `npm install` y crear `.env.local`:

   ```dotenv
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

4. Iniciar Next.js con `npm run dev`.

Frontend: [http://localhost:3000](http://localhost:3000)

Salud de la API: [http://localhost:4000/api/health](http://localhost:4000/api/health)

`docker compose down` conserva los datos. `docker compose down -v` los borra
junto con el volumen MySQL. Consulta [05_Integracion_Docker_MySQL_Express_React_MVVM.md](./05_Integracion_Docker_MySQL_Express_React_MVVM.md)
para ver los endpoints, las pruebas y los pasos detallados.

## Despliegue de prueba con CI/CD

La configuración incluida usa GitHub Actions para CI, Vercel para el frontend,
Render para la API y TiDB Cloud Starter para la base compatible con MySQL. El archivo
[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) valida lint, TypeScript,
build y sintaxis de la API en cada pull request y en `main`. El archivo
[`render.yaml`](./render.yaml) define el servicio de Render.

### 1. Crear la base compatible con MySQL en TiDB Cloud

1. Crear una cuenta en [TiDB Cloud](https://tidbcloud.com/) y crear una
   instancia **Starter**.
2. Abrir **Connect** y seleccionar la conexión pública para Node.js/mysql2.
3. Copiar host, puerto `4000`, base, usuario y contraseña. El usuario debe ser
   exactamente el que muestra TiDB, incluido su prefijo si aparece. No subir
   estas credenciales al repositorio.
4. Ejecutar el contenido de `database/init/01-schema.sql` y
   `database/init/02-seed.sql` desde un cliente MySQL conectado a TiDB.

### 2. Publicar la API en Render

1. Crear un Web Service desde el repositorio de GitHub o usar **Blueprint** y
   seleccionar `render.yaml`.
2. Confirmar `Root Directory = backend`, región y rama `main`.
3. Configurar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y
   `DB_SSL=true` con los datos de TiDB.
4. Generar un valor largo y aleatorio para `AUTH_SECRET`.
5. Dejar temporalmente `CORS_ORIGIN` como la URL final de Vercel. Si todavía no
   existe, se puede actualizar después y hacer un redeploy.
6. Esperar el despliegue y comprobar:

   ```bash
   curl --fail https://TU_API.onrender.com/api/health
   ```

   La respuesta esperada contiene `"status":"ok"` y
   `"database":"connected"`.

### 3. Publicar el frontend en Vercel

1. Importar el repositorio en Vercel.
2. Usar la raíz del repositorio como **Root Directory**.
3. Mantener el framework `Next.js`, el comando `npm run build` y el comando de
   instalación `npm ci`.
4. Crear la variable `NEXT_PUBLIC_API_URL` con:

   ```text
   https://TU_API.onrender.com/api
   ```

5. Aplicarla al entorno `Production` y desplegar.
6. Copiar la URL final de Vercel y agregarla a `CORS_ORIGIN` en Render. Separar
   varios orígenes con comas, sin espacios innecesarios.
7. Hacer un redeploy de Render y probar login y un CRUD real desde Vercel.

### 4. Validar el flujo CI/CD

1. Crear una rama y abrir un pull request: GitHub Actions debe ejecutar los
   checks de frontend y backend.
2. Integrar el pull request en `main`.
3. Vercel debe desplegar automáticamente el frontend y Render la API.
4. Verificar `/api/health`, login, CRUD, consola del navegador y logs.

Para una prueba temporal, borrar la instancia de TiDB, el servicio de Render y
el proyecto de Vercel al terminar. No uses las credenciales de desarrollo
incluidas en `.env.example` en servicios públicos.

### Credenciales de desarrollo

El seed crea un usuario para iniciar sesión en [http://localhost:3000/login](http://localhost:3000/login):

| Correo              | Contraseña |
| ------------------- | ---------- |
| `admin@ejemplo.edu` | `admin123` |

Solo para desarrollo local. El backend requiere `AUTH_SECRET` en `.env`
(ya incluido en `.env.example`). Si la base ya existía, aplica el esquema
nuevo con `docker compose down -v` y vuelve a levantar.

## Verificación

```bash
npx tsc --noEmit
npm run lint
npm run build
```
