# Guía 2. Pipeline de pruebas básicas en Azure Pipelines (equivalente a GitHub Actions)

**Caso:** aplicación Next.js/React con TypeScript; API Node/Express opcional. **Meta:** cada push y PR a `main` validará calidad básica antes de aceptar código.

## 1. Correspondencias entre plataformas

| GitHub Actions | Azure Pipelines | Función |
|---|---|---|
| `.github/workflows/ci.yml` | `azure-pipelines.yml` | Define la automatización como código |
| `on: push` | `trigger:` | Ejecuta en pushes |
| `on: pull_request` | **Branch policies > Build validation** en Azure Repos | Validación de PR |
| `runs-on: ubuntu-latest` | `pool: vmImage: ubuntu-latest` | Agente de ejecución |
| `actions/checkout@v4` | `checkout: self` | Descarga el código |
| `actions/setup-node@v4` | `NodeTool@0` | Instala Node.js |
| `run:` | `script:` | Ejecuta comandos |
| GitHub secrets | Azure Pipeline variables secretas / variable groups | Gestión de secretos |

## 2. Preparar pruebas locales reales

El `package.json` base del proyecto contiene `dev`, `build`, `start` y `lint`, **pero no incluye pruebas automatizadas**. Para una práctica mínima se puede utilizar el ejecutor incorporado de Node.js sin instalar Jest o Vitest. Esto verifica el flujo de testing, aunque posteriormente conviene probar funciones reales de los ViewModels, servicios y controladores.

Crear `tests/sanity.test.mjs` con el archivo `test-ejemplo.test.mjs` adjunto y agregar en `package.json`:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint",
  "test:ci": "node --test tests/*.test.mjs"
}
```

> No sustituir todo `package.json` por este fragmento: **agregar solamente** `test:ci` a `scripts`. Las pruebas de ejemplo no acreditan funcionalidad del sistema escolar; el estudiante debe reemplazarlas por casos de negocio.

Ejecutar en la raíz del proyecto:

```bash
node --version   # Se recomienda Node 22 en local y CI
npm install      # Genera o actualiza package-lock.json cuando haga falta
npm ci
npm run lint
npx tsc --noEmit
npm run test:ci
npm run build
```

Si falla una instrucción, corregir el proyecto antes de continuar. La compilación de Next.js puede depender de variables de entorno o llamadas externas; eliminar esas dependencias del build de prueba o configurar el entorno de forma segura.

## 3. Crear el YAML del pipeline

Copiar `azure-pipelines.yml` a la raíz del repositorio. Su contenido:

```yaml
trigger:
  branches:
    include:
      - main
      - feature/*

pool:
  vmImage: ubuntu-latest

variables:
  CI: 'true'

steps:
- checkout: self
- task: NodeTool@0
  inputs:
    versionSpec: '22.x'
- script: npm ci
  displayName: 'Instalar dependencias'
- script: npm run lint
  displayName: 'ESLint'
- script: npx tsc --noEmit
  displayName: 'TypeScript'
- script: npm run test:ci
  displayName: 'Pruebas unitarias'
- script: npm run build
  displayName: 'Compilar Next.js'
  env:
    NEXT_TELEMETRY_DISABLED: '1'
    NEXT_PUBLIC_API_URL: 'http://localhost:4000/api'
```

**Aclaración:** la URL de API se utiliza como ejemplo de variable pública de compilación, no significa que la API esté ejecutándose dentro del agente. Si el build intenta contactar realmente con el backend, será necesario simular las llamadas o incorporar servicios de prueba.

## 4. Crear el pipeline en la interfaz

1. Publicar el YAML y la prueba en una rama de Azure Repos.
2. Entrar a **Pipelines > New pipeline**.
3. Seleccionar **Azure Repos Git**, elegir el repositorio y **Existing Azure Pipelines YAML file**.
4. Elegir `/azure-pipelines.yml`, revisar y ejecutar.
5. Examinar cada log y el resultado. Corregir fallos y repetir.
6. Tras incorporar el YAML a `main`, configurar la política de **Build validation** sobre `main` en **Repos > Branches**.

## 5. Demostración de fallo y recuperación (práctica obligatoria)

1. Crear una rama `feature/ID-prueba-ci`, donde `ID` sea la historia de usuario de Azure Boards.
2. Cambiar intencionalmente una expectativa en `tests/sanity.test.mjs` (por ejemplo, esperar `'Otro'` en lugar de `'Alumno'`).
3. Ejecutar `npm run test:ci`: debe fallar. Hacer commit y push; comprobar que el pipeline marca error.
4. Corregir la prueba para que refleje el comportamiento esperado. Hacer un nuevo commit y push; verificar que pasa.
5. Abrir PR a `main` y mostrar la Build validation obligatoria. Explicar por qué un test fallido bloquea la integración.

## 6. Pruebas básicas de backend Express (si ya existe)

La Lección 4 implementa como ejemplo el CRUD de Profesores; el resto de módulos puede estar pendiente. Para incluir el backend en CI:

1. Verificar que `backend/package.json` tenga un script `test:ci` y `backend/package-lock.json` esté versionado.
2. Crear pruebas **unitarias sin MySQL** para validadores, funciones puras y controladores con dependencias simuladas. El archivo `backend/test/health.test.js` del kit es una comprobación de ejemplo que debe sustituirse por una prueba real.
3. Usar `azure-pipelines-fullstack.yml` en lugar del pipeline solo frontend.
4. Para pruebas de integración que sí usen MySQL, crear un entorno efímero de prueba con Docker o servicios del pipeline, migraciones y datos semilla; **no** apuntar a una base de datos real de alumnos.
5. Si el proyecto backend usa ES Modules, configurar `"type": "module"` y un script como `"test:ci": "node --test test/*.test.js"`.

## 7. Extensión: despliegue continuo (CD)

Cuando CI esté estable, añadir una etapa `Deploy_Development` con `dependsOn: BuildAndTest`, `condition` para rama `main`, `environment: desarrollo` y tareas de despliegue específicas del destino (Azure App Service, servidor Docker, etc.). La publicación **no** queda habilitada solo por escribir el YAML: se necesitan credenciales, destino, permisos, variables y comprobación de salud. Evitar desplegar automáticamente a producción desde un ejercicio académico.

## 8. Rúbrica sugerida (100 puntos)

| Evidencia | Puntos |
|---|---:|
| Repositorio importado a Azure Repos | 15 |
| Historia de Azure Boards vinculada a rama/PR | 15 |
| YAML correcto y versionado | 20 |
| Lint, TypeScript, test y build exitosos | 25 |
| Demostración de test fallido y corregido | 15 |
| Explicación técnica individual | 10 |

## 9. Lista de cotejo

- [ ] Repositorio importado y rama `main` correcta.
- [ ] Work item de Azure Boards enlazado a PR.
- [ ] Archivo `azure-pipelines.yml` en Git.
- [ ] `package-lock.json` en Git y `npm ci` exitoso.
- [ ] Al menos una prueba automatizada significativa del dominio.
- [ ] Build validation requerida en `main`.
- [ ] Evidencia de pipeline fallido y posteriormente exitoso.
- [ ] Aplicación ejecutándose en demostración.

## Referencias

- https://learn.microsoft.com/azure/devops/pipelines/repos/azure-repos-git
- https://learn.microsoft.com/azure/devops/repos/git/import-git-repository
