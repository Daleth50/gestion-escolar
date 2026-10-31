# Guía detallada de testing automatizado con GitHub Actions

**Asignatura:** Lenguajes Web · **Nivel:** Maestría en Sistemas Computacionales  
**Proyecto de referencia:** Sistema de Gestión Escolar (Next.js, React, TypeScript, Material UI; API Express/MySQL opcional)  
**Modalidad:** práctica individual · **Versión:** 1.0 · **Fecha:** octubre de 2026

> **Objetivo:** desarrollar pruebas automatizadas, ejecutarlas localmente y convertirlas en una condición obligatoria para integrar código a `main` mediante GitHub Actions y Pull Requests.
>
> **Alcance y adaptación:** los ejemplos parten de un frontend Next.js ubicado en la raíz del repositorio y con `package-lock.json`. Si el estudiante tiene un monorepositorio, utiliza `pnpm`/Yarn o aún no implementa backend, deberá ajustar los pasos indicados. Las pruebas de ejemplo son **código nuevo propuesto**, no una afirmación de que ya existan en la aplicación original.

---

## 1. Resultados de aprendizaje

Al finalizar, el estudiante será capaz de:

1. Diferenciar pruebas unitarias, de integración, de interfaz y end-to-end (E2E).
2. Identificar reglas de negocio comprobables del módulo de Alumnos.
3. Escribir y ejecutar pruebas automatizadas reproducibles.
4. Configurar un workflow de GitHub Actions en formato YAML.
5. Interpretar resultados, logs, fallos y ejecuciones de un workflow.
6. Vincular una rama y un Pull Request con un requisito o historia de usuario.
7. Configurar una regla de protección de `main` que exija un check exitoso.
8. Demostrar el ciclo **fallo → corrección → ejecución exitosa → integración**.

## 2. Conceptos esenciales

| Concepto | Definición | Ejemplo escolar |
|---|---|---|
| Prueba unitaria | Verifica una función aislada | Rechazar matrícula vacía |
| Prueba de integración | Verifica la colaboración entre componentes | API Express + repositorio + base de datos de pruebas |
| Prueba de componente | Comprueba una vista React | Mensaje de validación al guardar un alumno |
| Prueba E2E | Recorre un flujo completo | Abrir Alumnos, registrar, consultar y editar |
| CI | Integración continua: validación automatizada de cambios | Ejecutar tests en cada push o PR |
| Workflow | Archivo YAML que describe la automatización | `.github/workflows/ci.yml` |
| Event | Suceso que inicia un workflow | `push`, `pull_request`, `workflow_dispatch` |
| Job | Conjunto de pasos que corre en un runner | `frontend` |
| Step | Acción individual dentro de un job | `npm ci`, `npm run test:ci` |
| Runner | Equipo virtual que ejecuta los pasos | `ubuntu-latest` |
| Check | Resultado de una validación visible en GitHub | `frontend` exitoso o fallido |

**Distinción importante:** que el workflow aparezca en verde demuestra que las comprobaciones configuradas pasaron, **no** que toda la aplicación esté libre de errores. La cobertura y pertinencia de los casos de prueba determinan qué comportamiento está realmente validado.

## 3. Arquitectura y alcance de las pruebas

```text
Usuario
  |
  v
Next.js / React (Views) --> ViewModels / hooks --> Services / Axios
                                               |
                                               v
                                        API Node / Express
                                               |
                                               v
                                           MySQL / Docker
```

Se recomienda una estrategia incremental:

- **Primera práctica (obligatoria):** funciones puras del dominio (validación de Alumnos y métricas).
- **Segunda práctica:** pruebas de componentes React o ViewModels.
- **Tercera práctica:** pruebas de API Express sin base de datos real, con dependencias simuladas.
- **Ampliación:** pruebas de integración con una base MySQL efímera y E2E con Playwright.

No se utilizarán datos personales reales de estudiantes en el repositorio ni en los logs.

## 4. Requisitos previos

- Cuenta de GitHub con permisos de escritura sobre el repositorio.
- Proyecto publicado y rama principal `main` (si es `master`, sustituir el nombre).
- Git instalado; terminal Warp, Terminal o equivalente.
- Node.js 22 para esta práctica y npm.
- Archivo `package.json` y **`package-lock.json`** en la raíz.
- Aplicación que pueda ejecutarse localmente con `npm run dev`.
- Editor VS Code y acceso a la pestaña **Actions** de GitHub.

Comprobar versiones:

```bash
node --version
npm --version
git --version
```

Abrir la raíz del proyecto:

```bash
cd /ruta/a/gestion-escolar
pwd
ls -la
cat package.json
```

**Nota:** si el repositorio fue migrado a Azure Repos y GitHub ya no es el repositorio principal, este procedimiento debe aplicarse al repositorio GitHub que recibe los pushes y PR. GitHub Actions **no** se ejecuta automáticamente sobre commits que existen solo en Azure Repos.

## 5. Crear una rama de trabajo

```bash
git status
git switch main
git pull origin main
git switch -c feature/testing-github-actions
```

Comprobar:

```bash
git branch --show-current
```

Esperado: `feature/testing-github-actions`.

## 6. Inspeccionar los scripts del proyecto

Ejecutar:

```bash
npm run
```

Verificar si existen `lint`, `build` y `test:ci`. **No sobrescribir** scripts ya existentes. Si falta `lint`, revisar primero la configuración de ESLint y la versión de Next.js. En versiones actuales de Next.js puede utilizarse un script `"lint": "eslint ."` si ESLint ya está configurado. No asumir que `next lint` está disponible en todas las versiones.

En `package.json`, dentro de `scripts`, **agregar únicamente**:

```json
"test:ci": "node --test tests/*.test.mjs"
```

Ejemplo parcial (no sustituye el archivo completo):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test:ci": "node --test tests/*.test.mjs"
  }
}
```

Si ya existe Vitest o Jest, conservar la herramienta del proyecto y adaptar `test:ci` al comando correspondiente. En esta práctica se utiliza `node:test` porque evita instalar bibliotecas adicionales y permite enfocarse en CI.

## 7. Crear las carpetas de pruebas

Desde la raíz:

```bash
mkdir -p src/lib tests .github/workflows
```

Estructura mínima:

```text
gestion-escolar/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
├── src/
│   └── lib/
│       └── validaciones.mjs
├── tests/
│   └── validaciones.test.mjs
├── package.json
└── package-lock.json
```

Los archivos `.mjs` permiten probar funciones JavaScript con módulos ES sin requerir un compilador TypeScript. **Es una puerta de entrada didáctica:** en un proyecto totalmente TypeScript se recomienda después migrar a Vitest y probar módulos `.ts` y componentes `.tsx` reales.

## 8. Implementar lógica de negocio verificable

Crear `src/lib/validaciones.mjs`:

```javascript
export function validarAlumno({ matricula, nombre, correo }) {
  const errores = {};
  if (!matricula?.trim()) errores.matricula = 'La matricula es obligatoria';
  if (!nombre?.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo ?? '')) {
    errores.correo = 'El correo no es valido';
  }
  return errores;
}

export function calcularTotalAlumnos(alumnos) {
  return alumnos.length;
}
```

**Reglas de ejemplo:** matrícula y nombre obligatorios; correo con formato básico; total de alumnos igual al tamaño de la colección. Estas reglas deben compararse con el SRS del proyecto. La expresión regular comprueba solo un formato mínimo y no valida la existencia de la cuenta de correo.

> **MVVM:** estas funciones no deben depender de Material UI, del navegador ni de una base de datos. El ViewModel puede invocarlas antes de solicitar al servicio el guardado del alumno.

## 9. Escribir cuatro pruebas automatizadas

Crear `tests/validaciones.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { validarAlumno, calcularTotalAlumnos } from '../src/lib/validaciones.mjs';

test('un alumno valido no produce errores', () => {
  assert.deepEqual(validarAlumno({
    matricula: 'A001', nombre: 'Ana', correo: 'ana@escuela.mx'
  }), {});
});

test('rechaza matricula vacia', () => {
  const errores = validarAlumno({
    matricula: ' ', nombre: 'Ana', correo: 'ana@escuela.mx'
  });
  assert.equal(errores.matricula, 'La matricula es obligatoria');
});

test('rechaza correo invalido', () => {
  const errores = validarAlumno({
    matricula: 'A001', nombre: 'Ana', correo: 'incorrecto'
  });
  assert.equal(errores.correo, 'El correo no es valido');
});

test('cuenta los alumnos registrados', () => {
  assert.equal(calcularTotalAlumnos([{ id: 1 }, { id: 2 }]), 2);
});
```

**Explicación de la sintaxis:**

- `test(nombre, función)` declara un caso de prueba.
- `assert.equal(actual, esperado)` compara valores primitivos.
- `assert.deepEqual(actual, esperado)` compara objetos y arreglos.
- Un `assert` que no se cumple genera un fallo y el comando finaliza con código distinto de cero.
- El runner de GitHub interpreta ese código como un step fallido.

## 10. Ejecutar las pruebas localmente

```bash
npm run test:ci
```

Resultado esperado: **4 pruebas, 4 aprobadas, 0 fallidas**.

Ejecutar después:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run test:ci
npm run build
```

Si `npm ci` falla porque no existe `package-lock.json`, ejecutar `npm install`, revisar y versionar el lockfile, y repetir. No sustituir `npm ci` por `npm install` dentro de CI sin una razón técnica: `npm ci` usa las versiones fijadas por el lockfile y falla si hay inconsistencias.

Si `npx tsc --noEmit` falla por tipos preexistentes, corregirlos o documentar el bloqueo. No eliminar el paso silenciosamente. Si `npm run build` intenta acceder a una API que no está activa, revisar llamadas realizadas durante el renderizado de servidor y utilizar datos simulados o un entorno de prueba explícito.

## 11. ¿Qué es un workflow de GitHub Actions?

GitHub detecta archivos YAML en `.github/workflows/`. Cada archivo puede definir eventos, permisos, trabajos y pasos. El workflow de esta práctica se activará al hacer `push` a `main`, `feature/**` o `fix/**`, al abrir o actualizar un PR hacia `main` y al lanzarlo manualmente desde **Actions**.

Los eventos no son equivalentes a despliegue: **CI verifica**; el despliegue se configura en un workflow o job separado.

## 12. Crear el workflow principal

Crear `.github/workflows/ci.yml`:

```yaml
name: CI - Gestion Escolar

on:
  push:
    branches: [main, 'feature/**', 'fix/**']
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  frontend:
    name: Frontend - lint, tipos, tests y build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    defaults:
      run:
        working-directory: .
    env:
      CI: 'true'
      NEXT_TELEMETRY_DISABLED: '1'
      NEXT_PUBLIC_API_URL: 'http://localhost:4000/api'
    steps:
      - name: Descargar repositorio
        uses: actions/checkout@v4

      - name: Preparar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Instalar dependencias reproducibles
        run: npm ci

      - name: Analizar codigo
        run: npm run lint

      - name: Verificar tipos
        run: npx tsc --noEmit

      - name: Ejecutar pruebas
        run: npm run test:ci

      - name: Compilar aplicacion
        run: npm run build
```

### 12.1 Explicación línea por línea

| Elemento | Función | Consideración |
|---|---|---|
| `name` | Nombre visible en Actions | Se puede personalizar |
| `on.push.branches` | Ejecuta al enviar commits a las ramas indicadas | `feature/**` incluye ramas como `feature/alumnos/crud` |
| `on.pull_request` | Ejecuta cuando cambia un PR dirigido a `main` | Se ejecuta sobre el contexto del PR |
| `workflow_dispatch` | Permite ejecución manual | Disponible una vez que el workflow está en la rama predeterminada |
| `permissions.contents: read` | Concede acceso de lectura al repositorio | Principio de menor privilegio |
| `concurrency` | Cancela ejecuciones anteriores del mismo grupo | Ahorra minutos y evita resultados obsoletos |
| `runs-on` | Elige la máquina virtual | Ubuntu hospedado por GitHub |
| `timeout-minutes` | Evita jobs bloqueados indefinidamente | Ajustar si las pruebas son lentas |
| `checkout@v4` | Obtiene el código | Requisito para ejecutar scripts del proyecto |
| `setup-node@v4` | Configura Node y caché npm | `cache` acelera dependencias, no reemplaza `npm ci` |
| `npm ci` | Instala dependencias bloqueadas | Requiere `package-lock.json` |
| `npm run lint` | Detecta problemas de calidad estática | Requiere script válido |
| `npx tsc --noEmit` | Revisa tipos sin emitir archivos | Requiere TypeScript configurado |
| `npm run test:ci` | Ejecuta pruebas | Un fallo detiene el job |
| `npm run build` | Compila Next.js | Puede necesitar variables de entorno |

**Advertencia:** `NEXT_PUBLIC_API_URL` es una variable pública usada como ejemplo durante la compilación; no significa que Express esté ejecutándose en GitHub. No guardar secretos en variables con prefijo `NEXT_PUBLIC_`.

### 12.2 Comprobar que el YAML se guardó en la ruta correcta

```bash
ls -la .github/workflows/
git status
```

**No** colocar `ci.yml` en la raíz ni dentro de `src/`: GitHub solo reconoce workflows en `.github/workflows/`.

## 13. Subir los cambios a GitHub

```bash
git add package.json package-lock.json src/lib/validaciones.mjs tests/validaciones.test.mjs .github/workflows/ci.yml
git commit -m "test: agregar pruebas unitarias y workflow CI"
git push -u origin feature/testing-github-actions
```

Si `package-lock.json` no fue modificado, `git add` no causa problema. Si no existe, se debe generar antes de usar el workflow.

Entrar al repositorio en GitHub. Abrir **Actions** y seleccionar **CI - Gestion Escolar**. Si el workflow fue enviado a una rama `feature/**`, se habrá activado por el evento `push`, siempre que Actions esté habilitado y el repositorio permita ejecutar workflows.

## 14. Revisar la primera ejecución

1. Abrir el repositorio en GitHub.
2. Seleccionar la pestaña **Actions**.
3. Elegir el workflow **CI - Gestion Escolar**.
4. Abrir la ejecución más reciente.
5. Entrar al job **Frontend - lint, tipos, tests y build**.
6. Desplegar cada step y revisar duración, salida y errores.
7. Confirmar que se ejecutaron `npm ci`, `lint`, `tsc`, `test:ci` y `build`.

**Estados comunes:** amarillo/en progreso; verde/aprobado; rojo/fallido; gris/omitido o cancelado. No confundir un workflow cancelado por `concurrency` con una falla de código.

## 15. Crear un Pull Request y vincularlo con el trabajo planeado

1. Abrir **Pull requests → New pull request**.
2. Base: `main`; compare: `feature/testing-github-actions`.
3. Título sugerido: `test: incorporar pruebas automatizadas del módulo de Alumnos`.
4. Describir los cambios, pruebas y resultados.
5. Incorporar la referencia al requisito o historia de usuario correspondiente.
6. Esperar los checks automáticos y abrir sus detalles.
7. No hacer merge hasta que los checks obligatorios estén aprobados.

Si se utiliza **Azure Boards**, la relación entre GitHub y Azure Boards requiere configurar la integración correspondiente (por ejemplo, conectar el repositorio GitHub desde la configuración del proyecto de Azure DevOps). No asumir que escribir un ID en el PR crea la relación automáticamente si no existe integración.

## 16. Actividad obligatoria: provocar un fallo y corregirlo

**Fase A — Prueba fallida intencional**

Cambiar en `tests/validaciones.test.mjs`:

```javascript
assert.equal(calcularTotalAlumnos([{ id: 1 }, { id: 2 }]), 3);
```

Ejecutar:

```bash
npm run test:ci
```

El resultado esperado es un error: **actual = 2, esperado = 3**. Este cambio representa una expectativa incorrecta colocada deliberadamente para demostrar que el pipeline detecta fallos; **no** es una nueva regla de negocio.

```bash
git add tests/validaciones.test.mjs
git commit -m "test: demostrar fallo controlado de CI"
git push
```

Revisar el PR y la ejecución fallida en **Actions**. Registrar una captura de la prueba que falló y del check rojo.

**Fase B — Corrección**

Restaurar la expectativa a `2`:

```javascript
assert.equal(calcularTotalAlumnos([{ id: 1 }, { id: 2 }]), 2);
```

```bash
npm run test:ci
git add tests/validaciones.test.mjs
git commit -m "fix: corregir expectativa de prueba de alumnos"
git push
```

Verificar la nueva ejecución exitosa y guardar evidencia de los checks verdes. **No se debe entregar la rama final con la prueba incorrecta.**

## 17. Proteger la rama main con una regla de checks

Para exigir CI antes de integrar cambios:

1. Abrir **Settings → Rules → Rulesets** (o **Branches / Branch protection rules**, según la interfaz y permisos disponibles).
2. Crear una regla dirigida a la rama `main`.
3. Activar la exigencia de **Pull Request antes de fusionar**, si está disponible para el repositorio.
4. Activar **Require status checks to pass**.
5. Seleccionar el check real que apareció en una ejecución: `Frontend - lint, tipos, tests y build` (puede mostrarse con un nombre compuesto según la interfaz).
6. Guardar y comprobar la regla con un PR de prueba.

**Limitación:** la disponibilidad y aplicación efectiva de rulesets, branch protection y checks obligatorios depende del plan, del tipo de repositorio (público/privado) y de los permisos. En organizaciones puede ser necesario solicitarlo al administrador. Si no se puede imponer, documentar la limitación y demostrar que el PR muestra el resultado del workflow.

**Evitar bloquearse:** no exigir un check que nunca se haya ejecutado; ejecutar el workflow primero y luego seleccionar su nombre exacto. Si el nombre del job cambia, actualizar la regla.

## 18. Cómo probar componentes React: ampliación con Vitest

Las cuatro pruebas anteriores validan lógica de dominio, pero **no prueban** botones, formularios o navegación. Para una segunda etapa se recomienda Vitest + React Testing Library.

### 18.1 Instalación

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Agregar scripts sin eliminar los existentes:

```json
"test": "vitest",
"test:ci": "vitest run"
```

Crear `vitest.config.mts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});
```

Crear `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

### 18.2 Componente de ejemplo

Crear `src/components/ContadorAlumnos.tsx`:

```tsx
export function ContadorAlumnos({ total }: { total: number }) {
  return <p>Total de alumnos: {total}</p>;
}
```

Crear `tests/ContadorAlumnos.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContadorAlumnos } from '../src/components/ContadorAlumnos';

describe('ContadorAlumnos', () => {
  it('muestra el total recibido', () => {
    render(<ContadorAlumnos total={7} />);
    expect(screen.getByText('Total de alumnos: 7')).toBeInTheDocument();
  });
});
```

Ejecutar `npm run test:ci`. **Importante:** al cambiar `test:ci` a Vitest, las pruebas `.mjs` del primer ejercicio no se ejecutarán con el patrón `include` mostrado; migrarlas a `.test.ts` o conservar un script adicional (`test:node`) y ejecutar ambos. No afirmar que todas las pruebas pasan si solo se ejecutó una parte.

Para componentes que dependen de Next.js, Router, Context o Material UI pueden necesitarse proveedores o mocks adicionales. Se recomienda comenzar con componentes simples y avanzar hacia formularios reales.

## 19. Testing de la API Express: ampliación opcional

Si existe `backend/`, incorporar pruebas del servidor. Hay dos niveles:

**A. Unitarias sin MySQL:** probar validadores, funciones puras, servicios con repositorios simulados y controladores desacoplados.

**B. Integración:** probar rutas HTTP y acceso a una base de datos de pruebas. Usar datos ficticios, una instancia efímera y migraciones/semillas controladas. Nunca apuntar a la base de datos institucional real.

Para el primer nivel, el `backend/package.json` debe tener `"test:ci": "node --test test/*.test.js"` (o la herramienta real utilizada) y su propio `backend/package-lock.json`.

### 19.1 Workflow fullstack alternativo

El kit incluye `.github/workflows/ci-fullstack.yml`, que crea jobs separados `frontend` y `backend`. **No habilitar a la vez `ci.yml` y `ci-fullstack.yml` en el mismo repositorio sin intención**, porque ejecutarán verificaciones duplicadas. Elegir uno y adaptarlo.

El workflow fullstack presupone que existe `backend/` con `package.json`, lockfile y script `test:ci`. Si no existe, el job backend fallará; usar únicamente `ci.yml` hasta implementar la API.

## 20. Pruebas de integración con MySQL en CI (nivel avanzado)

Cuando se necesite verificar API + MySQL, GitHub Actions puede levantar un **service container** MySQL o ejecutar Docker Compose. Secuencia conceptual:

1. Crear una base temporal de pruebas con credenciales ficticias.
2. Esperar a que MySQL responda al healthcheck.
3. Aplicar el esquema y datos semilla.
4. Ejecutar pruebas contra `localhost:3306` desde el runner.
5. Destruir el entorno al terminar el job.

Las credenciales de un entorno **exclusivamente efímero de pruebas** pueden ser valores de demostración. Las credenciales reales deben guardarse en **GitHub Actions secrets** y no imprimirse en logs. No confundir `DB_HOST=db` de Docker Compose (comunicación entre contenedores) con `DB_HOST=127.0.0.1` cuando un job del runner accede a un puerto publicado por un servicio.

## 21. E2E con Playwright (nivel avanzado)

Para probar el flujo completo de registro de alumnos:

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

Crear pruebas E2E con datos ficticios y un servidor de desarrollo o preview iniciado durante el job. Una prueba E2E requiere un entorno ejecutándose: **no basta con instalar Playwright**. En CI se debe iniciar la aplicación, esperar a que responda y después ejecutar `npx playwright test`. Si las páginas requieren API, configurar backend y base de pruebas o interceptar solicitudes de forma explícita.

## 22. Diagnóstico de fallos frecuentes

| Síntoma | Causa probable | Acción |
|---|---|---|
| No aparece workflow en Actions | YAML en ruta equivocada, Actions deshabilitado o rama no incluida | Verificar `.github/workflows/ci.yml`, eventos y configuración |
| Error YAML | Sangría incorrecta, tabs o sintaxis | Revisar espacios y estructura; no mezclar tabs |
| `npm ci` falla | Lockfile ausente/desactualizado | Ejecutar `npm install` local, versionar lockfile |
| `Missing script: lint` | No existe script | Configurar ESLint y añadir script correcto |
| `Missing script: test:ci` | Falta script | Añadirlo en `package.json` |
| `Cannot find module` | Ruta o extensión incorrecta | Verificar imports relativos y mayúsculas/minúsculas |
| TypeScript falla solo en CI | Diferencia de versión, errores reales o archivos no versionados | Usar misma versión de Node, lockfile y revisar logs |
| Build falla por API | El agente no ejecuta el backend | Usar mocks o iniciar servicios de prueba |
| Test funciona en Mac pero no en Ubuntu | Rutas sensibles a mayúsculas o dependencias del SO | Corregir nombres y eliminar supuestos del entorno |
| Check no aparece en protección | No se ha ejecutado, cambió el nombre o no hay permisos | Ejecutar primero, usar nombre exacto y revisar ruleset |
| PR muestra checks duplicados | Dos workflows similares o `push` + `pull_request` | Consolidar workflows o ajustar eventos |
| No se ejecuta `workflow_dispatch` | Workflow no disponible en rama predeterminada | Incorporar workflow a rama predeterminada |
| Error `Resource not accessible by integration` | Permisos insuficientes del token | Revisar `permissions`, contexto del evento y seguridad |

**Método de depuración:** identificar el primer step rojo, leer su log completo, reproducir localmente el comando exacto, corregir, hacer commit y volver a ejecutar. No modificar varios factores a la vez si se puede evitar.

## 23. Seguridad y buenas prácticas

- Usar `permissions: contents: read` salvo necesidad justificada de escritura.
- No subir `.env`, contraseñas, tokens, llaves privadas ni bases con datos reales.
- Configurar secretos desde **Settings → Secrets and variables → Actions** cuando hagan falta.
- No exponer secretos a workflows de PR externos ni ejecutar código no confiable con credenciales privilegiadas.
- Fijar versiones de dependencias con lockfile. Para proyectos sensibles, fijar acciones por SHA completo tras verificar su procedencia.
- Mantener Actions, Node y dependencias actualizados.
- No dar permisos de despliegue de producción al workflow de pruebas.
- Distinguir CI de CD: este material **no despliega** automáticamente.

## 24. Relación con Azure Boards

Si el estudiante lleva su planeación en Azure Boards y el código permanece en GitHub, configurar la conexión oficial de Azure Boards con GitHub en el proyecto. Después:

1. Elegir una User Story (por ejemplo, **validar datos de Alumnos**).
2. Crear rama `feature/<identificador>-validacion-alumnos`.
3. Registrar los cambios y pruebas en commits descriptivos.
4. Abrir PR y asociarlo con la historia mediante el mecanismo admitido por la integración configurada.
5. Adjuntar evidencia del workflow aprobado.
6. Actualizar el estado de la historia solo cuando se cumplan sus criterios de aceptación.

Si se usa Azure Repos como repositorio principal, corresponde Azure Pipelines para la validación de PR allí; no se debe suponer que un PR en Azure Repos desencadena GitHub Actions.

## 25. Entregables de la actividad individual

| Entregable | Evidencia mínima |
|---|---|
| Código fuente | Repositorio GitHub y rama de trabajo |
| Pruebas | Archivo de pruebas y comando local exitoso |
| Workflow | `.github/workflows/ci.yml` versionado |
| Primera ejecución | Captura o URL de ejecución en Actions |
| Fallo controlado | Captura de check rojo y log de aserción fallida |
| Corrección | Commit posterior y ejecución verde |
| Pull Request | URL del PR con checks visibles |
| Planeación | Historia de Azure Boards relacionada, si la integración está configurada |
| Presentación | Demostración individual del código, pruebas y aplicación ejecutándose |

## 26. Rúbrica sugerida (100 puntos)

| Criterio | Puntos |
|---|---:|
| Diseño de casos de prueba vinculados a requisitos | 20 |
| Ejecución local y explicación de las aserciones | 15 |
| Workflow YAML correcto y reproducible | 20 |
| CI exitoso (lint, tipos, pruebas y build) | 15 |
| Demostración de fallo y recuperación | 15 |
| PR, control de versiones y trazabilidad | 10 |
| Explicación técnica individual | 5 |
| **Total** | **100** |

## 27. Lista de verificación antes de entregar

- [ ] `package-lock.json` está en Git.
- [ ] `npm ci` funciona localmente.
- [ ] `npm run test:ci` ejecuta pruebas reales.
- [ ] Las reglas probadas corresponden al módulo de Alumnos u otro módulo implementado.
- [ ] `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `npm run build` termina sin errores.
- [ ] Existe `.github/workflows/ci.yml` en el repositorio.
- [ ] La pestaña Actions muestra una ejecución exitosa.
- [ ] Se documentó un fallo intencional y su corrección.
- [ ] El Pull Request muestra checks.
- [ ] La aplicación se ejecuta durante la presentación.
- [ ] Se puede explicar el código y justificar cada prueba.

## 28. Recursos oficiales para consulta

- [GitHub Actions: documentación](https://docs.github.com/en/actions)
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Node.js en GitHub Actions](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Protección de ramas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)

---

**Criterio de cierre:** el estudiante deberá mostrar una historia o requisito verificable, el test correspondiente, una ejecución fallida intencional, la corrección, el workflow exitoso y el funcionamiento de la aplicación. El objetivo es comprender la trazabilidad **requisito → código → prueba → resultado de CI → PR**, no limitarse a copiar un YAML.
