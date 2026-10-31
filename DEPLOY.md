# Despliegue de prueba

Esta guía documenta el despliegue temporal de Gestión Escolar con:

- GitHub Actions para integración continua.
- Vercel para el frontend Next.js.
- Render para la API Express.
- TiDB Cloud Starter como base de datos compatible con MySQL.

No guardes contraseñas, tokens ni secretos en el repositorio.

## 1. Preparar el repositorio

La rama utilizada para el despliegue final es `main`.

Archivos relevantes:

- `.github/workflows/ci.yml`: lint, typecheck, build y validación del backend.
- `render.yaml`: configuración declarativa de Render.
- `.vercelignore`: evita enviar archivos auxiliares al build de Vercel.
- `backend/src/config/database.js`: conexión MySQL/TiDB con TLS.

### Crear los archivos de despliegue

Desde la raíz del repositorio crea las carpetas y archivos:

```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml render.yaml .vercelignore
```

#### Crear `.github/workflows/ci.yml`

Este archivo ejecuta CI en cada Pull Request y en cada push a `main`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  frontend:
    name: Frontend checks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Use Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Typecheck
        run: npx tsc --noEmit
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: https://api.example.invalid/api

  backend:
    name: Backend checks
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Use Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - name: Install dependencies
        run: npm ci
      - name: Check JavaScript syntax
        run: find src -type f -name '*.js' -print0 | xargs -0 -n1 node --check
```

#### Crear `render.yaml`

Este archivo define el servicio Node.js de Render y sus variables:

```yaml
services:
  - type: web
    name: gestion-escolar-api
    runtime: node
    rootDir: backend
    buildCommand: npm ci
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "10000"
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: "4000"
      - key: DB_SSL
        value: "true"
      - key: DB_NAME
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: AUTH_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        sync: false
```

En Render selecciona **New > Blueprint**, conecta el repositorio y confirma
este archivo. Si creas el servicio manualmente, usa los mismos valores de
`rootDir`, `buildCommand`, `startCommand` y `healthCheckPath`.

#### Crear `.vercelignore`

Este archivo evita que Vercel compile copias auxiliares y servicios que no
pertenecen al frontend:

```text
archivos_para_copiar
backend
database
compose.yaml
```

#### Guardar y publicar los archivos

```bash
git add .github/workflows/ci.yml render.yaml .vercelignore
git commit -m "ci: agregar archivos de despliegue"
git push origin main
```

Antes de desplegar:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build

cd backend
npm ci
find src -type f -name '*.js' -print0 | xargs -0 -n1 node --check
```

Sube los cambios a GitHub:

```bash
git add .
git commit -m "deploy: preparar entorno de prueba"
git push origin main
```

## 2. Configurar TiDB Cloud

En TiDB Cloud crea una instancia **Starter** y abre la opción **Connect**.
Usa la conexión pública para Node.js/mysql2.

La configuración utilizada es:

```text
Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com
Port: 4000
Usuario: el usuario mostrado por TiDB
Base: test
TLS: activado
```

TiDB Starter proporciona una base de aplicación `test`. La base `sys` es
interna y no debe usarse para crear las tablas de la aplicación. Por eso los
dos scripts SQL deben usar `test`:

```sql
USE test;
```

En `database/init/01-schema.sql`, elimina o comenta el bloque que intenta
crear `gestion_escolar` y deja `USE test;`. En
`database/init/02-seed.sql`, cambia `USE gestion_escolar;` por `USE test;`.

Ejecuta primero el esquema y después los datos iniciales desde un cliente
MySQL compatible con TLS:

1. `database/init/01-schema.sql`
2. `database/init/02-seed.sql`

Comprueba la instalación:

```sql
USE test;
SHOW TABLES;
SELECT correo FROM usuarios;
```

Debe existir el usuario de prueba `admin@ejemplo.edu`.

## 3. Crear la API en Render

En Render crea un **Web Service** conectado al repositorio:

```text
Branch: main
Root Directory: backend
Build Command: npm ci
Start Command: npm start
Health Check Path: /api/health
```

Al configurar `Root Directory: backend`, Render ejecuta los comandos desde esa
carpeta y solo considera cambios dentro de ella para el auto-deploy. Por eso,
un cambio únicamente en `README.md`, `.github/`, `render.yaml` o `database/`
no inicia automáticamente un despliegue de este servicio.

Los cambios que sí suelen disparar el auto-deploy son:

```text
backend/src/**
backend/package.json
backend/package-lock.json
backend/Dockerfile
```

Si necesitas desplegar un cambio realizado fuera de `backend/`, usa en Render:

```text
Manual Deploy → Deploy latest commit
```

Para comprobar el auto-deploy, realiza un cambio real dentro de `backend/`,
haz commit y súbelo a `main`:

```bash
git add backend/
git commit -m "chore: probar auto deploy de Render"
git push origin main
```

Configura estas variables en Render:

```env
NODE_ENV=production
PORT=10000
DB_HOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_SSL=true
DB_NAME=test
DB_USER=usuario-generado-por-TiDB
DB_PASSWORD=contraseña-de-TiDB
AUTH_SECRET=secreto-largo-y-aleatorio
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

`DB_SSL=true` es obligatorio para TiDB Starter. No configures
`/etc/ssl/cert.pem` en Render; esa ruta pertenece al cliente local.

Después del deploy, valida:

```bash
curl --fail https://TU_API.onrender.com/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "database": "connected"
}
```

La ruta correcta es `/api/health`; `/health` no existe.

## 4. Crear el frontend en Vercel

Importa el repositorio en Vercel con estos valores:

```text
Root Directory: /
Framework: Next.js
Install Command: npm ci
Build Command: npm run build
Production Branch: main
```

Agrega esta variable para Production:

```env
NEXT_PUBLIC_API_URL=https://TU_API.onrender.com/api
```

Despliega y copia la URL pública de Vercel.

## 5. Actualizar CORS

Regresa a Render y actualiza:

```env
CORS_ORIGIN=https://TU_APP.vercel.app
```

Guarda la variable y ejecuta un nuevo deploy. Después prueba:

- Inicio de sesión.
- CRUD de profesores.
- CRUD de alumnos.
- CRUD de materias y grupos.
- Reportes.
- Persistencia de datos.

## 6. Flujo CI/CD

Cada Pull Request hacia `main` ejecuta GitHub Actions.

Un push o merge a `main` ejecuta:

1. CI de frontend.
2. CI de backend.
3. Deploy automático de Vercel.
4. Deploy automático de Render, si está habilitado.

Comprueba siempre que los servicios estén construyendo el commit correcto y
que el branch mostrado sea `main`.

## 7. Diagnóstico rápido

### Error `502` en Render

- Confirma que el servicio esté en estado **Live**.
- Revisa los logs de runtime, no solo los de build.
- Comprueba que Render use `main`.
- Verifica que la aplicación escuche en `PORT`.
- Usa `/api/health`.

### Error `insecure transport`

Confirma que Render tenga:

```env
DB_SSL=true
DB_PORT=4000
```

### Error `Unknown database`

Confirma que Render use:

```env
DB_NAME=test
```

y que las tablas hayan sido creadas en `test`.

### Error CORS en el navegador

Configura `CORS_ORIGIN` con la URL exacta de Vercel, incluyendo `https://` y
sin una barra final.

### Error de compilación `archivos_para_copiar`

Confirma que estén presentes `tsconfig.json` actualizado y `.vercelignore`.
La carpeta `archivos_para_copiar/` contiene material auxiliar y no debe
participar en el build.

## 8. Credenciales de prueba

El seed incluye:

```text
Correo: admin@ejemplo.edu
Contraseña: admin123
```

Son credenciales de demostración. Cámbialas antes de usar el sistema fuera de
esta prueba.

## 9. Eliminar el entorno de prueba

Cuando termine la demostración:

1. Elimina o pausa el servicio de Render.
2. Elimina el proyecto de Vercel.
3. Elimina la instancia de TiDB.
4. Rota cualquier contraseña o secreto que haya sido expuesto.
