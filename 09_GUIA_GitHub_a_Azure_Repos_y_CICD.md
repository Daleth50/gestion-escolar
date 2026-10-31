# Guía 1. Migrar de GitHub a Azure Repos y configurar CI/CD

**Asignatura:** Lenguajes Web · **Proyecto individual:** Sistema de Gestión Escolar  
**Base:** Next.js 15, React 19, TypeScript, MUI, MVVM; API Express y MySQL/Docker en evolución.  
**Objetivo:** centralizar la trazabilidad en Azure Boards, versionar en Azure Repos y automatizar la verificación del código en Azure Pipelines.

> **Importante:** Azure Boards administra el trabajo; Azure Repos aloja el código; Azure Pipelines ejecuta CI/CD. El tablero por sí mismo no ejecuta pipelines. Esta guía describe operaciones que realiza cada estudiante en su propia organización; no se ha conectado ni modificado su cuenta.

## A. Preparación (15 minutos)

1. Abrir `https://dev.azure.com` y el proyecto configurado con proceso **Agile**; verificar que estén habilitados **Boards**, **Repos** y **Pipelines**.
2. En **Boards > Work Items / Backlogs**, confirmar que existe una historia de usuario (por ejemplo, **#123 Integrar API de Profesores**). Registrar el ID real.
3. Confirmar que el repositorio original en GitHub tiene rama `main`, `package.json` y, preferentemente, `package-lock.json` actualizado. Ejecutar localmente `npm install` si falta el lockfile, verificar cambios y hacer commit.
4. **Nunca** incluir `.env`, `.env.local`, credenciales de MySQL, tokens, `node_modules`, `.next` o claves en Git. Verificar `.gitignore` y el historial antes de importar.

## B. Importar el repositorio de GitHub a Azure Repos (10–15 minutos)

1. Abrir **Repos > Files** en Azure DevOps.
2. En el selector del repositorio, elegir **Import repository** (o **Import** si el repositorio está vacío).
3. Copiar la URL de clonación HTTPS de GitHub, por ejemplo `https://github.com/USUARIO/www-escuela.git`.
4. Introducir la URL y el nombre `gestion-escolar`; seleccionar **Import**.
5. Si el repositorio es privado, seguir el diálogo de autorización. No pegar tokens en el código ni en capturas de pantalla.
6. Revisar **Repos > Files**, **Branches** y **Commits**; comprobar `main`, estructura y último commit.
7. **Advertencia:** la importación inicial copia el historial Git, pero **no sincroniza automáticamente** cambios posteriores de GitHub ni migra issues, PR, políticas o workflows de GitHub. Los objetos Git LFS requieren pasos adicionales.

## C. Configurar el repositorio local para trabajar con Azure Repos (10 minutos)

Conservar GitHub como remoto secundario (opcional) y convertir Azure Repos en remoto principal:

```bash
cd /ruta/al/proyecto
# Verificar antes de cambiar
git status
git remote -v
# Si origin apunta a GitHub, renombrarlo
git remote rename origin github
# Copiar la URL de Clone en Azure Repos
git remote add origin 'https://dev.azure.com/ORGANIZACION/PROYECTO/_git/gestion-escolar'
git fetch origin
git switch main
git pull --ff-only origin main
```

Si el alumno prefiere evitar conflictos entre repositorios, puede **clonar directamente Azure Repos** en una carpeta nueva en lugar de modificar los remotos existentes. La URL del ejemplo es ilustrativa. Autenticarse con Git Credential Manager o el mecanismo autorizado por la institución.

## D. Relacionar Azure Boards con ramas, commits y PR (15 minutos)

1. Abrir la historia de usuario en **Boards** y anotar su identificador, por ejemplo `123`.
2. En el proyecto local:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/123-api-profesores
# Hacer cambios en la aplicación
git add .
git commit -m 'AB#123 Agrega servicio de profesores'
git push -u origin feature/123-api-profesores
```

3. En **Repos > Pull requests > New pull request**, seleccionar `feature/123-api-profesores` → `main`, describir la modificación y vincular el work item `123` en **Work items**.
4. Confirmar en Azure Boards la sección **Development** y el enlace a PR/commit. El prefijo `AB#123` puede vincular trabajo cuando la integración y permisos están correctamente configurados; si no aparece, vincularlo manualmente.
5. No cambiar una historia a **Done** por el simple hecho de crear el PR; hacerlo tras cumplir sus criterios de aceptación y la demostración.

## E. Crear el primer pipeline de CI (20 minutos)

1. Copiar `azure-pipelines.yml` a la **raíz** del repositorio.
2. Adaptar el proyecto según la **Guía 2**: `npm run test:ci` debe existir y `npm ci` requiere `package-lock.json`.
3. Ejecutar localmente los mismos comandos del pipeline antes de publicar.
4. Hacer commit en una rama y subirla. Abrir **Pipelines > New pipeline > Azure Repos Git > gestion-escolar > Existing Azure Pipelines YAML file** y seleccionar `/azure-pipelines.yml` en la rama que contiene el archivo.
5. Revisar el YAML y elegir **Run**. Si Azure DevOps pide autorizar recursos o agentes, atender la solicitud con el administrador.
6. Revisar el resultado de cada paso. Un fallo en ESLint, TypeScript, test o build debe bloquear la aprobación hasta corregirse.
7. Confirmar que el pipeline existe en la rama `main` tras integrar el PR. El disparador `trigger` ejecuta CI en `main` y ramas `feature/*` según el YAML.

> **Agentes:** algunas organizaciones nuevas no disponen de capacidad gratuita de trabajos paralelos hospedados por Microsoft. Si aparece el mensaje de capacidad insuficiente, solicitar acceso a la organización o configurar un agente autohospedado autorizado. No desactivar las pruebas para ocultar el problema.

## F. Hacer obligatoria la validación de Pull Requests (15 minutos)

1. Ir a **Repos > Branches**, ubicar `main`, menú `...` → **Branch policies**.
2. En **Build validation**, seleccionar **+**, elegir el pipeline CI y establecer **Required** y ejecución **Automatic**; configurar expiración de la validación según la política docente.
3. Opcionalmente activar número mínimo de revisores, comentarios resueltos y work items vinculados.
4. Abrir un PR de prueba: verificar que Azure Pipelines se ejecuta y que un resultado fallido impide completar el PR (salvo permisos especiales).
5. **Precisión técnica:** para Azure Repos Git la validación de PR se configura en **Branch policies**; el bloque `pr:` en YAML no configura ese disparador.

## G. Proponer un CD seguro para ambiente de desarrollo

**CI** = validar automáticamente código. **CD** = publicar una versión aprobada. Para la práctica inicial **no se despliega a producción**.

1. Definir el destino de desarrollo: servidor Docker institucional, Azure App Service u otro entorno autorizado.
2. Registrar credenciales en **Pipelines > Library / Variable groups**, secretos o una **service connection**; nunca en YAML.
3. Crear un **Environment** denominado `desarrollo` y, si procede, configurar aprobaciones.
4. Crear una segunda etapa de despliegue que dependa de la etapa de pruebas, y limitarla a `main` y al entorno de desarrollo. La etapa debe contener instrucciones **reales del destino elegido**; no se proporciona un comando universal de despliegue porque depende de infraestructura, permisos y método de autenticación.
5. Publicar evidencia del número de ejecución, commit desplegado, URL de desarrollo y verificación de salud (`/api/health` cuando esté disponible).

**Secuencia esperada:** Azure Boards (historia) → rama → commit → PR → validación CI → merge a `main` → CI en `main` → CD a desarrollo (solo cuando esté configurado) → evidencia y cierre del work item.

## H. Actividad individual y evidencias

- URL de Azure Repos con historial importado.
- Captura de la historia de usuario y su relación con rama, commit y PR.
- Archivo `azure-pipelines.yml` versionado.
- Captura del pipeline exitoso, mostrando pasos `npm ci`, lint, TypeScript, test y build.
- Captura de **Branch policies** con Build validation requerida.
- Aplicación ejecutándose y explicación de una prueba automatizada real.
- Describir si CD está configurado o únicamente diseñado (no declarar despliegue inexistente).

## I. Problemas comunes

| Síntoma | Verificación / solución |
|---|---|
| `npm ci` falla | Falta `package-lock.json` o no coincide con `package.json`; ejecutar `npm install`, confirmar lockfile y versionarlo. |
| `test:ci` no existe | Agregar script y prueba, según Guía 2. |
| Build de Next falla por variables | Configurar variables de compilación no secretas y no depender de servicios externos en build. |
| No aparece pipeline al crear política | Crear y ejecutar primero el pipeline; comprobar permisos. |
| PR no ejecuta pruebas | Revisar Build validation en `main`; `pr:` YAML no sustituye la política. |
| No se vincula `AB#123` | Confirmar ID correcto, permisos y vincular manualmente el work item al PR. |
| No se ejecutan trabajos hospedados | Verificar cuota de paralelismo de la organización o agente autohospedado. |
| Código diverge de GitHub | Importación no es sincronización continua; decidir cuál será repositorio principal. |

## Referencias oficiales

- Importación Git: https://learn.microsoft.com/azure/devops/repos/git/import-git-repository
- Azure Repos y CI triggers: https://learn.microsoft.com/azure/devops/pipelines/repos/azure-repos-git
- Azure Repos: https://learn.microsoft.com/azure/devops/repos/
- Integración de Boards con GitHub (alternativa sin migrar): https://learn.microsoft.com/azure/devops/boards/github
