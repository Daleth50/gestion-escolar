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

## Verificación

```bash
npx tsc --noEmit
npm run lint
npm run build
```
