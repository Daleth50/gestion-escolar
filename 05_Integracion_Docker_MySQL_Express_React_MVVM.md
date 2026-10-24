# Lección 4. Integración de React, Node.js, Express, MySQL y Docker

**Nivel:** Posgrado en Ingeniería de Software  
**Proyecto:** Sistema de Gestión Escolar  
**Entorno:** macOS, Warp, Visual Studio Code y GitHub  
**Arquitectura:** Frontend MVVM + API REST + MySQL  
**Duración sugerida:** cuatro sesiones de dos horas.

## Objetivo

Evolucionar la aplicación escolar desarrollada con Next.js, React, TypeScript y Material UI para sustituir los datos simulados por datos persistentes. Se crearán dos contenedores Docker: uno con MySQL y otro con una API Node.js/Express. El frontend se ejecutará inicialmente en macOS y consumirá la API por HTTP.

> **Alcance:** Se implementa como ejemplo completo el CRUD de Profesores. Los CRUD de Alumnos, Materias y Grupos, así como la ampliación de Reportes, son actividades de extensión. El Login continúa sin autenticación real; esta práctica es para desarrollo local, no para producción.

## 1. Arquitectura de la solución

```text
Navegador
  │
  ▼
Next.js / React (localhost:3000)
  View → ViewModel → Service HTTP (Axios)
  │ HTTP / JSON
  ▼
Node.js + Express (contenedor api, localhost:4000)
  Routes → Controllers → Repositories
  │ SQL parametrizado, red Docker
  ▼
MySQL 8.4 (contenedor db, db:3306)
  └── Volumen mysql_data
```

| Componente | Responsabilidad |
|---|---|
| React / Next.js | Interfaz, navegación y presentación |
| ViewModel | Estado y operaciones de interfaz |
| Service frontend | Consumo de endpoints HTTP |
| Express | Rutas, validaciones y coordinación |
| Repositorio backend | Consultas SQL parametrizadas |
| MySQL | Persistencia e integridad relacional |
| Docker Compose | Orquestación y comunicación de contenedores |

## 2. Preparación del entorno y rama Git

Verificar que Docker Desktop esté abierto:

```bash
docker --version
docker compose version
node --version
npm --version
git --version
```

Desde el proyecto existente (guardar o confirmar cambios pendientes antes de cambiar de rama):

```bash
cd /ruta/a/gestion-escolar
git status
git switch main
git pull origin main
git switch -c feature/integracion-api-mysql
mkdir -p database/init
mkdir -p backend/src/{config,controllers,repositories,routes}
```

Estructura prevista:

```text
gestion-escolar/
├── src/                       # Frontend Next.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── app.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── Dockerfile
│   └── init/
│       ├── 01-schema.sql
│       └── 02-seed.sql
├── compose.yaml
├── .env                  # NO subir a Git
├── .env.example
└── package.json
```

---

# Parte I. MySQL en Docker

## Paso 1. Dockerfile de la base de datos

**Archivo:** `database/Dockerfile`

```dockerfile
FROM mysql:8.4
COPY init/ /docker-entrypoint-initdb.d/
```

Los scripts SQL se copian a la imagen durante la construcción y se ejecutan **al inicializar por primera vez un directorio de datos vacío**, no durante `docker build` ni cada vez que se inicia el contenedor.

## Paso 2. Crear esquema SQL

**Archivo:** `database/init/01-schema.sql`

```sql
CREATE DATABASE IF NOT EXISTS gestion_escolar
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_escolar;

CREATE TABLE profesores (
    id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    estatus VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE materias (
    id CHAR(36) PRIMARY KEY,
    clave VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    creditos INT NOT NULL,
    profesor_id CHAR(36),
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL
);

CREATE TABLE grupos (
    id CHAR(36) PRIMARY KEY,
    clave VARCHAR(20) NOT NULL,
    semestre INT NOT NULL,
    ciclo_escolar VARCHAR(20) NOT NULL,
    UNIQUE (clave, ciclo_escolar)
);

CREATE TABLE alumnos (
    id CHAR(36) PRIMARY KEY,
    matricula VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    grupo_id CHAR(36),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL
);

CREATE TABLE grupo_materias (
    grupo_id CHAR(36) NOT NULL,
    materia_id CHAR(36) NOT NULL,
    PRIMARY KEY (grupo_id, materia_id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);
```

La tabla intermedia `grupo_materias` representa la relación muchos a muchos. Para un sistema real se podría introducir una entidad de asignación académica por grupo, profesor, materia y ciclo escolar.

## Paso 3. Datos de prueba

**Archivo:** `database/init/02-seed.sql`

```sql
USE gestion_escolar;

INSERT INTO profesores (id, nombre, correo, especialidad, estatus) VALUES
('11111111-1111-4111-8111-111111111111', 'Ana Martínez', 'ana@ejemplo.edu', 'Matemáticas', 'Activo'),
('22222222-2222-4222-8222-222222222222', 'Carlos López', 'carlos@ejemplo.edu', 'Informática', 'Activo');

INSERT INTO materias (id, clave, nombre, creditos, profesor_id) VALUES
('33333333-3333-4333-8333-333333333333', 'MAT101', 'Matemáticas I', 5, '11111111-1111-4111-8111-111111111111'),
('44444444-4444-4444-8444-444444444444', 'INF101', 'Programación I', 6, '22222222-2222-4222-8222-222222222222');

INSERT INTO grupos (id, clave, semestre, ciclo_escolar) VALUES
('55555555-5555-4555-8555-555555555555', '1A', 1, '2026-2027');

INSERT INTO grupo_materias (grupo_id, materia_id) VALUES
('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333');
```

## Paso 4. Variables de entorno

Crear `.env` en la raíz a partir de `.env.example`:

```dotenv
MYSQL_ROOT_PASSWORD=root_dev_change_me
MYSQL_DATABASE=gestion_escolar
MYSQL_USER=escolar_api
MYSQL_PASSWORD=escolar_dev_change_me
API_PORT=4000
```

Compose proporciona `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y
`DB_PASSWORD` al contenedor API. Mantener `.env` fuera de Git; los valores de
ejemplo son exclusivamente didácticos y no se deben usar en producción.

## Paso 5. Docker Compose

**Archivo:** `compose.yaml`

```yaml
services:
  db:
    build:
      context: ./database
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -uroot -p\"$$MYSQL_ROOT_PASSWORD\""]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - escolar_net

  api:
    build:
      context: ./backend
    ports:
      - "${API_PORT:-4000}:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      CORS_ORIGIN: http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    networks:
      - escolar_net

volumes:
  mysql_data:

networks:
  escolar_net:
    driver: bridge
```

No se publica el puerto 3306 en el host; la API se comunica con MySQL mediante `db:3306` dentro de la red Docker.

## Paso 6. Levantar y verificar MySQL

```bash
docker compose up -d --build db
docker compose ps
docker compose logs db
docker compose exec db mysql -u escolar_api -p gestion_escolar
```

En el cliente MySQL:

```sql
SHOW TABLES;
SELECT * FROM profesores;
SELECT * FROM materias;
SELECT * FROM grupos;
EXIT;
```

**Importante:** al modificar los scripts SQL no se ejecutarán de nuevo si el volumen ya contiene datos. `docker compose down -v` elimina el volumen y **destruye los datos de la práctica**; usar solo si se desea reinicializar conscientemente.

---

# Parte II. API REST con Node.js y Express

## Paso 7. Inicializar backend

```bash
cd backend
npm init -y
npm install express@^5 mysql2 cors dotenv
npm install -D nodemon
npm pkg set type=module
npm pkg set scripts.start="node src/app.js"
npm pkg set scripts.dev="nodemon src/app.js"
cd ..
```

| Librería | Uso |
|---|---|
| Express 5 | Servidor HTTP y rutas |
| mysql2 | Conexiones y SQL parametrizado |
| cors | Permitir peticiones desde el frontend |
| dotenv | Variables de entorno |
| nodemon | Reinicio automático en desarrollo |

## Paso 8. Conexión MySQL

**Archivo:** `backend/src/config/database.js`

```javascript
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
```

## Paso 9. Repositorio de Profesores

**Archivo:** `backend/src/repositories/profesoresRepository.js`

```javascript
import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";

export const profesoresRepository = {
  async listar() {
    const [rows] = await pool.execute("SELECT * FROM profesores ORDER BY nombre");
    return rows;
  },
  async obtener(id) {
    const [rows] = await pool.execute("SELECT * FROM profesores WHERE id = ?", [id]);
    return rows[0] ?? null;
  },
  async crear(datos) {
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO profesores (id, nombre, correo, especialidad, estatus)
       VALUES (?, ?, ?, ?, ?)`,
      [id, datos.nombre, datos.correo, datos.especialidad ?? null, datos.estatus ?? "Activo"]
    );
    return this.obtener(id);
  },
  async actualizar(id, datos) {
    const [result] = await pool.execute(
      `UPDATE profesores SET nombre = ?, correo = ?, especialidad = ?, estatus = ? WHERE id = ?`,
      [datos.nombre, datos.correo, datos.especialidad ?? null, datos.estatus ?? "Activo", id]
    );
    if (result.affectedRows === 0) return null;
    return this.obtener(id);
  },
  async eliminar(id) {
    const [result] = await pool.execute("DELETE FROM profesores WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};
```

## Paso 10. Controlador de Profesores

**Archivo:** `backend/src/controllers/profesoresController.js`

```javascript
import { profesoresRepository as repo } from "../repositories/profesoresRepository.js";

function validar(datos) {
  if (!datos || typeof datos.nombre !== "string" || !datos.nombre.trim() ||
      typeof datos.correo !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
    return "Nombre y correo válido son obligatorios";
  }
  return null;
}

export const profesoresController = {
  async listar(req, res) { res.json(await repo.listar()); },
  async obtener(req, res) {
    const profesor = await repo.obtener(req.params.id);
    if (!profesor) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(profesor);
  },
  async crear(req, res) {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });
    const profesor = await repo.crear(req.body);
    res.status(201).json(profesor);
  },
  async actualizar(req, res) {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });
    const profesor = await repo.actualizar(req.params.id, req.body);
    if (!profesor) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(profesor);
  },
  async eliminar(req, res) {
    const eliminado = await repo.eliminar(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Profesor no encontrado" });
    res.status(204).send();
  }
};
```

## Paso 11. Rutas

**Archivo:** `backend/src/routes/profesoresRoutes.js`

```javascript
import { Router } from "express";
import { profesoresController as c } from "../controllers/profesoresController.js";
const router = Router();
router.get("/", c.listar);
router.get("/:id", c.obtener);
router.post("/", c.crear);
router.put("/:id", c.actualizar);
router.delete("/:id", c.eliminar);
export default router;
```

## Paso 12. Endpoint de Reportes

**Archivo:** `backend/src/routes/reportesRoutes.js`

```javascript
import { Router } from "express";
import { pool } from "../config/database.js";
const router = Router();

router.get("/resumen", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM alumnos) AS totalAlumnos,
      (SELECT COUNT(*) FROM profesores) AS totalProfesores,
      (SELECT COUNT(*) FROM materias) AS totalMaterias,
      (SELECT COUNT(*) FROM grupos) AS totalGrupos
  `);
  res.json(rows[0]);
});
export default router;
```

## Paso 13. Servidor Express

**Archivo:** `backend/src/app.js`

```javascript
import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import profesoresRoutes from "./routes/profesoresRoutes.js";
import reportesRoutes from "./routes/reportesRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
});
app.use("/api/profesores", profesoresRoutes);
app.use("/api/reportes", reportesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Registro duplicado" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, "0.0.0.0", () => console.log(`API en puerto ${PORT}`));
```

Se utiliza Express 5 para que los errores lanzados por controladores asíncronos se propaguen al middleware de errores. La validación del ejemplo es básica; debe ampliarse antes de producción.

## Paso 14. Contenedor de la API

**Archivo:** `backend/Dockerfile`

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
USER node
CMD ["node", "src/app.js"]
```

**Archivo:** `backend/.dockerignore`

```text
node_modules
npm-debug.log
.env
.git
coverage
```

`npm ci` requiere el archivo `backend/package-lock.json` generado por `npm install`.

## Paso 15. Ejecutar API y probar con curl

Desde la raíz:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

En otra pestaña de Warp:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/profesores
```

Crear:

```bash
curl -X POST http://localhost:4000/api/profesores \
  -H "Content-Type: application/json" \
  -d '{"nombre":"María González","correo":"maria@ejemplo.edu","especialidad":"Computación","estatus":"Activo"}'
```

Actualizar (sustituir el ID):

```bash
curl -X PUT http://localhost:4000/api/profesores/ID_DEL_PROFESOR \
  -H "Content-Type: application/json" \
  -d '{"nombre":"María González","correo":"maria@ejemplo.edu","especialidad":"Ingeniería de Software","estatus":"Activo"}'
```

Eliminar:

```bash
curl -X DELETE http://localhost:4000/api/profesores/ID_DEL_PROFESOR
```

### Endpoints pendientes para práctica independiente

| Método | Endpoint | Propósito |
|---|---|---|
| GET, POST | `/api/alumnos` | Listar, crear |
| GET, PUT, DELETE | `/api/alumnos/:id` | Obtener, actualizar, eliminar |
| GET, POST | `/api/materias` | Listar, crear |
| GET, PUT, DELETE | `/api/materias/:id` | Obtener, actualizar, eliminar |
| GET, POST | `/api/grupos` | Listar, crear |
| GET, PUT, DELETE | `/api/grupos/:id` | Obtener, actualizar, eliminar |
| GET | `/api/reportes/resumen` | Totales de las entidades |

> Los endpoints de Alumnos, Materias y Grupos **no quedan implementados por los fragmentos anteriores**. Son parte de la actividad de extensión y deben existir antes de conectarlos desde React.

---

# Parte III. Integración de Next.js/React mediante MVVM

## Paso 16. Cliente HTTP Axios

Desde la raíz del frontend:

```bash
npm install axios
```

**Archivo:** `.env.local` (no subir a Git)

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Archivo:** `src/lib/api.ts`

```ts
import axios from "axios";
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});
```

Las variables `NEXT_PUBLIC_*` son visibles en el navegador; nunca colocar secretos en ellas.

## Paso 17. Servicio HTTP de Profesores

**Archivo:** `src/modules/profesores/services/profesoresService.ts`

```ts
import { api } from "@/lib/api";

export interface Profesor {
  id: string;
  nombre: string;
  correo: string;
  especialidad: string | null;
  estatus: string;
}
export type ProfesorInput = Omit<Profesor, "id">;

export const profesoresService = {
  async listar(): Promise<Profesor[]> {
    const { data } = await api.get<Profesor[]>("/profesores");
    return data;
  },
  async obtener(id: string): Promise<Profesor> {
    const { data } = await api.get<Profesor>(`/profesores/${id}`);
    return data;
  },
  async crear(datos: ProfesorInput): Promise<Profesor> {
    const { data } = await api.post<Profesor>("/profesores", datos);
    return data;
  },
  async actualizar(id: string, datos: ProfesorInput): Promise<Profesor> {
    const { data } = await api.put<Profesor>(`/profesores/${id}`, datos);
    return data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete(`/profesores/${id}`);
  }
};
```

Si ya existe un tipo `Profesor` en `models/Profesor.ts`, reutilizarlo en lugar de duplicarlo.

## Paso 18. ViewModel asíncrono

**Archivo:** `src/modules/profesores/viewmodels/useProfesoresViewModel.ts`

```tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { profesoresService, type Profesor, type ProfesorInput } from "../services/profesoresService";

const vacio: ProfesorInput = { nombre: "", correo: "", especialidad: "", estatus: "Activo" };

export function useProfesoresViewModel() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [form, setForm] = useState<ProfesorInput>({ ...vacio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProfesores(await profesoresService.listar());
    } catch {
      setError("No se pudieron cargar los profesores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const actualizarCampo = (campo: keyof ProfesorInput, valor: string) =>
    setForm(actual => ({ ...actual, [campo]: valor }));

  const editar = (profesor: Profesor) => {
    setEditandoId(profesor.id);
    setForm({ nombre: profesor.nombre, correo: profesor.correo,
      especialidad: profesor.especialidad ?? "", estatus: profesor.estatus });
    setError("");
  };

  const cancelar = () => {
    setForm({ ...vacio });
    setEditandoId(null);
    setError("");
  };

  const guardar = async () => {
    if (!form.nombre.trim() || !form.correo.trim()) {
      setError("Nombre y correo son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editandoId) await profesoresService.actualizar(editandoId, form);
      else await profesoresService.crear(form);
      await cargar();
      cancelar();
    } catch {
      setError("No se pudo guardar el profesor");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      await profesoresService.eliminar(id);
      await cargar();
    } catch {
      setError("No se pudo eliminar el profesor");
    } finally {
      setLoading(false);
    }
  };

  return { profesores, form, editandoId, loading, error, cargar,
    actualizarCampo, editar, guardar, eliminar, cancelar };
}
```

## Paso 19. Adaptar la Vista existente

En `src/modules/profesores/views/ProfesoresView.tsx`, consumir `useProfesoresViewModel()` y utilizar:

- `profesores` como fuente de filas.
- `loading` para indicar espera y deshabilitar botones.
- `error` para mostrar un componente `Alert`.
- `guardar()` para altas y modificaciones.
- `eliminar(id)` para bajas, preferentemente después de confirmar.

**Importante:** conservar la interfaz de la lección anterior; cambiar el origen de datos y el manejo asíncrono, no duplicar lógica de SQL en la Vista.

## Paso 20. Adaptar Alumnos, Materias y Grupos

Sustituir los servicios simulados por llamadas a sus respectivos endpoints **cuando estén implementados**:

| Servicio | API |
|---|---|
| `alumnosService.ts` | `/api/alumnos` |
| `materiasService.ts` | `/api/materias` |
| `gruposService.ts` | `/api/grupos` |
| `profesoresService.ts` | `/api/profesores` |

Revisar cambios de modelo: por ejemplo, el alumno pasa de `grupo: string` a `grupo_id: string | null`. Los formularios deben obtener grupos de la API y mostrar un `Select`. El servicio HTTP será la fuente de datos, no los arreglos locales ni `localStorage`.

## Paso 21. Servicio de Dashboard

**Archivo:** `src/modules/dashboard/services/dashboardService.ts`

```ts
import { api } from "@/lib/api";
export interface DashboardResumen {
  totalAlumnos: number;
  totalProfesores: number;
  totalMaterias: number;
  totalGrupos: number;
}
export const dashboardService = {
  async obtenerResumen(): Promise<DashboardResumen> {
    const { data } = await api.get<DashboardResumen>("/reportes/resumen");
    return {
      totalAlumnos: Number(data.totalAlumnos),
      totalProfesores: Number(data.totalProfesores),
      totalMaterias: Number(data.totalMaterias),
      totalGrupos: Number(data.totalGrupos)
    };
  }
};
```

El ViewModel del Dashboard puede invocar este servicio con `useEffect` y mostrar los resultados en tarjetas Material UI.

---

# Parte IV. Pruebas y GitHub

## Paso 22. Ejecución completa

**Terminal 1, en la raíz del proyecto:**

```bash
docker compose up -d --build
docker compose ps
```

**Terminal 2, en la raíz del frontend:**

```bash
npm run dev
```

| Componente | Dirección |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |
| Salud de API | http://localhost:4000/api/health |
| MySQL | Interno, `db:3306` |

## Paso 23. Lista de verificación

- [ ] Docker Compose levanta `db` y `api`.
- [ ] `/api/health` responde con conexión a la base de datos.
- [ ] `GET /api/profesores` devuelve los registros iniciales.
- [ ] `POST /api/profesores` crea un registro.
- [ ] `PUT /api/profesores/:id` actualiza el registro.
- [ ] `DELETE /api/profesores/:id` elimina el registro.
- [ ] React muestra los profesores recuperados desde la API.
- [ ] Crear, editar y eliminar desde React actualiza MySQL.
- [ ] Los datos persisten después de reiniciar contenedores sin borrar volúmenes.
- [ ] `/api/reportes/resumen` devuelve indicadores consistentes.
- [ ] Los endpoints pendientes de otros módulos se implementan antes de integrarlos al frontend.
- [ ] `npx tsc --noEmit` y `npm run build` terminan sin errores.

## Paso 24. Commit y Pull Request

```bash
git status
git add .
git diff --cached --stat
git commit -m "feat: integra API Express y MySQL con Docker"
git push -u origin feature/integracion-api-mysql
```

Crear un Pull Request de `feature/integracion-api-mysql` hacia `main`. Verificar que **no** se hayan incluido `.env`, `.env.local`, credenciales o datos personales reales.

## Evaluación

| Criterio | Ponderación |
|---|---:|
| Contenedor MySQL y scripts SQL | 20% |
| API REST Express y conexión MySQL | 25% |
| Integración React con MVVM | 25% |
| Pruebas de CRUD y persistencia | 20% |
| Documentación, commits y Pull Request | 10% |
| **Total** | **100%** |

## Preguntas de reflexión

1. ¿Por qué la Vista no debe ejecutar SQL directamente?
2. ¿Qué cambia en el ViewModel al pasar de un arreglo local a una API asíncrona?
3. ¿Cuál es la diferencia entre una imagen Docker y un volumen de datos?
4. ¿Por qué los scripts de inicialización no se vuelven a ejecutar en cada arranque?
5. ¿Qué ventajas ofrece separar frontend, API y base de datos?
6. ¿Qué controles faltan antes de desplegar la aplicación en producción?

## Siguiente lección

Completar los endpoints y validaciones de Alumnos, Materias y Grupos; incorporar autenticación, autorización, migraciones SQL y pruebas automatizadas. Después, configurar CI/CD con GitHub Actions.

---

**Nota didáctica:** Esta guía contiene un ejemplo funcional de referencia para el CRUD de Profesores y un endpoint de resumen. Las integraciones restantes requieren implementar sus endpoints, revisar modelos y probar el proyecto localmente. No se ha verificado la ejecución en el equipo de los estudiantes.
